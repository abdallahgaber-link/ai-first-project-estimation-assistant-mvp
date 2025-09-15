// Load environment variables first
import { loadConfig } from './config/index';
loadConfig();

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { estimateHandler } from './handlers/estimate';
import { exportHandler } from './handlers/export';
import { healthHandler } from './handlers/health';
import logger from './services/logger.service';

const app = new Hono();

// Middleware
app.use('*', honoLogger());
app.use('*', cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
    process.env.CORS_ORIGIN || '*'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
}));

// Custom logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  logger.logApiRequest(method, path, status, duration, {
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip')
  });
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const api = new Hono();
api.route('/estimate', estimateHandler);
api.route('/export', exportHandler);
api.route('/health', healthHandler);

// Mount API routes
app.route('/api', api);

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    { error: 'Internal Server Error', message: err.message },
    500
  );
});

// Start server
const port = parseInt(process.env.PORT || '3000');

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on port ${port}`);
