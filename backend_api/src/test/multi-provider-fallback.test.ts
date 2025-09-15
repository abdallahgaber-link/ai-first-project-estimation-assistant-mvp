import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createAzureClient } from '../lib/azureClient';
import { createGeminiClient } from '../lib/geminiClient';
import { createOllamaClient } from '../lib/ollamaClient';

// Mock the config to enable fallback
vi.mock('../config', () => ({
  getConfig: () => ({
    llm: {
      primaryProvider: 'azure',
      enableFallback: true,
      fallbackProviders: ['gemini', 'ollama']
    }
  })
}));

describe('Multi-Provider Fallback System', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Health Checks', () => {
    it('should check Azure health successfully', async () => {
      const azureClient = createAzureClient();
      const healthResult = await azureClient.healthCheck();
      
      expect(healthResult).toMatchObject({
        ok: expect.any(Boolean),
        provider: 'azure',
        model: expect.any(String),
        latencyMs: expect.any(Number),
        sessionId: expect.any(String)
      });
    });

    it('should check Ollama health successfully', async () => {
      const ollamaClient = createOllamaClient();
      const healthResult = await ollamaClient.healthCheck();
      
      expect(healthResult).toMatchObject({
        ok: expect.any(Boolean),
        provider: 'ollama',
        model: expect.any(String),
        latencyMs: expect.any(Number),
        sessionId: expect.any(String)
      });
    });

    it('should handle Gemini client creation without API key', () => {
      // Temporarily remove GEMINI_API_KEY
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      
      expect(() => createGeminiClient()).toThrow('GEMINI_API_KEY is required for Gemini client');
      
      // Restore the key
      if (originalKey) {
        process.env.GEMINI_API_KEY = originalKey;
      }
    });
  });

  describe('Provider Configuration', () => {
    it('should have correct fallback configuration', async () => {
      const response = await fetch('http://localhost:3001/api/health/all');
      const healthData = await response.json();
      
      expect(healthData.configuration).toMatchObject({
        primaryProvider: 'azure',
        fallbackEnabled: true,
        fallbackProviders: expect.arrayContaining(['gemini', 'ollama'])
      });
    });

    it('should show Azure as primary provider', async () => {
      const response = await fetch('http://localhost:3001/api/health/all');
      const healthData = await response.json();
      
      const azureProvider = healthData.providers.find((p: any) => p.provider === 'azure');
      expect(azureProvider).toMatchObject({
        provider: 'azure',
        isPrimary: true
      });
    });

    it('should show fallback providers correctly', async () => {
      const response = await fetch('http://localhost:3001/api/health/all');
      const healthData = await response.json();
      
      const fallbackProviders = healthData.providers.filter((p: any) => p.isFallback);
      expect(fallbackProviders.length).toBeGreaterThan(0);
      
      fallbackProviders.forEach((provider: any) => {
        expect(provider.isFallback).toBe(true);
        expect(['gemini', 'ollama']).toContain(provider.provider);
      });
    });
  });

  describe('Estimation API with Provider Metadata', () => {
    it('should return provider metadata in estimation response', async () => {
      const estimationRequest = {
        projectTitle: 'Test Multi-Provider App',
        description: 'Testing multi-provider fallback system',
        platforms: ['web'],
        teamSize: '3',
        timeline: '2 months',
        complexity: 'medium',
        teamExperience: 'mid',
        qualityLevel: 'production'
      };

      const response = await fetch('http://localhost:3001/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimationRequest)
      });

      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.meta).toMatchObject({
        provider: expect.any(String),
        model: expect.any(String),
        sessionId: expect.any(String),
        latencyMs: expect.any(Number),
        retryCount: expect.any(Number),
        inputTokens: expect.any(Number),
        outputTokens: expect.any(Number),
        totalTokens: expect.any(Number),
        timestamp: expect.any(String)
      });
      
      // Should use Azure as primary provider (unless it fails)
      expect(['azure', 'ollama', 'sample-fallback']).toContain(data.meta.provider);
    });

    it('should handle estimation with proper fallback sequence', async () => {
      const estimationRequest = {
        projectTitle: 'Fallback Test App',
        description: 'Testing fallback behavior',
        platforms: ['mobile'],
        teamSize: '2',
        timeline: '1 month',
        complexity: 'low',
        teamExperience: 'junior',
        qualityLevel: 'mvp'
      };

      const response = await fetch('http://localhost:3001/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimationRequest)
      });

      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        modules: expect.any(Array),
        roles: expect.any(Array),
        assumptions: expect.any(Array),
        risks: expect.any(Array)
      });
    });
  });

  describe('Individual Provider Health Endpoints', () => {
    it('should have working Azure health endpoint', async () => {
      const response = await fetch('http://localhost:3001/api/health/azure');
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.provider).toBe('azure');
      expect(data).toHaveProperty('ok');
      expect(data).toHaveProperty('latencyMs');
    });

    it('should have working Ollama health endpoint', async () => {
      const response = await fetch('http://localhost:3001/api/health/ollama');
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.provider).toBe('ollama');
      expect(data).toHaveProperty('ok');
      expect(data).toHaveProperty('latencyMs');
    });

    it('should have working all providers health endpoint', async () => {
      const response = await fetch('http://localhost:3001/api/health/all');
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('providers');
      expect(data).toHaveProperty('configuration');
      expect(data.providers).toBeInstanceOf(Array);
      expect(data.providers.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should gracefully handle provider failures in health checks', async () => {
      // Test that the system doesn't crash when a provider is unavailable
      const response = await fetch('http://localhost:3001/api/health/all');
      const data = await response.json();
      
      // Should still return a response even if some providers fail
      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('providers');
      expect(data).toHaveProperty('configuration');
    });

    it('should provide meaningful error information', async () => {
      const invalidRequest = {
        projectTitle: 'Test',
        // Missing required fields
      };

      const response = await fetch('http://localhost:3001/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidRequest)
      });

      const data = await response.json();
      
      expect(response.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
    });
  });
});
