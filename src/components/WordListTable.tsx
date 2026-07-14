import { useState } from 'react';
import { type MemoryMark, type VocabularyWord } from '../data/vocabulary';

export type WordListItem = {
  word: VocabularyWord;
  source?: {
    label: string;
    detail: string;
  };
};

type WordListTableProps = {
  items: WordListItem[];
  onSpeak: (word: string) => void;
  onSubmitSpelling: (wordId: string, input: string) => void;
  onSetMemoryMark: (wordId: string, boxIndex: number, mark: 'check' | 'cross') => void;
};

export function WordListTable({
  items,
  onSpeak,
  onSubmitSpelling,
  onSetMemoryMark,
}: WordListTableProps) {
  const [wordVisible, setWordVisible] = useState(true);
  const [meaningVisible, setMeaningVisible] = useState(true);
  const [spellingInputs, setSpellingInputs] = useState<Record<string, string>>({});

  const handleSpellingSubmit = (wordId: string) => {
    const currentInput = spellingInputs[wordId] ?? '';
    onSubmitSpelling(wordId, currentInput);
    setSpellingInputs((current) => ({
      ...current,
      [wordId]: '',
    }));
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setWordVisible((value) => !value)}
          className="border border-line bg-white/72 px-4 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
        >
          {wordVisible ? 'Hide Word' : 'Show Word'}
        </button>
        <button
          type="button"
          onClick={() => setMeaningVisible((value) => !value)}
          className="border border-line bg-white/72 px-4 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
        >
          {meaningVisible ? 'Hide Meaning' : 'Show Meaning'}
        </button>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-auto">
        <table className="w-full table-fixed border-separate border-spacing-y-3 text-left">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[17%]" />
            <col className="w-[14%]" />
            <col className="w-[20%]" />
            <col className="w-[17%]" />
            <col className="w-[26%]" />
          </colgroup>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.26em] text-taupe/90">
              <th className="px-3 py-2 font-normal">Number</th>
              <th className="px-3 py-2 font-normal">Word</th>
              <th className="px-3 py-2 font-normal">Phonetic + Audio</th>
              <th className="px-3 py-2 font-normal">Meaning</th>
              <th className="px-3 py-2 font-normal">Spelling</th>
              <th className="px-3 py-2 font-normal">Seven Memory Boxes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const { word, source } = item;

              return (
                <tr key={word.id} className="bg-white/68 shadow-card">
                  <td className="px-3 py-4 text-sm text-taupe">{index + 1}</td>
                  <td className="px-3 py-4">
                    <p className="font-display text-2xl text-ink">{wordVisible ? word.word : '••••••'}</p>
                    {source ? (
                      <div className="mt-2 space-y-1 text-xs leading-5 text-taupe">
                        <p>{source.label}</p>
                        <p>{source.detail}</p>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => onSpeak(word.word)}
                      className="inline-flex items-center gap-2 border border-line bg-white/72 px-3 py-2 text-sm text-taupe transition-colors hover:border-taupe hover:text-ink"
                    >
                      <span>{word.phonetic || '/—/'}</span>
                      <span aria-hidden="true">🔊</span>
                    </button>
                  </td>
                  <td className="px-3 py-4 text-sm leading-7 text-taupe">
                    <span className="whitespace-pre-line">
                      {meaningVisible ? formatMeaning(word.meaning || '—') : '••••••'}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={spellingInputs[word.id] ?? ''}
                        onChange={(event) =>
                          setSpellingInputs((current) => ({
                            ...current,
                            [word.id]: event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleSpellingSubmit(word.id);
                          }
                        }}
                        className="w-full border border-line bg-white/72 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-taupe"
                        placeholder="Type spelling"
                      />
                      <p className="text-sm text-taupe">
                        {word.spelling.errors}/{word.spelling.attempts}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-nowrap gap-1.5">
                      {word.memoryMarks.map((mark, boxIndex) => (
                        <button
                          key={`${word.id}-${boxIndex}`}
                          type="button"
                          onClick={() => onSetMemoryMark(word.id, boxIndex, 'check')}
                          onDoubleClick={() => onSetMemoryMark(word.id, boxIndex, 'cross')}
                          className={[
                            'flex h-8 w-8 shrink-0 items-center justify-center border text-xs transition-colors',
                            getMemoryBoxClassName(mark),
                          ].join(' ')}
                          title="Single click: check. Double click: cross."
                        >
                          {mark === 'check' ? '✓' : mark === 'cross' ? '✕' : ''}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function getMemoryBoxClassName(mark: MemoryMark) {
  if (mark === 'check') {
    return 'border-ink bg-ink text-sand';
  }

  if (mark === 'cross') {
    return 'border-taupe bg-sand/60 text-taupe';
  }

  return 'border-line bg-white/78 text-transparent hover:border-taupe';
}

function formatMeaning(value: string) {
  if (value.length <= 11) {
    return value;
  }

  return `${value.slice(0, 11)}\n${value.slice(11)}`;
}
