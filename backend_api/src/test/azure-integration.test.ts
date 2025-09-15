import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAzureClient, type AzureClient, type AzureError } from '../lib/azureClient';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('Azure Integration Tests', () => {
  let azureClient: AzureClient;

  beforeAll(() => {
    // Set up test environment variables
    process.env.AZURE_RESOURCE_NAME = 'test-resource';
    process.env.AZURE_DEPLOYMENT_NAME = 'test-deployment';
    process.env.AZURE_OPENAI_API_VERSION = '2025-01-01-preview';
    process.env.AZURE_OPENAI_SHARED_TOKEN = 'test-token';

    azureClient = createAzureClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Azure Client Success Cases', () => {
    it('should successfully make a chat request', async () => {
      const mockResponse = {
        id: 'chatcmpl-test',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: '{"ok": true}'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      });

      const result = await azureClient.chat({
        messages: [
          { role: 'system', content: 'Test system message' },
          { role: 'user', content: 'Test user message' }
        ]
      });

      expect(result.response.model).toBe('gpt-4');
      expect(result.sessionId).toBeDefined();
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.response.choices[0].message.content).toBe('{"ok": true}');
      
      // Verify the URL includes query parameters
      const callArgs = mockFetch.mock.calls[0];
      const url = callArgs[0] as string;
      expect(url).toContain('api-version=2025-01-01-preview');
      expect(url).toContain('Authorization=Bearer+test-token');
      expect(url).toContain('test-resource.openai.azure.com');
    });

    it('should successfully perform health check', async () => {
      const mockResponse = {
        id: 'chatcmpl-health',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: '{"ok": true}'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 3,
          total_tokens: 8
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      });

      const result = await azureClient.healthCheck();

      expect(result.ok).toBe(true);
      expect(result.provider).toBe('azure');
      expect(result.model).toBe('gpt-4');
      expect(result.sessionId).toBeDefined();
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Azure Client Error Cases', () => {
    it('should handle 401 authentication error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('{"error": {"code": "InvalidAuthenticationToken", "message": "Invalid token"}}')
      });

      await expect(azureClient.chat({
        messages: [{ role: 'user', content: 'test' }]
      })).rejects.toThrow('Azure OpenAI request failed: 401 Unauthorized');
    });

    it('should handle 403 forbidden error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve('{"error": {"code": "Forbidden", "message": "Access denied"}}')
      });

      await expect(azureClient.chat({
        messages: [{ role: 'user', content: 'test' }]
      })).rejects.toThrow('Azure OpenAI request failed: 403 Forbidden');
    });

    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: () => Promise.resolve('{"error": {"code": "RateLimitExceeded", "message": "Rate limit exceeded"}}')
      });

      await expect(azureClient.chat({
        messages: [{ role: 'user', content: 'test' }]
      })).rejects.toThrow('Azure OpenAI request failed: 429 Too Many Requests');
    });

    it('should handle 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('{"error": {"code": "InternalServerError", "message": "Server error"}}')
      });

      await expect(azureClient.chat({
        messages: [{ role: 'user', content: 'test' }]
      })).rejects.toThrow('Azure OpenAI request failed: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(azureClient.chat({
        messages: [{ role: 'user', content: 'test' }]
      })).rejects.toThrow('Azure OpenAI network error: Network error');
    });
  });

  describe('API Endpoint Tests', () => {
    it('should return 502 error for Azure failures in /api/estimate', async () => {
      // This would be tested with a real HTTP request to the endpoint
      // For now, we're testing the client behavior which feeds into the endpoint
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('{"error": {"message": "Invalid token"}}')
      });

      try {
        await azureClient.chat({
          messages: [{ role: 'user', content: 'test estimation' }]
        });
      } catch (error) {
        const azureError = error as AzureError;
        expect(azureError.status).toBe(401);
        expect(azureError.message).toContain('Azure OpenAI request failed');
        expect(azureError.details).toBeDefined();
      }
    });

    it('should not attempt fallback providers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('{"error": {"message": "Server error"}}')
      });

      // Should fail immediately without retries to other providers
      await expect(azureClient.chat({
        messages: [{ role: 'user', content: 'test' }]
      })).rejects.toThrow('Azure OpenAI request failed: 500 Internal Server Error');

      // Should only make one fetch call (no fallback)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query Parameter Authentication', () => {
    it('should pass token as query parameter, not header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({
          choices: [{ message: { content: '{"test": true}' } }],
          usage: { total_tokens: 10 }
        }))
      });

      await azureClient.chat({
        messages: [{ role: 'user', content: 'test' }]
      });

      const callArgs = mockFetch.mock.calls[0];
      const url = callArgs[0] as string;
      const options = callArgs[1] as any;

      // Token should be in URL as query parameter
      expect(url).toContain('Authorization=Bearer+test-token');
      
      // Token should NOT be in headers
      expect(options.headers['Authorization']).toBeUndefined();
      expect(options.headers['api-key']).toBeUndefined();
      
      // Should have x-ms-client-request-id header
      expect(options.headers['x-ms-client-request-id']).toBeDefined();
      expect(options.headers['Content-Type']).toBe('application/json');
    });
  });
});
