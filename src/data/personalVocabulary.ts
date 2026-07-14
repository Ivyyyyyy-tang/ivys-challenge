import { type VocabularyWord, vocabularyDatabase } from './vocabulary';

export type PersonalVocabularySource = {
  label: string;
  detail: string;
  dateAdded: string;
};

export type PersonalVocabularyEntry = {
  id: string;
  source: PersonalVocabularySource;
  wordId?: string;
  customWord?: VocabularyWord;
};

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

export const personalVocabularyDatabase: PersonalVocabularyEntry[] = sampleWordIds
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
    };
  })
  .filter(Boolean) as PersonalVocabularyEntry[];
