import { createApp } from '../backend/src/app';
import { connectDatabase } from '../backend/src/config/database';

const app = createApp();

// Middleware to ensure MongoDB is connected before handling any route
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

export default app;
