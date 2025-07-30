const Scan = require("../models/scan");
const ScanResult = require("../models/scanResult");
const Url = require("../models/url");
const { getRandomThreats } = require("../utils/random");

//get Results from all users!
const getResults = async (req, res) => {
  try {
    const results = await ScanResult.find();
    
    // Fetch URL data for each result
    const resultsWithUrls = await Promise.all(
      results.map(async (result) => {
        const url = await Url.findOne({ urlId: result.urlId });
        return {
          ...result.toObject(),
          urlData: url ? { url: url.url, label: url.label } : null
        };
      })
    );
    
    res.status(200).json(resultsWithUrls);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

//get all results for userId
const getResultsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const results = await ScanResult.find({ userId });
    
    // Fetch URL data for each result
    const resultsWithUrls = await Promise.all(
      results.map(async (result) => {
        const url = await Url.findOne({ urlId: result.urlId });
        return {
          ...result.toObject(),
          urlData: url ? { url: url.url, label: url.label } : null
        };
      })
    );
    
    res.status(200).json(resultsWithUrls);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

const getResultsByScanId = async (req, res) => {
  try {
    const { scanId } = req.params;

    if (!scanId) {
      return res.status(400).json({ error: "Scan ID is required" });
    }

    const result = await ScanResult.findOne({ scanId });

    if (!result) {
      return res.status(404).json({ error: "Result not found for this scan ID" });
    }

    // Fetch URL data for this result
    const url = await Url.findOne({ urlId: result.urlId });
    const resultWithUrl = {
      ...result.toObject(),
      urlData: url ? { url: url.url, label: url.label } : null
    };

    res.status(200).json(resultWithUrl);
  } catch (error) {
    console.error("Error fetching result by scanId:", error);
    res.status(500).json({ error: "Failed to fetch result by scanId" });
  }
};

//POST: Add a new scan result

const addResult = async (req, res) => {
  try {
    const { userId, scanId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!scanId) {
      return res.status(400).json({ error: "Scan ID is required" });
    }

    const scan = await Scan.findOne({ scanId });
    if (!scan) {
      return res.status(404).json({ error: "Scan not found" });
    }
    const urlId = scan.urlId;
    const randomThreats = getRandomThreats(5);

    const severityLevels = ["Low", "Medium", "High", "Critical"];
    const maxSeverity = randomThreats.reduce((max, curr) => {
      return severityLevels.indexOf(curr.severity) > severityLevels.indexOf(max)
        ? curr.severity
        : max;
    }, "Low");
    
    const result = new ScanResult({
      userId,
      scanId,
      urlId,
      threats: randomThreats,
      severity: maxSeverity
    });

    await result.save();

    res.status(201).json(result);

  } catch (error) {
    console.error("Error adding scan result:", error);
    res.status(500).json({ error: "Failed to add scan result" });
  }
};




module.exports = {
  addResult,
  getResults,
  getResultsByUserId,
  getResultsByScanId
};
