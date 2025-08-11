// controllers/scanController.js
const Scan = require('../models/scan');
const Result = require('../models/scanResult'); // Add this import
const Url = require('../models/url');
const User = require('../models/user'); // for admin verification
const { v4: uuidv4 } = require('uuid');



// Get all scans for a specific URL
const getScansByUrlId = async (req, res) => {
    try {
        const { urlId } = req.params;

        const scans = await Scan.find({ urlId }).sort({ scheduledFor: 1 });

        if (!scans) {
            return res.status(404).json({ message: 'No scans found for this URL' });
        }
        return scans;
        res.status(200).json(scans);
    } catch (err) {
        console.error('Error fetching scans:', err);
        res.status(500).json({ error: 'Failed to fetch scans' });
    }
};

// Helper function to count completed scans today
const getCompletedScansToday = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    // Use Result model and scanDate field instead of Scan model
    return await Result.countDocuments({
        scanDate: { $gte: today, $lt: tomorrow }
    });
};

// Add a new scan to an existing URL
const addScanToUrl = async (req, res) => {
    try {
        const { urlId } = req.params;
        const { scheduledFor, status } = req.body;

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

const updateScanStatus = async (req, res) => {
    try {
        const { scanId } = req.params;
        const { status } = req.body;

        if (!scanId || !status) {
            return res.status(400).json({ error: 'Missing scanId or status' });
        }

        const updatedScan = await Scan.findOneAndUpdate(
            { scanId }, // ✅ based on scanId field, not _id
            { status },
            { new: true }
        );

        if (!updatedScan) {
            return res.status(404).json({ error: 'Scan not found' });
        }

        res.status(200).json({ message: 'Status updated', scan: updatedScan });
    } catch (err) {
        console.error('Error updating scan status:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

//Get scan statistics
const getAllScansStats = async (req, res) => {
    try {
        // Use both Scan model (for scan statuses) and Result model (for results/severity)
        const totalScans = await Scan.countDocuments();
        const pendingScans = await Scan.countDocuments({ status: 'pending' });
        const completedScans = await Scan.countDocuments({ status: 'completed' });
        const failedScans = await Scan.countDocuments({ status: 'failed' });
        const criticalScans = await Result.countDocuments({ severity: 'Critical' });
        const totalResults = await Result.countDocuments();
        
        const completedScansToday = await getCompletedScansToday();

        res.json({
            message: 'All scan statistics retrieved successfully',
            stats: {
                totalScans,
                totalResults,
                criticalScans,
                completedScansToday,
                byStatus: {
                    pending: pendingScans,
                    completed: completedScans,
                    failed: failedScans
                }
            }
        });
    } catch (err) {
        console.error('All scan stats error:', err);
        res.status(500).json({ error: 'Failed to retrieve scan statistics' });
    }
};

// Get weekly scan activity for the chart
const getWeeklyScanActivity = async (req, res) => {
    try {
        // Get the last 7 days
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6); // 6 days back + today = 7 days
        weekAgo.setHours(0, 0, 0, 0);

        // Create array to hold daily counts
        const dailyActivity = [];
        const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Get counts for each of the last 7 days
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekAgo);
            currentDay.setDate(weekAgo.getDate() + i);
            
            const nextDay = new Date(currentDay);
            nextDay.setDate(currentDay.getDate() + 1);

            // Count completed scans for this day using Result model
            const dayCount = await Result.countDocuments({
                scanDate: { 
                    $gte: currentDay, 
                    $lt: nextDay 
                }
            });

            dailyActivity.push(dayCount);
        }

        // Reorder the data to match the correct day labels
        // The labels array starts with Sunday, so we need to adjust based on today's day
        const todayDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const reorderedActivity = [];
        const reorderedLabels = [];

        for (let i = 0; i < 7; i++) {
            const dayIndex = (todayDayOfWeek - 6 + i + 7) % 7; // Calculate correct day index
            reorderedActivity.push(dailyActivity[i]);
            reorderedLabels.push(labels[dayIndex]);
        }

        res.json({
            message: 'Weekly scan activity retrieved successfully',
            dailyActivity: reorderedActivity,
            labels: reorderedLabels
        });
    } catch (err) {
        console.error('Weekly scan activity error:', err);
        res.status(500).json({ error: 'Failed to retrieve weekly scan activity' });
    }
};



module.exports = {
    addScanToUrl,
    getScansByUrlId,
    getAllScansStats,
    updateScanStatus,
    getWeeklyScanActivity
};
