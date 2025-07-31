const { google } = require('googleapis');


const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// 1. Generate Google OAuth URL
function getAuthUrl() {
  const scopes = ['https://www.googleapis.com/auth/calendar'];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
}

// 2. Exchange code for tokens
async function getTokensFromCode(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

// 3. List upcoming events
async function listEvents() {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items;
}

// 4. Create a new event
async function createEvent(event) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event
  });

  return res.data;
}

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  listEvents,
  createEvent
};
