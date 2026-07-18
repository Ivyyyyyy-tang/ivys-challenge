import {
  initialMemoryBoxes,
  initialMemoryMarks,
  initialSpellingStats,
  type VocabularyWord,
} from './vocabulary';
import type {
  PersonalVocabularyAIEnrichment,
  PersonalVocabularyEnrichment,
  PersonalVocabularyEntry,
} from './personalVocabulary';
import { lookupDictionaryWord } from '../services/dictionary/dictionaryService';

export type DictionaryData = {
  phonetic: string;
  part_of_speech: string;
  definition: string;
  example: string;
};

export function normalizeWord(value: string) {
  const trimmed = value.trim().toLowerCase();
  const stripped = trimmed.replace(/^[^a-z]+|[^a-z]+$/gi, '');
  const collapsed = stripped.replace(/[^a-z'-]+/gi, '');
  return collapsed;
}

export function enrichVocabularyWord({
  rawWord,
  existingWords,
}: {
  rawWord: string;
  existingWords: VocabularyWord[];
}): VocabularyWord {
  const normalized = normalizeWord(rawWord);
  const matchedWord = findExistingWordMatch(normalized, existingWords);

  if (matchedWord) {
    return matchedWord;
  }

  return {
    id: `ai-reading-custom-${normalized || 'unknown'}`,
    chapter: 0,
    word: normalized || rawWord.trim().toLowerCase(),
    phonetic: '',
    audio: '',
    part_of_speech: 'Unknown',
    meaning: 'Pending enrichment',
    example: 'Captured from AI Reading.',
    word_family: [],
    collocations: [],
    memory: [...initialMemoryBoxes],
    spelling: { ...initialSpellingStats },
    memoryMarks: [...initialMemoryMarks],
    memoryHistory: [],
  };
}

export function getEnrichmentStatus(input: PersonalVocabularyEntry): PersonalVocabularyEnrichment & { needsAIEnhancement: boolean };
export function getEnrichmentStatus(input: {
  word: VocabularyWord;
  matchedFromExisting?: boolean;
}): PersonalVocabularyEnrichment;
export function getEnrichmentStatus(
  input:
    | PersonalVocabularyEntry
    | {
        word: VocabularyWord;
        matchedFromExisting?: boolean;
      },
) {
  if ('source' in input && ('wordId' in input || 'customWord' in input || 'enrichment' in input)) {
    const enrichment = input.enrichment ?? deriveWordEnrichment({
      word:
        input.customWord ??
        createFallbackWord(input.wordId ?? 'missing-word'),
      matchedFromExisting: Boolean(input.wordId),
    });

    return {
      ...enrichment,
      needsAIEnhancement: enrichment.status === 'partial' && enrichment.source === 'dictionary-api',
    };
  }

  return deriveWordEnrichment(input as { word: VocabularyWord; matchedFromExisting?: boolean });
}

export function shouldEnrichVocabularyEntry(entry: PersonalVocabularyEntry) {
  const enrichment = getEnrichmentStatus(entry);
  return enrichment.status === 'pending';
}

export function shouldAIEnrichVocabularyEntry(entry: PersonalVocabularyEntry) {
  const enrichment = getEnrichmentStatus(entry);

  if (enrichment.status !== 'partial' || enrichment.source !== 'dictionary-api') {
    return false;
  }

  if (!entry.aiEnrichment) {
    return true;
  }

  return entry.aiEnrichment.status === 'pending';
}

export function createAIEnrichmentPlaceholder(entry: PersonalVocabularyEntry): PersonalVocabularyEntry {
  if (!shouldAIEnrichVocabularyEntry(entry)) {
    return entry;
  }

  const aiEnrichment: PersonalVocabularyAIEnrichment = {
    status: 'pending',
    source: 'ai',
    updatedAt: new Date().toISOString(),
  };

  return {
    ...entry,
    aiEnrichment,
  };
}

export async function fetchDictionaryData(
  word: string,
  fetcher: typeof fetch = fetch,
): Promise<DictionaryData | null> {
  const normalized = normalizeWord(word);
  if (!normalized) {
    return null;
  }

  return lookupDictionaryWord(normalized, fetcher);
}

export async function enrichPendingVocabularyWord(
  entry: PersonalVocabularyEntry,
  fetcher: typeof fetch = fetch,
): Promise<PersonalVocabularyEntry> {
  if (entry.enrichment?.status !== 'pending' || !entry.customWord) {
    return entry;
  }

  const dictionaryData = await fetchDictionaryData(entry.customWord.word, fetcher);
  if (!dictionaryData) {
    return entry;
  }

  return {
    ...entry,
    customWord: {
      ...entry.customWord,
      phonetic: dictionaryData.phonetic || entry.customWord.phonetic,
      part_of_speech: dictionaryData.part_of_speech || entry.customWord.part_of_speech,
      meaning: dictionaryData.definition || entry.customWord.meaning,
      example: dictionaryData.example || entry.customWord.example,
    },
    enrichment: {
      status: 'partial',
      source: 'dictionary-api',
      updatedAt: new Date().toISOString(),
    },
  };
}

function deriveWordEnrichment({
  word,
  matchedFromExisting = false,
}: {
  word: VocabularyWord;
  matchedFromExisting?: boolean;
}): PersonalVocabularyEnrichment {
  if (matchedFromExisting || word.chapter > 0) {
    return {
      status: 'complete',
      source: 'main-vocabulary',
    };
  }

  const hasMeaning = Boolean(word.meaning && word.meaning !== 'Pending enrichment');
  const hasPhonetic = Boolean(word.phonetic);
  const hasExample = Boolean(word.example && word.example !== 'Captured from AI Reading.');

  if (!hasMeaning) {
    return {
      status: 'pending',
      source: 'ai-reading',
    };
  }

  if (hasMeaning && hasPhonetic && hasExample) {
    return {
      status: 'complete',
      source: 'ai-reading',
    };
  }

  return {
    status: 'partial',
    source: 'ai-reading',
  };
}

function createFallbackWord(id: string): VocabularyWord {
  return {
    id,
    chapter: 0,
    word: id,
    phonetic: '',
    audio: '',
    part_of_speech: 'Unknown',
    meaning: 'Pending enrichment',
    example: 'Captured from AI Reading.',
    word_family: [],
    collocations: [],
    memory: [...initialMemoryBoxes],
    spelling: { ...initialSpellingStats },
    memoryMarks: [...initialMemoryMarks],
    memoryHistory: [],
  };
}

function findExistingWordMatch(normalized: string, existingWords: VocabularyWord[]) {
  if (!normalized) return null;

  const directMatch = existingWords.find((word) => normalizeWord(word.word) === normalized);
  if (directMatch) return directMatch;

  const singularCandidate = toSingular(normalized);
  if (singularCandidate !== normalized) {
    const singularMatch = existingWords.find((word) => normalizeWord(word.word) === singularCandidate);
    if (singularMatch) return singularMatch;
  }

  const pluralCandidate = toPlural(normalized);
  if (pluralCandidate !== normalized) {
    const pluralMatch = existingWords.find((word) => normalizeWord(word.word) === pluralCandidate);
    if (pluralMatch) return pluralMatch;
  }

  return null;
}

function toSingular(value: string) {
  if (value.endsWith('ies') && value.length > 3) {
    return `${value.slice(0, -3)}y`;
  }

  if (value.endsWith('es') && value.length > 2) {
    return value.slice(0, -2);
  }

  if (value.endsWith('s') && !value.endsWith('ss') && value.length > 1) {
    return value.slice(0, -1);
  }

  return value;
}

function toPlural(value: string) {
  if (value.endsWith('y') && value.length > 1) {
    return `${value.slice(0, -1)}ies`;
  }

  if (/(s|x|z|ch|sh)$/i.test(value)) {
    return `${value}es`;
  }

  return `${value}s`;
}
