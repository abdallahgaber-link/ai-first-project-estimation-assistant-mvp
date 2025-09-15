import { Hono } from 'hono';
import { azureHealthCheck, geminiHealthCheck, ollamaHealthCheck, allProvidersHealthCheck } from '../health';

const healthHandler = new Hono();

// Individual provider health checks
healthHandler.get('/azure', azureHealthCheck);
healthHandler.get('/gemini', geminiHealthCheck);
healthHandler.get('/ollama', ollamaHealthCheck);

// All providers health check
healthHandler.get('/all', allProvidersHealthCheck);

export { healthHandler };
