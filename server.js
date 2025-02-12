require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'https://urlshortener-frontend-azure.vercel.app/' }));

// URL model
const Url = require('./models/Url');

// Route for URL shortening
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  // Validate the URL
  if (!originalUrl) {
    return res.status(400).json({ error: "Original URL is required" });
  }

  // Logic to check if URL already exists
  let existingUrl = await Url.findOne({ originalUrl });

  if (existingUrl) {
    return res.json({ shortUrl: existingUrl.shortUrl });
  }

  // Generate short URL
  const shortUrl = shortid.generate();
  const newUrl = new Url({ originalUrl, shortUrl });

  try {
    // Save the new URL in the database
    await newUrl.save();
    res.json({ shortUrl: `https://urlshortnerbackend-a2xi.onrender.com/${shortUrl}` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error while shortening the URL" });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Root route for testing
app.get('/', (req, res) => {
  res.send('URL Shortener API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
