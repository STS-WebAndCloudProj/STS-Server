const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
    url: String,
    threats: [String],
    severity: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanResult', scanResultSchema);

// {
//   "url": "https://example.com",
//   "threats": ["SQL Injection", "XSS", "CSRF"],
//   "severity": "High",
//   "date": "2025-07-26T11:43:00.000Z"
// }