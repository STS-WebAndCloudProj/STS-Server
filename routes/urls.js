const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/', urlController.addUrl);

router.get('/', urlController.getAllUrls);

module.exports = router;

