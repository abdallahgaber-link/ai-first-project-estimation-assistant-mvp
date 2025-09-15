import { createAzureClient, type ChatMessage, type AzureError } from './azureClient';
import { createGeminiClient, type GeminiChatMessage, type GeminiError } from './geminiClient';
import { createOllamaClient, type OllamaChatMessage, type OllamaError } from './ollamaClient';
import { EstimationEngine, type EstimationInput, type EstimationResult, type WBSResponse } from './estimation';
import { WBSSchema } from '../schemas/wbs';
import { logger } from './logger';
import { getConfig } from '../config';
import fs from 'fs';
import path from 'path';

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

class LLMService {
  private azureClient: ReturnType<typeof createAzureClient>;
  private geminiClient: ReturnType<typeof createGeminiClient> | null = null;
  private ollamaClient: ReturnType<typeof createOllamaClient> | null = null;
  private estimationEngine: EstimationEngine;
  private config: ReturnType<typeof getConfig>;

  constructor() {
    this.config = getConfig();
    this.azureClient = createAzureClient();
    this.estimationEngine = new EstimationEngine();
    
    // Initialize fallback clients if enabled
    if (this.config.llm.enableFallback) {
      try {
        if (this.config.llm.fallbackProviders.includes('gemini') && process.env.GEMINI_API_KEY) {
          this.geminiClient = createGeminiClient();
        }
        if (this.config.llm.fallbackProviders.includes('ollama')) {
          this.ollamaClient = createOllamaClient();
        }
      } catch (error) {
        console.warn('Failed to initialize some fallback clients:', error);
      }
    }
    
    console.log('🔧 LLM Service initialized with Azure primary and fallback providers:', 
      this.config.llm.enableFallback ? this.config.llm.fallbackProviders : 'disabled');
  }

  public async generateEstimation(
    input: EstimationInput
  ): Promise<{ result: EstimationResult; meta: LLMCallMeta }> {
    console.log('🔧 Starting project estimation...');
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: await this.getSystemPrompt()
      },
      {
        role: 'user', 
        content: await this.getUserPrompt(input)
      }
    ];
    
    let retryCount = 0;
    let lastError: AzureError | null = null;

    // First attempt
    try {
      const result = await this.azureClient.chat({ messages });
      const wbs = this.parseAndValidateWBS(result.response.choices[0].message.content);
      const estimation = this.estimationEngine.estimateProject(wbs, input);
      
      const meta: LLMCallMeta = {
        provider: 'azure',
        model: result.response.model,
        latencyMs: result.latencyMs,
        usedFallback: false,
        sessionId: result.sessionId,
        retryCount,
        inputTokens: result.response.usage?.prompt_tokens || 0,
        outputTokens: result.response.usage?.completion_tokens || 0,
        totalTokens: result.response.usage?.total_tokens || 0,
        timestamp: new Date().toISOString()
      };

      // Log successful request
      logger.info('Azure estimation completed successfully', {
        sessionId: result.sessionId,
        latencyMs: result.latencyMs,
        tokensUsed: result.response.usage?.total_tokens || 0,
        retryCount
      });

      return { result: estimation, meta };
    } catch (error) {
      lastError = error as AzureError;
      retryCount++;
      
      logger.warn('First Azure estimation attempt failed, retrying with corrective prompt', {
        error: lastError.message,
        status: lastError.status,
        retryCount
      });
    }

    // Retry with corrective system message
    if (retryCount === 1) {
      try {
        const correctedMessages: ChatMessage[] = [
          ...messages,
          {
            role: 'system',
            content: 'CRITICAL: The previous response contained invalid JSON. You MUST return ONLY a valid JSON object with no extra text, no markdown formatting, no code blocks, and no trailing commas. Validate your JSON syntax before responding. Start directly with { and end with }.'
          }
        ];

        const result = await this.azureClient.chat({ messages: correctedMessages });
        const wbs = this.parseAndValidateWBS(result.response.choices[0].message.content);
        const estimation = this.estimationEngine.estimateProject(wbs, input);
        
        const meta: LLMCallMeta = {
          provider: 'azure',
          model: result.response.model,
          latencyMs: result.latencyMs,
          usedFallback: false,
          sessionId: result.sessionId,
          retryCount,
          inputTokens: result.response.usage?.prompt_tokens || 0,
          outputTokens: result.response.usage?.completion_tokens || 0,
          totalTokens: result.response.usage?.total_tokens || 0,
          timestamp: new Date().toISOString()
        };

        logger.info('Azure estimation completed on retry', {
          sessionId: result.sessionId,
          latencyMs: result.latencyMs,
          tokensUsed: result.response.usage?.total_tokens || 0,
          retryCount
        });

        return { result: estimation, meta };
      } catch (error) {
        lastError = error as AzureError;
        retryCount++;
        
        logger.error('Azure estimation retry failed', {
          error: lastError.message,
          status: lastError.status,
          retryCount
        });
      }
    }

    // Try fallback providers if enabled
    if (this.config.llm.enableFallback) {
      for (const provider of this.config.llm.fallbackProviders) {
        try {
          logger.info(`Attempting fallback to ${provider} provider`, { retryCount });
          
          if (provider === 'gemini' && this.geminiClient) {
            const result = await this.tryGeminiEstimation(messages, retryCount);
            return result;
          } else if (provider === 'ollama' && this.ollamaClient) {
            const result = await this.tryOllamaEstimation(messages, retryCount);
            return result;
          }
        } catch (fallbackError) {
          logger.warn(`Fallback to ${provider} also failed`, {
            error: (fallbackError as Error).message,
            retryCount
          });
          continue;
        }
      }
    }
    
    // If all providers failed, return sample fallback
    logger.warn('All providers failed, using sample fallback data', {
      retryCount,
      lastError: lastError?.message,
      status: lastError?.status
    });
    
    return this.createSampleFallback(input, retryCount);
  }

  private async tryGeminiEstimation(messages: ChatMessage[], retryCount: number): Promise<{ result: EstimationResult; meta: LLMCallMeta }> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    // Convert Azure messages to Gemini format (skip system messages as Gemini doesn't support them)
    const geminiMessages: GeminiChatMessage[] = messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: msg.content }]
      }));

    // If we have a system message, prepend it to the first user message
    const systemMessage = messages.find(msg => msg.role === 'system');
    if (systemMessage && geminiMessages.length > 0 && geminiMessages[0].role === 'user') {
      geminiMessages[0].parts[0].text = `${systemMessage.content}\n\n${geminiMessages[0].parts[0].text}`;
    }

    const response = await this.geminiClient.chat({ messages: geminiMessages });
    const content = response.response.text();
    
    logger.info('Gemini response received', {
      sessionId: response.sessionId,
      latencyMs: response.latencyMs,
      contentLength: content.length,
      contentPreview: content.substring(0, 200)
    });

    const wbs = this.parseAndValidateWBS(content);
    const estimation = this.estimationEngine.estimateProject(wbs, messages[1].content as any);

    const meta: LLMCallMeta = {
      provider: 'gemini',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      latencyMs: response.latencyMs,
      usedFallback: true,
      sessionId: response.sessionId,
      retryCount,
      inputTokens: response.response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.response.usageMetadata?.totalTokenCount || 0,
      timestamp: new Date().toISOString()
    };

    return { result: estimation, meta };
  }

  private async tryOllamaEstimation(messages: ChatMessage[], retryCount: number): Promise<{ result: EstimationResult; meta: LLMCallMeta }> {
    if (!this.ollamaClient) {
      throw new Error('Ollama client not initialized');
    }

    // Convert Azure messages to Ollama format
    const ollamaMessages: OllamaChatMessage[] = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role,
      content: msg.content
    }));

    const response = await this.ollamaClient.chat({ messages: ollamaMessages });
    const content = response.response.message.content;
    
    logger.info('Ollama response received', {
      sessionId: response.sessionId,
      latencyMs: response.latencyMs,
      contentLength: content.length,
      contentPreview: content.substring(0, 200)
    });

    const wbs = this.parseAndValidateWBS(content);
    const estimation = this.estimationEngine.estimateProject(wbs, messages[1].content as any);

    const meta: LLMCallMeta = {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.1:8b',
      latencyMs: response.latencyMs,
      usedFallback: true,
      sessionId: response.sessionId,
      retryCount,
      inputTokens: response.response.prompt_eval_count || 0,
      outputTokens: response.response.eval_count || 0,
      totalTokens: (response.response.prompt_eval_count || 0) + (response.response.eval_count || 0),
      timestamp: new Date().toISOString()
    };

    return { result: estimation, meta };
  }

  private createSampleFallback(input: EstimationInput, retryCount: number): { result: EstimationResult; meta: LLMCallMeta } {
    // Create a fallback WBS based on the input
    const fallbackWBS: WBSResponse = {
      epics: [
        {
          name: `${input.projectTitle} - Core Features`,
          assumptions: [
            "Standard development practices will be followed",
            "No major technical blockers will be encountered"
          ],
          risks: [
            "Third-party integrations may have unexpected complexity",
            "Requirements may evolve during development"
          ],
          modules: [
            {
              name: "User Authentication",
              complexity: "M" as const,
              notes: "User registration, login, password reset functionality",
              primary_role: "Backend"
            },
            {
              name: "Task Management UI",
              complexity: "M" as const,
              notes: "Task creation, editing, deletion interface",
              primary_role: "Frontend/Flutter"
            },
            {
              name: "Task CRUD Operations",
              complexity: "M" as const,
              notes: "Backend API for task operations",
              primary_role: "Backend"
            },
            {
              name: "Data Storage Setup",
              complexity: "L" as const,
              notes: "Database schema and basic operations",
              primary_role: "Backend"
            },
            {
              name: "Testing & QA",
              complexity: "M" as const,
              notes: "Unit tests, integration tests, manual testing",
              primary_role: "QA"
            }
          ]
        }
      ]
    };
    
    const estimation = this.estimationEngine.estimateProject(fallbackWBS, input);
    
    const meta: LLMCallMeta = {
      provider: 'sample-fallback',
      model: 'fallback-sample',
      latencyMs: 100,
      usedFallback: true,
      sessionId: 'fallback-' + Math.random().toString(36).substr(2, 8),
      retryCount,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      timestamp: new Date().toISOString()
    };

    return { result: estimation, meta };
  }

  private parseAndValidateWBS(content: string): WBSResponse {
    // Extract JSON from response (handle markdown code blocks)
    const cleanedContent = this.extractJsonFromResponse(content);
    
    try {
      // Try to fix common JSON issues before parsing
      const fixedContent = this.fixCommonJsonIssues(cleanedContent);
      const parsed = JSON.parse(fixedContent);
      return WBSSchema.parse(parsed);
    } catch (error) {
      logger.error('WBS validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        content: cleanedContent.substring(0, 500),
        contentLength: cleanedContent.length
      });
      
      // Try to save the problematic content for debugging
      logger.error('Full problematic content', { fullContent: cleanedContent });
      
      throw new Error(`Invalid WBS response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private fixCommonJsonIssues(content: string): string {
    let fixed = content;
    
    // Remove any trailing commas before closing brackets/braces
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix unescaped quotes in strings (basic attempt)
    fixed = fixed.replace(/: "([^"]*)"([^",}\]]*)"([^",}\]]*)",/g, ': "$1\\"$2\\"$3",');
    
    // Remove any non-JSON content at the beginning or end
    fixed = fixed.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    
    // Ensure the content ends with a closing brace
    if (!fixed.endsWith('}')) {
      fixed += '}';
    }
    
    return fixed;
  }

  private extractJsonFromResponse(content: string): string {
    // Log the raw content for debugging
    logger.debug('Raw AI response content', { 
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + '...'
    });

    // Try to extract JSON from markdown code blocks first
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      const extracted = codeBlockMatch[1].trim();
      logger.debug('Extracted from code block', { extractedLength: extracted.length });
      return extracted;
    }
    
    // Try to find complete JSON object with proper bracket matching
    let braceCount = 0;
    let startIndex = -1;
    let endIndex = -1;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (char === '{') {
        if (braceCount === 0) {
          startIndex = i;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          endIndex = i;
          break;
        }
      }
    }
    
    if (startIndex !== -1 && endIndex !== -1) {
      const extracted = content.substring(startIndex, endIndex + 1);
      logger.debug('Extracted with bracket matching', { 
        startIndex, 
        endIndex, 
        extractedLength: extracted.length 
      });
      return extracted;
    }
    
    // Fallback: try simple regex match
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      logger.debug('Extracted with regex fallback', { extractedLength: jsonMatch[0].length });
      return jsonMatch[0];
    }
    
    // Last resort: return trimmed content
    logger.warn('No JSON pattern found, returning trimmed content');
    return content.trim();
  }

  // Legacy method for backward compatibility
  public async generateWBS(
    projectTitle: string,
    description: string,
    platforms: string[],
    integrations: string[],
    nfrs: string[],
    languagesCount: number,
    teamExperience: string,
    qualityLevel: string
  ): Promise<WBSResponse> {
    const input: EstimationInput = {
      projectTitle,
      description,
      platforms,
      integrations,
      nfrs,
      languagesCount,
      teamExperience,
      qualityLevel,
      constraints: '',
      outputLanguage: 'en'
    };
    
    const { result } = await this.generateEstimation(input);
    return result.wbs;
  }

  private async getSystemPrompt(): Promise<string> {
    const systemPromptPath = path.join(__dirname, '..', 'prompts', 'wbs.system.md');
    return fs.readFileSync(systemPromptPath, 'utf-8');
  }

  private async getUserPrompt(input: EstimationInput): Promise<string> {
    const userPromptPath = path.join(__dirname, '..', 'prompts', 'wbs.user.md');
    const template = fs.readFileSync(userPromptPath, 'utf-8');
    
    return template
      .replace('{{PROJECT_TITLE}}', input.projectTitle)
      .replace('{{DESCRIPTION}}', input.description)
      .replace('{{PLATFORMS}}', input.platforms.join(', '))
      .replace('{{INTEGRATIONS}}', input.integrations.join(', '))
      .replace('{{NFRS}}', input.nfrs.join(', '))
      .replace('{{LANGUAGES_COUNT}}', input.languagesCount.toString())
      .replace('{{TEAM_EXPERIENCE}}', input.teamExperience)
      .replace('{{QUALITY_LEVEL}}', input.qualityLevel)
      .replace('{{CONSTRAINTS}}', input.constraints || 'None specified')
      .replace('{{OUTPUT_LANGUAGE}}', input.outputLanguage || 'en');
  }
}

// Create a lazy-loaded singleton instance
let _llmService: LLMService | null = null;

export function getLLMService(): LLMService {
  // Force recreation to pick up new config
  _llmService = null;
  
  if (!_llmService) {
    console.log('🔧 Creating new LLM Service instance');
    _llmService = new LLMService();
  }
  return _llmService;
}
