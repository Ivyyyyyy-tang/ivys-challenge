import type { PersonalVocabularyEntry } from './personalVocabulary';
import { vocabularyDatabase } from './vocabulary';

const sampleWordIds = [
  'chapter-03-word-0380',
  'chapter-05-word-0740',
  'chapter-09-word-1310',
  'chapter-12-word-1790',
  'chapter-14-word-2090',
  'chapter-16-word-2370',
  'chapter-20-word-3010',
  'chapter-21-word-3360',
];

export const demoPersonalVocabularyDatabase: PersonalVocabularyEntry[] = sampleWordIds
  .map((wordId, index) => {
    const word = vocabularyDatabase.find((item) => item.id === wordId);
    if (!word) return null;

    return {
      id: `personal-${index + 1}`,
      wordId,
      source: {
        label: index % 2 === 0 ? 'AI Reading' : 'Chapter Review',
        detail: `Chapter ${String(word.chapter).padStart(2, '0')}`,
        dateAdded: '2026-07-14',
      },
      enrichment: {
        status: 'complete',
        source: 'main-vocabulary',
        updatedAt: '2026-07-14',
      },
    };
  })
  .filter(Boolean) as PersonalVocabularyEntry[];

interface ImportMetaEnvWithDemoFlag {
  readonly DEV?: boolean;
  readonly VITE_ENABLE_DEMO_PERSONAL_VOCABULARY?: string;
}

interface ImportMetaWithDemoFlag extends ImportMeta {
  readonly env: ImportMetaEnvWithDemoFlag;
}

export function shouldUseDemoPersonalVocabulary(
  env: ImportMetaEnvWithDemoFlag = (import.meta as ImportMetaWithDemoFlag).env ?? {},
) {
  return env.DEV === true && env.VITE_ENABLE_DEMO_PERSONAL_VOCABULARY === 'true';
}
