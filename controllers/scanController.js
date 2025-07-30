// controllers/scanController.js
const Scan = require('../models/scan');
const Url = require('../models/url');
const { v4: uuidv4 } = require('uuid');

// Get all scans for a specific URL
const getScansByUrlId = async (req, res) => {
  try {
    const { urlId } = req.params;

    const scans = await Scan.find({ urlId }).sort({ scheduledFor: 1 });

    if (!scans){
      return res.status(404).json({ message: 'No scans found for this URL' });
    }
    return scans;
    res.status(200).json(scans);
  } catch (err) {
    console.error('Error fetching scans:', err);
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
};

// Add a new scan to an existing URL
const addScanToUrl = async (req, res) => {
  try {
    const { urlId } = req.params;
    const { scheduledFor, status} = req.body;

    const url = await Url.findOne({ urlId });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const newScan = new Scan({
      scanId: uuidv4(),
      urlId,
      scheduledFor,
      status: status || 'pending',
    });

    await newScan.save();

    url.scans.push(newScan._id);
    await url.save();

    res.status(201).json({ message: 'Scan added to URL', scan: newScan });
  } catch (err) {
    console.error('Error adding scan:', err);
    res.status(500).json({ error: 'Failed to add scan' });
  }
};

module.exports = {
  addScanToUrl,
  getScansByUrlId
};
