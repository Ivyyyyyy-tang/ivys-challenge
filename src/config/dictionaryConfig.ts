export type DictionaryProviderName = 'free' | 'custom';

export type DictionaryConfig = {
  provider: DictionaryProviderName;
  endpoint?: string;
  apiKey?: string;
};

import { loadUserSettings } from './userSettings';

type DictionaryConfigEnv = {
  VITE_DICTIONARY_PROVIDER?: string;
  VITE_DICTIONARY_ENDPOINT?: string;
  VITE_DICTIONARY_API_KEY?: string;
};

interface ImportMetaWithEnv extends ImportMeta {
  readonly env: DictionaryConfigEnv;
}

export function loadDictionaryConfig(
  env: DictionaryConfigEnv = (import.meta as ImportMetaWithEnv).env ?? {},
): DictionaryConfig {
  const userSettings = loadUserSettings();
  const provider =
    normalizeProvider(userSettings.dictionaryProvider) ??
    normalizeProvider(env.VITE_DICTIONARY_PROVIDER) ??
    'free';
  const endpoint = sanitizeValue(userSettings.dictionaryEndpoint) ?? env.VITE_DICTIONARY_ENDPOINT;
  const apiKey = sanitizeValue(userSettings.dictionaryApiKey) ?? env.VITE_DICTIONARY_API_KEY;

  return {
    provider,
    ...(endpoint ? { endpoint } : {}),
    ...(apiKey ? { apiKey } : {}),
  };
}

function normalizeProvider(value?: string): DictionaryProviderName | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'free' || normalized === 'custom') {
    return normalized;
  }

  return null;
}

function sanitizeValue(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
