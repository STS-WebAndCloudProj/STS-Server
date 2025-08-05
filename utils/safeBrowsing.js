const axios = require('axios');

const checkUrlSafety = async (url) => {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    const body = {
        client: {
            clientId: "sts-server",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
        }
    };

    try {
        const response = await axios.post(endpoint, body);
        if (response.data.matches) {
            return { safe: false, threats: response.data.matches };
        }
        return { safe: true };
    } catch (error) {
        console.error("Error checking URL safety:", error);
        return { safe: false, error: "Error checking URL safety" };
    }
};

module.exports = { checkUrlSafety };