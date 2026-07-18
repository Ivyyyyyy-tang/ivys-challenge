import type { AIProviderName } from './aiConfig';
import type { DictionaryProviderName } from './dictionaryConfig';

export type UserAIProviderSetting = AIProviderName | 'none';
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserSettings {
  aiProvider: UserAIProviderSetting;
  aiApiKey: string;
  aiModel: string;
  aiEndpoint: string;
  dictionaryProvider: DictionaryProviderName;
  dictionaryApiKey: string;
  dictionaryEndpoint: string;
  learningLevel: LearningLevel;
  dailyGoal: number;
}

export const USER_SETTINGS_STORAGE_KEY = 'ivys-user-settings';

export const defaultUserSettings: UserSettings = {
  aiProvider: 'none',
  aiApiKey: '',
  aiModel: '',
  aiEndpoint: '',
  dictionaryProvider: 'free',
  dictionaryApiKey: '',
  dictionaryEndpoint: '',
  learningLevel: 'intermediate',
  dailyGoal: 20,
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function loadUserSettings(storage: StorageLike | null = resolveStorage()): UserSettings {
  if (!storage) {
    return { ...defaultUserSettings };
  }

  const raw = storage.getItem(USER_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return { ...defaultUserSettings };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return sanitizeUserSettings(parsed);
  } catch {
    return { ...defaultUserSettings };
  }
}

export function saveUserSettings(
  settings: Partial<UserSettings>,
  storage: StorageLike | null = resolveStorage(),
): UserSettings {
  const currentSettings = loadUserSettings(storage);
  const nextSettings = sanitizeUserSettings({
    ...currentSettings,
    ...settings,
  });

  if (storage) {
    storage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  }

  return nextSettings;
}

function sanitizeUserSettings(settings: Partial<UserSettings>): UserSettings {
  return {
    aiProvider: isAIProvider(settings.aiProvider) ? settings.aiProvider : defaultUserSettings.aiProvider,
    aiApiKey: sanitizeText(settings.aiApiKey),
    aiModel: sanitizeText(settings.aiModel),
    aiEndpoint: sanitizeText(settings.aiEndpoint),
    dictionaryProvider: isDictionaryProvider(settings.dictionaryProvider)
      ? settings.dictionaryProvider
      : defaultUserSettings.dictionaryProvider,
    dictionaryApiKey: sanitizeText(settings.dictionaryApiKey),
    dictionaryEndpoint: sanitizeText(settings.dictionaryEndpoint),
    learningLevel: isLearningLevel(settings.learningLevel) ? settings.learningLevel : defaultUserSettings.learningLevel,
    dailyGoal: isDailyGoal(settings.dailyGoal) ? settings.dailyGoal : defaultUserSettings.dailyGoal,
  };
}

function resolveStorage(): StorageLike | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function isAIProvider(value: unknown): value is UserAIProviderSetting {
  return value === 'none' || value === 'openai' || value === 'gemini' || value === 'deepseek' || value === 'custom';
}

function isDictionaryProvider(value: unknown): value is DictionaryProviderName {
  return value === 'free' || value === 'custom';
}

function isLearningLevel(value: unknown): value is LearningLevel {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced';
}

function isDailyGoal(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 300;
}

function sanitizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
