const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const urlSchema = new mongoose.Schema({
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
  userId: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  urlId: {
    type: String,
    default: () => uuidv4(),
    unique: true
  }
});

module.exports = mongoose.model('Url', urlSchema);
