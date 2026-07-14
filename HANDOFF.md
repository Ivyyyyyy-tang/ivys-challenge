# Current Goal
Freeze active development and leave Ivy's Challenge in a handoff-ready state so a brand-new Codex conversation can resume without relying on old chat history. The codebase already contains the main learning flows plus in-progress UI work around Vocabulary Garden, Word Card companion illustrations, and global cursor behavior.

# Current Stage
Documentation / handoff freeze.

# Done
- Landing Page is implemented.
- Sidebar shell is implemented with draggable ordering and resizable width.
- Vocabulary Library is implemented.
- Word Card and Word List flows are implemented.
- AI Reading is implemented.
- Personal Vocabulary Bank is implemented.
- Vocabulary Garden exists as an in-progress module with route, sidebar entry, page, growth calculation layer, and chapter visualization.
- AI Review Coach page has been removed from active flow; `/ai-review-coach` redirects to `/vocabulary-library`.
- `PROJECT_HANDOFF.md` has been rewritten as a complete no-context handoff file.

# In Progress
- Word Card right-side Q-version companion system is still mid-iteration.
- Rabbit cursor rollout across the whole system is unfinished.
- Vocabulary Garden is functional but not finalized.
- Working tree contains many uncommitted UI and asset changes.

# Blockers
- None at the infrastructure level.
- Main practical blocker is uncertainty about which current uncommitted visual iterations should be kept, cleaned, or reverted before syncing to GitHub.

# Key Files
- `AGENTS.md`: collaboration rules and new-conversation protocol.
- `HANDOFF.md`: short current-state continuation instructions.
- `DECISIONS.md`: stable decisions and constraints that should not be re-litigated every turn.
- `PROJECT_HANDOFF.md`: full detailed project handoff for a new Codex conversation.
- `src/context/VocabularyContext.tsx`: vocabulary persistence, memory logic, spelling logic, and personal bank mutations.
- `src/pages/AiReadingPage.tsx`: reading generation, translation, word interaction, and add-to-bank behavior.
- `src/pages/VocabularyGardenPage.tsx`: current Vocabulary Garden UI.
- `src/data/vocabularyGarden.ts`: garden growth calculation layer.
- `src/components/WordCardCompanion.tsx`: right-side illustration and bubble system in Word Card mode.
- `src/styles.css`: global background and current cursor scope.

# How To Continue
1. Read `AGENTS.md`, `HANDOFF.md`, `DECISIONS.md`, and `PROJECT_HANDOFF.md`.
2. Inspect `git status --short`.
3. Compare the docs against the real code before making assumptions.
4. Ask ivy which unfinished stream to resume first if not already specified.
5. Only after that continue development.

# Next Action
In a new conversation, read the four memory files first, then inspect `git status --short`, `src/components/WordCardCompanion.tsx`, `src/styles.css`, and `src/pages/VocabularyGardenPage.tsx` to verify that the current visual work matches the handoff notes.

# Run / Verify
- `git status --short`
- `./node_modules/.bin/tsc --noEmit`
- `./node_modules/.bin/vite build`

# Notes
- The project is desktop-first.
- The user prefers concise execution, minimal recap, and direct continuation.
- The best next conversation prompt is already included in `PROJECT_HANDOFF.md`.
