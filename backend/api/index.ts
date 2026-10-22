import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  // Direct diagnostics ping route (no DB required)
  if (req.url === '/api/ping' || req.url === '/api/v1/ping' || req.url === '/ping') {
    return res.status(200).json({
      status: 'ok',
      message: 'EVee Backend Vercel Serverless Function is running!',
      timestamp: new Date().toISOString(),
      node: process.version,
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      envKeys: Object.keys(process.env).filter(
        (k) => !k.toLowerCase().includes('secret') && !k.toLowerCase().includes('pass') && !k.toLowerCase().includes('key')
      ),
    });
  }

  try {
    await connectDatabase();
    if (!appInstance) {
      appInstance = createApp();
    }
    return appInstance(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Serverless or Database invocation error',
      stack: err.stack,
    });
  }
}
