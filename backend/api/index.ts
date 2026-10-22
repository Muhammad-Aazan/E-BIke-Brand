import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';

const app = createApp();

// Connect DB immediately at module load (serverless cold start).
// Mongoose caches the connection — subsequent calls are no-ops.
connectDatabase().catch((err) => {
  console.error('[MongoDB] Cold-start connection failed:', err?.message || err);
});

export default app;
