// Minimal Vercel debug handler - no imports, no DB, no Express
module.exports = (req, res) => {
  const uri = process.env.MONGODB_URI || '';
  res.status(200).json({
    ok: true,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      MONGODB_URI_SET: !!uri,
      MONGODB_URI_PREFIX: uri.substring(0, 35) + (uri.length > 35 ? '...' : ''),
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ? 'set' : 'missing',
    },
    cwd: process.cwd(),
    nodeVersion: process.version,
  });
};
