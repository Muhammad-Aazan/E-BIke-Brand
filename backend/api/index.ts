// Force IPv4 DNS resolution FIRST — required for MongoDB Atlas SRV on Node.js
// (Node 18+ defaults to IPv6, which breaks Atlas SRV record resolution)
import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';

const app = createApp();

// Connect DB at cold-start so routes have a live connection
connectDatabase().catch((err) => {
  console.error('[MongoDB] Cold-start connection failed:', err?.message || err);
});

export default app;
