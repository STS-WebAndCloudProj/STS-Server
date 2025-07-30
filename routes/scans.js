// routes/scans.js
const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');


// GET /api/scans/:urlId → Get all scans for a specific URL
router.get('/:urlId', scanController.getScansByUrlId);
// POST /api/scans/:urlId → Add a scan to a specific URL
router.post('/:urlId', scanController.addScanToUrl);

module.exports = router;
