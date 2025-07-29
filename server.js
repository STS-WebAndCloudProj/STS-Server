const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

const urlRoutes = require('./routes/urls');
app.use('/api/urls', urlRoutes);

const resultRoutes = require('./routes/results');
app.use('/api/results', resultRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

app.get('/api/threats', (req, res) => {
  const threatsPath = path.join(__dirname, 'data', 'threats.json');
  fs.readFile(threatsPath, 'utf8', (err, data) => {
    if (err) {
      console.error("Failed to read threats.json:", err);
      return res.status(500).json({ error: 'Failed to load threats' });
    }

    try {
      res.json(JSON.parse(data));
    } catch (parseError) {
      console.error("Invalid JSON format in threats.json");
      res.status(500).json({ error: 'Invalid JSON format in threats file' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
