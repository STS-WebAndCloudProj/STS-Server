const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const resultSchema = new mongoose.Schema({
  scanId: {
    type: String,
    default: () => uuidv4(),
    // unique: true
  },
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
  url: { type: mongoose.Schema.Types.ObjectId, ref: 'Url' }, // Reference to Url model
  threats: [
    {
      threat: { type: String, required: true },
      vulnerability: { type: String, required: true },
      severity: { type: String, required: true }
    }
  ],
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
