import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';

let isConnected = false;
let appInstance: any = null;

async function init() {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await init();
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Serverless initialization error',
      code: err?.code || 'SERVERLESS_ERROR',
    });
  }
}
