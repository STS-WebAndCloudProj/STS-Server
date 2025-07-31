const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const urlRoutes = require('./routes/urls');
const resultRoutes = require('./routes/results');
const userRoutes = require('./routes/users');
const scanRoutes = require('./routes/scans');
const calendarRoutes = require('./routes/calendar');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

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

app.use('/api/urls', urlRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scans', scanRoutes);
app.use('/', calendarRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
