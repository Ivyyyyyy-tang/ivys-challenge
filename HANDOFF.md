# Current Goal
Keep Ivy's Challenge in a stable handoff state and let a brand-new Codex conversation resume work without relying on old chat history. The next phase is not broad feature expansion; it is choosing one unfinished stream and continuing from the real codebase state.

# Current Stage
Documentation / handoff freeze after recent AI Reading architecture refactor and vocabulary-system updates.

# Done
- Core app shell is implemented with landing page, framed desktop layout, draggable sidebar order, and resizable sidebar width.
- Active product surfaces are implemented:
  - Vocabulary Library
  - Word Card Mode
  - Word List Mode
  - AI Reading
  - Vocabulary Garden
  - My Vocabulary Bank
- `VocabularyContext` remains the central state layer for:
  - normalized vocabulary data
  - memory-box progress
  - spelling progress
  - personal vocabulary persistence
- Personal Vocabulary Bank supports batch selection and batch deletion.
- Word List selection rows support easier click-to-select behavior.
- AI Reading now uses a new AI-driven architecture:
  - page no longer builds articles itself
  - `src/services/aiReadingService.ts` is the reading-generation entry point
  - `src/services/aiProvider.ts` provides provider abstraction
  - `src/data/aiReadingGeneration.ts` now focuses on semantic analysis, prompt construction, validation, and article-to-segment parsing
  - when no provider config exists, the system falls back to `mode: "fallback"`
- Vocabulary enrichment pipeline groundwork is present:
  - `src/data/vocabularyEnrichment.ts`
  - pending personal vocabulary enrichment
  - dictionary API enrichment helpers
  - AI enrichment placeholder data model
- Recent verification passed:
  - `npx tsc --noEmit`
  - `npm run build`
  - `node --test tests/aiReadingGeneration.test.mjs`

# In Progress
- AI Reading is architecturally refactored, but real external AI provider wiring is not configured yet.
- Current AI Reading fallback generation is intentionally transitional; it is more varied than before, but still not true model output until provider env vars are supplied.
- Vocabulary enrichment has data-model and dictionary pipeline pieces, but there is no AI enrichment execution yet.
- Vocabulary Garden exists and is usable, but still not clearly finalized as a product surface.
- Working tree contains uncommitted feature work from multiple threads and should be reviewed before any git sync.

# Blockers
- No hard infrastructure blocker.
- Main blocker is product-priority ambiguity: the next Codex should not guess whether to continue AI Reading provider integration, Vocabulary Garden refinement, enrichment continuation, or UI polish.
- Real AI reading generation cannot become truly model-backed until provider environment variables are defined.

# Key Files
- `AGENTS.md`
  - collaboration rules, continuation protocol, and handoff requirements.
- `HANDOFF.md`
  - short current-state continuation guide.
- `DECISIONS.md`
  - stable technical and product constraints that should not be re-decided casually.
- `PROJECT_HANDOFF.md`
  - detailed no-context handoff document for a new Codex conversation.
- `src/context/VocabularyContext.tsx`
  - single source of truth for vocabulary state, localStorage sync, personal bank mutations, and pending enrichment background pass.
- `src/data/vocabulary.ts`
  - normalized `VocabularyWord` model; includes progress fields and `learnedOn`.
- `src/data/personalVocabulary.ts`
  - personal vocabulary entry types, enrichment metadata, AI enrichment placeholder model, and removal helpers.
- `src/data/vocabularyEnrichment.ts`
  - normalization, enrichment status helpers, dictionary fetch layer, pending-word enrichment, and AI enrichment placeholder logic.
- `src/data/aiReadingGeneration.ts`
  - AI Reading semantic analysis, prompt builder, validation, and article parsing into clickable reading segments.
- `src/services/aiProvider.ts`
  - provider abstraction; currently expects env-based endpoint/model/key config.
- `src/services/aiReadingService.ts`
  - article generation service; uses provider if available, otherwise returns fallback result with `mode: "fallback"`.
- `src/pages/AiReadingPage.tsx`
  - AI Reading UI; now only selects words, requests reading generation, renders article/translation, and handles add-to-bank interactions.
- `src/pages/PersonalVocabularyBankPage.tsx`
  - personal bank list page with batch selection/deletion.
- `src/components/WordListTable.tsx`
  - shared list table including selection-mode behavior and row click selection UX.
- `tests/aiReadingGeneration.test.mjs`
  - tests for prompt, semantic grouping, fallback variation, and provider branch.
- `tests/vocabularyEnrichment.test.mjs`
  - tests around enrichment status and enrichment helpers.
- `tests/personalVocabulary.test.mjs`
  - tests for personal vocabulary removal helper behavior.

# How To Continue
1. Read `AGENTS.md`, `HANDOFF.md`, `DECISIONS.md`, and `PROJECT_HANDOFF.md`.
2. Inspect `git status --short`.
3. Compare the docs against the real code before making assumptions.
4. Confirm which unfinished stream ivy wants next:
   - AI Reading provider integration
   - Vocabulary enrichment continuation
   - Vocabulary Garden refinement
   - UI/interaction polish
5. Continue only that stream; do not reopen broad multi-track development by default.

# Next Action
In a new conversation, first read the four memory files, then inspect `git status --short`, `src/pages/AiReadingPage.tsx`, `src/services/aiReadingService.ts`, and `src/context/VocabularyContext.tsx` to verify that the current AI Reading and enrichment notes match the code. After that, ask ivy which single unfinished stream to resume if she has not already specified it.

# Run / Verify
- `git status --short`
- `npx tsc --noEmit`
- `npm run build`
- `node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild src/data/aiReadingGeneration.ts --bundle --platform=node --format=esm --outfile=.tmp-tests/aiReadingGeneration.bundle.mjs`
- `node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild src/services/aiReadingService.ts --bundle --platform=node --format=esm --outfile=.tmp-tests/aiReadingService.bundle.mjs`
- `node --test tests/aiReadingGeneration.test.mjs`

# Notes
- The app is still browser-first React + Vite, not yet Electronized.
- `src/services/aiProvider.ts` reads:
  - `VITE_AI_PROVIDER_ENDPOINT`
  - `VITE_AI_PROVIDER_API_KEY`
  - `VITE_AI_PROVIDER_MODEL`
- Without those env vars, AI Reading correctly degrades to fallback mode.
- `.tmp-tests/` exists because current test flow uses generated bundle artifacts for Node-based tests.
- Do not commit or push blindly; the repository has multiple uncommitted changes outside the latest handoff edits.
