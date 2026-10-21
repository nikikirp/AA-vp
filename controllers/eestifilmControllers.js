//@desc home page for Estonian Film section
//@route GET /eestifilm
//@access public
const mysql = require('mysql2/promise');


//app.get('/eestifilm', (req, res) => {
const eestifilm = (req, res) => {
    res.render('eestifilm');
}; 

//@desc page for people involved in Estonian Film industry
//@route GET /eestifilm/film_inimesed
//@access public

//app.get('/eestifilm/film_inimesed', async (req, res)=>{
const eestifilmInimesed = async (req, res) => {
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
};

//@desc page for adding people involved in Estonian Film industry
//@route GET /eestifilm/lisa_film_inimesed
//@access public

// app.get('/eestifilm/lisa_film_inimesed', (req, res)=>{
const eestifilmInimesedLisa = (req, res) => {
    res.render('lisa_film_inimesed', {
        firstName: '',
        lastName: '',
        born: '',
        deceased: '',
        notice: 'Ootan sisestust!'
    });
};

//@desc page for adding people involved in Estonian Film industry
//@route POST /eestifilm/lisa_film_inimesed
//@access public

//app.post('/eestifilm/lisa_film_inimesed', async (req, res)=>{
const eestifilmInimesedLisaPost = async (req, res) => {
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
};

//@desc page for adding Estonian Films
//@route GET /eestifilm/lisa_film
//@access public

//app.get('/eestifilm/lisa_film', (req, res) => {
const eestifilmLisa = (req, res) => {
    res.render('lisa_film', {
        title: '',
        year: '',
        duration: '',
        notice: 'Ootan filmi andmeid!'
    });
};

//@desc page for adding Estonian Films
//@route POST /eestifilm/lisa_film
//@access public

//app.post('/eestifilm/lisa_film', async (req, res) => {
const eestifilmLisaPost = async (req, res) => {
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
};

//@desc page for adding jobs
//@route GET /eestifilm/lisa_amet
//@access public

//app.get('/eestifilm/lisa_amet', (req, res) => {
const ametLisa = (req, res) => {
    res.render('lisa_amet', {
        positionName: '',
        notice: 'Ootan ameti nimetust!'
    });
};

//@desc page for adding Estonian Films
//@route POST /eestifilm/lisa_amet
//@access public

//app.post('/eestifilm/lisa_amet', async (req, res) => {
const ametLisaPost = async (req, res) => {
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
}; 

//@desc page for adding film relations
//@route GET /eestifilm/add-relation
//@access public
const getAddRelation = async (req, res) => {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });
        
        // Loeme andmebaasist filmid, isikud ja ametid rippmenüüde jaoks
        const [films] = await conn.execute('SELECT id, title FROM movie');
        const [persons] = await conn.execute('SELECT id, first_name, last_name FROM person');
        const [positions] = await conn.execute('SELECT id, position_name FROM position');

        res.render('add_relation', { films, persons, positions, notice: 'Ootan seose valikuid!' });
    } catch (err) {
        console.log('Viga seoste andmete laadimisel: ' + err);
        res.render('add_relation', { films: [], persons: [], positions: [], notice: 'Andmete laadimine ebaõnnestus!' });
    } finally {
        if (conn) { await conn.end(); }
    }
};

//@desc page for adding film relations POST
//@route POST /eestifilm/add-relation
//@access public
const postAddRelation = async (req, res) => {
    let filmId = req.body.filmInput || null;
    let personId = req.body.personInput || null;
    let positionId = req.body.positionInput || null;
    let characterName = req.body.characterInput ? req.body.characterInput.trim() : null;

    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });

        // 1. Enne salvestamist kontrollime SELECT käsuga, kas täpselt sama seos on juba olemas
        let checkSql = `
            SELECT id FROM film_to_position 
            WHERE film_id = ? AND person_id = ? AND position_id = ? 
            AND (character_name = ? OR (character_name IS NULL AND ? IS NULL))
        `;
        const [existing] = await conn.execute(checkSql, [filmId, personId, positionId, characterName, characterName]);

        // Laeme uuesti rippmenüüde andmed vaate jaoks
        const [films] = await conn.execute('SELECT id, title FROM movie');
        const [persons] = await conn.execute('SELECT id, first_name, last_name FROM person');
        const [positions] = await conn.execute('SELECT id, position_name FROM position');

        if (existing.length > 0) {
            // Kui vaste saadakse, loobutakse salvestamisest
            return res.render('add_relation', {
                films, persons, positions,
                notice: 'Selline seos on juba olemas, salvestamisest loobuti!'
            });
        }

        // 2. Kui vastet polnud, kirjutame uue seose andmebaasi
        let insertSql = 'INSERT INTO film_to_position (film_id, person_id, position_id, character_name) VALUES (?, ?, ?, ?)';
        await conn.execute(insertSql, [filmId, personId, positionId, characterName || null]);

        res.render('add_relation', {
            films, persons, positions,
            notice: 'Seos on edukalt lisatud!'
        });

    } catch (err) {
        console.log('Viga seose lisamisel: ' + err);
        // Laeme rippmenüüd ka vea korral
        let films = [], persons = [], positions = [];
        try {
            [films] = await conn.execute('SELECT id, title FROM movie');
            [persons] = await conn.execute('SELECT id, first_name, last_name FROM person');
            [positions] = await conn.execute('SELECT id, position_name FROM position');
        } catch (e) {}

        res.render('add_relation', {
            films, persons, positions,
            notice: 'Tekkis andmebaasi viga, seost ei salvestatud!'
        });
    } finally {
        if (conn) { await conn.end(); }
    }
};

module.exports = {
	eestifilm,
	eestifilmInimesed,
	eestifilmInimesedLisa,
	eestifilmInimesedLisaPost,
	eestifilmLisa,
	eestifilmLisaPost,
	ametLisa,
	ametLisaPost,
	getAddRelation,
	postAddRelation
};