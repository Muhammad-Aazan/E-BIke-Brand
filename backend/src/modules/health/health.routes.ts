import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  const status = dbState === 1 ? 'ok' : 'degraded';

  res.status(dbState === 1 ? 200 : 503).json({
    success: true,
    data: {
      status,
      timestamp: new Date().toISOString(),
      service: 'EVee API',
      version: '1.0.0',
      database: dbStatus,
      uptime: process.uptime(),
    },
  });
});
