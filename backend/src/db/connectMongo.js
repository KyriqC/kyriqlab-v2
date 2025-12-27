// backend/src/db/connectMongo.js
const mongoose = require('mongoose');

module.exports = async function connectMongo(uri) {
  const mongoUri = uri || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI');
  }

  // Mongoose 7/8/9 don’t require extra options; keep it simple
  await mongoose.connect(mongoUri);

  return mongoose.connection;
};
