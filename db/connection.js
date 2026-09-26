const mongoose = require('mongoose');

// Connects to MongoDB using the URI defined in the .env file.
// Keeping this in its own module lets both app.js and the seed
// script reuse the exact same connection logic.
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sports_management';

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected -> ${uri}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
