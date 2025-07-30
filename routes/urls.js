const express = require('express');
const router = express.Router();
const { getAllUrls, getUrlsByUserId, addUrl } = require('../controllers/urlController');

router.get('/', getAllUrls);
router.get('/:userId', getUrlsByUserId);
router.post('/', addUrl);


module.exports = router;

