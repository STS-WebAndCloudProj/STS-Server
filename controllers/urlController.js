const Url = require('../models/url');

exports.addUrl = async (req, res) => {
  try {
    const { url, label } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const newUrl = new Url({ url, label });
    await newUrl.save();

    res.status(201).json({ message: 'URL saved successfully', url: newUrl });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
