import { logger } from './logger.js';

export interface AzureConfig {
  resourceName: string;
  deploymentName: string;
  apiVersion: string;
  sharedToken: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AzureError extends Error {
  status?: number;
  details?: string;
}

export class AzureClient {
  private config: AzureConfig;

  constructor(config: AzureConfig) {
    this.config = config;
  }

  private generateSessionId(): string {
    return Math.random().toString(16).substring(2, 10);
  }

  private buildUrl(): string {
    const baseUrl = `https://${this.config.resourceName}.openai.azure.com`;
    const path = `/openai/deployments/${this.config.deploymentName}/chat/completions`;
    const params = new URLSearchParams({
      'api-version': this.config.apiVersion,
      'Authorization': `Bearer ${this.config.sharedToken}`
    });
    
    return `${baseUrl}${path}?${params.toString()}`;
  }

  async chat(request: ChatRequest): Promise<{
    response: ChatResponse;
    sessionId: string;
    latencyMs: number;
    reqBytes: number;
    resBytes: number;
  }> {
    const sessionId = this.generateSessionId();
    const startTime = Date.now();
    
    const body = JSON.stringify({
      messages: request.messages,
      temperature: request.temperature ?? 0.1,
      max_tokens: request.max_tokens ?? 900,
      response_format: request.response_format ?? { type: "json_object" }
    });

    const reqBytes = Buffer.byteLength(body, 'utf8');
    const url = this.buildUrl();

    logger.info('Azure OpenAI request', {
      sessionId,
      url: url.split('?')[0], // Log URL without query params for security
      reqBytes,
      messageCount: request.messages.length
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ms-client-request-id': sessionId
        },
        body
      });

      const responseText = await response.text();
      const resBytes = Buffer.byteLength(responseText, 'utf8');
      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const truncatedBody = responseText.substring(0, 4096);
        const error: AzureError = new Error(`Azure OpenAI request failed: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.details = truncatedBody;
        
        logger.error('Azure OpenAI request failed', {
          sessionId,
          status: response.status,
          statusText: response.statusText,
          latencyMs,
          reqBytes,
          resBytes,
          errorDetails: truncatedBody.substring(0, 500)
        });
        
        throw error;
      }

      const chatResponse: ChatResponse = JSON.parse(responseText);
      
      logger.info('Azure OpenAI request completed', {
        sessionId,
        status: response.status,
        latencyMs,
        reqBytes,
        resBytes,
        model: chatResponse.model,
        tokensUsed: chatResponse.usage?.total_tokens || 0
      });

      return {
        response: chatResponse,
        sessionId,
        latencyMs,
        reqBytes,
        resBytes
      };

    } catch (error) {
      const latencyMs = Date.now() - startTime;
      
      if (error instanceof Error && 'status' in error) {
        throw error; // Re-throw Azure errors as-is
      }
      
      // Handle network/parsing errors
      const azureError: AzureError = new Error(`Azure OpenAI network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      azureError.status = 0;
      azureError.details = error instanceof Error ? error.message : 'Unknown network error';
      
      logger.error('Azure OpenAI network error', {
        sessionId,
        latencyMs,
        reqBytes,
        error: azureError.message
      });
      
      throw azureError;
    }
  }

  async healthCheck(): Promise<{
    ok: boolean;
    provider: string;
    model: string;
    latencyMs: number;
    sessionId: string;
  }> {
    const healthRequest: ChatRequest = {
      messages: [
        {
          role: 'system',
          content: 'You are a health check endpoint. Respond with valid JSON containing only: {"ok": true}'
        },
        {
          role: 'user',
          content: 'Perform health check'
        }
      ],
      temperature: 0,
      max_tokens: 50,
      response_format: { type: "json_object" }
    };

    try {
      const result = await this.chat(healthRequest);
      
      return {
        ok: true,
        provider: 'azure',
        model: result.response.model,
        latencyMs: result.latencyMs,
        sessionId: result.sessionId
      };
    } catch (error) {
      throw error; // Let the caller handle the error response
    }
  }
}

// Factory function to create Azure client from environment variables
export function createAzureClient(): AzureClient {
  const resourceName = process.env.AZURE_RESOURCE_NAME;
  const deploymentName = process.env.AZURE_DEPLOYMENT_NAME;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const sharedToken = process.env.AZURE_OPENAI_SHARED_TOKEN;

  if (!resourceName || !deploymentName || !apiVersion || !sharedToken) {
    throw new Error('Missing required Azure OpenAI configuration. Please check AZURE_RESOURCE_NAME, AZURE_DEPLOYMENT_NAME, AZURE_OPENAI_API_VERSION, and AZURE_OPENAI_SHARED_TOKEN environment variables.');
  }

  return new AzureClient({
    resourceName,
    deploymentName,
    apiVersion,
    sharedToken
  });
}
