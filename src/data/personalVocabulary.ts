import { type VocabularyWord } from './vocabulary';

export type PersonalVocabularySource = {
  label: string;
  detail: string;
  dateAdded: string;
};

export type PersonalVocabularyEnrichment = {
  status: 'complete' | 'partial' | 'pending' | 'failed';
  source: 'main-vocabulary' | 'manual' | 'ai-reading' | 'dictionary-api' | 'ai-enhanced';
  updatedAt?: string;
};

export type PersonalVocabularyAIEnrichment = {
  status: 'pending' | 'complete' | 'failed';
  source: 'ai';
  rootAnalysis?: string;
  memoryTip?: string;
  wordFamily?: string[];
  collocations?: string[];
  learningNote?: string;
  updatedAt?: string;
};

export type PersonalVocabularyEntry = {
  id: string;
  source: PersonalVocabularySource;
  wordId?: string;
  customWord?: VocabularyWord;
  enrichment?: PersonalVocabularyEnrichment;
  aiEnrichment?: PersonalVocabularyAIEnrichment;
};

export const personalVocabularyDatabase: PersonalVocabularyEntry[] = [];

export function removePersonalVocabularyByIds(entries: PersonalVocabularyEntry[], ids: string[]) {
  if (ids.length === 0) {
    return entries;
  }

  const idSet = new Set(ids);
  return entries.filter((entry) => !idSet.has(entry.id));
}
