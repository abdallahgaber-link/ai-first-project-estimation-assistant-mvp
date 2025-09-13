import dotenv from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  CORS_ORIGIN: z.string().default('*'),
  
  // LLM Provider
  PROVIDER: z.enum(['azure', 'openai', 'grok', 'ollama', 'gemini']).default('openai'),
  
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
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT: z.string().optional(),
  
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
  console.log('🔧 PROVIDER from env:', process.env.PROVIDER);
  console.log('🔧 GROK_API_KEY from env:', process.env.GROK_API_KEY ? 'SET' : 'NOT SET');
  console.log('🔧 GROK_API_KEY length:', process.env.GROK_API_KEY?.length);
  console.log('🔧 GROK_API_KEY first 10 chars:', process.env.GROK_API_KEY?.substring(0, 10));
  
  try {
    const env = envSchema.parse(process.env);
    
    // Validate provider-specific environment variables
    if (env.PROVIDER === 'azure') {
      if (!env.AZURE_OPENAI_API_KEY) {
        throw new Error('AZURE_OPENAI_API_KEY is required when PROVIDER=azure');
      }
      if (!env.AZURE_OPENAI_ENDPOINT) {
        throw new Error('AZURE_OPENAI_ENDPOINT is required when PROVIDER=azure');
      }
      if (!env.AZURE_OPENAI_DEPLOYMENT) {
        throw new Error('AZURE_OPENAI_DEPLOYMENT is required when PROVIDER=azure');
      }
    } else if (env.PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when PROVIDER=openai');
    } else if (env.PROVIDER === 'grok' && !env.GROK_API_KEY) {
      throw new Error('GROK_API_KEY is required when PROVIDER=grok');
    } else if (env.PROVIDER === 'ollama' && !env.OLLAMA_BASE_URL) {
      throw new Error('OLLAMA_BASE_URL is required when PROVIDER=ollama');
    } else if (env.PROVIDER === 'gemini' && !env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required when PROVIDER=gemini');
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
      provider: process.env.PROVIDER as 'azure' | 'openai' | 'grok' | 'ollama' | 'gemini',
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
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
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
