import type { AIConfig } from '../../config/aiConfig';
import { loadAIConfig } from '../../config/aiConfig';
import { CustomProvider } from './providers/customProvider';
import { DeepSeekProvider } from './providers/deepseekProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { OpenAIProvider } from './providers/openaiProvider';

export type AIGenerateInput = {
  prompt: string;
  systemPrompt?: string;
};

export interface AIProvider {
  generateText(input: AIGenerateInput): Promise<string>;
  generateArticle(input: AIGenerateInput): Promise<string>;
}

export function createAIProvider(config: AIConfig | null = loadAIConfig()): AIProvider | null {
  if (!config) {
    return null;
  }

  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'deepseek':
      return new DeepSeekProvider(config);
    case 'custom':
      return new CustomProvider(config);
    default:
      return null;
  }
}

export async function generateText(input: AIGenerateInput, provider: AIProvider | null = createAIProvider()) {
  if (!provider) {
    return null;
  }

  return provider.generateText(input);
}

export async function generateArticle(input: AIGenerateInput, provider: AIProvider | null = createAIProvider()) {
  if (!provider) {
    return null;
  }

  return provider.generateArticle(input);
}
