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
    enum: ['active', 'inactive', 'banned'], // or your desired statuses
    default: 'active'
  }

});

module.exports = mongoose.model('User', userSchema);
