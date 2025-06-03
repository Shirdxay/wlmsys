require('dotenv').config();
const mongoose = require('mongoose');

function getMongoUri(configOverrides = {}) {
  // Use override if provided, else fallback to env
  return (
    configOverrides.uri ||
    process.env.MONGODB_URI ||
    `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
  );
}

async function connectMongo(configOverrides = {}) {
  const uri = getMongoUri(configOverrides);
  try {
    await mongoose.connect(uri, configOverrides.options || {});
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

module.exports = {
  connectMongo,
  getMongoUri,
};
