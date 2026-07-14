# Confirmed Technical Decisions
- Frontend stack is React + TypeScript + Tailwind CSS + Vite.
- Routing uses `react-router-dom`.
- Core vocabulary state is centralized in `src/context/VocabularyContext.tsx`.
- Raw vocabulary source remains `src/data/vocabulary.json`.
- Runtime-normalized vocabulary model remains `src/data/vocabulary.ts`.
- User progress and personal vocabulary persist in browser `localStorage`.
- Word Card, Word List, AI Reading, Personal Vocabulary Bank, and Vocabulary Garden all read from the same shared vocabulary state.
- Vocabulary Garden is a visualization/calculation layer built on top of existing learning data, not a separate learning system.

# Explicitly Not Adopted
- No backend database.
- No server-side user model.
- No separate spaced-repetition scheduler beyond the current client-side memory and spelling logic.
- No standalone active `AI Review Coach` page in current product flow.
- No standalone active `Collocation System` page in current product flow.
- No cartoonish or game-heavy visual language for the main learning surfaces.

# Current Product / Routing Decisions
- Active sidebar modules are:
  - Vocabulary
  - Vocabulary Garden
  - AI Reading
  - My Vocabulary Bank
- `/collocation-system` redirects to `/vocabulary-library`.
- `/ai-review-coach` redirects to `/vocabulary-library`.
- Landing page and focus-mode pages use the shared framed shell but different layout behavior from the dashboard pages.

# Learning Logic Decisions
- `Known` in Word Card fills the next empty memory box.
- `Unsure` removes the most recent filled memory box when possible.
- `Unknown` resets all seven memory boxes.
- Word List memory marks use:
  - single click = `check`
  - double click = `cross`
- If all 7 marks are filled and more than 4 are `cross`, the mark row resets and the old row is archived into `memoryHistory`.
- Spelling attempts are tracked separately from memory-box filling.

# Data Model Decisions
- `VocabularyWord` includes:
  - lexical fields
  - memory tuple
  - spelling stats
  - `memoryMarks`
  - `memoryHistory`
  - `lastReviewAction`
- Personal vocabulary entries may point to an existing `wordId` or store a `customWord`.

# UI / Style Decisions
- Design language stays:
  - clean
  - minimal
  - premium
  - calm
  - editorial
- Main palette stays warm neutral:
  - sand background
  - ink text
  - taupe metadata
  - soft line borders
- Typography stays:
  - serif display headings
  - sans-serif body
- Desktop-first framed shell with `18 / 12` aspect ratio remains the layout model.
- Sidebar remains resizable and reorderable.

# Current In-Progress UI Decisions
- Word Card mode now supports a right-side companion illustration system controlled at page level, not inside the card component.
- Companion illustrations change by latest review action:
  - `known`
  - `unsure`
  - `unknown`
- Default no-action state currently renders no companion illustration.
- Companion illustration assets have gone through several iterations and should be treated as active in-progress work until ivy confirms the final visual result.

# Important Continuation Constraints
- Before any new development, a new Codex conversation should read:
  - `AGENTS.md`
  - `HANDOFF.md`
  - `DECISIONS.md`
  - `PROJECT_HANDOFF.md`
- New Codex should compare docs with current code, not trust old chat history.
- Do not blindly commit the current working tree without review; it contains many uncommitted UI and asset changes.
