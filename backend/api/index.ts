import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';

const app = createApp();

// In serverless, each cold start needs a fresh connection attempt.
// We use a module-level promise so concurrent requests share one attempt.
let dbPromise: Promise<void> | null = null;

function ensureDb(): Promise<void> {
  if (!dbPromise) {
    dbPromise = connectDatabase().catch((err) => {
      // Reset so next request retries
      dbPromise = null;
      console.error('[MongoDB] Connection failed:', err?.message || err);
      throw err;
    });
  }
  return dbPromise;
}

app.use(async (_req, _res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

export default app;
