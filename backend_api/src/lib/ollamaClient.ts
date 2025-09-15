import { logger } from './logger';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatResponse {
  response: {
    message: {
      content: string;
    };
    model: string;
    done: boolean;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    eval_count?: number;
  };
  sessionId: string;
  latencyMs: number;
}

export interface OllamaError extends Error {
  status?: number;
  details?: string;
}

export interface OllamaClient {
  chat(params: { messages: OllamaChatMessage[] }): Promise<OllamaChatResponse>;
  healthCheck(): Promise<{
    ok: boolean;
    provider: string;
    model: string;
    latencyMs: number;
    sessionId: string;
    error?: string;
  }>;
}

export function createOllamaClient(): OllamaClient {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';

  return {
    async chat({ messages }): Promise<OllamaChatResponse> {
      const startTime = Date.now();
      const sessionId = Math.random().toString(36).substr(2, 8);

      try {
        const response = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            stream: false
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        logger.info('Ollama chat request completed', {
          sessionId,
          latencyMs,
          model,
          tokensUsed: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        });

        return {
          response: data,
          sessionId,
          latencyMs
        };
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const ollamaError = error as OllamaError;
        
        logger.error('Ollama chat request failed', {
          sessionId,
          latencyMs,
          error: ollamaError.message,
          model,
          baseUrl
        });

        ollamaError.status = 500;
        ollamaError.details = ollamaError.message;
        throw ollamaError;
      }
    },

    async healthCheck() {
      const startTime = Date.now();
      const sessionId = Math.random().toString(36).substr(2, 8);

      try {
        const response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            prompt: 'Hello, respond with "OK"',
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        return {
          ok: true,
          provider: 'ollama',
          model,
          latencyMs,
          sessionId
        };
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const ollamaError = error as OllamaError;

        return {
          ok: false,
          provider: 'ollama',
          model,
          latencyMs,
          sessionId,
          error: ollamaError.message
        };
      }
    }
  };
}
