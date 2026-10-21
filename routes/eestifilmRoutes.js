const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/eestifilmControllers');

router.get('/', eestifilm);
router.get('/film_inimesed', eestifilmInimesed);
router.get('/lisa_film_inimesed', eestifilmInimesedLisa);
router.post('/lisa_film_inimesed', eestifilmInimesedLisaPost);
router.get('/lisa_film', eestifilmLisa);
router.post('/lisa_film', eestifilmLisaPost);
router.get('/lisa_amet', ametLisa);
router.post('/lisa_amet', ametLisaPost);

// Uued seoste marsruudid
router.get('/add-relation', getAddRelation);
router.post('/add-relation', postAddRelation);

module.exports = router;