const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.post('/', resultController.addResult);
router.get('/', resultController.getAllResults);
router.get('/:url', resultController.getResultsByUrl);

module.exports = router;
