// genrating random results from a JSON file
const fs = require('fs');
const path = require('path');

// Path to the JSON file with threat data
const threatsFilePath = path.join(__dirname, '../data/threats.json');

function getRandomThreats(count = 5) {
  try {
    const rawData = fs.readFileSync(threatsFilePath);
    const threats = JSON.parse(rawData);

    const shuffled = threats.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count); // מחזיר אובייקטים שלמים
  } catch (err) {
    console.error('Error reading or parsing threats.json:', err);
    return [];
  }
}

module.exports = { getRandomThreats };
