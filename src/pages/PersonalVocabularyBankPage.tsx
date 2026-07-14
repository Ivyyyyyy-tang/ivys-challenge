import { useNavigate } from 'react-router-dom';
import { WordListTable } from '../components/WordListTable';
import { useVocabulary } from '../context/VocabularyContext';

export function PersonalVocabularyBankPage() {
  const navigate = useNavigate();
  const { getPersonalVocabularyWords, setMemoryMark, submitSpellingAttempt } = useVocabulary();
  const items = getPersonalVocabularyWords();

  const handleSpeak = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="flex h-full flex-col border border-line/70 bg-white/58 p-6 shadow-card lg:p-8">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-6">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.35em] text-taupe/90">Personal Vocabulary Database</p>
          <h2 className="font-display text-4xl tracking-tight text-ink">My Vocabulary Bank</h2>
          <p className="text-sm text-taupe">{items.length} saved words</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/personal-vocabulary-bank/word-card')}
          className="border border-line bg-white/72 px-4 py-2 text-sm uppercase tracking-[0.24em] text-taupe transition-colors hover:border-taupe hover:text-ink"
        >
          Word Card
        </button>
      </header>

      <WordListTable
        items={items}
        onSpeak={handleSpeak}
        onSubmitSpelling={submitSpellingAttempt}
        onSetMemoryMark={setMemoryMark}
      />
    </section>
  );
}
