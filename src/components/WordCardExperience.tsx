import { useEffect, useMemo, useRef, useState } from 'react';
import { type VocabularyWord, type WordAction } from '../data/vocabulary';

type WordCardExperienceProps = {
  words: VocabularyWord[];
  scopeLabel: string;
  persistKey?: string;
  exitLabel?: string;
  onExit: () => void;
  onUpdateWordReview: (wordId: string, action: 'known' | 'unsure' | 'unknown') => void;
};

export function WordCardExperience({
  words,
  scopeLabel,
  persistKey,
  exitLabel = 'Exit',
  onExit,
  onUpdateWordReview,
}: WordCardExperienceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [meaningVisible, setMeaningVisible] = useState(false);
  const [fontSize, setFontSize] = useState(64);
  const [wordFamilyExpanded, setWordFamilyExpanded] = useState(false);
  const [pendingReviewAction, setPendingReviewAction] = useState<WordAction | null>(null);
  const hasRestoredRef = useRef(false);
  const reviewTimeoutRef = useRef<number | null>(null);

  const currentWord = words[currentIndex];
  const wordFamilyEntries = useMemo(() => normalizeWordFamily(currentWord?.word_family ?? []), [currentWord?.word_family]);
  const storageKey = persistKey ? `ivy-word-card-last-word:${persistKey}` : null;
  const reviewCounts = useMemo(
    () => ({
      known: currentWord?.spelling.correct ?? 0,
      unsure: Math.max(0, (currentWord?.spelling.attempts ?? 0) - (currentWord?.spelling.correct ?? 0) - (currentWord?.spelling.errors ?? 0)),
      unknown: currentWord?.spelling.errors ?? 0,
    }),
    [currentWord],
  );

  useEffect(() => {
    setMeaningVisible(false);
    setWordFamilyExpanded(false);
    setPendingReviewAction(null);
  }, [currentWord?.id]);

  useEffect(() => {
    return () => {
      if (reviewTimeoutRef.current !== null) {
        window.clearTimeout(reviewTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (words.length === 0) return;
    if (!storageKey) {
      hasRestoredRef.current = true;
      return;
    }
    if (hasRestoredRef.current) return;

    const savedWordId = window.localStorage.getItem(storageKey);
    if (!savedWordId) {
      setCurrentIndex(0);
      hasRestoredRef.current = true;
      return;
    }

    const savedIndex = words.findIndex((word) => word.id === savedWordId);
    setCurrentIndex(savedIndex >= 0 ? savedIndex : 0);
    hasRestoredRef.current = true;
  }, [storageKey, words]);

  useEffect(() => {
    if (!storageKey || !currentWord) return;
    window.localStorage.setItem(storageKey, currentWord.id);
  }, [currentWord, storageKey]);

  if (!currentWord) {
    return (
      <section className="flex h-full items-center justify-center">
        <div className="border border-line/80 bg-white/70 px-8 py-10 text-center shadow-card">
          <p className="text-sm uppercase tracking-[0.3em] text-taupe">Word Card</p>
          <p className="mt-4 font-display text-3xl text-ink">No words found.</p>
        </div>
      </section>
    );
  }

  const handleReview = (action: WordAction) => {
    if (pendingReviewAction) return;

    onUpdateWordReview(currentWord.id, action);
    setPendingReviewAction(action);

    if (reviewTimeoutRef.current !== null) {
      window.clearTimeout(reviewTimeoutRef.current);
    }

    reviewTimeoutRef.current = window.setTimeout(() => {
      setPendingReviewAction(null);
      setCurrentIndex((index) => (index >= words.length - 1 ? 0 : index + 1));
      reviewTimeoutRef.current = null;
    }, 500);
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handlePreviousWord = () => {
    setCurrentIndex((index) => (index <= 0 ? words.length - 1 : index - 1));
  };

  const handleNextWord = () => {
    setCurrentIndex((index) => (index >= words.length - 1 ? 0 : index + 1));
  };

  return (
    <section className="flex h-full flex-col border border-line/70 bg-white/58 p-8 shadow-card lg:p-10">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.35em] text-taupe/90">Word Card Mode</p>
          <p className="text-sm text-taupe">
            {scopeLabel} / {currentIndex + 1} / {words.length}
          </p>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.22em] text-taupe">
            <button type="button" onClick={handlePreviousWord} className="transition-colors hover:text-ink">
              ← Prev
            </button>
            <button type="button" onClick={handleNextWord} className="transition-colors hover:text-ink">
              Next →
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFontSize((size) => Math.max(44, size - 4))}
            className="border border-line px-3 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setFontSize((size) => Math.min(96, size + 4))}
            className="border border-line px-3 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
          >
            A+
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <h1 className="font-display leading-none tracking-tight text-ink" style={{ fontSize: `${fontSize}px` }}>
            {currentWord.word}
          </h1>

          <button
            type="button"
            onClick={handleSpeak}
            className="mt-8 inline-flex items-center gap-3 border border-line bg-white/70 px-5 py-3 text-xl text-taupe transition-colors hover:border-taupe hover:text-ink"
          >
            <span>{currentWord.phonetic || '/—/'}</span>
            <span aria-hidden="true">🔊</span>
          </button>

          <p className="mt-8 text-base uppercase tracking-[0.28em] text-taupe">
            {currentWord.part_of_speech || 'Part of Speech'}
          </p>

          <button
            type="button"
            onClick={() => setMeaningVisible(true)}
            className="mt-12 min-w-[280px] border border-line bg-sand/35 px-6 py-5 text-lg text-ink transition-colors hover:border-taupe"
          >
            {meaningVisible ? currentWord.meaning || 'Meaning unavailable' : 'Click to reveal meaning'}
          </button>

          <p className="mt-10 max-w-3xl text-lg leading-9 text-taupe">
            {currentWord.example || `Example: ${currentWord.word} appears in this review set.`}
          </p>

          <div className="mt-10 w-full max-w-3xl border border-line/80 bg-white/72 text-left shadow-card">
            <button
              type="button"
              onClick={() => setWordFamilyExpanded((value) => !value)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-sand/30"
            >
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.34em] text-taupe/90">Word Family</p>
                <p className="text-sm leading-7 text-taupe">
                  {wordFamilyEntries.length > 0
                    ? `${wordFamilyEntries.length} related form${wordFamilyEntries.length > 1 ? 's' : ''}`
                    : 'No word family data yet'}
                </p>
              </div>
              <span className="text-sm uppercase tracking-[0.2em] text-taupe">
                {wordFamilyExpanded ? 'Hide' : 'Show'}
              </span>
            </button>

            {wordFamilyExpanded ? (
              <div className="max-h-[180px] overflow-y-auto border-t border-line/70 px-6 py-5">
                {wordFamilyEntries.length > 0 ? (
                  <div className="space-y-5">
                    {wordFamilyEntries.map((entry, index) => (
                      <div key={`${entry.word}-${entry.partOfSpeech}-${index}`} className="space-y-1">
                        <p className="font-display text-2xl leading-none text-ink">{entry.word}</p>
                        <p className="text-sm leading-6 text-taupe">
                          {entry.partOfSpeech ? `(${entry.partOfSpeech})` : '(related form)'}
                        </p>
                        <p className="text-base leading-7 text-taupe">{entry.meaning || 'Meaning unavailable'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-taupe">No word family data available for this word.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-8">
        <div className="flex gap-4">
          <ReviewButton
            label="Known"
            count={reviewCounts.known}
            isActive={pendingReviewAction === 'known'}
            disabled={pendingReviewAction !== null}
            onClick={() => handleReview('known')}
          />
          <ReviewButton
            label="Unsure"
            count={reviewCounts.unsure}
            isActive={pendingReviewAction === 'unsure'}
            disabled={pendingReviewAction !== null}
            onClick={() => handleReview('unsure')}
          />
          <ReviewButton
            label="Unknown"
            count={reviewCounts.unknown}
            isActive={pendingReviewAction === 'unknown'}
            disabled={pendingReviewAction !== null}
            onClick={() => handleReview('unknown')}
          />
        </div>

        <button
          type="button"
          onClick={onExit}
          className="self-end border border-line bg-white/70 px-5 py-3 text-sm uppercase tracking-[0.26em] text-taupe transition-colors hover:border-taupe hover:text-ink"
        >
          {exitLabel}
        </button>
      </div>
    </section>
  );
}

type WordFamilyEntry = {
  word: string;
  partOfSpeech: string;
  meaning: string;
};

function normalizeWordFamily(items: string[]): WordFamilyEntry[] {
  return items
    .map((item) => parseWordFamilyItem(item))
    .filter((entry): entry is WordFamilyEntry => entry !== null);
}

function parseWordFamilyItem(item: string): WordFamilyEntry | null {
  const value = item.trim();
  if (!value) return null;

  const pipeParts = value.split('|').map((part) => part.trim());
  if (pipeParts.length >= 3) {
    return {
      word: pipeParts[0],
      partOfSpeech: pipeParts[1],
      meaning: pipeParts.slice(2).join(' | '),
    };
  }

  const bracketMatch = value.match(/^(.+?)\s*\(([^)]+)\)\s*(.+)?$/);
  if (bracketMatch) {
    return {
      word: bracketMatch[1].trim(),
      partOfSpeech: bracketMatch[2].trim(),
      meaning: bracketMatch[3]?.trim() ?? '',
    };
  }

  const commaParts = value.split(/[:：\-]\s*/).map((part) => part.trim());
  if (commaParts.length >= 2) {
    return {
      word: commaParts[0],
      partOfSpeech: '',
      meaning: commaParts.slice(1).join(' - '),
    };
  }

  return {
    word: value,
    partOfSpeech: '',
    meaning: '',
  };
}

function ReviewButton({
  label,
  count,
  isActive,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'relative border px-8 py-3 text-sm uppercase tracking-[0.26em] transition-colors disabled:cursor-default',
        isActive
          ? 'border-ink bg-ink text-sand'
          : 'border-line bg-white/72 text-taupe hover:border-taupe hover:text-ink',
      ].join(' ')}
    >
      <span>{label}</span>
      {count > 0 ? (
        <span
          className={[
            'absolute right-2 top-2 text-[10px] leading-none',
            isActive ? 'text-sand/80' : 'text-taupe/80',
          ].join(' ')}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
