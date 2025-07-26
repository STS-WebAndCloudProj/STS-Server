const Result = require('../models/result');

// יצירת תוצאה חדשה
exports.addResult = async (req, res) => {
  try {
    const { url, threats, severity } = req.body;

    if (!url || !threats || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = new Result({ url, threats, severity });
    await result.save();

    res.status(201).json({ message: 'Result saved successfully', result });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// קבלת כל התוצאות
exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// קבלת תוצאות לפי URL
exports.getResultsByUrl = async (req, res) => {
  try {
    const { url } = req.params;
    const results = await Result.find({ url });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
