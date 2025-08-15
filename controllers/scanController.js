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

// Get vulnerability types distribution for pie chart
const getVulnerabilityTypes = async (req, res) => {
    try {
        console.log('=== DEBUGGING VULNERABILITY TYPES ===');
        
        // Get all results with their threats array
        const allResults = await Result.find({}).limit(10);
        console.log('\nSample results from database:');
        allResults.forEach((result, index) => {
            console.log(`  ${index + 1}. ID: ${result._id}`);
            console.log(`     Severity: "${result.severity}"`);
            console.log(`     ScanDate: ${result.scanDate}`);
            console.log(`     Threats array:`, result.threats);
            if (result.threats && result.threats.length > 0) {
                result.threats.forEach((threat, tIndex) => {
                    console.log(`       Threat ${tIndex + 1}: "${threat.threat}" | Vulnerability: "${threat.vulnerability}" | Severity: "${threat.severity}"`);
                });
            }
            console.log('     ---');
        });

        // Get all results to analyze threats
        const allResultsWithThreats = await Result.find({});
        
        // Initialize counters
        let crossSiteScripting = 0;
        let sqlInjection = 0;
        let csrf = 0;
        let brokenAuthentication = 0;
        
        // Arrays to store matching threats for debugging
        const xssThreats = [];
        const sqlThreats = [];
        const csrfThreats = [];
        const authThreats = [];
        
        // Process each result and its threats
        allResultsWithThreats.forEach(result => {
            if (result.threats && result.threats.length > 0) {
                result.threats.forEach(threat => {
                    const threatText = (threat.threat || '').toLowerCase();
                    const vulnText = (threat.vulnerability || '').toLowerCase();
                    const combinedText = `${threatText} ${vulnText}`;
                    
                    // Check for Cross-site Scripting / XSS
                    if (combinedText.includes('xss') || 
                        combinedText.includes('cross-site scripting') || 
                        combinedText.includes('cross site scripting') ||
                        combinedText.includes('script injection')) {
                        crossSiteScripting++;
                        xssThreats.push({ resultId: result._id, threat: threat.threat, vulnerability: threat.vulnerability });
                    }
                    // Check for SQL Injection
                    else if (combinedText.includes('sql injection') || 
                             combinedText.includes('sqli') ||
                             combinedText.includes('sql inject')) {
                        sqlInjection++;
                        sqlThreats.push({ resultId: result._id, threat: threat.threat, vulnerability: threat.vulnerability });
                    }
                    // Check for CSRF
                    else if (combinedText.includes('csrf') || 
                             combinedText.includes('cross-site request forgery') ||
                             combinedText.includes('cross site request forgery')) {
                        csrf++;
                        csrfThreats.push({ resultId: result._id, threat: threat.threat, vulnerability: threat.vulnerability });
                    }
                    // Check for Authentication issues
                    else if (combinedText.includes('authentication') || 
                             combinedText.includes('broken auth') ||
                             combinedText.includes('auth') ||
                             combinedText.includes('login') ||
                             combinedText.includes('password')) {
                        brokenAuthentication++;
                        authThreats.push({ resultId: result._id, threat: threat.threat, vulnerability: threat.vulnerability });
                    }
                });
            }
        });

        // Calculate total threats and "Other"
        const totalThreats = allResultsWithThreats.reduce((sum, result) => {
            return sum + (result.threats ? result.threats.length : 0);
        }, 0);
        
        const categorized = crossSiteScripting + sqlInjection + csrf + brokenAuthentication;
        const other = totalThreats - categorized;

        console.log('\n=== THREAT ANALYSIS RESULTS ===');
        console.log(`Cross-site Scripting threats found: ${crossSiteScripting}`);
        xssThreats.forEach((t, i) => console.log(`  ${i+1}. "${t.threat}" - "${t.vulnerability}"`));
        
        console.log(`\nSQL Injection threats found: ${sqlInjection}`);
        sqlThreats.forEach((t, i) => console.log(`  ${i+1}. "${t.threat}" - "${t.vulnerability}"`));
        
        console.log(`\nCSRF threats found: ${csrf}`);
        csrfThreats.forEach((t, i) => console.log(`  ${i+1}. "${t.threat}" - "${t.vulnerability}"`));
        
        console.log(`\nBroken Authentication threats found: ${brokenAuthentication}`);
        authThreats.forEach((t, i) => console.log(`  ${i+1}. "${t.threat}" - "${t.vulnerability}"`));

        console.log('\n=== SUMMARY ===');
        console.log(`Cross-site Scripting: ${crossSiteScripting}`);
        console.log(`SQL Injection: ${sqlInjection}`);
        console.log(`CSRF: ${csrf}`);
        console.log(`Broken Authentication: ${brokenAuthentication}`);
        console.log(`Other: ${other}`);
        console.log(`Total categorized: ${categorized}`);
        console.log(`Total threats in DB: ${totalThreats}`);
        console.log('==========================================');

        const vulnerabilityData = {
            crossSiteScripting,
            sqlInjection,
            csrf,
            brokenAuthentication,
            other: other > 0 ? other : 0
        };

        res.json({
            message: 'Vulnerability types retrieved successfully',
            vulnerabilityTypes: vulnerabilityData,
            chartData: {
                labels: ['Cross-site Scripting', 'SQL Injection', 'CSRF', 'Broken Authentication', 'Other'],
                data: [crossSiteScripting, sqlInjection, csrf, brokenAuthentication, other > 0 ? other : 0],
                colors: ['#f16b7a', '#f8ab59', '#fbe078', '#89c791', '#62a3d3']
            },
            debug: {
                totalResults: allResultsWithThreats.length,
                totalThreats: totalThreats,
                categorizedThreats: categorized,
                sampleResults: allResults.slice(0, 3),
                detailedThreats: {
                    xss: xssThreats,
                    sql: sqlThreats,
                    csrf: csrfThreats,
                    auth: authThreats
                }
            }
        });
    } catch (err) {
        console.error('Vulnerability types error:', err);
        res.status(500).json({ error: 'Failed to retrieve vulnerability types' });
    }
};



module.exports = {
    addScanToUrl,
    getScansByUrlId,
    getAllScansStats,
    updateScanStatus,
    getWeeklyScanActivity,
    getVulnerabilityTypes
};
