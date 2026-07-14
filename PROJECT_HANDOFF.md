# Ivy's Challenge Project Handoff

This document is for a brand-new Codex conversation with no prior chat context.
It reflects the current codebase state in `/Users/apple/Documents/ivy'challenge`.

## 1. Product Vision

### Positioning
Ivy's Challenge is a premium personal English-learning web app for focused self-study.
It is not meant to feel like a mass-market vocabulary app, a game, or a noisy productivity dashboard.
The intended feeling is a private learning studio: calm, elegant, analytical, and highly personal.

### Design Philosophy
- Clean, restrained, desktop-first presentation.
- Minimal rather than crowded.
- Premium rather than playful.
- Editorial typography rather than generic app UI.
- Warm beige and soft neutral tones rather than bright saturated accents.
- Large whitespace, quiet motion, deliberate interaction.
- Visual metaphors are allowed, but they must stay refined and non-cartoonish.

## 2. Current Completed Features

### Landing Page
Implemented.

What exists:
- Top-left avatar using `src/assets/system-avatar.jpg`
- Personal signature: `See it. Move beyond it.`
- Live clock at top-right
- Centered subtitle: `PRIVATE ENGLISH LEARNING SPACE`
- Centered main title: `Ivy's Challenge`
- Single entry button into the vocabulary system

Primary file:
- `src/pages/LandingPage.tsx`

### Sidebar
Implemented.

What exists:
- Desktop shell with left sidebar and right content canvas
- Sidebar items currently shown:
  - Vocabulary
  - Vocabulary Garden
  - AI Reading
  - My Vocabulary Bank
- Sidebar order is draggable
- Sidebar width is resizable
- Sidebar order and width persist in `localStorage`
- Bottom utility link back to home

Primary file:
- `src/components/AppLayout.tsx`

Important current note:
- `AI Review Coach` has been removed as a real page and sidebar module.
- The route `/ai-review-coach` currently redirects to `/vocabulary-library`.

### Vocabulary Library
Implemented.

What exists:
- 22 chapter cards built from the normalized vocabulary dataset
- Top-right lightweight progress stats
- Each chapter card shows:
  - chapter label
  - chapter topic
  - progress bar
  - learned words / total words
  - `Word Card` button
  - `Word List` button
- Desktop-oriented responsive grid

Primary file:
- `src/pages/VocabularyLibraryPage.tsx`

### Word Card
Implemented and actively customized.

What exists:
- Chapter-specific word card mode
- Personal bank word card mode
- Adjustable word font size
- Pronunciation display and audio trigger
- Meaning hidden by default, reveal on click
- Example sentence area
- Word family expandable section
- Review actions:
  - Known
  - Unsure
  - Unknown
- Auto-advance after review
- Last-visited word restore by scope
- Right-side Q-version companion illustration system tied to latest review action

Primary files:
- `src/components/WordCardExperience.tsx`
- `src/pages/WordCardModePage.tsx`
- `src/pages/PersonalVocabularyBankWordCardPage.tsx`
- `src/components/WordCardCompanion.tsx`

Important current note:
- The Q-version companion system has been heavily customized and is still mid-iteration.
- There are uncommitted asset and presentation changes around transparent cutout illustrations.

### Word List
Implemented.

What exists:
- Shared table-based list mode
- Columns:
  - Number
  - Word
  - Phonetic + audio
  - Meaning
  - Spelling
  - Seven Memory Boxes
- Inline spelling input
- Enter key submits spelling attempt
- Each row shows seven memory marks
- Single click applies `check`
- Double click applies `cross`

Primary files:
- `src/pages/WordListModePage.tsx`
- `src/components/WordListTable.tsx`

### AI Reading
Implemented.

What exists:
- Learned-word set selection
- Article generation from learned words
- Unknown-word ratio kept around 5% to 10%
- Translation show/hide
- Reading font controls
- Collapsible reading card
- Single-click word insight
- Double-click add-to-bank logic
- Resizable Word Insight panel

Primary file:
- `src/pages/AiReadingPage.tsx`

Important current note:
- AI Reading exists, but the double-click add-to-bank interaction previously needed real-user verification.
- Current code includes both article-level double-click handling and per-word button double-click handling.

### Personal Vocabulary Bank
Implemented.

What exists:
- Separate page for collected words
- Reuses the same list system and word-card system
- Displays source metadata per word
- Supports memory boxes and spelling progress like the main vocabulary system

Primary files:
- `src/pages/PersonalVocabularyBankPage.tsx`
- `src/pages/PersonalVocabularyBankWordCardPage.tsx`
- `src/data/personalVocabulary.ts`

## 3. Current Architecture

### Frontend Framework
- React
- TypeScript
- Tailwind CSS
- `react-router-dom`
- Vite

### Database Structure
There is no backend database.

Current storage model:
- Source vocabulary content: `src/data/vocabulary.json`
- Normalized runtime model: `src/data/vocabulary.ts`
- Runtime progress persistence: browser `localStorage`
- Personal vocabulary persistence: browser `localStorage`

Local storage keys:
- `ivys-challenge.vocabulary-progress`
- `ivys-challenge.personal-vocabulary`
- `ivys-challenge.sidebar-width`
- `ivys-challenge.sidebar-order`
- `ivy-word-card-last-word:<scope>`

### Major Components
- `src/components/AppLayout.tsx`
  - application shell
  - sidebar
  - frame ratio
  - focus-mode layout behavior
- `src/components/WordCardExperience.tsx`
  - shared word card engine
- `src/components/WordCardCompanion.tsx`
  - right-side Q-version illustration and bubble text
- `src/components/WordListTable.tsx`
  - shared word-list engine
- `src/components/VocabularyGardenChapterCard.tsx`
  - chapter-level garden visualization

### Data Flow
1. Raw vocabulary is imported from `src/data/vocabulary.json`.
2. `src/data/vocabulary.ts` normalizes it into `VocabularyWord` records.
3. `VocabularyContext` merges:
   - base vocabulary data
   - persisted progress state
   - personal vocabulary entries
4. Pages read state through `useVocabulary()`.
5. Review actions, memory-box updates, spelling attempts, and personal-bank additions all write back through `VocabularyContext`.

This is currently a client-side single-source-of-truth architecture.

## 4. Vocabulary Data Model

Defined in:
- `src/data/vocabulary.ts`

### Core Types

```ts
type MemoryBoxes = [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
];

type SpellingStats = {
  attempts: number;
  correct: number;
  errors: number;
};

type MemoryMark = 'empty' | 'check' | 'cross';

type WordAction = 'known' | 'unsure' | 'unknown';

type VocabularyWord = {
  id: string;
  chapter: number;
  word: string;
  phonetic: string;
  audio: string;
  part_of_speech: string;
  meaning: string;
  example: string;
  word_family: string[];
  collocations: string[];
  memory: MemoryBoxes;
  spelling: SpellingStats;
  memoryMarks: MemoryMark[];
  memoryHistory: MemoryMark[][];
  lastReviewAction?: WordAction;
};
```

### Persisted Progress Model

```ts
type PersistedWordState = {
  memory: MemoryBoxes;
  spelling: SpellingStats;
  memoryMarks: MemoryMark[];
  memoryHistory: MemoryMark[][];
  lastReviewAction?: WordAction;
};
```

### Personal Vocabulary Model

Defined in:
- `src/data/personalVocabulary.ts`

```ts
type PersonalVocabularySource = {
  label: string;
  detail: string;
  dateAdded: string;
};

type PersonalVocabularyEntry = {
  id: string;
  source: PersonalVocabularySource;
  wordId?: string;
  customWord?: VocabularyWord;
};
```

## 5. Memory Box System

Current logic exists in:
- `src/context/VocabularyContext.tsx`
- `src/components/WordListTable.tsx`
- `src/components/WordCardExperience.tsx`

### 7 Boxes Logic
There are two related representations:

1. `memory`
- fixed-length boolean tuple of 7 boxes
- each `true` represents a filled box

2. `memoryMarks`
- visual/action-oriented list of 7 marks
- each slot is:
  - `empty`
  - `check`
  - `cross`

`memoryMarks` is the more detailed interaction layer.
`memory` is derived from marks in list-mode flows and directly updated in word-card review flows.

### Check / Cross Rules

#### In Word List Mode
- Single click on a box writes `check`
- Double click on a box writes `cross`
- Every click/double-click also updates spelling stats:
  - `check` increments `attempts` and `correct`
  - `cross` increments `attempts` and `errors`

#### In Word Card Mode
- `Known`
  - fills the next unfilled memory box
  - increments `attempts`
  - increments `correct`
  - writes `check` into the next empty `memoryMarks` slot
- `Unsure`
  - removes the most recent filled memory box if one exists
  - increments `attempts`
  - does not increment `correct`
  - does not increment `errors`
  - does not add a cross mark
- `Unknown`
  - resets all 7 memory boxes to empty
  - increments `attempts`
  - increments `errors`
  - resets `memoryMarks` to all `empty`

### Reset Rules

#### Word Card reset
- Trigger: `Unknown`
- Effect:
  - all 7 `memory` boxes reset to `false`
  - all `memoryMarks` reset to `empty`

#### Word List reset
- Trigger:
  - if 7 marks are completed and more than 4 of them are `cross`
- Effect:
  - current `memoryMarks` snapshot is pushed into `memoryHistory`
  - current marks are reset to seven `empty`
  - `memory` becomes the derived empty state

### Mastered Word Review Rules
There is no separate spaced-repetition calendar yet.

Current mastered behavior is:
- a word with all or most boxes filled remains in the same vocabulary pool
- it can still be reviewed again through card/list use
- Vocabulary Garden interprets stronger review history as more mature growth

In other words:
- mastered-word tracking exists implicitly through `memory`, `memoryMarks`, `spelling`, and `memoryHistory`
- there is not yet an independent review scheduler for mastered words

## 6. AI Reading Logic

Current logic exists in:
- `src/pages/AiReadingPage.tsx`

### Selected Words
- `learnedWordPool` is built from words whose `memory.some(Boolean)` is true and whose word form is a single token
- if learned words are fewer than 10, the system falls back to a broader single-word pool
- `learnedWords` selects a rolling set of 12 words using `setIndex`

### Unknown Word Ratio
- `unknownWordPool` is built from words that have not started learning: `!word.memory.some(Boolean)`
- it excludes already selected learned words
- `unknownWords` selects up to 6 from that pool based on `articleVariant`
- the article generator mixes learned and unknown words
- `unknownRatio` is calculated from article segments and displayed as a percentage
- the UI copy states the intended unknown range is 5% to 10%

### Translation Behavior
- `translationVisible` toggles whether translation paragraphs are rendered
- translation content is generated by `getTranslationParagraphs(articleVariant)`
- translation is hidden by default and shown on demand

### Word Interaction

#### Single click
- clicking a word segment with a bound `VocabularyWord` sets `selectedWord`
- `Word Insight` shows:
  - word
  - phonetic
  - audio button
  - part of speech
  - meaning

#### Double click
There are two paths:

1. Double click on a bound article word button
- handled inside the mapped word button
- directly calls `handleAddUnknownWord(segment.word)`

2. Double click on selected plain text or a non-bound reading word
- handled at article container level
- uses selected browser text or `data-reading-word`
- normalizes text
- if a known vocabulary entry matches, adds that word
- otherwise creates a `customWord`

#### Add to personal bank
- uses `addPersonalVocabularyWord`
- source metadata is:
  - `label: 'AI Reading'`
  - `detail: "Today's Reading"`
  - current date

## 7. Current UI Design Rules

### Colors
Defined mainly in:
- `tailwind.config.ts`
- `src/styles.css`

Core colors:
- `sand: #F5F0E8`
- `ink: #201A15`
- `taupe: #76695D`
- `line: #DED2C5`
- `panel: rgba(255,255,255,0.72)`

Global background:
- warm layered beige gradient in `src/styles.css`

Panel treatment:
- thin warm borders
- translucent white/beige panel surfaces
- soft card shadow

### Typography
- Display font stack:
  - `Iowan Old Style`
  - `Palatino Linotype`
  - `serif`
- Body font stack:
  - `Avenir Next`
  - `Helvetica Neue`
  - `sans-serif`

Use pattern:
- large serif headlines
- light uppercase metadata labels with wide tracking
- restrained body text with soft taupe color

### Spacing
- generous whitespace is intentional
- desktop frame uses a fixed large presentation canvas
- common section gaps are wide (`gap-8`, `gap-10`)
- cards and shell use roomy internal padding

### Sidebar Behavior
- draggable item ordering
- resizable width
- width persisted in local storage
- order persisted in local storage
- not mobile-first; optimized around a desktop framed shell

### Cursor
Current CSS state:
- rabbit cursor is only applied under `.system-shell, .system-shell *`
- that means it is not yet guaranteed across the entire system, especially focus-mode and landing views

File:
- `src/styles.css`

## 8. Pending Tasks

### Highest Priority Documentation / Continuation Reality
The app has many uncommitted UI changes in working tree.
Before any new development, a new Codex should inspect current `git status` and verify which visual changes are intentional.

### Vocabulary Garden
Status: partially implemented, not finished.

What already exists:
- sidebar entry
- route
- dedicated page
- chapter-level garden summaries
- global stage summaries
- custom stage icons
- chapter dot/growth visualization
- growth calculation layer in `src/data/vocabularyGarden.ts`

What is still incomplete:
- final visual polish
- final interaction design
- alignment with the product spec as a finished module
- possible cleanup of current intermediate UI decisions

### AI Personal Teacher
Status: not implemented.

Current nearest concept:
- no real AI Personal Teacher page exists
- previous `AI Review Coach` page has been removed from active product flow
- `/ai-review-coach` currently redirects away

Future work should define:
- teacher persona
- coaching logic
- study recommendations
- integration with vocabulary / reading / review signals

### Q-version Companion Cleanup
Status: partially implemented, still in iteration.

Current reality:
- review-state-based illustrations and speech bubble text exist
- custom assets were repeatedly revised
- current transparent cutout state needs in-browser visual verification after the latest asset replacement

### Rabbit Cursor Rollout
Status: incomplete.

Current reality:
- rabbit cursor asset exists: `src/assets/rabbit-cursor-user.png`
- CSS applies cursor only inside `.system-shell`
- landing page and focus-mode pages may not fully inherit it
- user explicitly wanted the rabbit cursor across the whole system

### Build / Sync / Cleanup
Status: not done.

Current reality:
- working tree has many modified and untracked files
- nothing in this state has been documented as pushed to GitHub
- before syncing, a new Codex should:
  - inspect changes
  - verify build
  - remove accidental artifacts if any
  - then commit intentionally

## 9. How a New Codex Conversation Should Continue

### Required first step
In a new conversation, the next Codex should:
1. read `AGENTS.md`
2. read `HANDOFF.md`
3. read `DECISIONS.md`
4. read `PROJECT_HANDOFF.md`

### Then do this
- do not restate full history
- summarize current state in a few sentences
- compare docs with current code reality
- inspect `git status`
- continue from the highest-priority unfinished task the user chooses

### Recommended first verification checklist
- `git status --short`
- inspect `src/components/WordCardCompanion.tsx`
- inspect `src/styles.css`
- inspect `src/pages/VocabularyGardenPage.tsx`
- inspect `src/data/vocabularyGarden.ts`
- run:
  - `./node_modules/.bin/tsc --noEmit`
  - `./node_modules/.bin/vite build`

### Best prompt for a new Codex conversation
Use this exact message:

```text
继续这个项目。先读取 AGENTS.md、HANDOFF.md、DECISIONS.md、PROJECT_HANDOFF.md，不要复述整个历史。先检查当前代码和交接文档是否一致，再告诉我当前未完成事项，并从最优先的一项开始继续。
```

### If you want to force a specific next task
Use one of these:

```text
继续这个项目。先读取 AGENTS.md、HANDOFF.md、DECISIONS.md、PROJECT_HANDOFF.md。不要复述整个历史。先检查当前代码和交接文档是否一致。然后优先处理：1）兔子 cursor 全系统应用，或 2）Vocabulary Garden 收尾，或 3）Word Card 右侧插画系统清理。
```

## 10. Current Working Tree Reality

At the time of this handoff, the working tree includes many uncommitted changes, including:
- `src/App.tsx`
- `src/components/AppLayout.tsx`
- `src/components/WordCardExperience.tsx`
- `src/components/WordCardCompanion.tsx`
- `src/pages/AiReadingPage.tsx`
- `src/pages/PersonalVocabularyBankPage.tsx`
- `src/pages/PersonalVocabularyBankWordCardPage.tsx`
- `src/pages/VocabularyGardenPage.tsx`
- `src/pages/WordCardModePage.tsx`
- `src/pages/WordListModePage.tsx`
- `src/styles.css`
- garden assets
- word-card illustration assets
- `src/data/vocabularyGarden.ts`
- `src/utils/`

Also:
- `src/pages/AiReviewCoachPage.tsx` is deleted

New Codex should not assume the current state has been committed or pushed.
