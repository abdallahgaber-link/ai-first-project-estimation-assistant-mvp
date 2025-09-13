import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { exportHandler } from '../../handlers/export';

describe('Export Handler', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.route('/api/export', exportHandler);
  });

  const mockEstimationData = {
    projectTitle: 'Test Project',
    wbs: {
      epics: [{
        name: 'Development',
        assumptions: ['Test assumption'],
        risks: ['Test risk'],
        modules: [{
          name: 'Test Module',
          complexity: 'M' as const,
          notes: 'Test notes',
          primary_role: 'Frontend/React'
        }]
      }]
    },
    modules: [{
      name: 'Test Module',
      complexity: 'M' as const,
      basePoints: 5,
      multipliers: {},
      totalPoints: 5,
      weeks: 0.5,
      role: 'Frontend/React',
      notes: 'Test notes'
    }],
    roles: [{
      role: 'Frontend/React',
      effortWeeks: 0.5,
      percentage: 100
    }],
    totals: {
      developmentMDs: 2.5,
      accessibilityMDs: 0.25,
      externalApisMDs: 0.25,
      appStorePublishingMDs: 3,
      bugFixingMDs: 0.75,
      totalMDs: 6.75
    },
    optimistic: 0.54,
    mostLikely: 0.675,
    pessimistic: 0.878,
    velocity: 20,
    bufferUsed: 0.2,
    assumptions: ['Test assumption'],
    risks: ['Test risk']
  };

  it('should export CSV successfully', async () => {
    const res = await app.request('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'csv',
        data: mockEstimationData
      })
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/csv');
    expect(res.headers.get('content-disposition')).toContain('attachment');
  });

  it('should export XLSX successfully', async () => {
    const res = await app.request('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'xlsx',
        data: mockEstimationData
      })
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('should export PDF successfully', async () => {
    const res = await app.request('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'pdf',
        data: mockEstimationData
      })
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
  });

  it('should validate export format', async () => {
    const res = await app.request('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'invalid',
        data: mockEstimationData
      })
    });

    expect(res.status).toBe(400);
  });

  it('should validate estimation data', async () => {
    const res = await app.request('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'csv',
        data: { invalid: 'data' }
      })
    });

    expect(res.status).toBe(400);
  });
});
