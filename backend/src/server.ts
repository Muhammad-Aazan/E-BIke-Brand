import { createApp } from './app';
import { connectDatabase } from './config/database';
import { logger } from './common/utils/logger';
import { config } from './config';

const PORT = config.server.port;

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    const app = createApp();
    const server = app.listen(PORT, () => {
      logger.info(`EVee API server started`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`Port: ${PORT}`);
      logger.info(`API: http://localhost:${PORT}/api/v1`);
      logger.info(`Docs: http://localhost:${PORT}/api/docs`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          const { disconnectDatabase } = await import('./config/database');
          await disconnectDatabase();
        } catch (err) {
          logger.error('Error during shutdown:', err);
        }
        process.exit(0);
      });

      // Force exit after 30s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception:', err);
      shutdown('uncaughtException').catch(() => process.exit(1));
    });
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  bootstrap();
}

export default createApp;
