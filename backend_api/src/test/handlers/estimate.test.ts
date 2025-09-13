import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { estimateHandler } from '../../handlers/estimate';
import { MockLLMProvider } from '../mocks/llm.mock';

// Mock the LLM service
vi.mock('../../lib/llm', () => ({
  getLLMService: () => ({
    generateEstimation: vi.fn().mockResolvedValue({
      result: {
        wbs: { epics: [] },
        modules: [],
        roles: [],
        totals: { totalMDs: 10 },
        optimistic: 1,
        mostLikely: 2,
        pessimistic: 3,
        velocity: 20,
        bufferUsed: 0.2,
        assumptions: [],
        risks: []
      },
      meta: {
        provider: 'mock',
        model: 'test-model',
        sessionId: 'test-session',
        latencyMs: 100,
        retryCount: 0,
        inputTokens: 50,
        outputTokens: 100,
        totalTokens: 150,
        timestamp: new Date().toISOString()
      }
    })
  })
}));

describe('Estimate Handler', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/estimate', estimateHandler);
  });

  it('should generate estimation successfully', async () => {
    const requestData = {
      projectTitle: 'Test Project',
      description: 'A test project for estimation',
      platforms: ['web'],
      integrations: [],
      nfrs: [],
      languagesCount: 1,
      teamExperience: 'mid',
      qualityLevel: 'production',
      outputLanguage: 'en'
    };

    const res = await app.request('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.wbs).toBeDefined();
    expect(data.data.modules).toBeDefined();
    expect(data.data.roles).toBeDefined();
    expect(data.meta).toBeDefined();
    expect(data.meta.provider).toBe('mock');
  });

  it('should validate required fields', async () => {
    const invalidRequest = {
      description: 'Missing project title'
    };

    const res = await app.request('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidRequest)
    });

    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('validation');
  });

  it('should validate enum values', async () => {
    const invalidRequest = {
      projectTitle: 'Test',
      description: 'Test description',
      platforms: ['web'],
      teamExperience: 'invalid', // Invalid enum value
      qualityLevel: 'production',
      outputLanguage: 'en'
    };

    const res = await app.request('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidRequest)
    });

    expect(res.status).toBe(400);
  });
});
