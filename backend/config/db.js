const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas.
 * The connection string is read from the MONGO_URI environment variable.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit so the failure is obvious during development instead of silently running without a DB.
    process.exit(1);
  }
};

module.exports = connectDB;
