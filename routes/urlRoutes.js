const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const crypto = require('crypto');

// Shorten a URL
router.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
    }

    try {
        // Generate a short code
        const shortCode = crypto.randomBytes(3).toString('hex'); // Example: 'a1b2c3'

        // Save to MongoDB
        const url = await Url.create({ originalUrl, shortUrl: shortCode, clicks: 0 });

        // Use environment variable for base URL or default to localhost
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

        res.json({ shortUrl: `${baseUrl}/${url.shortUrl}` });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Redirect to the Original URL
router.get('/:shortUrl', async (req, res) => {
    try {
        const url = await Url.findOne({ shortUrl: req.params.shortUrl });

        if (url) {
            url.clicks += 1; // Increment clicks
            await url.save();
            return res.redirect(url.originalUrl);
        } else {
            return res.status(404).json({ error: 'URL not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get URL history
router.get('/history', async (req, res) => {
    try {
        const urls = await Url.find().sort({ createdAt: -1 });  // Sort by creation date
        res.json(urls);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
