const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
