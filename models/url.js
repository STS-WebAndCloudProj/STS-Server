const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const urlSchema = new mongoose.Schema({
    userId: {
    type: String,
    default: () => uuidv4(),
    // unique: true
  },
  urlId: {
    type: String,
    default: () => uuidv4(),
    // unique: true
  },
  url: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
 scans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scan' }] // REFERENCE to scans related to this URL
});

module.exports = mongoose.model('Url', urlSchema);
