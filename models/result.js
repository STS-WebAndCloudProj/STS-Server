const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  threats: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  }
});

module.exports = mongoose.model('Result', resultSchema);
