const Url = require('../models/url');

const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

//get all Urls for userId
const getUrlsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const urls = await Url.find({ userId });
    res.status(200).json(urls);
  } catch (error) {
    console.error("Error fetching Url:", error);
    res.status(500).json({ error: "Failed to fetch Url" });
  }
};


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
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUrls,
  getUrlsByUserId,
  addUrl
};