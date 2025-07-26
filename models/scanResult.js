const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  threats: {
    type: [String],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    required: true
  },
  scanDate: {
    type: Date,
    default: Date.now
  }
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
