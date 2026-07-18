import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  personalVocabularyDatabase,
  type PersonalVocabularyEntry,
  type PersonalVocabularyEnrichment,
  removePersonalVocabularyByIds,
} from '../data/personalVocabulary';
import {
  demoPersonalVocabularyDatabase,
  shouldUseDemoPersonalVocabulary,
} from '../data/demoPersonalVocabulary';
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
import {
  enrichPendingVocabularyWord,
  enrichVocabularyWord,
  getEnrichmentStatus,
} from '../data/vocabularyEnrichment';

type PersistedWordState = {
  memory: MemoryBoxes;
  spelling: SpellingStats;
  memoryMarks: MemoryMark[];
  memoryHistory: MemoryMark[][];
  lastReviewAction?: WordAction;
  learnedOn?: string;
};

type VocabularyContextValue = {
  words: VocabularyWord[];
  chapterSummaries: VocabularyChapterSummary[];
  todayLearned: number;
  todayReviewed: number;
  totalWords: number;
  getWordsByChapter: (chapter: number) => VocabularyWord[];
  getPersonalVocabularyWords: () => Array<{
    entryId: string;
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
    enrichment?: PersonalVocabularyEnrichment;
  }) => void;
  addPersonalVocabularyFromReading: (rawWord: string) => VocabularyWord | null;
  removePersonalVocabularyEntries: (ids: string[]) => void;
  updateWordReview: (wordId: string, action: WordAction) => void;
  setMemoryMark: (wordId: string, boxIndex: number, mark: 'check' | 'cross') => void;
  submitSpellingAttempt: (wordId: string, input: string) => boolean;
};

const STORAGE_KEY = 'ivys-challenge.vocabulary-progress';
const PERSONAL_VOCABULARY_STORAGE_KEY = 'ivys-challenge.personal-vocabulary';

const VocabularyContext = createContext<VocabularyContextValue | null>(null);

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const [persistedState, setPersistedState] = useState<Record<string, PersistedWordState>>(() => loadInitialPersistedState());
  const [personalEntries, setPersonalEntries] = useState<PersonalVocabularyEntry[]>(() => loadInitialPersonalEntries());
  const attemptedEnrichmentIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  }, [persistedState]);

  useEffect(() => {
    window.localStorage.setItem(PERSONAL_VOCABULARY_STORAGE_KEY, JSON.stringify(personalEntries));
  }, [personalEntries]);

  const enrichPendingPersonalVocabulary = async () => {
    const pendingEntries = personalEntries.filter(
      (entry) => entry.enrichment?.status === 'pending' && !attemptedEnrichmentIdsRef.current.has(entry.id),
    );

    if (pendingEntries.length === 0) {
      return;
    }

    await Promise.all(
      pendingEntries.map(async (entry) => {
        attemptedEnrichmentIdsRef.current.add(entry.id);

        try {
          const enrichedEntry = await enrichPendingVocabularyWord(entry);

          if (enrichedEntry === entry) {
            return;
          }

          setPersonalEntries((current) => {
            const currentEntry = current.find((item) => item.id === entry.id);
            if (!currentEntry || currentEntry.enrichment?.status !== 'pending') {
              return current;
            }

            return current.map((item) => (item.id === entry.id ? enrichedEntry : item));
          });
        } catch {
          // Keep the original entry and avoid noisy console errors.
        }
      }),
    );
  };

  useEffect(() => {
    void enrichPendingPersonalVocabulary();
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
        learnedOn: override.learnedOn,
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
              learnedOn: override.learnedOn,
            }
          : baseWord;

        if (!word) return null;
        return {
          entryId: entry.id,
          word,
          source: entry.source,
        };
      })
      .filter(Boolean) as Array<{
      entryId: string;
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
    enrichment,
  }: {
    wordId?: string;
    customWord?: VocabularyWord;
    source: { label: string; detail: string; dateAdded: string };
    enrichment?: PersonalVocabularyEnrichment;
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
          enrichment,
        },
        ...current,
      ];
    });
  };

  const addPersonalVocabularyFromReading = (rawWord: string) => {
    const enrichedWord = enrichVocabularyWord({
      rawWord,
      existingWords: words,
    });

    if (!enrichedWord.word) {
      return null;
    }

    const enrichment = getEnrichmentStatus({
      word: enrichedWord,
      matchedFromExisting: enrichedWord.chapter > 0,
    });

    addPersonalVocabularyWord({
      ...(enrichedWord.chapter > 0 ? { wordId: enrichedWord.id } : { customWord: enrichedWord }),
      source: {
        label: 'AI Reading',
        detail: "Today's Reading",
        dateAdded: new Date().toISOString().slice(0, 10),
      },
      enrichment: {
        ...enrichment,
        updatedAt: new Date().toISOString(),
      },
    });

    return enrichedWord;
  };

  const removePersonalVocabularyEntries = (ids: string[]) => {
    setPersonalEntries((current) => removePersonalVocabularyByIds(current, ids));
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
      const learnedOn = baseWord.learnedOn ?? (action === 'known' && !baseWord.memory.some(Boolean) ? todayKey() : undefined);

      return {
        ...current,
        [wordId]: {
          memory: nextMemory,
          spelling: nextSpelling,
          memoryMarks: getNextMemoryMarks(baseWord.memoryMarks ?? createEmptyMemoryMarks(), action),
          memoryHistory: baseWord.memoryHistory ?? [],
          lastReviewAction: action,
          learnedOn,
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
      const learnedOn = baseWord.learnedOn ?? (mark === 'check' ? todayKey() : undefined);

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
          learnedOn,
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
        learnedOn: baseWord.learnedOn,
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
      addPersonalVocabularyFromReading,
      removePersonalVocabularyEntries,
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

function migratePersonalVocabularyEntries(entries: PersonalVocabularyEntry[]) {
  return entries.map((entry) => {
    if (entry.wordId) {
      return {
        ...entry,
        enrichment:
          entry.enrichment ??
          ({
            status: 'complete',
            source: 'main-vocabulary',
            updatedAt: entry.source.dateAdded,
          } satisfies PersonalVocabularyEnrichment),
      };
    }

    if (!entry.customWord) {
      return entry;
    }

    const customWord = {
      ...entry.customWord,
      phonetic: entry.customWord.phonetic ?? '',
      audio: entry.customWord.audio ?? '',
      part_of_speech: entry.customWord.part_of_speech || 'Unknown',
      meaning: entry.customWord.meaning || 'Pending enrichment',
      example: entry.customWord.example || 'Captured from AI Reading.',
      word_family: entry.customWord.word_family ?? [],
      collocations: entry.customWord.collocations ?? [],
      memory: entry.customWord.memory ?? [...initialMemoryBoxes],
      spelling: entry.customWord.spelling ?? { ...initialSpellingStats },
      memoryMarks: entry.customWord.memoryMarks ?? [...initialMemoryMarks],
      memoryHistory: entry.customWord.memoryHistory ?? [],
      learnedOn: entry.customWord.learnedOn,
    };

    return {
      ...entry,
      customWord,
      enrichment: entry.enrichment ?? {
        ...getEnrichmentStatus({ word: customWord }),
        updatedAt: entry.source.dateAdded,
      },
    };
  });
}

function repairPersonalVocabulary(entries: PersonalVocabularyEntry[]) {
  return entries.map((entry) => {
    if (!entry.customWord) {
      return entry;
    }

    const needsRepair =
      entry.customWord.meaning === '' ||
      entry.customWord.phonetic === '' ||
      entry.customWord.part_of_speech === '';

    if (!needsRepair) {
      return entry;
    }

    const repairedWord = {
      ...entry.customWord,
      meaning: entry.customWord.meaning || 'Pending enrichment',
      phonetic: entry.customWord.phonetic || '',
      part_of_speech: entry.customWord.part_of_speech || 'Unknown',
      example: entry.customWord.example || 'Captured from AI Reading.',
      word_family: entry.customWord.word_family ?? [],
      collocations: entry.customWord.collocations ?? [],
      memory: entry.customWord.memory ?? [...initialMemoryBoxes],
      spelling: entry.customWord.spelling ?? { ...initialSpellingStats },
      memoryMarks: entry.customWord.memoryMarks ?? [...initialMemoryMarks],
      memoryHistory: entry.customWord.memoryHistory ?? [],
      learnedOn: entry.customWord.learnedOn,
    };

    return {
      ...entry,
      customWord: repairedWord,
      enrichment: {
        ...getEnrichmentStatus({ word: repairedWord }),
        updatedAt: entry.enrichment?.updatedAt ?? entry.source.dateAdded,
      },
    };
  });
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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeWord(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function loadInitialPersonalEntries(): PersonalVocabularyEntry[] {
  if (typeof window === 'undefined') {
    return personalVocabularyDatabase;
  }

  const saved = window.localStorage.getItem(PERSONAL_VOCABULARY_STORAGE_KEY);
  if (!saved) {
    return shouldUseDemoPersonalVocabulary() ? demoPersonalVocabularyDatabase : personalVocabularyDatabase;
  }

  try {
    const parsed = JSON.parse(saved) as typeof personalVocabularyDatabase;
    return repairPersonalVocabulary(migratePersonalVocabularyEntries(parsed));
  } catch {
    return personalVocabularyDatabase;
  }
}

function loadInitialPersistedState(): Record<string, PersistedWordState> {
  if (typeof window === 'undefined') {
    return {};
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved) as Record<string, PersistedWordState>;
  } catch {
    return {};
  }
}
