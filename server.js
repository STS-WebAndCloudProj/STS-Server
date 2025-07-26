const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/securityDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

const urlRoutes = require('./routes/urls');
app.use('/api/urls', urlRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
