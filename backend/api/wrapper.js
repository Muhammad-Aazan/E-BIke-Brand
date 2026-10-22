// Force IPv4 DNS - required for MongoDB Atlas SRV on Node 18+
const dns = require('dns');
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');

let app;

// Establish (or reuse) MongoDB connection before handling any request
async function ensureDb() {
  if (mongoose.connection.readyState === 1) return; // already connected
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'evee_db';
  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });
}

module.exports = async (req, res) => {
  // Load Express app once (module-level cache)
  if (!app) {
    try {
      const mod = require('./index.js');
      app = mod.default || mod;
    } catch (err) {
      console.error('[FATAL] Express app failed to load:', err.message);
      return res.status(500).json({ error: 'App load failed', message: err.message });
    }
  }

  // Connect DB (cached after first success)
  try {
    await ensureDb();
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    // Don't block the request — routes will handle DB errors gracefully
  }

  app(req, res);
};
