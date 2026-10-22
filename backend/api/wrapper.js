// Vercel serverless entry — exposes exact DB connection error
module.exports = async (req, res) => {
  try {
    const mod = require('./index.js');
    const app = mod.default || mod;

    // If /debug-db requested, try connecting manually and report result
    if (req.url === '/debug-db') {
      const mongoose = require('mongoose');
      const uri = process.env.MONGODB_URI;
      res.status(200).json({
        uri_prefix: uri ? uri.substring(0, 30) + '...' : 'NOT SET',
        mongoose_state: mongoose.connection.readyState,
        // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      });
      return;
    }

    app(req, res);
  } catch (err) {
    res.status(500).json({
      error: 'App crashed',
      message: err.message,
      stack: err.stack,
    });
  }
};
