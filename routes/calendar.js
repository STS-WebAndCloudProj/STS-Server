const express = require('express');
const router = express.Router();
const calendar = require('../utils/google-calendar');

// GET /auth → redirect user to Google consent screen
router.get('/auth', (req, res) => {
  const url = calendar.getAuthUrl();
  res.redirect(url);
});

// GET /oauth2callback → handle Google's redirect with ?code=
router.get('/oauth2callback', async (req, res) => {
  try {
    const code = req.query.code;
    const tokens = await calendar.getTokensFromCode(code);
    // You can save tokens here to DB or session if needed
    res.send(`
      <h2>Authorization successful!</h2>
      <p>You can now create events and read your calendar.</p>
    `);
  } catch (err) {
    console.error('OAuth2 callback error:', err);
    res.status(500).send('Authentication failed.');
  }
});

// GET /events → list upcoming 10 events
router.get('/events', async (req, res) => {
  try {
    const events = await calendar.listEvents();
    res.json(events);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    res.status(500).json({ error: 'Could not list events' });
  }
});

module.exports = router;
