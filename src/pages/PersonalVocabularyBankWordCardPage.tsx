import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WordCardCompanion } from '../components/WordCardCompanion';
import { WordCardExperience } from '../components/WordCardExperience';
import { useVocabulary } from '../context/VocabularyContext';
import type { WordAction } from '../data/vocabulary';

export function PersonalVocabularyBankWordCardPage() {
  const navigate = useNavigate();
  const { getPersonalVocabularyWords, updateWordReview } = useVocabulary();
  const [companionAction, setCompanionAction] = useState<WordAction | null>(null);
  const words = getPersonalVocabularyWords().map((item) => item.word);

  return (
    <section className="relative h-full min-h-0">
      <div className="grid h-full min-h-0 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]">
        <div className="min-h-0 lg:pr-6">
          <WordCardExperience
            words={words}
            scopeLabel="Personal Bank"
            persistKey="personal-bank"
            onExit={() => navigate('/personal-vocabulary-bank')}
            onPendingReviewActionChange={(action) => {
              if (action) {
                setCompanionAction(action);
              }
            }}
            onUpdateWordReview={updateWordReview}
          />
        </div>

        <div className="hidden min-h-0 border-l border-line/60 lg:block" />
      </div>

      <WordCardCompanion action={companionAction} />
    </section>
  );
}
