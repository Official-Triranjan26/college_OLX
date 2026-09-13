// tests/setup/test-db.js
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/test_db';

exports.connectDB = async () => {
  // Disable buffering so Mongoose throws errors instantly instead of hanging
  mongoose.set('bufferCommands', false);

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30s
    });
    console.log(' Successfully connected to Test MongoDB');
  } catch (err) {
    console.error(' MongoDB Connection Error:', err.message);
    throw err;
  }
};

exports.dropDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};

exports.dropCollections = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};