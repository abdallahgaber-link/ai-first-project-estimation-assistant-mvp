import { LLMProviderService, LLMProviderConfig, type LLMMessage, type LLMCallMeta } from './providers';
import { EstimationEngine, type EstimationInput, type EstimationResult, type WBSResponse } from './estimation';
import { WBSSchema } from '../schemas/wbs';
import fs from 'fs';
import path from 'path';

class LLMService {
  private providerService: LLMProviderService;
  private estimationEngine: EstimationEngine;

  constructor() {
    const config = this.getProviderConfig();
    this.providerService = new LLMProviderService(config);
    this.estimationEngine = new EstimationEngine();
    console.log(`🔧 LLM Service initialized with provider: ${config.provider}`);
  }

  private getProviderConfig(): LLMProviderConfig {
    const provider = process.env.PROVIDER as 'gemini' | 'openai' | 'azure' | 'ollama' || 'ollama';
    
    const config: LLMProviderConfig = { provider };
    
    // Configure primary provider
    if (provider === 'ollama') {
      config.ollama = {
        baseURL: process.env.OLLAMA_BASE || 'http://localhost:11434',
        model: process.env.OLLAMA_MODEL || 'llama3.1:8b'
      };
      // Set Gemini as fallback for Ollama
      if (process.env.GEMINI_API_KEY) {
        config.fallbackProvider = 'gemini';
        config.gemini = {
          apiKey: process.env.GEMINI_API_KEY,
          model: 'gemini-1.5-flash'
        };
      }
    }
    
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      config.gemini = {
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-1.5-flash'
      };
    }
    
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      config.openai = {
        baseURL: process.env.OPENAI_BASE || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.LLM_MODEL || 'gpt-4'
      };
    }
    
    if (provider === 'azure' && process.env.AZURE_OPENAI_API_KEY) {
      config.azure = {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
      };
    }
    
    return config;
  }

  public async generateEstimation(
    input: EstimationInput
  ): Promise<{ result: EstimationResult; meta: LLMCallMeta }> {
    console.log('🔧 Starting project estimation...');
    
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: await this.getSystemPrompt()
      },
      {
        role: 'user', 
        content: await this.getUserPrompt(input)
      }
    ];
    
    const validateWBS = (data: any): WBSResponse => {
      return WBSSchema.parse(data);
    };
    
    const { result: wbs, meta } = await this.providerService.callWithRetryAndValidate(
      messages,
      WBSSchema,
      validateWBS
    );
    
    // Calculate estimation using the WBS
    const estimation = this.estimationEngine.estimateProject(wbs, input);
    
    return { result: estimation, meta };
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
