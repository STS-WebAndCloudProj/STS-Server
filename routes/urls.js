const express = require('express');
const router = express.Router();
const { getAllUrls, getUrlsByUserId, addUrl } = require('../controllers/urlController');
const { checkUrlSafety } = require('../utils/safeBrowsing'); // Import the URL safety check function

// GET /api/urls → Get all URLs
router.get('/', getAllUrls);

// GET /api/urls/:userId → Get URLs by user ID
router.get('/:userId', getUrlsByUserId);

// POST /api/urls → Add a new URL
router.post('/', async (req, res) => {
    const { url } = req.body; // Expect the URL to be provided in the request body

    try {
        // Check URL safety using Google Safe Browsing API
        const safetyStatus = await checkUrlSafety(url);

        if (!safetyStatus.safe) {
            return res.status(400).json({
                error: 'The URL is flagged as unsafe and cannot be added.',
                threats: safetyStatus.threats || safetyStatus.error
            });
        }

        // If the URL is safe, proceed with adding it to the database
        await addUrl(req, res);
    } catch (err) {
        console.error('Error adding URL:', err);
        res.status(500).json({ error: 'Failed to add URL.' });
    }
});

module.exports = router;