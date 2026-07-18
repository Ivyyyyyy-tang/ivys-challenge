import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEARNING_PROGRESS_STORAGE_KEY,
  PERSONAL_VOCABULARY_STORAGE_KEY,
  SIDEBAR_ORDER_STORAGE_KEY,
  SIDEBAR_WIDTH_STORAGE_KEY,
  clearManagedLocalData,
  collectUserLocalData,
  importDataBackupFromJson,
} from '../.tmp-tests/dataExportService.bundle.mjs';
import { USER_SETTINGS_STORAGE_KEY } from '../.tmp-tests/userSettings.bundle.mjs';

function createStorage(initial = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test('export collects managed user data without API keys', () => {
  const storage = createStorage({
    [USER_SETTINGS_STORAGE_KEY]: JSON.stringify({
      aiProvider: 'openai',
      aiApiKey: 'sk-secret',
      aiModel: 'gpt-test',
      aiEndpoint: '',
      dictionaryProvider: 'custom',
      dictionaryApiKey: 'dict-secret',
      dictionaryEndpoint: 'https://dict.example.test',
      learningLevel: 'advanced',
      dailyGoal: 42,
    }),
    [PERSONAL_VOCABULARY_STORAGE_KEY]: JSON.stringify([{ id: 'personal-1', wordId: 'word-1' }]),
    [LEARNING_PROGRESS_STORAGE_KEY]: JSON.stringify({ 'word-1': { attempts: 3 } }),
    [SIDEBAR_WIDTH_STORAGE_KEY]: '280',
    [SIDEBAR_ORDER_STORAGE_KEY]: JSON.stringify(['settings', 'vocabulary']),
  });

  const payload = collectUserLocalData(storage);
  const serialized = JSON.stringify(payload);

  assert.equal(payload.version, '1');
  assert.equal(payload.data.userSettings.aiApiKey, undefined);
  assert.equal(payload.data.userSettings.dictionaryApiKey, undefined);
  assert.equal(payload.data.userSettings.aiProvider, 'openai');
  assert.equal(payload.data.personalVocabulary.length, 1);
  assert.equal(payload.data.learningProgress['word-1'].attempts, 3);
  assert.equal(payload.data.sidebarPreferences.width, '280');
  assert.ok(!serialized.includes('sk-secret'));
  assert.ok(!serialized.includes('dict-secret'));
});

test('import restores settings vocabulary progress and sidebar preferences', () => {
  const storage = createStorage({
    [USER_SETTINGS_STORAGE_KEY]: JSON.stringify({
      aiProvider: 'openai',
      aiApiKey: 'keep-this-key',
      aiModel: 'gpt-old',
      aiEndpoint: '',
      dictionaryProvider: 'free',
      dictionaryApiKey: '',
      dictionaryEndpoint: '',
      learningLevel: 'beginner',
      dailyGoal: 10,
    }),
  });

  const backupJson = JSON.stringify({
    version: '1',
    exportedAt: '2026-07-18T10:00:00.000Z',
    data: {
      userSettings: {
        aiProvider: 'gemini',
        aiModel: 'gemini-1.5-flash',
        aiEndpoint: 'https://gemini.example.test',
        dictionaryProvider: 'custom',
        dictionaryEndpoint: 'https://dict.example.test',
        learningLevel: 'advanced',
        dailyGoal: 25,
      },
      personalVocabulary: [{ id: 'personal-2', wordId: 'word-2' }],
      learningProgress: { 'word-2': { attempts: 5, correct: 4 } },
      memoryData: { 'word-2': { attempts: 5, correct: 4 } },
      sidebarPreferences: {
        width: '300',
        order: JSON.stringify(['settings', 'ai-reading']),
      },
    },
  });

  importDataBackupFromJson(backupJson, storage);

  const restoredSettings = JSON.parse(storage.getItem(USER_SETTINGS_STORAGE_KEY));
  assert.equal(restoredSettings.aiProvider, 'gemini');
  assert.equal(restoredSettings.aiApiKey, 'keep-this-key');
  assert.equal(restoredSettings.dictionaryProvider, 'custom');
  assert.equal(restoredSettings.dailyGoal, 25);
  assert.deepEqual(JSON.parse(storage.getItem(PERSONAL_VOCABULARY_STORAGE_KEY)), [{ id: 'personal-2', wordId: 'word-2' }]);
  assert.deepEqual(JSON.parse(storage.getItem(LEARNING_PROGRESS_STORAGE_KEY)), { 'word-2': { attempts: 5, correct: 4 } });
  assert.equal(storage.getItem(SIDEBAR_WIDTH_STORAGE_KEY), '300');
  assert.equal(storage.getItem(SIDEBAR_ORDER_STORAGE_KEY), JSON.stringify(['settings', 'ai-reading']));
});

test('clearManagedLocalData removes only managed learning keys', () => {
  const storage = createStorage({
    [USER_SETTINGS_STORAGE_KEY]: '{"dailyGoal":20}',
    [PERSONAL_VOCABULARY_STORAGE_KEY]: '[]',
    [LEARNING_PROGRESS_STORAGE_KEY]: '{}',
    [SIDEBAR_WIDTH_STORAGE_KEY]: '260',
  });

  clearManagedLocalData(storage);

  assert.equal(storage.getItem(USER_SETTINGS_STORAGE_KEY), null);
  assert.equal(storage.getItem(PERSONAL_VOCABULARY_STORAGE_KEY), null);
  assert.equal(storage.getItem(LEARNING_PROGRESS_STORAGE_KEY), null);
  assert.equal(storage.getItem(SIDEBAR_WIDTH_STORAGE_KEY), '260');
});
