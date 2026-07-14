import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AiReadingPage } from './pages/AiReadingPage';
import { LandingPage } from './pages/LandingPage';
import { PersonalVocabularyBankPage } from './pages/PersonalVocabularyBankPage';
import { PersonalVocabularyBankWordCardPage } from './pages/PersonalVocabularyBankWordCardPage';
import { VocabularyGardenPage } from './pages/VocabularyGardenPage';
import { VocabularyLibraryPage } from './pages/VocabularyLibraryPage';
import { WordCardModePage } from './pages/WordCardModePage';
import { WordListModePage } from './pages/WordListModePage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="vocabulary-library" element={<VocabularyLibraryPage />} />
        <Route path="vocabulary-garden" element={<VocabularyGardenPage />} />
        <Route path="vocabulary-library/chapter/:chapterId/word-card" element={<WordCardModePage />} />
        <Route path="vocabulary-library/chapter/:chapterId/word-list" element={<WordListModePage />} />
        <Route path="ai-reading" element={<AiReadingPage />} />
        <Route path="personal-vocabulary-bank" element={<PersonalVocabularyBankPage />} />
        <Route path="personal-vocabulary-bank/word-card" element={<PersonalVocabularyBankWordCardPage />} />
        <Route path="collocation-system" element={<Navigate to="/vocabulary-library" replace />} />
        <Route path="ai-review-coach" element={<Navigate to="/vocabulary-library" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
