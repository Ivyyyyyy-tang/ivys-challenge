export type AIProviderName = 'openai' | 'gemini' | 'deepseek' | 'custom';

export type AIConfig = {
  provider: AIProviderName;
  model: string;
  endpoint?: string;
  apiKey: string;
};

type AIConfigEnv = {
  VITE_AI_PROVIDER?: string;
  VITE_AI_MODEL?: string;
  VITE_AI_ENDPOINT?: string;
  VITE_AI_API_KEY?: string;
  VITE_AI_PROVIDER_MODEL?: string;
  VITE_AI_PROVIDER_ENDPOINT?: string;
  VITE_AI_PROVIDER_API_KEY?: string;
};

import { loadUserSettings } from './userSettings';

interface ImportMetaWithEnv extends ImportMeta {
  readonly env: AIConfigEnv;
}

export function loadAIConfig(env: AIConfigEnv = (import.meta as ImportMetaWithEnv).env ?? {}): AIConfig | null {
  const userSettings = loadUserSettings();
  const provider = normalizeProvider(userSettings.aiProvider) ?? normalizeProvider(env.VITE_AI_PROVIDER);
  const model =
    sanitizeValue(userSettings.aiModel) ??
    env.VITE_AI_MODEL ??
    env.VITE_AI_PROVIDER_MODEL ??
    (provider ? getDefaultModel(provider) : null);
  const endpoint =
    sanitizeValue(userSettings.aiEndpoint) ??
    env.VITE_AI_ENDPOINT ??
    env.VITE_AI_PROVIDER_ENDPOINT ??
    (provider ? getDefaultEndpoint(provider) : null);
  const apiKey = sanitizeValue(userSettings.aiApiKey) ?? env.VITE_AI_API_KEY ?? env.VITE_AI_PROVIDER_API_KEY;

  if (!provider || !model || !apiKey || (provider === 'custom' && !endpoint)) {
    return null;
  }

  return {
    provider,
    model,
    ...(endpoint ? { endpoint } : {}),
    apiKey,
  };
}

function normalizeProvider(value?: string): AIProviderName | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'openai' || normalized === 'gemini' || normalized === 'deepseek' || normalized === 'custom') {
    return normalized;
  }

  return null;
}

function sanitizeValue(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function getDefaultModel(provider: AIProviderName) {
  if (provider === 'deepseek') {
    return 'deepseek-chat';
  }

  return null;
}

function getDefaultEndpoint(provider: AIProviderName) {
  if (provider === 'deepseek') {
    return 'https://api.deepseek.com/v1/chat/completions';
  }

  return null;
}
