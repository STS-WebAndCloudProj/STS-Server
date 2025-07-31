//used in models/url.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const scanSchema = new mongoose.Schema({
    scanId: {
        type: String,
        default: () => uuidv4(),
        // unique: true
    },
    urlId: {
        type: String,
        required: true // this links the scan to a URL by urlId
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    scheduledFor: Date,
    status: {
        type: String,
        enum: ['pending', 'running', 'completed'],
        default: 'pending'
    },
});
const Scan = mongoose.model('Scan', scanSchema);

module.exports = Scan;