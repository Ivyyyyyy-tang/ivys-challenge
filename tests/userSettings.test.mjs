import test from 'node:test';
import assert from 'node:assert/strict';
import {
  USER_SETTINGS_STORAGE_KEY,
  defaultUserSettings,
  loadUserSettings,
  saveUserSettings,
} from '../.tmp-tests/userSettings.bundle.mjs';
import { loadAIConfig } from '../.tmp-tests/aiConfig.bundle.mjs';
import { loadDictionaryConfig } from '../.tmp-tests/dictionaryConfig.bundle.mjs';
import { createAIProvider } from '../.tmp-tests/aiService.bundle.mjs';

function createStorage(initial = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}

test('first launch returns default user settings', () => {
  const storage = createStorage();
  const result = loadUserSettings(storage);

  assert.deepEqual(result, defaultUserSettings);
});

test('settings persist after save and reload', () => {
  const storage = createStorage();

  saveUserSettings(
    {
      aiProvider: 'openai',
      aiApiKey: 'sk-user',
      aiModel: 'gpt-user',
      aiEndpoint: 'https://api.openai.test/v1',
      dictionaryProvider: 'custom',
      dictionaryApiKey: 'dict-user',
      dictionaryEndpoint: 'https://dictionary.example.test',
      learningLevel: 'advanced',
      dailyGoal: 35,
    },
    storage,
  );

  const raw = storage.getItem(USER_SETTINGS_STORAGE_KEY);
  assert.ok(raw);

  const result = loadUserSettings(storage);
  assert.deepEqual(result, {
    aiProvider: 'openai',
    aiApiKey: 'sk-user',
    aiModel: 'gpt-user',
    aiEndpoint: 'https://api.openai.test/v1',
    dictionaryProvider: 'custom',
    dictionaryApiKey: 'dict-user',
    dictionaryEndpoint: 'https://dictionary.example.test',
    learningLevel: 'advanced',
    dailyGoal: 35,
  });
});

test('user settings override environment variables when both exist', () => {
  const storage = createStorage({
    [USER_SETTINGS_STORAGE_KEY]: JSON.stringify({
      aiProvider: 'gemini',
      aiApiKey: 'gemini-user-key',
      aiModel: 'gemini-user-model',
      aiEndpoint: 'https://gemini.user.test',
      dictionaryProvider: 'custom',
      dictionaryApiKey: 'dict-user-key',
      dictionaryEndpoint: 'https://dictionary.user.test',
      learningLevel: 'intermediate',
      dailyGoal: 20,
    }),
  });

  globalThis.window = { localStorage: storage };

  const aiConfig = loadAIConfig({
    VITE_AI_PROVIDER: 'openai',
    VITE_AI_MODEL: 'gpt-env',
    VITE_AI_API_KEY: 'key-env',
    VITE_AI_ENDPOINT: 'https://env.openai.test',
  });
  const dictionaryConfig = loadDictionaryConfig({
    VITE_DICTIONARY_PROVIDER: 'free',
    VITE_DICTIONARY_ENDPOINT: 'https://dictionary.env.test',
    VITE_DICTIONARY_API_KEY: 'dict-env-key',
  });

  assert.equal(aiConfig?.provider, 'gemini');
  assert.equal(aiConfig?.model, 'gemini-user-model');
  assert.equal(aiConfig?.apiKey, 'gemini-user-key');
  assert.equal(aiConfig?.endpoint, 'https://gemini.user.test');
  assert.equal(dictionaryConfig.provider, 'custom');
  assert.equal(dictionaryConfig.endpoint, 'https://dictionary.user.test');
  assert.equal(dictionaryConfig.apiKey, 'dict-user-key');

  delete globalThis.window;
});

test('environment values still fill missing user fields', () => {
  const storage = createStorage({
    [USER_SETTINGS_STORAGE_KEY]: JSON.stringify({
      aiProvider: 'gemini',
      aiApiKey: '',
      aiModel: '',
      aiEndpoint: '',
      dictionaryProvider: 'custom',
      dictionaryApiKey: '',
      dictionaryEndpoint: '',
      learningLevel: 'intermediate',
      dailyGoal: 20,
    }),
  });

  globalThis.window = { localStorage: storage };

  const aiConfig = loadAIConfig({
    VITE_AI_MODEL: 'gemini-test',
    VITE_AI_API_KEY: 'key-456',
    VITE_AI_ENDPOINT: 'https://env.gemini.test',
  });
  const dictionaryConfig = loadDictionaryConfig({
    VITE_DICTIONARY_ENDPOINT: 'https://dict.env.test',
    VITE_DICTIONARY_API_KEY: 'dict-456',
  });

  assert.equal(aiConfig?.provider, 'gemini');
  assert.equal(aiConfig?.model, 'gemini-test');
  assert.equal(aiConfig?.apiKey, 'key-456');
  assert.equal(aiConfig?.endpoint, 'https://env.gemini.test');
  assert.equal(dictionaryConfig.provider, 'custom');
  assert.equal(dictionaryConfig.endpoint, 'https://dict.env.test');
  assert.equal(dictionaryConfig.apiKey, 'dict-456');

  delete globalThis.window;
});

test('deepseek provider reads apiKey model and default endpoint correctly', () => {
  const storage = createStorage({
    [USER_SETTINGS_STORAGE_KEY]: JSON.stringify({
      ...defaultUserSettings,
      aiProvider: 'deepseek',
      aiApiKey: 'deepseek-key',
      aiModel: '',
      aiEndpoint: '',
    }),
  });

  globalThis.window = { localStorage: storage };

  const aiConfig = loadAIConfig({});

  assert.equal(aiConfig?.provider, 'deepseek');
  assert.equal(aiConfig?.apiKey, 'deepseek-key');
  assert.equal(aiConfig?.model, 'deepseek-chat');
  assert.equal(aiConfig?.endpoint, 'https://api.deepseek.com/v1/chat/completions');

  delete globalThis.window;
});

test('custom provider can change endpoint without business-code changes', () => {
  const storage = createStorage({
    [USER_SETTINGS_STORAGE_KEY]: JSON.stringify({
      ...defaultUserSettings,
      aiProvider: 'custom',
      aiApiKey: 'custom-key',
      aiModel: 'qwen-plus',
      aiEndpoint: 'https://provider.example.com/v1/chat/completions',
    }),
  });

  globalThis.window = { localStorage: storage };

  const aiConfig = loadAIConfig({});
  const provider = createAIProvider(aiConfig);

  assert.equal(aiConfig?.provider, 'custom');
  assert.equal(aiConfig?.endpoint, 'https://provider.example.com/v1/chat/completions');
  assert.ok(provider);
  assert.equal(provider?.constructor.name, 'CustomProvider');

  delete globalThis.window;
});

test('no api key still returns null config so AI reading can fall back', () => {
  const storage = createStorage({
    [USER_SETTINGS_STORAGE_KEY]: JSON.stringify({
      ...defaultUserSettings,
      aiProvider: 'openai',
      aiApiKey: '',
      aiModel: 'gpt-test',
      aiEndpoint: '',
    }),
  });

  globalThis.window = { localStorage: storage };

  const aiConfig = loadAIConfig({});

  assert.equal(aiConfig, null);

  delete globalThis.window;
});
