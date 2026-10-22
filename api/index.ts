import { createApp } from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';

const app = createApp();

let isConnected = false;

app.use(async (_req, _res, next) => {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (err) {
      console.error('[MongoDB Atlas Connection Error]:', err);
    }
  }
  next();
});

export default app;
