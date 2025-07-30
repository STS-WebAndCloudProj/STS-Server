const Url = require('../models/url');

// GET all URLs with their scans
const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find()
      .sort({ createdAt: -1 })
      .populate('scans'); // show full scan info
    res.json(urls);
  } catch (err) {
    console.error('Error fetching all URLs:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET all URLs by userId (with scans)
const getUrlsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const urls = await Url.find({ userId }).populate('scans');
    res.status(200).json(urls);
  } catch (error) {
    console.error("Error fetching URLs by userId:", error);
    res.status(500).json({ error: "Failed to fetch URLs" });
  }
};

// POST a new URL (without scans)
const addUrl = async (req, res) => {
  try {
    const { userId, url, label } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const newUrl = new Url({ userId, url, label });
    await newUrl.save();

    res.status(201).json({ message: 'URL saved successfully', url: newUrl });
  } catch (err) {
    console.error('Error saving URL:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUrls,
  getUrlsByUserId,
  addUrl
};
