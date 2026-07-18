import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useVocabulary } from '../context/VocabularyContext';
import { buildReadingSegmentsFromArticle, type ReadingSegment } from '../data/aiReadingGeneration';
import { type VocabularyWord } from '../data/vocabulary';
import { parseSelectedReadingWordIds, resolveSelectedReadingWords } from '../services/aiReadingSelection';
import { generateReadingArticle, type GenerateReadingArticleResult } from '../services/aiReadingService';
import { speakWord } from '../utils/speech';

const MIN_LEARNED_WORD_COUNT = 4;
const MAX_LEARNED_WORD_COUNT = 12;

export function AiReadingPage() {
  const location = useLocation();
  const { words, getPersonalVocabularyWords, addPersonalVocabularyFromReading } = useVocabulary();
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [lastAddedWordId, setLastAddedWordId] = useState<string | null>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [articleVariant, setArticleVariant] = useState(0);
  const [readingFontSize, setReadingFontSize] = useState(18);
  const [readingCardCollapsed, setReadingCardCollapsed] = useState(true);
  const [wordInsightHeight, setWordInsightHeight] = useState(190);
  const [translationVisible, setTranslationVisible] = useState(false);
  const [desiredLearnedWordCount, setDesiredLearnedWordCount] = useState(8);
  const [readingResult, setReadingResult] = useState<GenerateReadingArticleResult | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [readingError, setReadingError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const todayKey = new Date().toISOString().slice(0, 10);
  const selectedReadingWordIds = useMemo(() => parseSelectedReadingWordIds(location.search), [location.search]);
  const personalVocabularyWords = useMemo(
    () => getPersonalVocabularyWords().map((item) => item.word),
    [getPersonalVocabularyWords],
  );
  const selectedReadingWords = useMemo(
    () =>
      resolveSelectedReadingWords({
        selectedWordIds: selectedReadingWordIds,
        vocabularyWords: words,
        personalVocabularyWords,
      }),
    [personalVocabularyWords, selectedReadingWordIds, words],
  );
  const isUserSelectedWordMode = selectedReadingWords.length > 0;

  const todayLearnedWordPool = useMemo(
    () => words.filter((word) => word.learnedOn === todayKey && isSingleWord(word.word)),
    [todayKey, words],
  );

  const fallbackLearnedWordPool = useMemo(
    () => words.filter((word) => word.memory.some(Boolean) && isSingleWord(word.word)),
    [words],
  );

  const activeLearnedWordPool = isUserSelectedWordMode
    ? selectedReadingWords
    : todayLearnedWordPool.length > 0
      ? todayLearnedWordPool
      : fallbackLearnedWordPool;
  const actualLearnedWordCount = isUserSelectedWordMode
    ? selectedReadingWords.length
    : Math.max(1, Math.min(desiredLearnedWordCount, Math.max(activeLearnedWordPool.length, 1)));

  const learnedWords = useMemo(() => {
    if (selectedReadingWords.length > 0) {
      return selectedReadingWords;
    }

    if (activeLearnedWordPool.length === 0) {
      return fillWords([], actualLearnedWordCount);
    }

    const offsetStep = Math.max(1, Math.floor(activeLearnedWordPool.length / 2));
    const start = (setIndex * offsetStep) % activeLearnedWordPool.length;
    const rotated = [...activeLearnedWordPool.slice(start), ...activeLearnedWordPool.slice(0, start)];
    return rotated.slice(0, actualLearnedWordCount);
  }, [activeLearnedWordPool, actualLearnedWordCount, selectedReadingWords, setIndex]);

  const unknownWordPool = useMemo(() => {
    return words
      .filter((word) => !word.memory.some(Boolean) && isSingleWord(word.word))
      .filter((word) => !learnedWords.some((item) => item.id === word.id));
  }, [learnedWords, words]);

  const unknownWords = useMemo(() => {
    const targetCount = Math.max(3, Math.min(6, Math.ceil(actualLearnedWordCount / 2)));
    if (unknownWordPool.length === 0) {
      return fillWords([], targetCount);
    }

    const start = (articleVariant * targetCount) % unknownWordPool.length;
    const doubled = [...unknownWordPool, ...unknownWordPool];
    return doubled.slice(start, start + targetCount);
  }, [actualLearnedWordCount, articleVariant, unknownWordPool]);

  const difficultyLabel = useMemo(() => {
    if (actualLearnedWordCount >= 10) return 'B1';
    if (actualLearnedWordCount >= 6) return 'A2-B1';
    return 'A2';
  }, [actualLearnedWordCount]);

  useEffect(() => {
    let cancelled = false;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsGeneratingArticle(true);
    setReadingError(null);

    void generateReadingArticle({
      words: learnedWords,
      difficulty: difficultyLabel,
      unknownRatio: 8,
      length: 120,
      variant: articleVariant,
    })
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setReadingResult(result);
      })
      .catch(() => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setReadingError('Reading generation is temporarily unavailable.');
      })
      .finally(() => {
        if (cancelled || requestId !== requestIdRef.current) return;
        setIsGeneratingArticle(false);
      });

    return () => {
      cancelled = true;
    };
  }, [articleVariant, difficultyLabel, learnedWords]);

  const readingParagraphs = useMemo(
    () =>
      buildReadingSegmentsFromArticle({
        article: readingResult?.article ?? '',
        learnedWords,
        unknownWords,
      }),
    [learnedWords, readingResult?.article, unknownWords],
  );

  const flatReadingSegments = useMemo(() => readingParagraphs.flat(), [readingParagraphs]);
  const approximateWordCount = useMemo(
    () => flatReadingSegments.filter((segment) => /[A-Za-z]/.test(segment.text)).length,
    [flatReadingSegments],
  );

  const unknownRatio = readingResult?.validation.unknownRatio ?? 0;

  const handleSpeak = (word: string) => {
    speakWord(word);
  };

  const handleAddUnknownWord = (word: VocabularyWord) => {
    addPersonalVocabularyFromReading(word.word);
    setLastAddedWordId(word.id);
    setSelectedWord(word);
  };

  const handleAddSelectedReadingWord = (rawWord: string) => {
    const enrichedWord = addPersonalVocabularyFromReading(rawWord);
    if (!enrichedWord) return;

    setLastAddedWordId(enrichedWord.id);
    setSelectedWord(enrichedWord);
  };

  const handleArticleDoubleClick = (event: React.MouseEvent<HTMLElement>) => {
    const selection = window.getSelection()?.toString() ?? '';
    if (selection.trim()) {
      handleAddSelectedReadingWord(selection);
      window.getSelection()?.removeAllRanges();
      return;
    }

    const rawWord = event.currentTarget.dataset.readingWord;
    if (rawWord) {
      handleAddSelectedReadingWord(rawWord);
    }
  };

  const handleNextSet = () => {
    setSetIndex((value) => value + 1);
    setArticleVariant((value) => value + 1);
    setSelectedWord(null);
    setLastAddedWordId(null);
  };

  const handleGenerateArticle = () => {
    setArticleVariant((value) => value + 1);
    setSelectedWord(null);
    setLastAddedWordId(null);
  };

  const handleWordInsightResizeStart = (startEvent: React.MouseEvent<HTMLButtonElement>) => {
    const startY = startEvent.clientY;
    const startHeight = wordInsightHeight;

    const onMouseMove = (event: MouseEvent) => {
      const delta = startY - event.clientY;
      const nextHeight = Math.min(Math.max(startHeight + delta, 110), 360);
      setWordInsightHeight(nextHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleDecreaseLearnedWordCount = () => {
    setDesiredLearnedWordCount((count) => Math.max(MIN_LEARNED_WORD_COUNT, count - 1));
    setSetIndex(0);
  };

  const handleIncreaseLearnedWordCount = () => {
    setDesiredLearnedWordCount((count) => Math.min(MAX_LEARNED_WORD_COUNT, count + 1));
    setSetIndex(0);
  };

  return (
    <section className="flex h-full flex-col gap-8">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-8">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.38em] text-taupe/90">AI Reading</p>
          <h2 className="font-display text-5xl leading-none tracking-tight text-ink">AI Reading</h2>
        </div>

        <div className="space-y-4 text-right">
          <Stat label="Selected Words" value={String(actualLearnedWordCount)} />
          <Stat label="Unknown Ratio" value={`${unknownRatio}%`} />
          <Stat label="Difficulty" value={difficultyLabel} />
        </div>
      </header>

      {isUserSelectedWordMode ? (
        <div className="flex items-center justify-between gap-4 border border-line/70 bg-white/60 px-5 py-4 text-sm text-taupe shadow-card">
          <p>Using {selectedReadingWords.length} user-selected words for this reading.</p>
          <p className="uppercase tracking-[0.22em] text-taupe/80">Refresh keeps this selection through the URL.</p>
        </div>
      ) : null}

      {readingCardCollapsed ? (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setReadingCardCollapsed(false)}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line/80 bg-white/72 text-[11px] uppercase tracking-[0.22em] text-taupe shadow-card transition-colors hover:border-taupe hover:text-ink"
          >
            Card
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <LearnedWordCountControl
              actualCount={actualLearnedWordCount}
              availableCount={activeLearnedWordPool.length}
              onDecrease={handleDecreaseLearnedWordCount}
              onIncrease={handleIncreaseLearnedWordCount}
              disabled={isUserSelectedWordMode}
            />
            <button
              type="button"
              onClick={handleNextSet}
              disabled={isUserSelectedWordMode}
              className="border border-ink px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-sand"
            >
              {isUserSelectedWordMode ? 'Selected Word Set' : 'Next Word Set'}
            </button>
            <button
              type="button"
              onClick={handleGenerateArticle}
              className="border border-line bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink"
            >
              Generate New Article
            </button>
            <button
              type="button"
              onClick={() => setTranslationVisible((value) => !value)}
              className="border border-line bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink"
            >
              {translationVisible ? 'Hide Translation' : 'Show Translation'}
            </button>
            <button
              type="button"
              onClick={() => setReadingFontSize((size) => Math.max(16, size - 1))}
              className="border border-line px-3 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setReadingFontSize((size) => Math.min(24, size + 1))}
              className="border border-line px-3 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
            >
              A+
            </button>
          </div>
        </div>
      ) : (
        <section className="w-full border border-line/80 bg-white/62 p-5 shadow-card">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-[560px] space-y-3">
              <p className="text-[11px] uppercase tracking-[0.34em] text-taupe/90">Today&apos;s Reading Card</p>
              <h3 className="font-display text-[2.2rem] leading-tight text-ink">
                {readingResult?.title ?? 'A short article built from your learned vocabulary'}
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-taupe">
                Around {approximateWordCount} words. Single click any word to inspect it. Double click an unknown word
                to add it to My Vocabulary Bank.
              </p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-taupe/90">
                Topic: {readingResult?.topic ?? 'Preparing article'}
              </p>
            </div>
            <div className="max-w-[320px] text-right text-sm text-taupe">
              {todayLearnedWordPool.length > 0
                ? `${todayLearnedWordPool.length} words were learned on ${todayKey}, and this article rotates through them.`
                : 'No new words were marked learned today yet, so the card is using your broader learned vocabulary as fallback.'}
              <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-taupe/90">
                Mode: {readingResult?.mode ?? 'loading'}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <LearnedWordCountControl
              actualCount={actualLearnedWordCount}
              availableCount={activeLearnedWordPool.length}
              onDecrease={handleDecreaseLearnedWordCount}
              onIncrease={handleIncreaseLearnedWordCount}
            />
            <p className="text-sm text-taupe">
              {todayLearnedWordPool.length > 0 ? 'Source: Today learned words' : 'Source: Learned-word fallback'}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {learnedWords.map((word) => (
              <span
                key={word.id}
                className="border border-line bg-sand/45 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-taupe"
              >
                {word.word}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleNextSet}
              className="border border-ink px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-sand"
            >
              Next Word Set
            </button>
            <button
              type="button"
              onClick={handleGenerateArticle}
              className="border border-line bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink"
            >
              Generate New Article
            </button>
            <button
              type="button"
              onClick={() => setTranslationVisible((value) => !value)}
              className="border border-line bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink"
            >
              {translationVisible ? 'Hide Translation' : 'Show Translation'}
            </button>
            <button
              type="button"
              onClick={() => setReadingCardCollapsed(true)}
              className="border border-line bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-taupe transition-colors hover:border-taupe hover:text-ink"
            >
              Collapse Card
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReadingFontSize((size) => Math.max(16, size - 1))}
                className="border border-line px-3 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setReadingFontSize((size) => Math.min(24, size + 1))}
                className="border border-line px-3 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
              >
                A+
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-hidden">
        <article
          className="min-h-0 flex-1 overflow-y-auto border border-line/80 bg-white/72 p-8 shadow-card"
          onDoubleClick={handleArticleDoubleClick}
        >
          <div className="mx-auto max-w-4xl pr-2">
            <div
              className="space-y-6 select-text text-ink"
              style={{
                fontSize: `${readingFontSize}px`,
                lineHeight: readingFontSize >= 20 ? '2.15rem' : '2rem',
              }}
            >
              {isGeneratingArticle && !readingResult ? <p className="text-base text-taupe">Generating a new reading...</p> : null}
              {readingError ? <p className="text-base text-taupe">{readingError}</p> : null}
              {readingParagraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>
                  {paragraph.map((segment, segmentIndex) =>
                    segment.word ? (
                      <button
                        key={`${segment.word.id}-${segmentIndex}`}
                        type="button"
                        onClick={() => setSelectedWord(segment.word ?? null)}
                        onDoubleClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (segment.word) {
                            handleAddUnknownWord(segment.word);
                          }
                        }}
                        className={[
                          'inline select-none transition-colors',
                          segment.isTodayLearned ? 'font-semibold text-ink' : '',
                          segment.isUnknown
                            ? 'border-b border-dashed border-taupe/70 text-ink hover:text-taupe'
                            : 'hover:text-taupe',
                        ].join(' ')}
                      >
                        {segment.text}
                      </button>
                    ) : (
                      <span key={`${segment.text}-${segmentIndex}`}>
                        {renderPlainTextSegment(segment.text, handleArticleDoubleClick)}
                      </span>
                    ),
                  )}
                </p>
              ))}
            </div>

            {translationVisible ? (
              <div className="mt-10 border-t border-line/70 pt-8">
                <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">Translation</p>
                <div className="mt-5 space-y-5 text-base leading-9 text-taupe">
                  {(readingResult?.translation.split(/\n\s*\n/).filter(Boolean) ?? []).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </article>

        <aside
          className="relative shrink-0 border border-line/80 bg-white/70 p-5 shadow-card"
          style={{ height: `${wordInsightHeight}px`, minHeight: `${wordInsightHeight}px` }}
        >
          <button
            type="button"
            aria-label="Resize Word Insight"
            onMouseDown={handleWordInsightResizeStart}
            className="absolute left-0 top-0 h-4 w-full -translate-y-1/2 cursor-row-resize bg-transparent"
          >
            <span className="absolute left-1/2 top-1/2 h-px w-20 -translate-x-1/2 -translate-y-1/2 bg-line" />
          </button>
          <p className="text-[11px] uppercase tracking-[0.34em] text-taupe/90">Word Insight</p>
          {selectedWord ? (
            <div className="mt-5 space-y-4">
              <h3 className="font-display text-[2.35rem] leading-none text-ink">{selectedWord.word}</h3>

              <div className="flex flex-wrap items-center gap-3 text-sm leading-6 text-taupe">
                <button
                  type="button"
                  onClick={() => handleSpeak(selectedWord.word)}
                  className="inline-flex items-center gap-2 border border-line bg-sand/35 px-3 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
                >
                  <span>{selectedWord.phonetic || '/—/'}</span>
                  <span aria-hidden="true">🔊</span>
                </button>
                <span className="uppercase tracking-[0.2em]">{selectedWord.part_of_speech || 'Word'}</span>
                <span>{selectedWord.meaning || 'Meaning unavailable'}</span>
              </div>

              <p className="text-sm leading-7 text-taupe">
                {lastAddedWordId === selectedWord.id
                  ? 'Added to My Vocabulary Bank from AI Reading.'
                  : 'Double click an unknown word in the article to save it into My Vocabulary Bank.'}
              </p>
            </div>
          ) : (
            <div className="mt-5 text-sm leading-7 text-taupe">
              Click any word in the article to inspect its pronunciation and meaning.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-end gap-3">
      <p className="text-[11px] uppercase leading-none tracking-[0.3em] text-taupe/90">{label}</p>
      <p className="text-[11px] uppercase leading-none tracking-[0.3em] text-taupe/90">{value}</p>
    </div>
  );
}

function LearnedWordCountControl({
  actualCount,
  availableCount,
  onDecrease,
  onIncrease,
  disabled = false,
}: {
  actualCount: number;
  availableCount: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border border-line bg-white/72 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">Today Learned Words</p>
      <button
        type="button"
        onClick={onDecrease}
        disabled={disabled}
        className="h-7 w-7 border border-line text-sm text-taupe transition-colors hover:border-taupe hover:text-ink disabled:cursor-default disabled:border-line disabled:text-taupe/50"
      >
        −
      </button>
      <span className="min-w-[3.25rem] text-center text-sm text-ink">{actualCount}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        className="h-7 w-7 border border-line text-sm text-taupe transition-colors hover:border-taupe hover:text-ink disabled:cursor-default disabled:border-line disabled:text-taupe/50"
      >
        +
      </button>
      <span className="text-xs text-taupe">available {availableCount}</span>
    </div>
  );
}

function isSingleWord(value: string) {
  return !value.includes(' ');
}

function renderPlainTextSegment(
  text: string,
  onDoubleClick: (event: React.MouseEvent<HTMLElement>) => void,
) {
  return text.split(/([A-Za-z'-]+)/).map((token, index) => {
    if (!token) return null;

    if (!/[A-Za-z]/.test(token)) {
      return <span key={`${token}-${index}`}>{token}</span>;
    }

    return (
      <span
        key={`${token}-${index}`}
        data-reading-word={token}
        onDoubleClick={onDoubleClick}
        className="inline cursor-pointer transition-colors hover:text-taupe"
      >
        {token}
      </span>
    );
  });
}

function fillWords(words: VocabularyWord[], count: number) {
  if (words.length >= count) {
    return words.slice(0, count);
  }

  const fallback = [...words];
  while (fallback.length < count) {
    fallback.push(words[fallback.length % Math.max(words.length, 1)] ?? createFallbackWord(fallback.length));
  }

  return fallback;
}

function createFallbackWord(index: number): VocabularyWord {
  return {
    id: `fallback-${index}`,
    chapter: 0,
    word: 'study',
    phonetic: '/ˈstʌdi/',
    audio: '',
    part_of_speech: 'n.',
    meaning: '学习；研究',
    example: '',
    word_family: [],
    collocations: [],
    memory: [false, false, false, false, false, false, false],
    spelling: { attempts: 0, correct: 0, errors: 0 },
    memoryMarks: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
    memoryHistory: [],
  };
}
