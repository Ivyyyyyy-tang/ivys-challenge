# Ivy's Challenge Architecture

## Project Architecture

Ivy's Challenge is a browser-first React application with a layered structure:

```text
React
↓
Pages
↓
Components
↓
Context
↓
Data
↓
Services
```

Current source layout:

```text
src/
├── pages
├── components
├── context
├── data
├── services
├── config
└── utils
```

Layer responsibilities:

- `pages`: route-level screens such as Vocabulary Library, AI Reading, Settings, and Personal Vocabulary Bank.
- `components`: reusable UI blocks such as the shared word list table, app layout, and word card experience.
- `context`: application state entry point. `VocabularyContext` is the main runtime source of truth for learning data.
- `data`: domain models and pure learning logic, including vocabulary normalization, enrichment logic, prompt construction, and reading validation.
- `services`: integration boundaries for AI providers, dictionary providers, storage export/import, and AI reading orchestration.
- `config`: browser-side settings and provider configuration loading.
- `utils`: isolated helpers such as browser speech playback.

## Vocabulary Flow

Main vocabulary follows this path:

```text
vocabulary.json
↓
Vocabulary Model
↓
VocabularyContext
↓
Word Card / Word List / Memory System
```

Implementation mapping:

```text
src/data/vocabulary.json
↓
src/data/vocabulary.ts
↓
src/context/VocabularyContext.tsx
↓
src/pages/WordCardModePage.tsx
src/pages/WordListModePage.tsx
src/components/WordCardExperience.tsx
src/components/WordListTable.tsx
```

What happens in this flow:

- `vocabulary.json` stores the raw source vocabulary dataset.
- `vocabulary.ts` converts raw rows into the normalized `VocabularyWord` model.
- `VocabularyContext` overlays persisted progress, spelling history, memory boxes, and review state onto that model.
- Word Card and Word List consume the contextual model instead of reading raw vocabulary directly.
- The memory system is persisted through the same context layer, not inside page components.

## Personal Vocabulary Flow

Personal vocabulary follows this path:

```text
AI Reading
↓
Unknown word
↓
Personal Vocabulary
↓
Enrichment
↓
Dictionary Provider
```

Runtime behavior:

- A user can double-click an unknown word in AI Reading to capture it.
- `VocabularyContext.addPersonalVocabularyFromReading()` creates a personal entry.
- If the word already exists in the main vocabulary library, the entry references `wordId`.
- If not, a custom word object is created and stored in personal vocabulary.
- New personal entries may start in `pending` enrichment state.
- Enrichment then routes through the dictionary provider system.

Relevant files:

- `src/pages/AiReadingPage.tsx`
- `src/context/VocabularyContext.tsx`
- `src/data/personalVocabulary.ts`
- `src/data/vocabularyEnrichment.ts`
- `src/services/dictionary/dictionaryService.ts`

## AI Reading Pipeline

Current AI Reading generation flow:

```text
User Selected Words
↓
Semantic Vocabulary Analyzer
↓
Semantic Profiles
↓
Topic Planning
↓
Context Planning
↓
Prompt Construction
↓
AI Provider
↓
Validation
↓
Article
```

Detailed flow:

1. User-selected words can come from Vocabulary Library word lists or Personal Vocabulary word lists.
2. `AiReadingPage` resolves selected word ids into real vocabulary entries.
3. `semanticVocabularyAnalyzer` builds semantic profiles for each selected word.
4. Topic planning chooses a unified reading theme based on semantic overlap.
5. Context planning decides genre, scene, and article structure.
6. Prompt construction assembles the semantic analysis, topic plan, difficulty, and word usage constraints.
7. `aiService` selects the active provider.
8. The provider returns article JSON or the system falls back to local generation.
9. Validation checks article structure, missing target words, word repetition, and target length.
10. The final article is rendered in AI Reading.

Key files:

- `src/pages/AiReadingPage.tsx`
- `src/services/aiReadingService.ts`
- `src/services/ai/semanticVocabularyAnalyzer.ts`
- `src/data/aiReadingGeneration.ts`
- `src/services/ai/aiService.ts`
- `src/services/aiReadingSelection.ts`

## AI Provider Extension

AI provider dispatch is isolated behind `aiService`:

```text
aiService
↓
Provider Factory
↓
OpenAI / Gemini / DeepSeek / Custom
```

Current provider files:

- `src/services/ai/providers/openaiProvider.ts`
- `src/services/ai/providers/geminiProvider.ts`
- `src/services/ai/providers/deepseekProvider.ts`
- `src/services/ai/providers/customProvider.ts`

Current provider entry point:

- `src/services/ai/aiService.ts`

To add a new provider:

1. Create a new provider file under `src/services/ai/providers/`.
2. Implement the shared `AIProvider` interface.
3. Support at least `generateText()` and `generateArticle()`.
4. Register the provider in `createAIProvider()` inside `aiService.ts`.
5. If the provider needs user-facing configuration, extend:
   - `src/config/aiConfig.ts`
   - `src/config/userSettings.ts`
   - `src/pages/SettingsPage.tsx`

Important rule:

- Pages, components, and context should not call OpenAI-, Gemini-, DeepSeek-, or custom-compatible endpoints directly.
- All AI traffic should continue to pass through `src/services/ai/aiService.ts`.

## Dictionary Extension

Dictionary lookup is also provider-based:

```text
dictionaryService
↓
Provider
```

Current provider files:

- `src/services/dictionary/providers/freeDictionaryProvider.ts`
- `src/services/dictionary/providers/customDictionaryProvider.ts`

Current service entry point:

- `src/services/dictionary/dictionaryService.ts`

To add a new dictionary provider:

1. Create a new provider file under `src/services/dictionary/providers/`.
2. Implement the shared `DictionaryProvider` interface.
3. Keep the normalized lookup result compatible with the existing enrichment layer:
   - `phonetic`
   - `part_of_speech`
   - `definition`
   - `example`
4. Register the provider inside `createDictionaryProvider()`.
5. Extend configuration if needed in:
   - `src/config/dictionaryConfig.ts`
   - `src/config/userSettings.ts`
   - `src/pages/SettingsPage.tsx`

Important rule:

- Existing feature code should continue to use `fetchDictionaryData()` or `dictionaryService.lookup()` rather than calling provider endpoints directly.

## Local Storage Design

Current browser storage keys:

- `ivys-challenge.vocabulary-progress`
  Used for learning progress, spelling attempts, memory marks, memory history, and learned state.
- `ivys-challenge.personal-vocabulary`
  Used for personal vocabulary entries captured from AI Reading or manual addition.
- `ivys-user-settings`
  Used for browser-local user configuration, including provider preferences and BYOK settings.
- `ivys-challenge.sidebar-width`
  Used for sidebar width persistence in the app shell.
- `ivys-challenge.sidebar-order`
  Used for sidebar navigation order persistence.
- `ivy-word-card-last-word:<persistKey>`
  Used by Word Card mode to restore the last viewed word for a specific scope.

Storage design notes:

- Learning data is stored locally in the browser by default.
- API keys are stored only in `ivys-user-settings`.
- Data export intentionally excludes `aiApiKey` and `dictionaryApiKey`.
- AI Reading selected words are currently passed through the URL query instead of local storage.

## Development Guide

Install and run locally:

```bash
npm install
npm run dev
```

Build and verify:

```bash
npm run build
node --test
```

Recommended contributor workflow:

1. Read `README.md` for setup and provider configuration.
2. Read this document before changing state, persistence, AI generation, or enrichment behavior.
3. Inspect `src/context/VocabularyContext.tsx` first for learning-state changes.
4. Inspect `src/services/aiReadingService.ts` and `src/data/aiReadingGeneration.ts` first for AI Reading changes.
5. Inspect provider services before adding or replacing external integrations.

## Extension Notes

When contributing, preserve these current architecture rules:

- `VocabularyContext` remains the main state entry point for learning behavior.
- AI provider selection remains browser-side BYOK.
- Dictionary enrichment should be additive and should not delete user vocabulary entries on lookup failure.
- Route-level pages should coordinate UI, not own domain persistence logic.
- Shared service layers should be the only place where external provider traffic is created.
