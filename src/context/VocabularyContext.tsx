import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { personalVocabularyDatabase, type PersonalVocabularyEntry } from '../data/personalVocabulary';
import {
  chapterDefinitions,
  initialMemoryBoxes,
  initialMemoryMarks,
  initialSpellingStats,
  type MemoryBoxes,
  type MemoryMark,
  type SpellingStats,
  type VocabularyChapterSummary,
  type VocabularyWord,
  type WordAction,
  vocabularyDatabase,
} from '../data/vocabulary';

type PersistedWordState = {
  memory: MemoryBoxes;
  spelling: SpellingStats;
  memoryMarks: MemoryMark[];
  memoryHistory: MemoryMark[][];
  lastReviewAction?: WordAction;
};

type VocabularyContextValue = {
  words: VocabularyWord[];
  chapterSummaries: VocabularyChapterSummary[];
  todayLearned: number;
  todayReviewed: number;
  totalWords: number;
  getWordsByChapter: (chapter: number) => VocabularyWord[];
  getPersonalVocabularyWords: () => Array<{
    word: VocabularyWord;
    source: {
      label: string;
      detail: string;
      dateAdded: string;
    };
  }>;
  addPersonalVocabularyWord: (payload: {
    wordId?: string;
    customWord?: VocabularyWord;
    source: { label: string; detail: string; dateAdded: string };
  }) => void;
  updateWordReview: (wordId: string, action: WordAction) => void;
  setMemoryMark: (wordId: string, boxIndex: number, mark: 'check' | 'cross') => void;
  submitSpellingAttempt: (wordId: string, input: string) => boolean;
};

const STORAGE_KEY = 'ivys-challenge.vocabulary-progress';
const PERSONAL_VOCABULARY_STORAGE_KEY = 'ivys-challenge.personal-vocabulary';

const VocabularyContext = createContext<VocabularyContextValue | null>(null);

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const [persistedState, setPersistedState] = useState<Record<string, PersistedWordState>>({});
  const [personalEntries, setPersonalEntries] = useState(personalVocabularyDatabase);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Record<string, PersistedWordState>;
      setPersistedState(parsed);
    } catch {
      setPersistedState({});
    }
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(PERSONAL_VOCABULARY_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as typeof personalVocabularyDatabase;
      setPersonalEntries(parsed);
    } catch {
      setPersonalEntries(personalVocabularyDatabase);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  }, [persistedState]);

  useEffect(() => {
    window.localStorage.setItem(PERSONAL_VOCABULARY_STORAGE_KEY, JSON.stringify(personalEntries));
  }, [personalEntries]);

  const words = useMemo(() => {
    return vocabularyDatabase.map((word) => {
      const override = persistedState[word.id];
      if (!override) return word;

      return {
        ...word,
        memory: override.memory,
        spelling: override.spelling,
        memoryMarks: override.memoryMarks ?? [...initialMemoryMarks],
        memoryHistory: override.memoryHistory ?? [],
        lastReviewAction: override.lastReviewAction,
      };
    });
  }, [persistedState]);

  const chapterSummaries = useMemo<VocabularyChapterSummary[]>(() => {
    return chapterDefinitions.map((definition) => {
      const chapterWords = words.filter((word) => word.chapter === definition.chapter);
      const learnedWords = chapterWords.filter((word) => word.memory.some(Boolean)).length;

      return {
        chapter: definition.chapter,
        chapterLabel: String(definition.chapter).padStart(2, '0'),
        topic: definition.topic,
        learnedWords,
        totalWords: chapterWords.length,
        progress: chapterWords.length === 0 ? 0 : Math.round((learnedWords / chapterWords.length) * 100),
      };
    });
  }, [words]);

  const todayLearned = useMemo(() => {
    return words.filter((word) => word.memory.some(Boolean)).length;
  }, [words]);

  const todayReviewed = useMemo(() => {
    return words.filter((word) => word.spelling.attempts > 0).length;
  }, [words]);

  const getWordsByChapter = (chapter: number) => words.filter((word) => word.chapter === chapter);

  const getPersonalVocabularyWords = () =>
    personalEntries
      .map((entry) => {
        const baseWord =
          (entry.wordId ? words.find((item) => item.id === entry.wordId) : null) ??
          entry.customWord ??
          null;

        if (!baseWord) return null;

        const override = persistedState[baseWord.id];
        const word = override
          ? {
              ...baseWord,
              memory: override.memory,
              spelling: override.spelling,
              memoryMarks: override.memoryMarks ?? [...initialMemoryMarks],
              memoryHistory: override.memoryHistory ?? [],
              lastReviewAction: override.lastReviewAction,
            }
          : baseWord;

        if (!word) return null;
        return {
          word,
          source: entry.source,
        };
      })
      .filter(Boolean) as Array<{
      word: VocabularyWord;
      source: {
        label: string;
        detail: string;
        dateAdded: string;
      };
    }>;

  const addPersonalVocabularyWord = ({
    wordId,
    customWord,
    source,
  }: {
    wordId?: string;
    customWord?: VocabularyWord;
    source: { label: string; detail: string; dateAdded: string };
  }) => {
    setPersonalEntries((current) => {
      const targetId = wordId ?? customWord?.id;
      if (!targetId) {
        return current;
      }

      const exists = current.some((entry) => entry.wordId === wordId || entry.customWord?.id === targetId);
      if (exists) {
        return current;
      }

      return [
        {
          id: `personal-${targetId}`,
          wordId,
          customWord,
          source,
        },
        ...current,
      ];
    });
  };

  const updateWordReview = (wordId: string, action: WordAction) => {
    setPersistedState((current) => {
      const baseWord =
        words.find((word) => word.id === wordId) ??
        vocabularyDatabase.find((word) => word.id === wordId) ??
        personalEntries.find((entry) => entry.customWord?.id === wordId)?.customWord;

      if (!baseWord) {
        return current;
      }

      const nextMemory = getNextMemory(baseWord.memory, action);
      const nextSpelling = getNextSpelling(baseWord.spelling, action);

      return {
        ...current,
        [wordId]: {
          memory: nextMemory,
          spelling: nextSpelling,
          memoryMarks: getNextMemoryMarks(baseWord.memoryMarks ?? createEmptyMemoryMarks(), action),
          memoryHistory: baseWord.memoryHistory ?? [],
          lastReviewAction: action,
        },
      };
    });
  };

  const setMemoryMark = (wordId: string, boxIndex: number, mark: 'check' | 'cross') => {
    setPersistedState((current) => {
      const baseWord =
        words.find((word) => word.id === wordId) ??
        vocabularyDatabase.find((word) => word.id === wordId) ??
        personalEntries.find((entry) => entry.customWord?.id === wordId)?.customWord;

      if (!baseWord) {
        return current;
      }

      const currentMarks = [...(baseWord.memoryMarks ?? createEmptyMemoryMarks())];
      currentMarks[boxIndex] = mark;
      const currentHistory = [...(baseWord.memoryHistory ?? [])];
      const nextAttempts = countCompletedMarks(currentMarks);
      const nextCrosses = currentMarks.filter((item) => item === 'cross').length;

      let finalMarks = currentMarks;
      let finalHistory = currentHistory;

      if (nextAttempts >= 7 && nextCrosses > 4) {
        finalHistory = [...currentHistory, [...currentMarks]];
        finalMarks = createEmptyMemoryMarks();
      }

      return {
        ...current,
        [wordId]: {
          memory: marksToMemory(finalMarks),
          spelling: {
            attempts: baseWord.spelling.attempts + 1,
            correct: baseWord.spelling.correct + (mark === 'check' ? 1 : 0),
            errors: baseWord.spelling.errors + (mark === 'cross' ? 1 : 0),
          },
          memoryMarks: finalMarks,
          memoryHistory: finalHistory,
          lastReviewAction: baseWord.lastReviewAction,
        },
      };
    });
  };

  const submitSpellingAttempt = (wordId: string, input: string) => {
    const baseWord =
      words.find((word) => word.id === wordId) ??
      vocabularyDatabase.find((word) => word.id === wordId) ??
      personalEntries.find((entry) => entry.customWord?.id === wordId)?.customWord;

    if (!baseWord) {
      return false;
    }

    const normalizedInput = normalizeWord(input);
    const normalizedWord = normalizeWord(baseWord.word);
    const isCorrect = normalizedInput.length > 0 && normalizedInput === normalizedWord;

    setPersistedState((current) => ({
      ...current,
      [wordId]: {
        memory: baseWord.memory,
        spelling: {
          attempts: baseWord.spelling.attempts + 1,
          correct: baseWord.spelling.correct + (isCorrect ? 1 : 0),
          errors: baseWord.spelling.errors + (isCorrect ? 0 : 1),
        },
        memoryMarks: baseWord.memoryMarks ?? [...initialMemoryMarks],
        memoryHistory: baseWord.memoryHistory ?? [],
        lastReviewAction: baseWord.lastReviewAction,
      },
    }));

    return isCorrect;
  };

  const value = useMemo<VocabularyContextValue>(
    () => ({
      words,
      chapterSummaries,
      todayLearned,
      todayReviewed,
      totalWords: words.length,
      getWordsByChapter,
      getPersonalVocabularyWords,
      addPersonalVocabularyWord,
      updateWordReview,
      setMemoryMark,
      submitSpellingAttempt,
    }),
    [chapterSummaries, personalEntries, persistedState, todayLearned, todayReviewed, words],
  );

  return <VocabularyContext.Provider value={value}>{children}</VocabularyContext.Provider>;
}

export function useVocabulary() {
  const context = useContext(VocabularyContext);
  if (!context) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }

  return context;
}

function getNextMemory(current: MemoryBoxes, action: WordAction): MemoryBoxes {
  const next = [...current] as MemoryBoxes;

  if (action === 'known') {
    const nextIndex = next.findIndex((box) => box === false);
    if (nextIndex !== -1) {
      next[nextIndex] = true;
    }
    return next;
  }

  if (action === 'unknown') {
    return [...initialMemoryBoxes] as MemoryBoxes;
  }

  const lastTrueIndex = [...next].reverse().findIndex((box) => box === true);
  if (lastTrueIndex === -1) {
    return next;
  }

  const realIndex = next.length - 1 - lastTrueIndex;
  next[realIndex] = false;
  return next;
}

function getNextSpelling(current: SpellingStats, action: WordAction): SpellingStats {
  if (action === 'known') {
    return {
      attempts: current.attempts + 1,
      correct: current.correct + 1,
      errors: current.errors,
    };
  }

  if (action === 'unknown') {
    return {
      attempts: current.attempts + 1,
      correct: current.correct,
      errors: current.errors + 1,
    };
  }

  return {
    attempts: current.attempts + 1,
    correct: current.correct,
    errors: current.errors,
  };
}

function getNextMemoryMarks(current: MemoryMark[], action: WordAction) {
  const next = [...current];

  if (action === 'known') {
    const targetIndex = next.findIndex((mark) => mark === 'empty');
    if (targetIndex !== -1) {
      next[targetIndex] = 'check';
    }
    return next;
  }

  if (action === 'unknown') {
    return createEmptyMemoryMarks();
  }

  return next;
}

function createEmptyMemoryMarks(): MemoryMark[] {
  return [...initialMemoryMarks];
}

function marksToMemory(marks: MemoryMark[]): MemoryBoxes {
  return marks.map((mark) => mark === 'check') as MemoryBoxes;
}

function countCompletedMarks(marks: MemoryMark[]) {
  return marks.filter((mark) => mark !== 'empty').length;
}

function normalizeWord(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
