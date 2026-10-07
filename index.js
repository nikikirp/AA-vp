const express = require ('express');
const fs = require('fs').promises;
const bodyparser = require('body-parser');
//moodul andmebaaside suhtlemiseks, koos async voimalustega
const mysql = require('mysql2/promise');
const dateET = require('./src/dateTimeET.js');
//moodul keskkonnamuutujate lugemiseks
require('dotenv').config();

const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

//käivitan express() funktsiooni ja tähistan töötava asja nimega "app"
const app = express();
//määrame veebilehe mallide järgi renderdamise mootori (EJS)
app.set('view engine', 'ejs');
//muudan "public" veebiserverile kättesaadavaks
app.use(express.static('public'));
//hakkame päringuid parsima
app.use(bodyparser.urlencoded({extended: false}));

app.get('/', (req, res)=>{
	//res.send('Express.js veeb käivitus!');
	const day = dateET.dayET();
	const date = dateET.dateET(0);
	const time = dateET.timeET();
	res.render('index', {day: day, date: date, time: time});
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

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res) => {
	console.log(req.body);
	try {
		// 1. Võtame nime
		const name = req.body.nameInput;

		if (name && name.trim() !== '') {
			// 2. Võtame kuupäeva ja kellaaja sinu dateET moodulist
			const date = dateET.dateET();
			const time = dateET.timeET();

			// 3. Paneme kokku rea: nimi,kuupäev,kellaaeg;
			const entry = `${name},${date},${time};`;

			// 4. Salvestame faili
			await fs.appendFile(regTextRef, entry);
		}

		res.render('regvisit');
	}
	catch (err) {
		console.log(err);
		res.render('regvisit');
	}
});

app.get('/miks-tlu', (req, res) => {
    res.render('reasons');
});

app.get('/lastvisit', async (req, res) => {
    try {
        const data = await fs.readFile(regTextRef, 'utf8');
        const visits = data.split(';');
        const lastVisitRaw = visits[visits.length - 2];

        if (!lastVisitRaw) {
            return res.render('lastvisit', { lastVisitText: null });
        }
        const parts = lastVisitRaw.split(',');
        const name = parts[0];
        const date = parts[1];
        const time = parts[2];
        const formattedText = `Viimati registreeriti külastus ${date}, kell ${time} kui seda tegi ${name}.`;
        res.render('lastvisit', { lastVisitText: formattedText });

    } catch (err) {
        console.log(err);
        res.render('lastvisit', { lastVisitText: null });
    }
});

app.get('/eestifilm', (req, res) => {
    res.render('eestifilm');
});

app.get('/eestifilm/film_inimesed', async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});
		//defineerime sql paringu
		let sqlReq = 'SELECT * FROM person';
		//käivitame selle päringu
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('film_inimesed', {personList: sqlRes});
	}
	catch (err) {
		console.log('Andmebaasiga suhtlemise viga: ' + err);
		res.render('film_inimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/lisa_film_inimesed', (req, res)=>{
    res.render('lisa_film_inimesed', {notice: 'Ootan sisestust!'});
});

app.post('/eestifilm/lisa_film_inimesed', async (req, res)=>{
	console.log(req.body);
	let deceasedDate = null;
	if(req.body.deceasedInput != ''){
		deceasedDate = req.body.deceasedInput;
	}
	
	//sünnikuupäeva võrdlemine
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > timeNow){
		console.log("Andmed pole korrektsed!");
		return res.render('lisa_film_inimesed', {notice: 'Sisestatud andmed pole korrektsed!'});
	}
	let conn;
	try{
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('lisa_film_inimesed', {notice: req.body.firstNameInput + ' ' + req.body.lastNameInput + ' andmebaasid salvestatud'});
	}
	catch (err) {
		console.log('Andmebaasiga suhtlemise viga: ' + err);
		res.render('lisa_film_inimesed', {notice: 'Tekkis viga, andmeid ei salvestatud!'});
	}
    finally {
		if(conn){
			await conn.end();
		}
	}
	
});

app.listen(5324);