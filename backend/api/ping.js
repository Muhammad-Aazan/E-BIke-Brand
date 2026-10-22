// Minimal Vercel debug handler - no imports, no DB, no Express
module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'missing',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ? 'set' : 'missing',
    },
    cwd: process.cwd(),
    nodeVersion: process.version,
  });
};
