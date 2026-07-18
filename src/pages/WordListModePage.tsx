import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WordListTable } from '../components/WordListTable';
import { useVocabulary } from '../context/VocabularyContext';
import { buildAIReadingSearch } from '../services/aiReadingSelection';
import { speakWord } from '../utils/speech';

export function WordListModePage() {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const chapter = Number(chapterId);
  const { getWordsByChapter, setMemoryMark, submitSpellingAttempt } = useVocabulary();
  const words = useMemo(() => getWordsByChapter(chapter), [chapter, getWordsByChapter]);
  const [selectedReadingWordIds, setSelectedReadingWordIds] = useState<Set<string>>(new Set());
  const selectedReadingCount = selectedReadingWordIds.size;
  const allReadingWordsSelected = words.length > 0 && words.every((word) => selectedReadingWordIds.has(word.id));

  const handleSpeak = (word: string) => {
    speakWord(word);
  };

  useEffect(() => {
    setSelectedReadingWordIds((current) => {
      const validWordIds = new Set(words.map((word) => word.id));
      const next = new Set([...current].filter((wordId) => validWordIds.has(wordId)));
      return next.size === current.size ? current : next;
    });
  }, [words]);

  const handleToggleSelectReadingWord = (wordId: string) => {
    setSelectedReadingWordIds((current) => {
      const next = new Set(current);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const handleToggleSelectAllReadingWords = () => {
    setSelectedReadingWordIds((current) => {
      if (allReadingWordsSelected) {
        return new Set();
      }

      return new Set(words.map((word) => word.id));
    });
  };

  const handleGenerateReading = () => {
    if (selectedReadingCount === 0) {
      return;
    }

    const selectedWordIds = words.filter((word) => selectedReadingWordIds.has(word.id)).map((word) => word.id);
    navigate(`/ai-reading${buildAIReadingSearch(selectedWordIds)}`);
  };

  return (
    <section className="flex h-full flex-col border border-line/70 bg-white/58 p-6 shadow-card lg:p-8">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-6">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.35em] text-taupe/90">Word List Mode</p>
          <h2 className="font-display text-4xl tracking-tight text-ink">
            Chapter {String(chapter).padStart(2, '0')} Word List
          </h2>
          <p className="text-sm text-taupe">{words.length} words</p>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-taupe">Selected: {selectedReadingCount} words</p>
            <button
              type="button"
              onClick={handleGenerateReading}
              disabled={selectedReadingCount === 0}
              className="border border-ink px-4 py-2 text-sm uppercase tracking-[0.24em] text-ink transition-colors hover:bg-ink hover:text-sand disabled:cursor-default disabled:border-line disabled:text-taupe"
            >
              Generate AI Reading
            </button>
            <button
              type="button"
              onClick={() => navigate('/vocabulary-library')}
              className="border border-line bg-white/72 px-4 py-2 text-sm uppercase tracking-[0.24em] text-taupe transition-colors hover:border-taupe hover:text-ink"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <WordListTable
        items={words.map((word) => ({ word }))}
        onSpeak={handleSpeak}
        onSubmitSpelling={submitSpellingAttempt}
        onSetMemoryMark={setMemoryMark}
        readingSelectionEnabled
        selectedReadingWordIds={selectedReadingWordIds}
        allReadingWordsSelected={allReadingWordsSelected}
        onToggleSelectAllReadingWords={handleToggleSelectAllReadingWords}
        onToggleSelectReadingWord={handleToggleSelectReadingWord}
      />
    </section>
  );
}
