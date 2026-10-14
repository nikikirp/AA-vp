const express = require('express');
const router = express.Router();

//kasutatavad kontrollerid
const {
	eestifilm,
	eestifilmInimesed,
	eestifilmInimesedLisa,
	eestifilmInimesedLisaPost,
	eestifilmLisa,
	eestifilmLisaPost,
	ametLisa,
	ametLisaPost
} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/film_inimesed').get(eestifilmInimesed);

router.route('/lisa_film_inimesed').get(eestifilmInimesedLisa);

router.route('/lisa_film_inimesed').post(eestifilmInimesedLisaPost);

router.route('/lisa_film').get(eestifilmLisa);

router.route('/lisa_film').post(eestifilmLisaPost);

router.route('/lisa_amet').get(ametLisa);

router.route('/lisa_amet').post(ametLisaPost);

module.exports = router;