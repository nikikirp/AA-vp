const express = require('express');
const router = express.Router();
const { regVisit, regVisitPost } = require('../controllers/visitsControllers');

router.get('/regvisit', regVisit);
router.post('/regvisit', regVisitPost);

module.exports = router;