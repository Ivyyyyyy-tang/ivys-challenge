import { useNavigate } from 'react-router-dom';
import { WordCardExperience } from '../components/WordCardExperience';
import { useVocabulary } from '../context/VocabularyContext';

export function PersonalVocabularyBankWordCardPage() {
  const navigate = useNavigate();
  const { getPersonalVocabularyWords, updateWordReview } = useVocabulary();
  const words = getPersonalVocabularyWords().map((item) => item.word);

  return (
    <WordCardExperience
      words={words}
      scopeLabel="Personal Bank"
      persistKey="personal-bank"
      onExit={() => navigate('/personal-vocabulary-bank')}
      onUpdateWordReview={updateWordReview}
    />
  );
}
