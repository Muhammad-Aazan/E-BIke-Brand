export default async function handler(req: any, res: any) {
  // Quick ping check
  if (req.url && (req.url.includes('ping') || req.url === '/')) {
    try {
      const { connectDatabase } = await import('../src/config/database');
      await connectDatabase();
      return res.status(200).json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        url: req.url,
      });
    } catch (dbErr: any) {
      return res.status(200).json({
        status: 'ok',
        database: 'error',
        dbError: dbErr.message,
        timestamp: new Date().toISOString(),
        url: req.url,
      });
    }
  }

  try {
    const { connectDatabase } = await import('../src/config/database');
    await connectDatabase();
    const { createApp } = await import('../src/app');
    const app = createApp();
    return app(req, res);
  } catch (err: any) {
    console.error('[Serverless Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Server error',
      stack: err?.stack,
    });
  }
}
