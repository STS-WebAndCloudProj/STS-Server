// models/user.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  userId: {
    type: String,
    default: () => uuidv4(),
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'disabled'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  sitesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('User', userSchema);
