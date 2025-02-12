require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid'); // For generating unique short URLs
const Url = require('./models/Url'); // Assuming the model is in models/Url.js

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'https://urlshortener-frontend-azure.vercel.app/' }));

// Root route for testing
app.get('/', (req, res) => {
  res.send('URL Shortener API is running...');
});

// POST route for shortening the URL
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body; // Get the URL from the request body

  if (!originalUrl) {
    return res.status(400).json({ message: 'Please provide a valid URL.' });
  }

  try {
    // Check if the original URL already exists in the database
    let url = await Url.findOne({ originalUrl });

    if (url) {
      return res.status(200).json({ shortUrl: url.shortUrl });
    }

    // Create a new URL document with the original and generated short URL
    const shortUrl = shortid.generate(); // Generates a unique short URL
    url = new Url({
      originalUrl,
      shortUrl
    });

    // Save the URL to the database
    await url.save();

    // Send back the shortened URL
    res.status(201).json({ shortUrl: url.shortUrl });
  } catch (err) {
    console.error('Error creating short URL:', err);
    res.status(500).json({ message: 'An error occurred while shortening the URL.' });
  }
});

// Import and use URL routes (you may still have other routes in a separate file)
const urlRoutes = require('./routes/urlRoutes');
app.use('/', urlRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
