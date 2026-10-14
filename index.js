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

/* app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
}); */

/* app.post('/regvisit', async (req, res) => {
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
}); */

app.get('/miks-tlu', (req, res) => {
    res.render('reasons');
});

/* app.get('/lastvisit', async (req, res) => {
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
}); */
const visitsRouter = require('./routes/visitsRoutes');
app.use('/', visitsRouter); // Ühendab ruuteri otse juure alla, nii et /regvisit ja /lastvisit töötavad otse

const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

/* app.get('/eestifilm', (req, res) => {
    res.render('eestifilm');
}); */

/* app.get('/eestifilm/film_inimesed', async (req, res)=>{
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
}); */

/* app.get('/eestifilm/lisa_film_inimesed', (req, res)=>{
    res.render('lisa_film_inimesed', {
        firstName: '',
        lastName: '',
        born: '',
        deceased: '',
        notice: 'Ootan sisestust!'
    });
}); */

/* app.post('/eestifilm/lisa_film_inimesed', async (req, res)=>{
    console.log(req.body);
    
    let firstName = req.body.firstNameInput ? req.body.firstNameInput.trim() : '';
    let lastName = req.body.lastNameInput ? req.body.lastNameInput.trim() : '';
    let born = req.body.bornInput || '';
    let deceased = req.body.deceasedInput || '';

    let deceasedDate = null;
    if (deceased !== ''){
        deceasedDate = new Date(deceased);
    }

    const bornDate = new Date(born);
    const timeNow = new Date();

    let notice = '';
    let hasError = false;

    if (!firstName || !lastName || !born || isNaN(bornDate.getTime()) || bornDate > timeNow) {
        notice += 'Andmed pole korrektsed (eesnimi, perekonnanimi või sünnikuupäev vigane)! ';
        hasError = true;
    }

    if (deceased !== '') {
        if (isNaN(deceasedDate.getTime())) {
            notice += 'Surmakuupäev on vigane! ';
            hasError = true;
        } else if (deceasedDate > timeNow) {
            notice += 'Surmakuupäev ei saa olla tulevikus! ';
            hasError = true;
        } else if (bornDate && deceasedDate < bornDate) {
            notice += 'Surmakuupäev ei saa olla varasem kui sünnikuupäev! ';
            hasError = true;
        }
    }

    if (hasError) {
        console.log('Andmed pole korrektsed!');
        return res.render('lisa_film_inimesed', {
            firstName: firstName,
            lastName: lastName,
            born: born,
            deceased: deceased,
            notice: notice
        });
    }

    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });
        let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
        await conn.execute(sqlReq, [
            firstName,
            lastName,
            born,
            deceased || null
        ]);
        
        res.render('lisa_film_inimesed', {
            firstName: '',
            lastName: '',
            born: '',
            deceased: '',
            notice: firstName + ' ' + lastName + ' on andmebaasi salvestatud!'
        });
    } catch (err) {
        console.log('Andmebaasiga suhtlemise viga: ' + err);
        res.render('lisa_film_inimesed', {
            firstName: firstName,
            lastName: lastName,
            born: born,
            deceased: deceased,
            notice: 'Tekkis viga, andmeid ei salvestatud!'
        });
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}); */

/* app.get('/eestifilm/lisa_film', (req, res) => {
    res.render('lisa_film', {
        title: '',
        year: '',
        duration: '',
        notice: 'Ootan filmi andmeid!'
    });
}); */

/* app.post('/eestifilm/lisa_film', async (req, res) => {
    let title = req.body.titleInput ? req.body.titleInput.trim() : '';
    let year = req.body.yearInput || '';
    let duration = req.body.durationInput || '';

    let currentYear = new Date().getFullYear();
    let notice = '';
    let hasError = false;

    if (!title) { notice += 'Pealkiri on puudu! '; hasError = true; }
    if (!year || year < 1888 || year > currentYear) { notice += 'Vigane valmimisaasta! '; hasError = true; }
    if (!duration || duration <= 0) { notice += 'Vigane kestus! '; hasError = true; }

    if (hasError) {
        return res.render('lisa_film', { title: title, year: year, duration: duration, notice: notice });
    }

    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });
        let sqlReq = 'INSERT INTO movie (title, production_year, duration) VALUES (?,?,?)';
        await conn.execute(sqlReq, [title, year, duration]);

        res.render('lisa_film', {
            title: '',
            year: '',
            duration: '',
            notice: 'Film "' + title + '" on edukalt lisatud!'
        });
    } catch (err) {
        console.log('Viga filmi lisamisel: ' + err);
        res.render('lisa_film', { title: title, year: year, duration: duration, notice: 'Tekkis andmebaasi viga!' });
    } finally {
        if (conn) { await conn.end(); }
    }
}); */


/* app.get('/eestifilm/lisa_amet', (req, res) => {
    res.render('lisa_amet', {
        positionName: '',
        notice: 'Ootan ameti nimetust!'
    });
}); */

/* app.post('/eestifilm/lisa_amet', async (req, res) => {
    let positionName = req.body.positionInput ? req.body.positionInput.trim() : '';

    if (!positionName) {
        return res.render('lisa_amet', {
            positionName: positionName,
            notice: 'Ameti nimetus on sisestamata!'
        });
    }

    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });
        let sqlReq = 'INSERT INTO position (position_name) VALUES (?)';
        await conn.execute(sqlReq, [positionName]);

        res.render('lisa_amet', {
            positionName: '',
            notice: 'Amet "' + positionName + '" on edukalt lisatud!'
        });
    } catch (err) {
        console.log('Viga ameti lisamisel: ' + err);
        res.render('lisa_amet', { positionName: positionName, notice: 'Tekkis andmebaasi viga!' });
    } finally {
        if (conn) { await conn.end(); }
    }
}); */

app.listen(5324);