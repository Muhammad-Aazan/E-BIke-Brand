// Debug endpoint - tries MongoDB connection and reports exact error
const mongoose = require('mongoose');
const dns = require('dns');

module.exports = async (req, res) => {
  if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'evee_db';

  let result = {
    uri_prefix: uri.substring(0, 40) + '...',
    readyState: mongoose.connection.readyState,
    error: null,
    connected: false,
  };

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, {
        dbName,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
    }
    result.connected = true;
    result.readyState = mongoose.connection.readyState;
  } catch (err) {
    result.error = err.message;
  }

  res.status(200).json(result);
};
