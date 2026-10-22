import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';

let appInstance: any = null;

export default async function handler(req: any, res: any) {
  try {
    await connectDatabase();
    if (!appInstance) {
      appInstance = createApp();
    }
    return appInstance(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless] Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Serverless Error',
    });
  }
}
