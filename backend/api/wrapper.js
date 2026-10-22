// Vercel serverless entry — wraps Express app with error catching
let app;
let loadError;

try {
  const mod = require('./index.js');
  app = mod.default || mod;
} catch (err) {
  loadError = err;
  console.error('[FATAL] Failed to load Express app:', err);
}

module.exports = (req, res) => {
  if (loadError) {
    res.status(500).json({
      error: 'App failed to load',
      message: loadError.message,
      stack: loadError.stack,
    });
    return;
  }
  app(req, res);
};
