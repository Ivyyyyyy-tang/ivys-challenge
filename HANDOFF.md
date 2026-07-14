# Current Goal
Build Ivy's Challenge into a premium personal English learning web app with a stable desktop-first shell, shared vocabulary data model, and connected learning modules. The current codebase already supports the main vocabulary workflow and now needs handoff-ready continuation for the unfinished visualization and coaching layers.

# Current Stage
Implementation handoff / continuation preparation.

# Done
- Landing page implemented with avatar, signature, live clock, central title, and single entry button.
- Global desktop shell implemented with adjustable sidebar width, draggable sidebar ordering, persistent layout state, and a subtle back-to-home entry.
- Vocabulary Library implemented with 22 chapter cards, chapter statistics, routing to Word Card and Word List modes, and responsive multi-column desktop grid.
- Shared vocabulary database imported from `src/data/vocabulary.json` and normalized through `src/data/vocabulary.ts`.
- Shared persistence layer implemented in `src/context/VocabularyContext.tsx` using `localStorage` for vocabulary state and personal vocabulary entries.
- Word Card mode implemented with font resizing, reveal meaning, pronunciation, previous/next navigation, word family panel, review buttons, delayed auto-advance, and last-position restore.
- Word List mode implemented with hide/show word and meaning, inline spelling input submitted by Enter, and seven memory boxes with single-click / double-click interaction.
- Personal Vocabulary Bank implemented by reusing the same `WordListTable` component and shared vocabulary state; it also links to its own Word Card mode.
- AI Reading implemented with selected learned-word sets, generated article variants, collapsible reading card, translation toggle, font scaling, draggable Word Insight height, single-click inspection, and double-click unknown-word collection logic.
- AI Review Coach implemented with daily report, weak-word detection, seven-box performance, reset counts, spelling accuracy, unknown-word count, and reading performance metrics.
- Collocation System page effectively removed as a real module by redirecting `/collocation-system` back to `/vocabulary-library`; the related content is now represented inside Word Card word-family display.

# In Progress
- Project documentation and memory files are now being established so a fresh Codex conversation can resume without relying on chat history.
- AI Reading unknown-word collection behavior exists in code but still needs real-user verification in the browser because ivy reported it did not work as expected.
- Cursor customization is unresolved: the project currently uses a temporary SVG rabbit cursor instead of the user's original cut-out rabbit image.

# Blockers
- The requested rabbit cursor must use the user's original image with a truly transparent background, but current generated assets still have baked-in checkerboard pixels or were replaced with a temporary custom SVG the user rejected.
- Vocabulary Garden has not been started.
- "AI Personal Teacher" is not yet implemented; the closest current module is AI Review Coach.

# Key Files
- `/Users/apple/Documents/ivy'challenge/src/App.tsx`: top-level route map for landing, vocabulary library, word card/list, AI Reading, personal bank, and AI Review Coach.
- `/Users/apple/Documents/ivy'challenge/src/components/AppLayout.tsx`: desktop shell, sidebar ordering, sidebar resizing, frame ratio, and home navigation.
- `/Users/apple/Documents/ivy'challenge/src/context/VocabularyContext.tsx`: single shared source of runtime truth, persistence, review updates, spelling updates, memory-box updates, and personal vocabulary mutations.
- `/Users/apple/Documents/ivy'challenge/src/data/vocabulary.ts`: normalized vocabulary types, chapter definitions, initial states, and supplemental word-family data.
- `/Users/apple/Documents/ivy'challenge/src/data/vocabulary.json`: imported raw vocabulary dataset.
- `/Users/apple/Documents/ivy'challenge/src/data/personalVocabulary.ts`: persisted personal vocabulary entry shape and seed entries.
- `/Users/apple/Documents/ivy'challenge/src/components/WordCardExperience.tsx`: shared word-card interaction engine.
- `/Users/apple/Documents/ivy'challenge/src/components/WordListTable.tsx`: reused list/table engine for chapter lists and personal bank lists.
- `/Users/apple/Documents/ivy'challenge/src/pages/AiReadingPage.tsx`: reading article generation, translation toggle, word interaction, and personal-vocabulary collection.
- `/Users/apple/Documents/ivy'challenge/src/pages/AiReviewCoachPage.tsx`: analytics/coaching page.
- `/Users/apple/Documents/ivy'challenge/src/styles.css`: global visual rules and current cursor wiring.
- `/Users/apple/Documents/ivy'challenge/PROJECT_HANDOFF.md`: full detailed project handoff for a new Codex conversation.

# How To Continue
1. Read `AGENTS.md`, `HANDOFF.md`, `DECISIONS.md`, and `PROJECT_HANDOFF.md`.
2. Verify the codebase against the handoff notes instead of relying on old chat history.
3. Check the current unfinished item the user wants first; likely one of these:
   - fix AI Reading double-click add-to-bank behavior
   - replace the temporary rabbit cursor with the user's original transparent-background rabbit
   - add the new Vocabulary Garden module
   - add the future AI Personal Teacher module
4. Make the smallest targeted change that addresses the current goal, then verify with TypeScript and/or build.

# Next Action
Open `/Users/apple/Documents/ivy'challenge/src/pages/AiReadingPage.tsx` and `/Users/apple/Documents/ivy'challenge/src/context/VocabularyContext.tsx`, then verify in-browser why double-clicking a word in AI Reading is not reliably adding it to My Vocabulary Bank.

# Run / Verify
- `npm run dev`
- `./node_modules/.bin/tsc --noEmit`
- `./node_modules/.bin/vite build`

# Notes
- The project is desktop-first and intentionally not optimized around mobile-first interaction patterns.
- The active cursor asset is currently a temporary compromise and should not be treated as final.
- The user strongly prefers concise execution and expects new conversations to resume from these files rather than from reconstructed history.
