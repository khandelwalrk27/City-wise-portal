const express = require('express');
const router = express.Router();
const { fetchLiveJaipurWeather, generatePredictiveCivicRisks } = require('../services/weatherPredictiveService');

// Get Live Jaipur Weather & 12h Forecast
router.get('/weather', async (req, res) => {
  try {
    const weather = await fetchLiveJaipurWeather();
    return res.json(weather);
  } catch (err) {
    console.error('Error fetching live weather:', err);
    return res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

// Get Predictive Civic Risk Analysis & Anomaly Detection
router.get('/risks', async (req, res) => {
  try {
    const analysis = await generatePredictiveCivicRisks();
    return res.json(analysis);
  } catch (err) {
    console.error('Error generating predictive civic risks:', err);
    return res.status(500).json({ error: 'Failed to generate predictive risk analysis.' });
  }
});

module.exports = router;
