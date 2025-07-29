const ScanResult = require("../models/scanResult");
const { getRandomThreats } = require("../utils/random");

const addResult = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
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
      url,
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

const getResults = async (req, res) => {
  try {
    const results = await ScanResult.find();
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

module.exports = {
  addResult,
  getResults
};
