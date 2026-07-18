import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WordListTable } from '../components/WordListTable';
import { useVocabulary } from '../context/VocabularyContext';
import { buildAIReadingSearch } from '../services/aiReadingSelection';
import { speakWord } from '../utils/speech';

export function PersonalVocabularyBankPage() {
  const navigate = useNavigate();
  const { getPersonalVocabularyWords, removePersonalVocabularyEntries, setMemoryMark, submitSpellingAttempt } =
    useVocabulary();
  const items = getPersonalVocabularyWords();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());
  const [selectedReadingWordIds, setSelectedReadingWordIds] = useState<Set<string>>(new Set());

  const selectableEntryIds = useMemo(
    () => items.map((item) => item.entryId).filter((entryId): entryId is string => Boolean(entryId)),
    [items],
  );
  const selectableReadingWordIds = useMemo(() => items.map((item) => item.word.id), [items]);
  const selectedCount = selectedEntryIds.size;
  const allSelected = selectableEntryIds.length > 0 && selectableEntryIds.every((id) => selectedEntryIds.has(id));
  const selectedReadingCount = selectedReadingWordIds.size;
  const allReadingWordsSelected =
    selectableReadingWordIds.length > 0 && selectableReadingWordIds.every((id) => selectedReadingWordIds.has(id));

  const handleSpeak = (word: string) => {
    speakWord(word);
  };

  useEffect(() => {
    setSelectedReadingWordIds((current) => {
      const validWordIds = new Set(selectableReadingWordIds);
      const next = new Set([...current].filter((wordId) => validWordIds.has(wordId)));
      return next.size === current.size ? current : next;
    });
  }, [selectableReadingWordIds]);

  const handleToggleSelectionMode = () => {
    setSelectionMode((value) => !value);
    setSelectedEntryIds(new Set());
  };

  const handleToggleSelectEntry = (entryId: string) => {
    setSelectedEntryIds((current) => {
      const next = new Set(current);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedEntryIds((current) => {
      if (allSelected) {
        return new Set();
      }

      return new Set(selectableEntryIds);
    });
  };

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

      return new Set(selectableReadingWordIds);
    });
  };

  const handleDeleteSelected = () => {
    if (selectedCount === 0) {
      return;
    }

    const confirmed = window.confirm(`Confirm deletion of ${selectedCount} word${selectedCount > 1 ? 's' : ''}?`);
    if (!confirmed) {
      return;
    }

    removePersonalVocabularyEntries([...selectedEntryIds]);
    setSelectedEntryIds(new Set());
    setSelectionMode(false);
  };

  const handleGenerateReading = () => {
    if (selectedReadingCount === 0) {
      return;
    }

    const selectedWordIds = items.filter((item) => selectedReadingWordIds.has(item.word.id)).map((item) => item.word.id);
    navigate(`/ai-reading${buildAIReadingSearch(selectedWordIds)}`);
  };

  return (
    <section className="flex h-full flex-col border border-line/70 bg-white/58 p-6 shadow-card lg:p-8">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-6">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.35em] text-taupe/90">Personal Vocabulary Database</p>
          <h2 className="font-display text-4xl tracking-tight text-ink">My Vocabulary Bank</h2>
          <p className="text-sm text-taupe">{items.length} saved words</p>
        </div>

        <div className="flex items-center gap-3">
          {selectionMode ? (
            <>
              <p className="text-sm text-taupe">Selected {selectedCount}</p>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedCount === 0}
                className="border border-ink px-4 py-2 text-sm uppercase tracking-[0.24em] text-ink transition-colors hover:bg-ink hover:text-sand disabled:cursor-default disabled:border-line disabled:text-taupe"
              >
                Delete Selected
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-taupe">Selected: {selectedReadingCount} words</p>
              <button
                type="button"
                onClick={handleGenerateReading}
                disabled={selectedReadingCount === 0}
                className="border border-ink px-4 py-2 text-sm uppercase tracking-[0.24em] text-ink transition-colors hover:bg-ink hover:text-sand disabled:cursor-default disabled:border-line disabled:text-taupe"
              >
                Generate AI Reading
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleToggleSelectionMode}
            className="border border-line bg-white/72 px-4 py-2 text-sm uppercase tracking-[0.24em] text-taupe transition-colors hover:border-taupe hover:text-ink"
          >
            {selectionMode ? 'Cancel' : 'Select'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/personal-vocabulary-bank/word-card')}
            className="border border-line bg-white/72 px-4 py-2 text-sm uppercase tracking-[0.24em] text-taupe transition-colors hover:border-taupe hover:text-ink"
          >
            Word Card
          </button>
        </div>
      </header>

      <WordListTable
        items={items}
        onSpeak={handleSpeak}
        onSubmitSpelling={submitSpellingAttempt}
        onSetMemoryMark={setMemoryMark}
        selectionMode={selectionMode}
        selectedEntryIds={selectedEntryIds}
        allSelected={allSelected}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectEntry={handleToggleSelectEntry}
        readingSelectionEnabled={!selectionMode}
        selectedReadingWordIds={selectedReadingWordIds}
        allReadingWordsSelected={allReadingWordsSelected}
        onToggleSelectAllReadingWords={handleToggleSelectAllReadingWords}
        onToggleSelectReadingWord={handleToggleSelectReadingWord}
      />
    </section>
  );
}
