// routes/scans.js
const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const checkAdmin = require('../middleware/checkAdmin');

// Public routes
// GET /api/scans/:urlId → Get all scans for a specific URL
router.get('/:urlId', scanController.getScansByUrlId);
// POST /api/scans/:urlId → Add a scan to a specific URL
router.post('/:urlId', scanController.addScanToUrl);
// PUT /api/scans/:scanId/status → Update scan status
router.put('/:scanId/status', scanController.updateScanStatus);

// Admin-only routes (require checkAdmin middleware)
// GET /api/scans/admin/stats → Get comprehensive scan statistics
router.get('/admin/stats', checkAdmin, scanController.getAllScansStats);
// GET /api/scans/admin/activity/weekly → Get weekly scan activity for charts
router.get('/admin/activity/weekly', checkAdmin, scanController.getWeeklyScanActivity);
// GET /api/scans/admin/vulnerability-types → Get vulnerability types distribution for pie chart
router.get('/admin/vulnerability-types', checkAdmin, scanController.getVulnerabilityTypes);

module.exports = router;
