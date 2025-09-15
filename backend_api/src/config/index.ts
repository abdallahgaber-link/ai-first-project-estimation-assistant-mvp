import dotenv from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  CORS_ORIGIN: z.string().default('*'),
  
  // LLM Provider Configuration
  PRIMARY_PROVIDER: z.enum(['azure', 'gemini', 'ollama']).default('azure'),
  ENABLE_FALLBACK: z.string().transform(val => val === 'true').default('true'),
  FALLBACK_PROVIDERS: z.string().default('gemini,ollama'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4-1106-preview'),
  
  // Grok
  GROK_API_KEY: z.string().optional(),
  GROK_MODEL: z.string().default('grok-beta'),
  
  // Gemini
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  
  // Ollama
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('llama3.1:8b'),
  
  // Azure OpenAI
  AZURE_RESOURCE_NAME: z.string().optional(),
  AZURE_DEPLOYMENT_NAME: z.string().optional(),
  AZURE_OPENAI_API_VERSION: z.string().optional(),
  AZURE_OPENAI_SHARED_TOKEN: z.string().optional(),
  
  // Estimation Constants
  DEFAULT_TEAM_VELOCITY: z.string().transform(Number).default('20'),
  DEFAULT_BUFFER_PERCENT: z.string().transform(Number).default('20'),
});

type EnvConfig = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvConfig {}
  }
}

export function loadConfig() {
  dotenv.config();
  
  console.log('🔧 Loading configuration...');
  console.log('🔧 PRIMARY_PROVIDER from env:', process.env.PRIMARY_PROVIDER);
  console.log('🔧 ENABLE_FALLBACK from env:', process.env.ENABLE_FALLBACK);
  console.log('🔧 FALLBACK_PROVIDERS from env:', process.env.FALLBACK_PROVIDERS);
  
  try {
    const env = envSchema.parse(process.env);
    
    // Validate provider-specific environment variables
    const allProviders = [env.PRIMARY_PROVIDER, ...(env.ENABLE_FALLBACK ? env.FALLBACK_PROVIDERS.split(',') : [])];
    
    for (const provider of allProviders) {
      const trimmedProvider = provider.trim();
      
      if (trimmedProvider === 'azure') {
        if (!env.AZURE_RESOURCE_NAME) {
          throw new Error('AZURE_RESOURCE_NAME is required when using Azure provider');
        }
        if (!env.AZURE_DEPLOYMENT_NAME) {
          throw new Error('AZURE_DEPLOYMENT_NAME is required when using Azure provider');
        }
        if (!env.AZURE_OPENAI_SHARED_TOKEN) {
          throw new Error('AZURE_OPENAI_SHARED_TOKEN is required when using Azure provider');
        }
      } else if (trimmedProvider === 'gemini' && !env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not provided - Gemini fallback will be skipped');
      } else if (trimmedProvider === 'ollama' && !env.OLLAMA_BASE_URL) {
        console.warn('OLLAMA_BASE_URL not provided - Ollama fallback will be skipped');
      }
    }
    
    // Set process.env with validated values
    Object.assign(process.env, env);
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Invalid environment configuration:\n${errorMessage}`);
    }
    throw error;
  }
}

// Export configuration as a function to ensure it's evaluated after env loading
export function getConfig() {
  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    corsOrigin: process.env.CORS_ORIGIN || '*',
    
    // LLM Configuration
    llm: {
      primaryProvider: process.env.PRIMARY_PROVIDER as 'azure' | 'gemini' | 'ollama',
      enableFallback: Boolean(process.env.ENABLE_FALLBACK),
      fallbackProviders: process.env.FALLBACK_PROVIDERS?.split(',').map(p => p.trim()) || [],
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
      },
      grok: {
        apiKey: process.env.GROK_API_KEY,
        model: process.env.GROK_MODEL,
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
      },
      ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL,
        model: process.env.OLLAMA_MODEL,
      },
      azure: {
        resourceName: process.env.AZURE_RESOURCE_NAME,
        deploymentName: process.env.AZURE_DEPLOYMENT_NAME,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION,
        sharedToken: process.env.AZURE_OPENAI_SHARED_TOKEN,
      },
    },
    
    // Estimation Constants
    estimation: {
      defaultTeamVelocity: parseInt(String(process.env.DEFAULT_TEAM_VELOCITY || '20'), 10),
      defaultBufferPercent: parseInt(String(process.env.DEFAULT_BUFFER_PERCENT || '20'), 10),
    },
  } as const;
}

// Export static config for backward compatibility
export const config = getConfig();
