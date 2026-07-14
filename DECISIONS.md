# Confirmed Technical Decisions
- Frontend stack is React + TypeScript + Tailwind CSS.
- Routing is handled with `react-router-dom`.
- Vocabulary state is centralized in a React context (`VocabularyContext`) and persisted in browser `localStorage`.
- The raw vocabulary source is `src/data/vocabulary.json`, normalized by `src/data/vocabulary.ts`, and treated as the single source of truth for the main vocabulary database.
- Word Card mode and Word List mode must read from the same vocabulary state rather than duplicate data.
- Personal Vocabulary Bank reuses the existing Word List and Word Card experience instead of introducing a separate interaction system.
- Collocation content is represented through `word_family` display inside Word Card rather than a standalone learning module.
- The app shell uses a fixed desktop presentation frame with `18 / 12` aspect ratio.

# Explicitly Not Adopted
- No separate backend database has been introduced.
- No complex learning algorithm or server-driven personalization has been added yet.
- No standalone Collocation System page should remain as a real destination; `/collocation-system` currently redirects to `/vocabulary-library`.
- No cartoonified or game-like UI layer should be used for learning views, even when adding visualizations.

# Key Constraints
- Maintain Ivy's Challenge style: minimalist, premium, soft beige palette, large whitespace, elegant typography.
- Default output and future collaboration should stay concise.
- Avoid unrelated expansion; each round should focus on the user's current target.
- Long-term project memory must live in `AGENTS.md`, `HANDOFF.md`, and `DECISIONS.md`.
- Do not re-architect existing Vocabulary Library, Word Card, Word List, or Memory Box logic when adding new visualization modules such as Vocabulary Garden.

# Naming / Directory / Interface Conventions
- Page components live under `src/pages`.
- Shared UI components live under `src/components`.
- Shared data definitions live under `src/data`.
- Shared state and persistence logic live under `src/context`.
- Chapter routes use `/vocabulary-library/chapter/:chapterId/...`.
- Personal vocabulary routes use `/personal-vocabulary-bank/...`.
- AI Review Coach title should use straight apostrophe form: `Ivy's AI Coach`.

# UI / Interaction Conventions
- Sidebar width persists in local storage and remains user-resizable and draggable in item order.
- Vocabulary Library chapter cards use 16:9 ratio and multi-column desktop layout.
- Word Card review buttons auto-advance after 0.5 seconds and should not retain highlight state across reopen; only counts persist.
- Word Card should reopen at the last word visited within the same scope.
- Word List spelling submission happens via Enter key, not a submit button.
- AI Reading supports single-click inspect and double-click add-to-bank behavior.
- AI Reading's "Today's Reading Card" defaults to collapsed.

# Unfinished but Accepted Direction
- Add `Vocabulary Garden` as a new sidebar module and visualization-only layer over existing vocabulary data.
- Add a future `AI Personal Teacher` style module; current `AI Review Coach` is analytics-focused but not the final personal-teacher experience.
- Replace the temporary cursor solution with the user's original rabbit image after proper background removal.
