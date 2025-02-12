const mongoose = require('mongoose');
const shortid = require('shortid');

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, default: shortid.generate }, // Generates unique short codes
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Ensure uniqueness of shortUrl
urlSchema.index({ shortUrl: 1 }, { unique: true });

module.exports = mongoose.model('Url', urlSchema);
