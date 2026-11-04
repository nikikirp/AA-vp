const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');

//@desc page for uploading photos to gallery
//@route GET /galleryphotoupload
//@access public

const galleryPhotoUpload = (req, res) => {
    res.render('galleryphotoupload');
}; 

//@desc page for uploading photos to gallery
//@route POST /galleryphotoupload
//@access public

const galleryPhotoUploadPost = async (req, res) => {
	//console.log(req.body)
	//console.log(req.file)
	let conn;
	if (!req.file) {
        console.log('Viga: Faili ei laetud üles!');
        return res.render('galleryphotoupload');
	}
	
	try {
		const fileName = 'vp_' + Date.now() + '.jpg';
// Loeme kataloogid .env muutujatest (või kasutame vaikimisi väärtuseid)
        const origDir = process.env.UPLOAD_ORIGINAL_PATH || './public/gallery/orig/';
        const normalDir = process.env.UPLOAD_RESIZED_PATH || './public/gallery/normal/';
        const thumbDir = process.env.UPLOAD_THUMBNAIL_PATH || './public/gallery/thumbs/';

        // Tagame, et sihtkaustad on olemas
        await fs.mkdir(origDir, { recursive: true });
        await fs.mkdir(normalDir, { recursive: true });
        await fs.mkdir(thumbDir, { recursive: true });

        // 1. Tõstame ajutise faili originaalkausta
        const origFilePath = path.join(origDir, fileName);
        await fs.rename(req.file.path, origFilePath);

        // 2. Vesimärgi faili teekond (public/pic/vp_logo_small.png)
        const watermarkPath = path.join(__dirname, '../public/pic/vp_logo_small.png');

        // 3. Töötleme normal mõõtu pildi (800x500) + lisame vesimärgi alla paremale
        await sharp(origFilePath)
            .resize(800, 500, { fit: 'inside', withoutEnlargement: true })
            .composite([{
                input: watermarkPath,
                gravity: 'southeast' // Alla paremasse nurka
            }])
            .jpeg({ quality: 90 })
            .toFile(path.join(normalDir, fileName));

        // 4. Töötleme pisipildi (100x100)
        await sharp(origFilePath)
            .resize(100, 100)
            .jpeg({ quality: 90 })
            .toFile(path.join(thumbDir, fileName));

        // 5. Andmebaasi ühendus ja salvestamine
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });

        const sqlReq = 'INSERT INTO galleryphotos (filename, origname, alttext, privacy, userid) VALUES (?,?,?,?,?)';
        const userId = 1; // ajutine
        
        // Kui altInput on tühi, teeme automaatse teksti
        let altText = req.body.altInput;
        if (!altText || altText.trim() === '') {
            altText = 'Uus avalik foto';
        }

        const [result] = await conn.execute(sqlReq, [
            fileName, 
            req.file.originalname, 
            altText, 
            req.body.privacyInput, 
            userId
        ]);

        res.render('galleryphotoupload');
    }
    catch (err) {
        console.log('Viga: ' + err);
        res.render('galleryphotoupload');
    }
    finally {
        if(conn){
            await conn.end();
        }
    }
}; 

module.exports = {
    galleryPhotoUpload,
    galleryPhotoUploadPost
};