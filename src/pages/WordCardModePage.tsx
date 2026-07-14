import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WordCardExperience } from '../components/WordCardExperience';
import { useVocabulary } from '../context/VocabularyContext';

export function WordCardModePage() {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const chapter = Number(chapterId);
  const { getWordsByChapter, updateWordReview } = useVocabulary();
  const words = useMemo(() => getWordsByChapter(chapter), [chapter, getWordsByChapter]);
  return (
    <WordCardExperience
      words={words}
      scopeLabel={String(chapter).padStart(2, '0')}
      persistKey={`chapter-${chapter}`}
      onExit={() => navigate('/vocabulary-library')}
      onUpdateWordReview={updateWordReview}
    />
  );
}
