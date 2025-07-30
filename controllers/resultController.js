const ScanResult = require("../models/scanResult");
const { getRandomThreats } = require("../utils/random");

//get Results from all users!
const getResults = async (req, res) => {
  try {
    const results = await ScanResult.find();
    res.status(200).json(results);
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
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

//POST: Add a new scan result
const addResult = async (req, res) => {
  try {
    const { userId, urlId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!urlId) {
      return res.status(400).json({ error: "URL is required" });
    }

    const randomThreats = getRandomThreats(5);

    const severityLevels = ["Low", "Medium", "High", "Critical"];
    const maxSeverity = randomThreats.reduce((max, curr) => {
      return severityLevels.indexOf(curr.severity) > severityLevels.indexOf(max)
        ? curr.severity
        : max;
    }, "Low");


    const result = new ScanResult({
      userId: userId,
      urlId: urlId,
      threats: randomThreats,
      severity: maxSeverity,
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
  getResultsByUserId
};
