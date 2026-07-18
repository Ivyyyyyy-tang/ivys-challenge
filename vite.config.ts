import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          if (id.includes('node_modules/react-router-dom')) {
            return 'router-vendor';
          }

          if (id.includes('/src/data/vocabulary.json') || id.includes('/src/data/vocabulary.ts')) {
            return 'vocabulary-core';
          }

          if (id.includes('/src/context/VocabularyContext.tsx')) {
            return 'learning-state';
          }

          return undefined;
        },
      },
    },
  },
});
