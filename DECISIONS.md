# Confirmed Technical Decisions
- Frontend stack remains:
  - React
  - TypeScript
  - Tailwind CSS
  - Vite
  - `react-router-dom`
- The app remains browser-based and client-side only.
- Core learning state remains centralized in `src/context/VocabularyContext.tsx`.
- Raw vocabulary source remains `src/data/vocabulary.json`.
- Runtime normalized vocabulary model remains `src/data/vocabulary.ts`.
- User progress and personal vocabulary remain persisted in browser `localStorage`.
- Main vocabulary, personal vocabulary, AI Reading, Word Card, Word List, and Vocabulary Garden all continue to read from the same shared state layer.

# Confirmed Product / Routing Decisions
- Active main modules are:
  - Vocabulary
  - Vocabulary Garden
  - AI Reading
  - My Vocabulary Bank
- `/ai-review-coach` is not an active product page and should redirect to `/vocabulary-library`.
- `/collocation-system` is not an active product page and should redirect to `/vocabulary-library`.
- Design language remains:
  - clean
  - minimal
  - premium
  - personal
  - editorial

# Learning Logic Decisions
- The seven-box memory system must not be rewritten casually.
- Word Card actions remain:
  - `Known` fills the next empty memory box
  - `Unsure` removes the most recent filled memory box when possible
  - `Unknown` resets all seven memory boxes
- Word List memory marks remain:
  - single click = `check`
  - double click = `cross`
- If all 7 marks are filled and more than 4 are `cross`, the row resets and the old row is archived into `memoryHistory`.
- Spelling stats remain separate from memory-box progression.
- Personal Vocabulary Bank should reuse the same learning logic rather than inventing a parallel review system.

# Data Model Decisions
- `VocabularyWord` includes lexical fields plus:
  - `memory`
  - `spelling`
  - `memoryMarks`
  - `memoryHistory`
  - `lastReviewAction`
  - `learnedOn`
- Personal vocabulary entries may represent:
  - an existing main-vocabulary word through `wordId`
  - or a custom stored word through `customWord`
- `PersonalVocabularyEntry` now supports:
  - `enrichment`
  - `aiEnrichment`
- Existing localStorage key names must not be changed casually:
  - `ivys-challenge.vocabulary-progress`
  - `ivys-challenge.personal-vocabulary`
  - `ivys-challenge.sidebar-width`
  - `ivys-challenge.sidebar-order`
  - `ivy-word-card-last-word:<scope>`

# Vocabulary Enrichment Decisions
- Vocabulary enrichment lives in `src/data/vocabularyEnrichment.ts`.
- The enrichment layer is additive and must not break existing learning flows.
- Status model remains:
  - `pending`
  - `partial`
  - `complete`
  - `failed`
- Source model currently includes:
  - `main-vocabulary`
  - `manual`
  - `ai-reading`
  - `dictionary-api`
  - `ai-enhanced`
- Dictionary enrichment is allowed as a background improvement step for pending personal vocabulary.
- AI enrichment currently exists only as a data model / placeholder layer, not as a live execution flow.

# AI Reading Decisions
- AI Reading page should not directly generate article text anymore.
- Final reading generation entry point is `src/services/aiReadingService.ts`.
- Provider abstraction lives in `src/services/aiProvider.ts`.
- `src/data/aiReadingGeneration.ts` should only handle:
  - semantic analysis
  - prompt construction
  - validation
  - article parsing into UI segments
- If no provider configuration exists, AI Reading must explicitly return fallback mode instead of pretending the article is model-generated.
- Provider configuration is environment-based and currently expects:
  - `VITE_AI_PROVIDER_ENDPOINT`
  - `VITE_AI_PROVIDER_API_KEY`
  - `VITE_AI_PROVIDER_MODEL`

# Explicitly Not Adopted
- No backend database.
- No server-side user model.
- No mandatory external API dependency for core local usage.
- No forced git commit at the end of ordinary feature work.
- No UI rewrite that breaks the current premium editorial direction.
- No random expansion of unfinished systems in one turn without ivy choosing the priority.

# Current Working Constraints
- The repository contains multiple uncommitted changes from ongoing work and should not be blindly cleaned, reverted, or committed.
- New Codex conversations must rebuild context from:
  - `AGENTS.md`
  - `HANDOFF.md`
  - `DECISIONS.md`
  - `PROJECT_HANDOFF.md`
- New Codex should compare those docs against the actual code and working tree before continuing.
- Unless ivy explicitly asks otherwise, continue one focused stream at a time rather than restarting broad parallel development.
