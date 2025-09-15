import { Hono } from 'hono';
import { createAzureClient, type AzureError } from '../lib/azureClient';
import logger from '../services/logger.service';

// Create a new router for health endpoints
export const healthHandler = new Hono();

// GET /api/health/azure
healthHandler.get('/azure', async (c) => {
  const startTime = Date.now();
  
  try {
    const azureClient = createAzureClient();
    const result = await azureClient.healthCheck();
    
    logger.info('Azure health check successful', {
      sessionId: result.sessionId,
      latencyMs: result.latencyMs,
      model: result.model
    });
    
    return c.json({
      ok: true,
      provider: result.provider,
      model: result.model,
      latencyMs: result.latencyMs,
      sessionId: result.sessionId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    if (error instanceof Error && 'status' in error) {
      const azureError = error as AzureError;
      
      logger.error('Azure health check failed', azureError.message, {
        status: azureError.status,
        latencyMs,
        details: azureError.details?.substring(0, 300)
      });
      
      return c.json(
        {
          ok: false,
          error: azureError.message,
          provider: 'azure',
          status: azureError.status,
          latencyMs,
          timestamp: new Date().toISOString()
        },
        502
      );
    }
    
    logger.error('Azure health check network error', error instanceof Error ? error.message : 'Unknown error', {
      latencyMs
    });
    
    return c.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'azure',
        status: 0,
        latencyMs,
        timestamp: new Date().toISOString()
      },
      502
    );
  }
});
