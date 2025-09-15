import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger';

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiChatResponse {
  response: {
    text(): string;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
  };
  sessionId: string;
  latencyMs: number;
}

export interface GeminiError extends Error {
  status?: number;
  details?: string;
}

export interface GeminiClient {
  chat(params: { messages: GeminiChatMessage[] }): Promise<GeminiChatResponse>;
  healthCheck(): Promise<{
    ok: boolean;
    provider: string;
    model: string;
    latencyMs: number;
    sessionId: string;
    error?: string;
  }>;
}

export function createGeminiClient(): GeminiClient {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for Gemini client');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  return {
    async chat({ messages }): Promise<GeminiChatResponse> {
      const startTime = Date.now();
      const sessionId = Math.random().toString(36).substr(2, 8);

      try {
        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: msg.parts[0].text }]
        }));

        const lastMessage = messages[messages.length - 1];
        
        const chat = geminiModel.startChat({ history });
        const result = await chat.sendMessage(lastMessage.parts[0].text);

        const latencyMs = Date.now() - startTime;

        logger.info('Gemini chat request completed', {
          sessionId,
          latencyMs,
          model,
          tokensUsed: result.response.usageMetadata?.totalTokenCount || 0
        });

        return {
          response: result.response,
          sessionId,
          latencyMs
        };
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const geminiError = error as GeminiError;
        
        logger.error('Gemini chat request failed', {
          sessionId,
          latencyMs,
          error: geminiError.message,
          model
        });

        geminiError.status = 500; // Gemini doesn't provide HTTP status codes
        geminiError.details = geminiError.message;
        throw geminiError;
      }
    },

    async healthCheck() {
      const startTime = Date.now();
      const sessionId = Math.random().toString(36).substr(2, 8);

      try {
        const result = await geminiModel.generateContent('Hello, respond with "OK"');
        const latencyMs = Date.now() - startTime;

        return {
          ok: true,
          provider: 'gemini',
          model,
          latencyMs,
          sessionId
        };
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        const geminiError = error as GeminiError;

        return {
          ok: false,
          provider: 'gemini',
          model,
          latencyMs,
          sessionId,
          error: geminiError.message
        };
      }
    }
  };
}
