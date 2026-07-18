import { USER_SETTINGS_STORAGE_KEY, loadUserSettings, saveUserSettings, type UserSettings } from '../../config/userSettings';

export const LEARNING_PROGRESS_STORAGE_KEY = 'ivys-challenge.vocabulary-progress';
export const PERSONAL_VOCABULARY_STORAGE_KEY = 'ivys-challenge.personal-vocabulary';
export const SIDEBAR_WIDTH_STORAGE_KEY = 'ivys-challenge.sidebar-width';
export const SIDEBAR_ORDER_STORAGE_KEY = 'ivys-challenge.sidebar-order';
export const DATA_EXPORT_VERSION = '1';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type ExportedUserSettings = Omit<UserSettings, 'aiApiKey' | 'dictionaryApiKey'>;

export type DataBackupPayload = {
  version: string;
  exportedAt: string;
  data: {
    userSettings: ExportedUserSettings;
    personalVocabulary: unknown[];
    learningProgress: Record<string, unknown>;
    memoryData: Record<string, unknown>;
    sidebarPreferences: {
      width: string | null;
      order: string | null;
    };
  };
};

export function collectUserLocalData(storage: StorageLike | null = resolveStorage()): DataBackupPayload {
  const settings = loadUserSettings(storage);
  const sanitizedSettings = sanitizeUserSettingsForExport(settings);
  const learningProgress = parseStoredJson(storage?.getItem(LEARNING_PROGRESS_STORAGE_KEY), {});
  const personalVocabulary = parseStoredJson(storage?.getItem(PERSONAL_VOCABULARY_STORAGE_KEY), []);

  return {
    version: DATA_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      userSettings: sanitizedSettings,
      personalVocabulary: Array.isArray(personalVocabulary) ? personalVocabulary : [],
      learningProgress: isRecord(learningProgress) ? learningProgress : {},
      memoryData: isRecord(learningProgress) ? learningProgress : {},
      sidebarPreferences: {
        width: storage?.getItem(SIDEBAR_WIDTH_STORAGE_KEY) ?? null,
        order: storage?.getItem(SIDEBAR_ORDER_STORAGE_KEY) ?? null,
      },
    },
  };
}

export function createDataBackupJson(storage: StorageLike | null = resolveStorage()) {
  return JSON.stringify(collectUserLocalData(storage), null, 2);
}

export function downloadDataBackup(filename = createBackupFilename(), storage: StorageLike | null = resolveStorage()) {
  const json = createDataBackupJson(storage);

  if (typeof window === 'undefined') {
    return json;
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
  return json;
}

export function parseDataBackup(raw: string): DataBackupPayload {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid backup file. JSON could not be parsed.');
  }

  if (!isDataBackupPayload(parsed)) {
    throw new Error('Invalid backup file. Required fields are missing.');
  }

  return parsed;
}

export function restoreDataBackup(
  payload: DataBackupPayload,
  storage: StorageLike | null = resolveStorage(),
) {
  if (!storage) {
    throw new Error('Local storage is not available in this browser.');
  }

  const currentSettings = loadUserSettings(storage);
  saveUserSettings(
    {
      ...payload.data.userSettings,
      aiApiKey: currentSettings.aiApiKey,
      dictionaryApiKey: currentSettings.dictionaryApiKey,
    },
    storage,
  );

  storage.setItem(PERSONAL_VOCABULARY_STORAGE_KEY, JSON.stringify(payload.data.personalVocabulary));
  storage.setItem(LEARNING_PROGRESS_STORAGE_KEY, JSON.stringify(payload.data.learningProgress));

  if (payload.data.sidebarPreferences.width !== null) {
    storage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, payload.data.sidebarPreferences.width);
  }

  if (payload.data.sidebarPreferences.order !== null) {
    storage.setItem(SIDEBAR_ORDER_STORAGE_KEY, payload.data.sidebarPreferences.order);
  }
}

export function importDataBackupFromJson(raw: string, storage: StorageLike | null = resolveStorage()) {
  const payload = parseDataBackup(raw);
  restoreDataBackup(payload, storage);
  return payload;
}

export function clearManagedLocalData(storage: StorageLike | null = resolveStorage()) {
  if (!storage) {
    return;
  }

  storage.removeItem(USER_SETTINGS_STORAGE_KEY);
  storage.removeItem(PERSONAL_VOCABULARY_STORAGE_KEY);
  storage.removeItem(LEARNING_PROGRESS_STORAGE_KEY);
}

function sanitizeUserSettingsForExport(settings: UserSettings): ExportedUserSettings {
  const { aiApiKey: _aiApiKey, dictionaryApiKey: _dictionaryApiKey, ...safeSettings } = settings;
  return safeSettings;
}

function createBackupFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `ivys-challenge-backup-${date}.json`;
}

function parseStoredJson(raw: string | null | undefined, fallback: unknown) {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function resolveStorage(): StorageLike | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSidebarPreferences(value: unknown): value is DataBackupPayload['data']['sidebarPreferences'] {
  return (
    isRecord(value) &&
    ('width' in value ? typeof value.width === 'string' || value.width === null : true) &&
    ('order' in value ? typeof value.order === 'string' || value.order === null : true)
  );
}

function isDataBackupPayload(value: unknown): value is DataBackupPayload {
  if (!isRecord(value) || typeof value.version !== 'string' || !isRecord(value.data)) {
    return false;
  }

  const data = value.data;
  return (
    isRecord(data.userSettings) &&
    Array.isArray(data.personalVocabulary) &&
    isRecord(data.learningProgress) &&
    isRecord(data.memoryData) &&
    isSidebarPreferences(data.sidebarPreferences)
  );
}
