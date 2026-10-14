const fs = require('fs').promises;
const path = require('path');
const dateTimeET = require('../src/dateTimeET'); 
const regTextRef = path.join(__dirname, '../public/txt/visits.txt');

//@desc page for registration & showing last visit info
//@route GET /regvisit
//@access public
const regVisit = async (req, res) => {
    try {
        let formattedText = null;
        try {
            const data = await fs.readFile(regTextRef, 'utf8');
            const visits = data.split(';');
            const lastVisitRaw = visits[visits.length - 2];
            
            if (lastVisitRaw) {
                const parts = lastVisitRaw.split(',');
                const name = parts[0];
                const date = parts[1];
                const time = parts[2];
                formattedText = `Viimati registreeriti külastus ${date}, kell ${time} kui seda tegi ${name}.`;
            }
        } catch (e) {
            // Kui faili veel pole või on tühi, jääb tekst nulliks
        }

        // Saadame viimase külastuse teksti regvisit.ejs vaatele
        res.render('regvisit', { lastVisitText: formattedText });
    } catch (err) {
        console.log(err);
        res.render('regvisit', { lastVisitText: null });
    }
};

//@desc page for registration POST
//@route POST /regvisit
//@access public
const regVisitPost = async (req, res) => {
    console.log(req.body);
    try {
        const name = req.body.nameInput;

        if (name && name.trim() !== '') {
            const date = dateTimeET.dateET(0);
            const time = dateTimeET.timeET();
            const entry = `${name},${date},${time};`;
            await fs.appendFile(regTextRef, entry);
        }

        res.redirect('/regvisit');
    }
    catch (err) {
        console.log(err);
        res.render('regvisit', { lastVisitText: null });
    }
};

module.exports = {
    regVisit,
    regVisitPost
};