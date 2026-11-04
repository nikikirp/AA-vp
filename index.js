const express = require ('express');
const fs = require('fs').promises;
const bodyparser = require('body-parser');
// moodul andmebaaside suhtlemiseks, koos async võimalustega
const mysql = require('mysql2/promise');
const dateET = require('./src/dateTimeET.js');
// moodul keskkonnamuutujate lugemiseks
require('dotenv').config();

const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

// käivitan express() funktsiooni ja tähistan töötava asja nimega "app"
const app = express();
// määrame veebilehe mallide järgi renderdamise mootori (EJS)
app.set('view engine', 'ejs');
// muudan "public" veebiserverile kättesaadavaks
app.use(express.static('public'));
// hakkame päringuid parsima
app.use(bodyparser.urlencoded({extended: true}));

// AVALEHT (täiendatud viimase avaliku foto lugemisega andmebaasist)
app.get('/', async (req, res)=>{
	const day = dateET.dayET();
	const date = dateET.dateET(0);
	const time = dateET.timeET();
	
	let conn;
	let latestPhoto = null;
	
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});

		// Ülesandes antud SQL päring kõige uuema avaliku foto leidmiseks
		const sql = 'SELECT filename, alttext FROM galleryphotos WHERE id = (SELECT MAX(id) FROM galleryphotos WHERE privacy = ? AND deleted IS NULL)';
		const [rows] = await conn.execute(sql, [3]); // 3 on avalik tase

		if (rows.length > 0) {
			latestPhoto = rows[0];
			if (!latestPhoto.alttext) {
				latestPhoto.alttext = "Uusim avalik foto";
			}
		}
	}
	catch (err) {
		console.log('Viga avalehe pildi laadimisel: ' + err);
	}
	finally {
		if (conn) {
			await conn.end();
		}
	}

	res.render('index', {day: day, date: date, time: time, latestPhoto: latestPhoto});
});

app.get('/home', (req, res) => {
	res.render('home');
});

app.get('/logout', (req, res) => {
	res.redirect('/');
});

app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, 'utf8');
		let folkWisdom = data.split(';');
		let wisdom = folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))];
		res.render('wisdom', {wisdom: wisdom});
	}
	catch (err){
		console.log(err);
		res.render('wisdom', {wisdom: 'Kahjuks ühtegi vanasõna ei leitud!'});
	}
});

app.get('/miks-tlu', (req, res) => {
    res.render('reasons');
});

// FOTOGALERII LEHT (privaatsus >= 2)
app.get('/gallery', async (req, res) => {
	let conn;
	let photos = [];
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});

		const sql = 'SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL ORDER BY id DESC';
		const [rows] = await conn.execute(sql, [2]);
		photos = rows;
	} catch (err) {
		console.log('Viga galerii laadimisel: ' + err);
	} finally {
		if (conn) await conn.end();
	}

	res.render('gallery', { photos: photos });
});

const visitsRouter = require('./routes/visitsRoutes');
app.use('/', visitsRouter); // Ühendab ruuteri otse juure alla, nii et /regvisit ja /lastvisit töötavad otse

const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

const signupRouter = require('./routes/signupRoutes');
app.use('/signup', signupRouter);

const signinRouter = require('./routes/signinRoutes');
app.use('/signin', signinRouter);

const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryphotoupload', galleryPhotoUploadRouter);

app.listen(5324);