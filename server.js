const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const urlRoutes = require('./routes/urls');
const resultRoutes = require('./routes/results');
const userRoutes = require('./routes/users');
const scanRoutes = require('./routes/scans');
require('dotenv').config(); // Load environment variables

const app = express();
const port = 3000;

// Middlewares
app.use(cors({
  origin: "https://venerable-phoenix-5a34c4.netlify.app", // your Netlify frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'user-id', 'X-User-Role'] // headers actually used by your frontend
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use('/api/urls', urlRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scans', scanRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});