import type { VocabularyWord } from '../data/vocabulary';

export const AI_READING_SELECTED_WORDS_PARAM = 'words';

export function buildAIReadingSearch(wordIds: string[]) {
  const selectedWordIds = normalizeWordIds(wordIds);
  const params = new URLSearchParams();

  if (selectedWordIds.length > 0) {
    params.set(AI_READING_SELECTED_WORDS_PARAM, selectedWordIds.join(','));
  }

  const search = params.toString();
  return search ? `?${search}` : '';
}

export function parseSelectedReadingWordIds(search: string) {
  const params = new URLSearchParams(search);
  const raw = params.get(AI_READING_SELECTED_WORDS_PARAM) ?? '';
  return normalizeWordIds(raw.split(','));
}

export function resolveSelectedReadingWords({
  selectedWordIds,
  vocabularyWords,
  personalVocabularyWords,
}: {
  selectedWordIds: string[];
  vocabularyWords: VocabularyWord[];
  personalVocabularyWords: VocabularyWord[];
}) {
  const vocabularyWordMap = new Map(vocabularyWords.map((word) => [word.id, word]));
  const personalWordMap = new Map(personalVocabularyWords.map((word) => [word.id, word]));

  return normalizeWordIds(selectedWordIds)
    .map((wordId) => vocabularyWordMap.get(wordId) ?? personalWordMap.get(wordId) ?? null)
    .filter((word): word is VocabularyWord => Boolean(word));
}

function normalizeWordIds(wordIds: string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const wordId of wordIds) {
    const value = typeof wordId === 'string' ? wordId.trim() : '';
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    normalized.push(value);
  }

  return normalized;
}
