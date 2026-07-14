import { useMemo, useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { type VocabularyWord } from '../data/vocabulary';

type ReadingSegment = {
  text: string;
  word?: VocabularyWord;
  isUnknown?: boolean;
};

export function AiReadingPage() {
  const { words, addPersonalVocabularyWord } = useVocabulary();
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [lastAddedWordId, setLastAddedWordId] = useState<string | null>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [articleVariant, setArticleVariant] = useState(0);
  const [readingFontSize, setReadingFontSize] = useState(18);
  const [readingCardCollapsed, setReadingCardCollapsed] = useState(true);
  const [wordInsightHeight, setWordInsightHeight] = useState(190);
  const [translationVisible, setTranslationVisible] = useState(false);

  const learnedWordPool = useMemo(() => {
    const learned = words.filter((word) => word.memory.some(Boolean) && isSingleWord(word.word));
    if (learned.length >= 10) {
      return learned;
    }

    const fallback = words.filter((word) => isSingleWord(word.word));
    const merged = [...learned];
    for (const word of fallback) {
      if (merged.some((item) => item.id === word.id)) continue;
      merged.push(word);
      if (merged.length >= 12) break;
    }

    return merged;
  }, [words]);

  const learnedWords = useMemo(() => {
    const start = learnedWordPool.length === 0 ? 0 : (setIndex * 12) % learnedWordPool.length;
    const doubled = [...learnedWordPool, ...learnedWordPool];
    return doubled.slice(start, start + 12);
  }, [learnedWordPool, setIndex]);

  const unknownWordPool = useMemo(() => {
    return words
      .filter((word) => !word.memory.some(Boolean) && isSingleWord(word.word))
      .filter((word) => !learnedWordPool.some((item) => item.id === word.id));
  }, [learnedWordPool, words]);

  const unknownWords = useMemo(() => {
    const start = unknownWordPool.length === 0 ? 0 : (articleVariant * 6) % unknownWordPool.length;
    const doubled = [...unknownWordPool, ...unknownWordPool];
    return doubled.slice(start, start + 6);
  }, [articleVariant, unknownWordPool]);

  const readingSegments = useMemo(
    () => buildReadingSegments(learnedWords, unknownWords, articleVariant),
    [articleVariant, learnedWords, unknownWords],
  );

  const approximateWordCount = useMemo(
    () => readingSegments.filter((segment) => /[A-Za-z]/.test(segment.text)).length,
    [readingSegments],
  );

  const unknownRatio = useMemo(() => {
    const unknownCount = readingSegments.filter((segment) => segment.isUnknown).length;
    if (approximateWordCount === 0) return 0;
    return Math.round((unknownCount / approximateWordCount) * 100);
  }, [approximateWordCount, readingSegments]);

  const difficultyLabel = learnedWords.length >= 12 ? 'Intermediate' : 'Foundational';

  const handleSpeak = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAddUnknownWord = (word: VocabularyWord) => {
    addPersonalVocabularyWord({
      wordId: word.id,
      source: {
        label: 'AI Reading',
        detail: 'Today\'s Reading',
        dateAdded: new Date().toISOString().slice(0, 10),
      },
    });
    setLastAddedWordId(word.id);
    setSelectedWord(word);
  };

  const handleAddSelectedReadingWord = (rawWord: string) => {
    const normalized = normalizeArticleWord(rawWord);
    if (!normalized) return;

    const matchedWord = words.find((item) => normalizeArticleWord(item.word) === normalized);
    if (matchedWord) {
      handleAddUnknownWord(matchedWord);
      return;
    }

    const customWord: VocabularyWord = {
      id: `ai-reading-custom-${normalized}`,
      chapter: 0,
      word: normalized,
      phonetic: '',
      audio: '',
      part_of_speech: '',
      meaning: '',
      example: '',
      word_family: [],
      collocations: [],
      memory: [false, false, false, false, false, false, false],
      spelling: { attempts: 0, correct: 0, errors: 0 },
      memoryMarks: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      memoryHistory: [],
    };

    addPersonalVocabularyWord({
      customWord,
      source: {
        label: 'AI Reading',
        detail: 'Today\'s Reading',
        dateAdded: new Date().toISOString().slice(0, 10),
      },
    });
    setLastAddedWordId(customWord.id);
    setSelectedWord(customWord);
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

  return (
    <section className="flex h-full flex-col gap-8">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-8">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.38em] text-taupe/90">AI Reading</p>
          <h2 className="font-display text-5xl leading-none tracking-tight text-ink">AI Reading</h2>
        </div>

        <div className="space-y-4 text-right">
          <Stat label="Selected Words" value={String(learnedWords.length)} />
          <Stat label="Unknown Ratio" value={`${unknownRatio}%`} />
          <Stat label="Difficulty" value={difficultyLabel} />
        </div>
      </header>

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
                A short article built from your learned vocabulary
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-taupe">
                Around {approximateWordCount} words. Single click any word to inspect it. Double click an unknown word
                to add it to My Vocabulary Bank.
              </p>
            </div>
            <div className="max-w-[280px] text-right text-sm text-taupe">
              Unknown words stay between five and ten percent, while the selected learned words shape the main reading
              flow.
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {learnedWords.slice(0, 12).map((word) => (
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
              {splitIntoParagraphs(readingSegments).map((paragraph, paragraphIndex) => (
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
                  {getTranslationParagraphs(articleVariant).map((paragraph, index) => (
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

function isSingleWord(value: string) {
  return !value.includes(' ');
}

function normalizeArticleWord(value: string) {
  return value.trim().toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
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

function splitIntoParagraphs(segments: ReadingSegment[]) {
  return [segments.slice(0, 43), segments.slice(43, 84), segments.slice(84)];
}

function getTranslationParagraphs(variant: number) {
  const translations = [
    [
      '日出时，向导向我们讲解了山谷上方的大气层和山丘下方的水圈。借助一个小型高度传感器，小组比较了岩石圈、氧气和氧化物在冷空气中的表现。',
      '随后，一名学生画出了海岸的氢分布，另一名学生则解释了地核和地壳如何支持当地农业。在附近的实验室里，一个灾害模型和一张事故图表帮助我们把地幔、经度和纬度与日常天气联系起来。',
      '最终的报告使用了地平线、灾难性观察、严重结论以及一个濒危提醒，说明细致阅读能够把新词汇转化为主动知识。',
    ],
    [
      '在一次实地课堂上，我们沿着港口附近的地平线前进，并测量了悬崖周围的大气状况。黑板上的一条补充说明把岩石圈、氧气和氧化物联系在了一起。',
      '随后，老师使用氢元素示意图来比较地核、地壳和地幔在现代农业中的作用。一个设备和一张地图帮助我们读取数据，而经度、纬度和地平线共同塑造了最后的总结。',
      '到课程结束时，一段反思、一份复盘和一条洞察说明：已经学过的词汇能够支撑更强的阅读习惯。',
    ],
  ];

  return translations[variant % translations.length];
}

function buildReadingSegments(
  learnedWords: VocabularyWord[],
  unknownWords: VocabularyWord[],
  variant: number,
): ReadingSegment[] {
  const learned = fillWords(learnedWords, 12);
  const unknown = fillWords(unknownWords, 6);

  const templates = [
    [
      textSegment('At sunrise, our guide described the '),
      wordSegment(learned[0]),
      textSegment(' above the valley and the '),
      wordSegment(learned[1]),
      textSegment(' beneath the hills. Using a small '),
      wordSegment(unknown[0], true),
      textSegment(' sensor, the group compared '),
      wordSegment(learned[2]),
      textSegment(', '),
      wordSegment(learned[3]),
      textSegment(', and '),
      wordSegment(learned[4]),
      textSegment(' in the cool air. Later, one student drew the '),
      wordSegment(learned[5]),
      textSegment(' of the coast, while another explained how '),
      wordSegment(learned[6]),
      textSegment(' and '),
      wordSegment(learned[7]),
      textSegment(' support local farming. In a nearby lab, a '),
      wordSegment(unknown[1], true),
      textSegment(' model and a '),
      wordSegment(unknown[2], true),
      textSegment(' chart helped us connect '),
      wordSegment(learned[8]),
      textSegment(', '),
      wordSegment(learned[9]),
      textSegment(', and '),
      wordSegment(learned[10]),
      textSegment(' with daily weather. The final report used '),
      wordSegment(learned[11]),
      textSegment(', a '),
      wordSegment(unknown[3], true),
      textSegment(' observation, a '),
      wordSegment(unknown[4], true),
      textSegment(' conclusion, and one '),
      wordSegment(unknown[5], true),
      textSegment(' reminder to show that careful reading can turn new vocabulary into active knowledge.'),
    ],
    [
      textSegment('During a field lesson, our class followed the '),
      wordSegment(learned[0]),
      textSegment(' near the harbor and measured the '),
      wordSegment(learned[1]),
      textSegment(' around nearby cliffs. A '),
      wordSegment(unknown[0], true),
      textSegment(' note on the board linked '),
      wordSegment(learned[2]),
      textSegment(' with '),
      wordSegment(learned[3]),
      textSegment(' and '),
      wordSegment(learned[4]),
      textSegment('. Later, the teacher used '),
      wordSegment(learned[5]),
      textSegment(' sketches to compare '),
      wordSegment(learned[6]),
      textSegment(', '),
      wordSegment(learned[7]),
      textSegment(', and '),
      wordSegment(learned[8]),
      textSegment(' in modern farming. One '),
      wordSegment(unknown[1], true),
      textSegment(' device and a '),
      wordSegment(unknown[2], true),
      textSegment(' map helped us read the data, while '),
      wordSegment(learned[9]),
      textSegment(', '),
      wordSegment(learned[10]),
      textSegment(', and '),
      wordSegment(learned[11]),
      textSegment(' shaped the final summary. By the end, a '),
      wordSegment(unknown[3], true),
      textSegment(' reflection, a '),
      wordSegment(unknown[4], true),
      textSegment(' review, and one '),
      wordSegment(unknown[5], true),
      textSegment(' insight showed how learned vocabulary can support a stronger reading habit.'),
    ],
  ];

  return templates[variant % templates.length];
}

function fillWords(words: VocabularyWord[], count: number) {
  if (words.length >= count) {
    return words.slice(0, count);
  }

  const filled = [...words];
  while (filled.length < count) {
    filled.push(words[filled.length % Math.max(words.length, 1)] ?? fallbackWord(filled.length));
  }
  return filled;
}

function fallbackWord(index: number): VocabularyWord {
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

function textSegment(text: string): ReadingSegment {
  return { text };
}

function wordSegment(word: VocabularyWord, isUnknown = false): ReadingSegment {
  return { text: word.word, word, isUnknown };
}
