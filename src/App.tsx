import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const VocabularyLibraryPage = lazy(() =>
  import('./pages/VocabularyLibraryPage').then((module) => ({ default: module.VocabularyLibraryPage })),
);
const VocabularyGardenPage = lazy(() =>
  import('./pages/VocabularyGardenPage').then((module) => ({ default: module.VocabularyGardenPage })),
);
const WordCardModePage = lazy(() =>
  import('./pages/WordCardModePage').then((module) => ({ default: module.WordCardModePage })),
);
const WordListModePage = lazy(() =>
  import('./pages/WordListModePage').then((module) => ({ default: module.WordListModePage })),
);
const AiReadingPage = lazy(() => import('./pages/AiReadingPage').then((module) => ({ default: module.AiReadingPage })));
const PersonalVocabularyBankPage = lazy(() =>
  import('./pages/PersonalVocabularyBankPage').then((module) => ({ default: module.PersonalVocabularyBankPage })),
);
const PersonalVocabularyBankWordCardPage = lazy(() =>
  import('./pages/PersonalVocabularyBankWordCardPage').then((module) => ({ default: module.PersonalVocabularyBankWordCardPage })),
);
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));

export default function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
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
          <Route path="settings" element={<SettingsPage />} />
          <Route path="collocation-system" element={<Navigate to="/vocabulary-library" replace />} />
          <Route path="ai-review-coach" element={<Navigate to="/vocabulary-library" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-sand px-6 py-8 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px] items-center justify-center border border-line/80 bg-panel shadow-card">
        <div className="space-y-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.34em] text-taupe/90">Loading</p>
          <p className="font-display text-3xl tracking-tight text-ink">Preparing your learning space.</p>
        </div>
      </div>
    </div>
  );
}
