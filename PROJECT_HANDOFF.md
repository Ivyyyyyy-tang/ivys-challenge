# Ivy's Challenge Project Handoff

This file is for a brand-new Codex conversation with zero prior context.
It is intended to be sufficient on its own after also reading:
- `AGENTS.md`
- `HANDOFF.md`
- `DECISIONS.md`

This document reflects the actual codebase state as of July 16, 2026.

## 1. What This Project Is

Ivy's Challenge is a premium personal English-learning web application.

It is intentionally:
- calm
- minimal
- editorial
- desktop-first
- personal rather than mass-market

It is intentionally not:
- a noisy gamified vocabulary app
- a dashboard full of widgets
- a backend-heavy SaaS product

Current implementation is:
- React
- TypeScript
- Tailwind CSS
- Vite
- client-side localStorage persistence

There is no backend database.

## 2. Current Product Surfaces

Active main routes / modules:
- Landing Page
- Vocabulary Library
- Word Card Mode
- Word List Mode
- AI Reading
- Vocabulary Garden
- My Vocabulary Bank

Not currently active as product modules:
- AI Review Coach
- Collocation System

Those routes should redirect to `/vocabulary-library`.

## 3. Current Architecture

### 3.1 Core State

`src/context/VocabularyContext.tsx` is the central state layer.

It is responsible for:
- loading normalized vocabulary
- loading persisted progress
- loading personal vocabulary
- exposing review/memory mutations
- exposing spelling mutations
- exposing personal bank mutations
- background pending enrichment pass

Do not casually split business logic away from this context unless there is a strong reason.

### 3.2 Vocabulary Source

Vocabulary source flow:

1. Raw source:
   - `src/data/vocabulary.json`
2. Runtime normalization:
   - `src/data/vocabulary.ts`
3. Shared consumption:
   - `VocabularyContext`
4. UI reads via:
   - `useVocabulary()`

### 3.3 Persistence

Current important localStorage keys:
- `ivys-challenge.vocabulary-progress`
- `ivys-challenge.personal-vocabulary`
- `ivys-challenge.sidebar-width`
- `ivys-challenge.sidebar-order`
- `ivy-word-card-last-word:<scope>`

Do not rename these without a deliberate migration.

## 4. Current Data Models

### 4.1 VocabularyWord

Defined in:
- `src/data/vocabulary.ts`

Important fields:
- `id`
- `chapter`
- `word`
- `phonetic`
- `audio`
- `part_of_speech`
- `meaning`
- `example`
- `word_family`
- `collocations`
- `memory`
- `spelling`
- `memoryMarks`
- `memoryHistory`
- `lastReviewAction`
- `learnedOn`

`learnedOn` is important for current AI Reading word selection.

### 4.2 PersonalVocabularyEntry

Defined in:
- `src/data/personalVocabulary.ts`

Personal vocabulary can reference:
- an existing main vocabulary word via `wordId`
- or a custom captured word via `customWord`

It also now supports:
- `enrichment`
- `aiEnrichment`

These fields are important for current unfinished enrichment work.

## 5. Learning Logic That Must Be Preserved

### 5.1 Seven-Box Memory System

Current rules:
- `Known` fills the next empty memory box.
- `Unsure` removes the most recent filled memory box when possible.
- `Unknown` resets all seven memory boxes.

### 5.2 Word List Marking

Current rules:
- single click = `check`
- double click = `cross`

If all 7 marks are filled and more than 4 are `cross`, the row resets and the previous row is archived into `memoryHistory`.

### 5.3 Spelling

Spelling attempts are tracked separately from memory-box state.

### 5.4 Personal Vocabulary

Personal vocabulary reuses existing learning logic rather than inventing a second learning engine.

## 6. Current Feature Status

### 6.1 Vocabulary Library

Implemented.

Primary file:
- `src/pages/VocabularyLibraryPage.tsx`

What exists:
- chapter cards
- topic/progress display
- entry points into Word Card / Word List

### 6.2 Word Card

Implemented.

Primary files:
- `src/components/WordCardExperience.tsx`
- `src/pages/WordCardModePage.tsx`
- `src/pages/PersonalVocabularyBankWordCardPage.tsx`

What exists:
- chapter and personal-bank card modes
- word reveal flow
- review actions
- pronunciation
- auto-advance
- last visited position restore

### 6.3 Word List

Implemented.

Primary files:
- `src/pages/WordListModePage.tsx`
- `src/components/WordListTable.tsx`

What exists:
- shared table
- phonetic / meaning / spelling / memory boxes
- selection mode behavior reused by personal vocabulary

Recent UX additions:
- larger selection checkbox
- row click can toggle selection in selection mode

### 6.4 Personal Vocabulary Bank

Implemented.

Primary files:
- `src/pages/PersonalVocabularyBankPage.tsx`
- `src/data/personalVocabulary.ts`

What exists:
- personal vocabulary listing
- source metadata
- word-card integration
- memory and spelling tracking
- batch select
- select all
- batch delete

Context API involved:
- `removePersonalVocabularyEntries(ids: string[])`

### 6.5 Vocabulary Enrichment

Partially implemented foundation.

Primary file:
- `src/data/vocabularyEnrichment.ts`

What exists:
- `normalizeWord()`
- `enrichVocabularyWord()`
- `getEnrichmentStatus()`
- `shouldEnrichVocabularyEntry()`
- `fetchDictionaryData()`
- `enrichPendingVocabularyWord()`
- `shouldAIEnrichVocabularyEntry()`
- `createAIEnrichmentPlaceholder()`

Related context integration:
- `VocabularyContext` runs a background pending-enrichment pass
- duplicate requests are guarded

What is not finished:
- true AI enrichment execution
- complete end-to-end enrichment orchestration beyond current foundations

### 6.6 AI Reading

This area changed recently and is the most important current handoff topic.

#### Old Direction

AI Reading previously used local rule-based article construction directly in the page / generation layer.

That direction has now been intentionally stopped.

#### New Direction

AI Reading is now structured as:

Vocabulary Input  
↓  
AI Generation Service  
↓  
Generated Reading  
↓  
Validation

#### Current Important Files

- `src/pages/AiReadingPage.tsx`
- `src/services/aiReadingService.ts`
- `src/services/aiProvider.ts`
- `src/data/aiReadingGeneration.ts`

#### Current Responsibilities

`src/pages/AiReadingPage.tsx`
- selects today's learned words
- chooses word count
- triggers article generation
- renders article
- renders translation
- handles click / double-click interaction
- adds unknown words to personal bank

`src/services/aiReadingService.ts`
- main generation entry point
- uses provider if available
- parses provider JSON
- validates output
- falls back when provider is unavailable or fails

`src/services/aiProvider.ts`
- provider abstraction
- currently environment-configured
- not tied to a single vendor at interface level

`src/data/aiReadingGeneration.ts`
- semantic analysis
- prompt construction
- validation
- article text to clickable reading segments

#### Current Provider Config

The provider layer currently expects:
- `VITE_AI_PROVIDER_ENDPOINT`
- `VITE_AI_PROVIDER_API_KEY`
- `VITE_AI_PROVIDER_MODEL`

If those are missing:
- AI Reading must return `mode: "fallback"`

That fallback behavior is intentional and should not be hidden.

#### Current AI Reading Testing

Current tests cover:
- semantic grouping
- prompt requirements
- fallback variation across repeated generation
- provider branch with mocked JSON response

Relevant file:
- `tests/aiReadingGeneration.test.mjs`

Important note:
- current Node-based test flow uses `.tmp-tests/` bundle artifacts
- current bundling commands are listed in `HANDOFF.md`

### 6.7 Vocabulary Garden

Implemented as a working module, but still not clearly final.

Primary files:
- `src/pages/VocabularyGardenPage.tsx`
- `src/data/vocabularyGarden.ts`

Treat this as usable but still open to refinement.

## 7. Current Working Tree Reality

At handoff time, the repository is not clean.

Working tree includes modified or new files such as:
- `src/components/WordListTable.tsx`
- `src/context/VocabularyContext.tsx`
- `src/data/personalVocabulary.ts`
- `src/data/vocabulary.ts`
- `src/pages/AiReadingPage.tsx`
- `src/pages/PersonalVocabularyBankPage.tsx`
- `src/data/aiReadingGeneration.ts`
- `src/data/vocabularyEnrichment.ts`
- `src/services/`
- `tests/`
- `tsconfig.test.json`
- `.tmp-tests/`

Meaning:
- do not assume a clean branch
- do not blindly commit
- do not revert unrelated changes

## 8. What Was Verified Most Recently

Verified successfully:
- `npx tsc --noEmit`
- `npm run build`
- `node --test tests/aiReadingGeneration.test.mjs`

Build note:
- Vite build passes
- there is still a large chunk warning
- this is not a functional blocker for the current handoff

## 9. Main Unfinished Streams

The next Codex should not guess across all of these at once.
Ivy should choose one stream first.

### Stream A: Real AI Reading Provider Integration

Current state:
- architecture exists
- provider abstraction exists
- fallback exists
- page integration exists

Not done:
- real production provider wiring
- env setup
- possibly vendor-specific payload shaping

Best next action if this stream is chosen:
- inspect `src/services/aiProvider.ts` and `src/services/aiReadingService.ts`
- decide the real provider target
- implement provider request/response shape against that target

### Stream B: Vocabulary Enrichment Continuation

Current state:
- status model exists
- pending enrichment path exists
- dictionary enrichment helper exists
- AI enrichment placeholder data model exists

Not done:
- true AI enrichment execution
- complete enrichment lifecycle beyond placeholders

Best next action if this stream is chosen:
- inspect `src/data/vocabularyEnrichment.ts`
- inspect `src/context/VocabularyContext.tsx`
- decide whether next step is AI enrichment execution or repair/migration hardening

### Stream C: Vocabulary Garden Refinement

Current state:
- route and page exist
- data layer exists
- visually usable

Not done:
- confirmed final interaction / product polish

Best next action if this stream is chosen:
- inspect `src/pages/VocabularyGardenPage.tsx`
- inspect `src/data/vocabularyGarden.ts`
- compare actual page against desired product feel

### Stream D: UI / Experience Polish

Possible targets:
- AI Reading presentation polish
- Word Card companion refinement
- remaining selection UX issues
- large-bundle cleanup if desired

This stream should only proceed if ivy explicitly chooses it.

## 10. Recommended New-Conversation Startup Procedure

When a new Codex conversation starts, it should do this in order:

1. Read:
   - `AGENTS.md`
   - `HANDOFF.md`
   - `DECISIONS.md`
   - `PROJECT_HANDOFF.md`
2. Inspect:
   - `git status --short`
3. Compare docs with real code.
4. Confirm which single unfinished stream ivy wants next.
5. Continue only that stream.

## 11. Recommended Prompt For The New Codex Conversation

Use this message:

```text
继续这个项目。先读取 AGENTS.md、HANDOFF.md、DECISIONS.md、PROJECT_HANDOFF.md，不要复述整个历史。先检查交接文档和当前代码是否一致，再告诉我当前未完成事项。然后只聚焦最优先的一项继续。
```

If you already know the exact next stream, use a more specific version, for example:

```text
继续这个项目。先读取 AGENTS.md、HANDOFF.md、DECISIONS.md、PROJECT_HANDOFF.md，不要复述整个历史。先检查交接文档和当前代码是否一致，然后继续 AI Reading 的真实 provider 接入，不要改动无关模块。
```

Or:

```text
继续这个项目。先读取 AGENTS.md、HANDOFF.md、DECISIONS.md、PROJECT_HANDOFF.md，不要复述整个历史。先检查交接文档和当前代码是否一致，然后继续 Vocabulary Enrichment 的下一阶段，只处理 enrichment 相关内容。
```

## 12. Final Cautions For The Next Codex

- Do not trust old chat history over the code.
- Do not assume AI Reading is fully model-backed yet.
- Do not assume enrichment is fully complete.
- Do not clean or revert the working tree unless ivy explicitly asks.
- Do not open multiple unfinished streams in one turn unless ivy asks.
