import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { generateSessionId, hashInput, logLLMRequest, type LLMLogEntry } from './logger';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface LLMProviderConfig {
  provider: 'gemini' | 'openai' | 'azure' | 'ollama';
  ollama?: {
    baseURL: string;
    model: string;
  };
  openai?: {
    baseURL: string;
    apiKey: string;
    model: string;
  };
  gemini?: {
    apiKey: string;
    model: string;
  };
  azure?: {
    endpoint: string;
    apiKey: string;
    deployment: string;
    apiVersion: string;
  };
  fallbackProvider?: 'gemini' | 'openai' | 'azure';
}

export interface LLMCallMeta {
  provider: string;
  model: string;
  latencyMs: number;
  usedFallback: boolean;
  sessionId: string;
  retryCount: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  timestamp: string;
}

export class LLMProviderService {
  private config: LLMProviderConfig;
  private sessionId: string;

  constructor(config: LLMProviderConfig) {
    this.config = config;
    this.sessionId = generateSessionId();
  }

  async callWithRetryAndValidate<T>(
    messages: LLMMessage[],
    _schema: any,
    validateFn: (data: any) => T
  ): Promise<{ result: T; meta: LLMCallMeta }> {
    const startTime = Date.now();
    let retryCount = 0;
    let lastError: Error | null = null;

    // Try primary provider
    try {
      const response = await this.callProvider(messages, retryCount);
      const cleanedContent = this.extractJsonFromResponse(response.content);
      const result = validateFn(JSON.parse(cleanedContent));
      
      const meta: LLMCallMeta = {
        provider: this.config.provider,
        model: this.getModelName(),
        latencyMs: Date.now() - startTime,
        usedFallback: false,
        sessionId: this.sessionId,
        retryCount,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        timestamp: new Date().toISOString()
      };

      this.logRequest('success', messages, response, meta, retryCount);
      return { result, meta };
    } catch (error) {
      lastError = error as Error;
      retryCount++;
      
      // Log first attempt failure
      this.logRequest('error', messages, null, {
        provider: this.config.provider,
        model: this.getModelName(),
        latencyMs: Date.now() - startTime,
        usedFallback: false,
        sessionId: this.sessionId,
        retryCount: retryCount - 1,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        timestamp: new Date().toISOString()
      }, retryCount - 1, lastError.message);
      
      // Try fallback provider if configured
      if (this.config.fallbackProvider) {
        try {
          const fallbackResponse = await this.callFallbackProvider(messages, retryCount);
          const cleanedContent = this.extractJsonFromResponse(fallbackResponse.content);
          const result = validateFn(JSON.parse(cleanedContent));
          
          const meta: LLMCallMeta = {
            provider: this.config.fallbackProvider,
            model: this.getFallbackModelName(),
            latencyMs: Date.now() - startTime,
            usedFallback: true,
            sessionId: this.sessionId,
            retryCount,
            inputTokens: fallbackResponse.usage?.prompt_tokens || 0,
            outputTokens: fallbackResponse.usage?.completion_tokens || 0,
            totalTokens: fallbackResponse.usage?.total_tokens || 0,
            timestamp: new Date().toISOString()
          };

          this.logRequest('fallback', messages, fallbackResponse, meta, retryCount);
          return { result, meta };
        } catch (fallbackError) {
          console.log(`Fallback provider ${this.config.fallbackProvider} also failed:`, fallbackError);
        }
      }
    }

    // Retry with corrective system message
    if (retryCount === 1) {
      try {
        const correctedMessages = [
          ...messages,
          {
            role: 'system' as const,
            content: 'The previous response was invalid JSON or failed validation. Please return ONLY valid JSON that matches the required schema. Do not include any markdown formatting or code blocks.'
          }
        ];

        const response = await this.callProvider(correctedMessages, retryCount);
        const cleanedContent = this.extractJsonFromResponse(response.content);
        const result = validateFn(JSON.parse(cleanedContent));
        
        const meta: LLMCallMeta = {
          provider: this.config.provider,
          model: this.getModelName(),
          latencyMs: Date.now() - startTime,
          usedFallback: false,
          sessionId: this.sessionId,
          retryCount,
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
          timestamp: new Date().toISOString()
        };

        this.logRequest('retry', correctedMessages, response, meta, retryCount);
        return { result, meta };
      } catch (error) {
        lastError = error as Error;
        retryCount++;
        
        this.logRequest('error', messages, null, {
          provider: this.config.provider,
          model: this.getModelName(),
          latencyMs: Date.now() - startTime,
          usedFallback: false,
          sessionId: this.sessionId,
          retryCount: retryCount - 1,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          timestamp: new Date().toISOString()
        }, retryCount - 1, lastError.message);
      }
    }

    // Fallback to rule-based WBS
    try {
      const fallbackResult = this.generateRuleBasedWBS(messages);
      const meta: LLMCallMeta = {
        provider: 'rule-based',
        model: 'fallback',
        latencyMs: Date.now() - startTime,
        usedFallback: true,
        sessionId: this.sessionId,
        retryCount,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        timestamp: new Date().toISOString()
      };

      this.logRequest('fallback', messages, { content: JSON.stringify(fallbackResult) }, meta, retryCount);
      return { result: fallbackResult as T, meta };
    } catch (fallbackError) {
      this.logRequest('error', messages, null, {
        provider: 'rule-based',
        model: 'fallback',
        latencyMs: Date.now() - startTime,
        usedFallback: true,
        sessionId: this.sessionId,
        retryCount,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        timestamp: new Date().toISOString()
      }, retryCount, (fallbackError as Error).message);
      
      throw new Error(`All LLM attempts failed. Last error: ${lastError?.message}`);
    }
  }

  private extractJsonFromResponse(content: string): string {
    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    
    // Try to find JSON object in the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    // Return original content if no patterns match
    return content.trim();
  }

  private async callProvider(messages: LLMMessage[], _retryCount: number): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'gemini':
        return this.callGemini(messages);
      case 'openai':
        return this.callOpenAICompat(messages);
      case 'azure':
        return this.callAzureOpenAI(messages);
      case 'ollama':
        return this.callOllama(messages);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async callFallbackProvider(messages: LLMMessage[], _retryCount: number): Promise<LLMResponse> {
    if (!this.config.fallbackProvider) {
      throw new Error('No fallback provider configured');
    }

    switch (this.config.fallbackProvider) {
      case 'gemini':
        return this.callGemini(messages);
      case 'openai':
        return this.callOpenAICompat(messages);
      case 'azure':
        return this.callAzureOpenAI(messages);
      default:
        throw new Error(`Unsupported fallback provider: ${this.config.fallbackProvider}`);
    }
  }

  private async callGemini(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.gemini) {
      throw new Error('Gemini configuration not provided');
    }

    const genAI = new GoogleGenerativeAI(this.config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: this.config.gemini.model || 'gemini-1.5-flash' });

    // Convert messages to Gemini format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');
    
    const prompt = systemMessage ? `${systemMessage}\n\n${userMessages}` : userMessages;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      content: response.text(),
      usage: {
        prompt_tokens: response.usageMetadata?.promptTokenCount,
        completion_tokens: response.usageMetadata?.candidatesTokenCount,
        total_tokens: response.usageMetadata?.totalTokenCount
      }
    };
  }

  private async callOpenAICompat(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.openai) {
      throw new Error('OpenAI configuration not provided');
    }

    const client = new OpenAI({
      baseURL: this.config.openai.baseURL,
      apiKey: this.config.openai.apiKey
    });

    const response = await client.chat.completions.create({
      model: this.config.openai.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.1,
      max_tokens: 4000
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error('No content in OpenAI response');
    }

    return {
      content: choice.message.content,
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      } : undefined
    };
  }

  private async callAzureOpenAI(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.azure) {
      throw new Error('Azure configuration not provided');
    }

    const client = new OpenAI({
      baseURL: `${this.config.azure.endpoint}/openai/deployments/${this.config.azure.deployment}`,
      apiKey: this.config.azure.apiKey,
      defaultQuery: { 'api-version': this.config.azure.apiVersion },
      defaultHeaders: {
        'api-key': this.config.azure.apiKey,
      },
    });

    const response = await client.chat.completions.create({
      model: this.config.azure.deployment,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.1,
      max_tokens: 4000
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error('No content in Azure OpenAI response');
    }

    return {
      content: choice.message.content,
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      } : undefined
    };
  }

  private async callOllama(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.config.ollama) {
      throw new Error('Ollama configuration not provided');
    }

    const client = new OpenAI({
      baseURL: `${this.config.ollama.baseURL}/v1`,
      apiKey: 'ollama', // Ollama doesn't require a real API key
    });

    const response = await client.chat.completions.create({
      model: this.config.ollama.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.1,
      max_tokens: 4000
    });

    const choice = response.choices[0];
    if (!choice?.message?.content) {
      throw new Error('No content in Ollama response');
    }

    return {
      content: choice.message.content,
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      } : undefined
    };
  }

  private generateRuleBasedWBS(_messages: LLMMessage[]): any {
    // Extract project info from messages
    // const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    // Simple rule-based WBS generation
    return {
      epics: [
        {
          name: "Core Application Development",
          assumptions: ["Standard development practices", "Experienced team"],
          risks: ["Technical complexity", "Integration challenges"],
          modules: [
            {
              name: "User Interface",
              complexity: "M",
              notes: "Main application screens and navigation",
              primary_role: "Frontend/Flutter"
            },
            {
              name: "Backend API",
              complexity: "M", 
              notes: "Core business logic and data management",
              primary_role: "Backend"
            },
            {
              name: "Testing & QA",
              complexity: "L",
              notes: "Unit and integration testing",
              primary_role: "QA"
            }
          ]
        }
      ]
    };
  }

  private getModelName(): string {
    switch (this.config.provider) {
      case 'gemini':
        return this.config.gemini?.model || 'gemini-1.5-flash';
      case 'openai':
        return this.config.openai?.model || 'gpt-4';
      case 'azure':
        return this.config.azure?.deployment || 'gpt-4';
      case 'ollama':
        return this.config.ollama?.model || 'llama3.1:8b';
      default:
        return 'unknown';
    }
  }

  private getFallbackModelName(): string {
    if (!this.config.fallbackProvider) {
      return 'unknown';
    }

    switch (this.config.fallbackProvider) {
      case 'gemini':
        return this.config.gemini?.model || 'gemini-1.5-flash';
      case 'openai':
        return this.config.openai?.model || 'gpt-4';
      case 'azure':
        return this.config.azure?.deployment || 'gpt-4';
      default:
        return 'unknown';
    }
  }

  private logRequest(
    status: 'success' | 'error' | 'retry' | 'fallback',
    messages: LLMMessage[],
    response: LLMResponse | null,
    meta: LLMCallMeta,
    retryCount: number,
    error?: string
  ): void {
    const logEntry: LLMLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: meta.sessionId,
      provider: meta.provider,
      model: meta.model,
      latencyMs: meta.latencyMs,
      status,
      retryCount,
      inputHash: hashInput(messages),
      requestBody: JSON.stringify(messages),
      responseBody: response ? JSON.stringify(response) : undefined,
      error
    };

    logLLMRequest(logEntry);
  }
}
