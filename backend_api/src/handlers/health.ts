import { Context } from 'hono';
import { createAzureClient, type AzureError } from '../lib/azureClient';
import { createGeminiClient } from '../lib/geminiClient';
import { createOllamaClient } from '../lib/ollamaClient';
import { getConfig } from '../config';
import { logger } from '../lib/logger';

export async function azureHealthCheck(c: Context) {
  const startTime = Date.now();
  
  try {
    const azureClient = createAzureClient();
    const healthResult = await azureClient.healthCheck();
    
    const latencyMs = Date.now() - startTime;
    
    logger.info('Azure health check completed', {
      ...healthResult,
      latencyMs
    });
    
    return c.json({
      ...healthResult,
      latencyMs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    
    if (error && typeof error === 'object' && 'status' in error) {
      const azureError = error as AzureError;
      
      logger.error('Azure health check failed', {
        error: azureError.message,
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
    
    logger.error('Azure health check network error', {
      error: error instanceof Error ? error.message : 'Unknown error',
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
}

export async function geminiHealthCheck(c: Context) {
  const startTime = Date.now();
  
  try {
    const geminiClient = createGeminiClient();
    const healthResult = await geminiClient.healthCheck();
    
    const latencyMs = Date.now() - startTime;
    
    logger.info('Gemini health check completed', {
      ...healthResult,
      latencyMs
    });
    
    return c.json({
      ...healthResult,
      latencyMs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('Gemini health check failed', {
      error: errorMessage,
      latencyMs
    });
    
    return c.json(
      {
        ok: false,
        provider: 'gemini',
        error: errorMessage,
        latencyMs,
        timestamp: new Date().toISOString()
      },
      502
    );
  }
}

export async function ollamaHealthCheck(c: Context) {
  const startTime = Date.now();
  
  try {
    const ollamaClient = createOllamaClient();
    const healthResult = await ollamaClient.healthCheck();
    
    const latencyMs = Date.now() - startTime;
    
    logger.info('Ollama health check completed', {
      ...healthResult,
      latencyMs
    });
    
    return c.json({
      ...healthResult,
      latencyMs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('Ollama health check failed', {
      error: errorMessage,
      latencyMs
    });
    
    return c.json(
      {
        ok: false,
        provider: 'ollama',
        error: errorMessage,
        latencyMs,
        timestamp: new Date().toISOString()
      },
      502
    );
  }
}

export async function allProvidersHealthCheck(c: Context) {
  const startTime = Date.now();
  const config = getConfig();
  
  try {
    const results: any[] = [];
    
    // Always check Azure (primary)
    try {
      const azureClient = createAzureClient();
      const azureResult = await azureClient.healthCheck();
      results.push({ ...azureResult, isPrimary: true });
    } catch (error) {
      results.push({
        ok: false,
        provider: 'azure',
        error: error instanceof Error ? error.message : 'Unknown error',
        isPrimary: true
      });
    }
    
    // Check fallback providers if enabled
    if (config.llm.enableFallback) {
      for (const provider of config.llm.fallbackProviders) {
        try {
          if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
            const geminiClient = createGeminiClient();
            const geminiResult = await geminiClient.healthCheck();
            results.push({ ...geminiResult, isFallback: true });
          } else if (provider === 'ollama') {
            const ollamaClient = createOllamaClient();
            const ollamaResult = await ollamaClient.healthCheck();
            results.push({ ...ollamaResult, isFallback: true });
          }
        } catch (error) {
          results.push({
            ok: false,
            provider,
            error: error instanceof Error ? error.message : 'Unknown error',
            isFallback: true
          });
        }
      }
    }
    
    const latencyMs = Date.now() - startTime;
    const allHealthy = results.every(r => r.ok);
    
    logger.info('All providers health check completed', {
      allHealthy,
      latencyMs,
      results: results.length
    });
    
    return c.json({
      ok: allHealthy,
      latencyMs,
      timestamp: new Date().toISOString(),
      configuration: {
        primaryProvider: config.llm.primaryProvider,
        fallbackEnabled: config.llm.enableFallback,
        fallbackProviders: config.llm.fallbackProviders
      },
      providers: results
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('All providers health check failed', {
      error: errorMessage,
      latencyMs
    });
    
    return c.json(
      {
        ok: false,
        error: errorMessage,
        latencyMs,
        timestamp: new Date().toISOString()
      },
      502
    );
  }
}
