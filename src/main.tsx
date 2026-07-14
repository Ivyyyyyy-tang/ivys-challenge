import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { VocabularyProvider } from './context/VocabularyContext';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VocabularyProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </VocabularyProvider>
  </React.StrictMode>,
);
