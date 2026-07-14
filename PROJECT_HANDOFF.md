# Ivy's Challenge Project Handoff

## 1. Product Vision

### Positioning
Ivy's Challenge is a premium personal English learning space built around calm, focused, desktop-first study. It is not meant to feel like a mass-market gamified app. The product direction is closer to a private study atelier: restrained, elegant, analytical, and highly personal.

### Design Philosophy
- Minimalist rather than dense.
- Premium rather than playful.
- Large whitespace rather than dashboard clutter.
- Soft beige and warm neutrals rather than bright saturated accents.
- Elegant typography rather than utilitarian UI text everywhere.
- Learning actions should feel deliberate and quiet.
- Visual systems may be expressive, but they must stay refined and non-cartoonish.

## 2. Current Completed Features

### Landing Page
Implemented.

What exists:
- Avatar at top-left using `src/assets/system-avatar.jpg`.
- Personal signature: `See it. Move beyond it.`
- Real-time clock at top-right in `HH:mm:ss`.
- Centered subtitle: `PRIVATE ENGLISH LEARNING SPACE`.
- Centered main title: `Ivy's Challenge`.
- Single entry button: `Words`.

Primary file:
- `/Users/apple/Documents/ivy'challenge/src/pages/LandingPage.tsx`

### Sidebar
Implemented.

What exists:
- Desktop shell layout with left sidebar and right content area.
- Sidebar items:
  - Vocabulary
  - AI Reading
  - My Vocabulary Bank
  - AI Review Coach
- Sidebar item order is draggable.
- Sidebar width is resizable.
- Sidebar width and item order persist in `localStorage`.
- A subtle `Back to Home` link exists near the bottom.
- `/collocation-system` is no longer a true module; it redirects away.

Primary file:
- `/Users/apple/Documents/ivy'challenge/src/components/AppLayout.tsx`

### Vocabulary Library
Implemented.

What exists:
- 22 chapter cards based on imported vocabulary data.
- Title and top-right lightweight stats:
  - Today Learned
  - Today Reviewed
- Each chapter card shows:
  - chapter label
  - chapter topic
  - progress bar
  - learned words / total words
  - `Word Card` button
  - `Word List` button
- Grid is desktop-oriented with 4 columns by default, then 5 or 6 on very wide screens.
- Chapter cards use 16:9 aspect ratio.

Primary file:
- `/Users/apple/Documents/ivy'challenge/src/pages/VocabularyLibraryPage.tsx`

### Word Card
Implemented.

What exists:
- Full focus view for a chapter or personal bank set.
- Adjustable word font size.
- Pronunciation + speech button.
- Part of speech display.
- Meaning hidden by default, reveal on click.
- Example sentence.
- Buttons:
  - Known
  - Unsure
  - Unknown
- Small previous / next navigation.
- Word Family expandable section.
- Review buttons auto-advance after 0.5 seconds.
- Review counts are shown as very small numeric indicators.
- Last visited word is restored when reopening the same set.

Primary files:
- `/Users/apple/Documents/ivy'challenge/src/components/WordCardExperience.tsx`
- `/Users/apple/Documents/ivy'challenge/src/pages/WordCardModePage.tsx`
- `/Users/apple/Documents/ivy'challenge/src/pages/PersonalVocabularyBankWordCardPage.tsx`

### Word List
Implemented.

What exists:
- Shared table-based list view.
- Columns:
  - Number
  - Word
  - Phonetic + Audio
  - Meaning
  - Spelling
  - Seven Memory Boxes
- Word visibility toggle.
- Meaning visibility toggle.
- Spelling input is editable inline.
- Enter submits spelling attempt.
- Spelling shows `errors / attempts`.
- Each row shows 7 memory boxes in one line.
- Single click adds `check`.
- Double click adds `cross`.

Primary file:
- `/Users/apple/Documents/ivy'challenge/src/components/WordListTable.tsx`

### AI Reading
Implemented, but one interaction still needs verification.

What exists:
- Title and top-right reading stats.
- Selected learned-word sets.
- Generated article variants using learned words plus a small unknown-word layer.
- Reading font size controls.
- Translation toggle.
- Collapsible `Today's Reading Card`, default collapsed.
- Single click a word to inspect it in Word Insight.
- Double click intended to add unknown words into My Vocabulary Bank.
- Word Insight panel exists and supports draggable height resizing.

Primary file:
- `/Users/apple/Documents/ivy'challenge/src/pages/AiReadingPage.tsx`

Important status:
- ivy reported double-click add-to-bank did not work reliably in real use. This is likely the first unfinished behavior to verify.

### Personal Vocabulary Bank
Implemented.

What exists:
- Dedicated page using the same Word List component as the main vocabulary system.
- Shared spelling system.
- Shared seven-box system.
- Shared Word Card experience.
- Source metadata shown per word, such as:
  - AI Reading
  - Chapter 03

Primary files:
- `/Users/apple/Documents/ivy'challenge/src/pages/PersonalVocabularyBankPage.tsx`
- `/Users/apple/Documents/ivy'challenge/src/data/personalVocabulary.ts`

## 3. Current Architecture

### Frontend Framework
- React
- TypeScript
- Tailwind CSS
- `react-router-dom`

### Route Structure
Defined in:
- `/Users/apple/Documents/ivy'challenge/src/App.tsx`

Current routes:
- `/` → Landing Page
- `/vocabulary-library`
- `/vocabulary-library/chapter/:chapterId/word-card`
- `/vocabulary-library/chapter/:chapterId/word-list`
- `/ai-reading`
- `/personal-vocabulary-bank`
- `/personal-vocabulary-bank/word-card`
- `/collocation-system` → redirect to `/vocabulary-library`
- `/ai-review-coach`

### Database Structure
There is no backend database yet.

Current storage model:
- Raw vocabulary dataset lives in `src/data/vocabulary.json`.
- It is normalized into runtime objects in `src/data/vocabulary.ts`.
- User progress and personal-vocabulary entries persist in browser `localStorage`.

Local storage keys used now:
- `ivys-challenge.vocabulary-progress`
- `ivys-challenge.personal-vocabulary`
- `ivys-challenge.sidebar-width`
- `ivys-challenge.sidebar-order`
- `ivy-word-card-last-word:<scope>`

### Components

Major reusable components:
- `AppLayout`
  - desktop shell
  - sidebar
  - frame ratio
- `WordCardExperience`
  - the shared word-card engine
- `WordListTable`
  - the shared list engine
- `PageShell`
  - exists in codebase, but not central to this handoff

### Data Flow
Core data flow is:

1. Raw vocabulary is imported from JSON.
2. `src/data/vocabulary.ts` converts it into normalized `VocabularyWord` records and chapter definitions.
3. `VocabularyContext` merges:
   - base vocabulary data
   - persisted progress state
   - personal vocabulary entries
4. Pages consume `useVocabulary()`.
5. All review actions, spelling actions, memory-box actions, and personal-word additions are written back through the same context.

This means the app already behaves like a client-side single source of truth.

## 4. Vocabulary Data Model

Main runtime type:
- `VocabularyWord`

Defined in:
- `/Users/apple/Documents/ivy'challenge/src/data/vocabulary.ts`

Current fields:

```ts
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
  memory: [
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean,
    boolean
  ];
  spelling: {
    attempts: number;
    correct: number;
    errors: number;
  };
  memoryMarks: Array<'empty' | 'check' | 'cross'>;
  memoryHistory: Array<Array<'empty' | 'check' | 'cross'>>;
  lastReviewAction?: 'known' | 'unsure' | 'unknown';
};
```

Related chapter summary type:

```ts
type VocabularyChapterSummary = {
  chapter: number;
  chapterLabel: string;
  topic: string;
  learnedWords: number;
  totalWords: number;
  progress: number;
};
```

Personal vocabulary entry type:

```ts
type PersonalVocabularyEntry = {
  id: string;
  source: {
    label: string;
    detail: string;
    dateAdded: string;
  };
  wordId?: string;
  customWord?: VocabularyWord;
};
```

Purpose of `customWord`:
- Allows AI Reading to add words that are not already present in the main vocabulary database.

## 5. Memory Box System

## Overview
The app currently uses two connected representations:

1. `memory`
   - seven booleans
   - compact learned-state representation

2. `memoryMarks`
   - seven explicit box marks
   - each mark is `empty`, `check`, or `cross`

`memoryMarks` drives the visible seven-box UI.

### Initial State

```ts
memory = [false, false, false, false, false, false, false]
memoryMarks = ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty']
spelling = {
  attempts: 0,
  correct: 0,
  errors: 0
}
```

### 7 Boxes Logic
Each word visually has 7 boxes in Word List mode.

Current meaning of a box:
- `check` means positive success for that slot.
- `cross` means failure for that slot.
- `empty` means unused.

The visible boxes are updated by `setMemoryMark()` in:
- `/Users/apple/Documents/ivy'challenge/src/context/VocabularyContext.tsx`

### Check / Cross Rules
- Single click on a box → set that box to `check`
- Double click on a box → set that box to `cross`

When a mark is written:
- spelling attempts increase by 1
- `check` also increments spelling `correct`
- `cross` also increments spelling `errors`

### Reset Rules
Current reset condition:
- after 7 completed marks
- if total crosses are greater than 4

Then:
1. The current 7-mark row is pushed into `memoryHistory`
2. `memoryMarks` reset to all `empty`
3. `memory` becomes the boolean projection of the reset marks

In other words:
- a difficult round can be recorded historically
- the visible boxes restart for another pass

### Mastered Word Review Rules
There is no separate fully mature spaced-repetition engine yet.

Current practical mastered logic:
- A word is treated as "learned" in summary views when `memory.some(Boolean)` is true.
- Chapter progress counts words whose memory array contains at least one `true`.
- Word Card review counts accumulate through:
  - `spelling.correct`
  - `spelling.errors`
  - derived unsure count
- Reopening Word Card does not preserve button highlight, only the historical numeric counters.

Important limitation:
- The system tracks review evidence, but it does not yet implement a final "mastered and scheduled for later review" rule set.

## 6. AI Reading Logic

Primary file:
- `/Users/apple/Documents/ivy'challenge/src/pages/AiReadingPage.tsx`

### Selected Words
The reading module builds a learned-word pool first.

Current selection logic:
1. Prefer words where `word.memory.some(Boolean)` is true and the word is a single lexical token.
2. If there are fewer than 10 learned single-word entries, fall back to additional single-word items from the wider vocabulary set.
3. The page uses a rotating set of 12 learned words at a time.
4. `Next Word Set` advances to the next 12-word slice.

### Unknown Word Ratio
Current target behavior:
- Unknown words should remain low and controlled.
- UI messaging says unknown words stay between five and ten percent.

Current implementation:
- A separate unknown-word pool is made from words that are not learned and are not already inside the learned set.
- The article generator injects up to 6 unknown words into the reading variants.
- The page computes `unknownRatio` from actual reading segments and displays it in the top-right statistics.

Important note:
- The displayed ratio depends on the generated reading segments, not on a fixed hard-coded number.

### Translation Behavior
Current translation behavior:
- Translation is hidden by default.
- `Show Translation` toggles it on.
- When visible, translation appears below the English article within the same article area.

Recent design expectation from ivy:
- English正文 and translation must stay inside the same reading frame.
- The reading frame should scroll vertically if content exceeds height.

### Word Interaction
Current intended interactions:
- Single click a vocabulary word in the article:
  - opens that word in Word Insight
  - shows word, phonetic, part of speech, meaning
- Double click a vocabulary word in the article:
  - should add the word to My Vocabulary Bank
- Double click selected article text:
  - attempts to normalize the selected text
  - if it matches a known word, add that word
  - otherwise create a `customWord` entry and add it to the personal bank

Current unresolved issue:
- ivy tested double click and reported that it only selected text rather than reliably adding to My Vocabulary Bank.
- This needs direct browser verification and likely event-handling adjustment.

### Reading Card Behavior
- `Today's Reading Card` exists.
- It defaults to collapsed.
- When collapsed, it becomes a compact control strip.
- When expanded, it shows:
  - descriptive title
  - selected word chips
  - article controls

### Word Insight Behavior
- Displays current inspected word.
- Height is resizable vertically by mouse drag.
- Reading area visually adapts because the page is stacked vertically.

## 7. Current UI Design Rules

## Colors
Global palette is warm and neutral.

Core tones from `src/styles.css` and current Tailwind usage:
- background beige: `#f5f0e8`
- lighter panel whites with translucent warm overlays
- dark ink text around `#201a15`
- line / border tones in soft taupe-beige range

Visual behavior:
- warm beige page background
- white or milk-glass panels
- soft borders
- restrained shadows
- almost no bright accent colors

### Typography
- Global font stack uses `"Avenir Next", "Helvetica Neue", sans-serif`
- Display headlines use `font-display` from the project setup
- Uppercase micro-labels use wide letter spacing
- Large titles rely on refined serif-like display treatment

Typography rules already visible in the app:
- major titles are large and elegant
- supporting labels are tiny uppercase with tracking
- body text is quiet and well-spaced

### Spacing
- Large whitespace is intentional.
- Sections typically use generous padding and large vertical gaps.
- Cards are separated with visible breathing room.
- Dense micro-panels or crowded dashboards are not aligned with the current direction.

### Sidebar Behavior
- Desktop shell only; sidebar is always part of the main system frame.
- Sidebar width:
  - default 240px
  - minimum 180px
  - maximum 400px
- Actual restored width is clamped on load.
- Sidebar order is draggable and persisted.
- Active item becomes dark.
- Menu card blocks remain airy and premium, not compressed.

### System Frame
- App shell uses a fixed visual frame ratio:
  - `18 / 12`
- This is set in `AppLayout.tsx`.
- The shell is centered on the beige background.

### Cursor
Current status:
- A custom rabbit cursor is wired only inside `.system-shell`.
- The current active implementation uses a temporary SVG asset:
  - `/Users/apple/Documents/ivy'challenge/src/assets/rabbit-cursor.svg`

Important unresolved design issue:
- The user explicitly rejected this SVG because it is not their original rabbit image.
- The intended final cursor must use the user's original rabbit image with all background outside the rabbit silhouette removed.

## 8. Pending Tasks

## High Priority Pending Tasks

### A. Fix AI Reading Unknown-Word Collection
Status:
- partially implemented
- user-reported behavior mismatch

Needed:
- verify double-click interaction in real browser
- ensure words are actually added to Personal Vocabulary Bank
- make interaction robust against ordinary text selection behavior

### B. Replace Temporary Rabbit Cursor
Status:
- unresolved

Needed:
- use the original rabbit image supplied by ivy
- remove background correctly
- avoid mosaic/checkerboard artifacts
- avoid replacing it with a redrawn icon

### C. Vocabulary Garden
Status:
- not started

User request summary:
- add new sidebar item: `Vocabulary Garden`
- sidebar order must remain draggable
- this is a visualization layer only
- do not change:
  - Vocabulary Library
  - Word Card
  - Word List
  - Memory Box logic
- group words by chapter
- show vocabulary growth as refined plant-like visual forms
- each word should express:
  - word name
  - growth stage
  - learning status
- style must stay premium, minimalist, elegant, and non-cartoonish

This module should read existing vocabulary data rather than create a new progress model.

### D. AI Personal Teacher
Status:
- not implemented

Interpretation:
- The user explicitly called out future pending work around an "AI Personal Teacher".
- The current AI Review Coach is a behavior-analysis dashboard, not a fully interactive personal teacher.

Likely future direction:
- actionable daily guidance
- personalized review planning
- learning-priority suggestions
- chapter/skill targeting
- deeper integration with reading, review, and weak-word data

## Secondary Pending Tasks
- Complete verification of AI Reading translation layout after future modifications.
- Review whether AI Review Coach copy or panel density needs further tightening.
- Decide whether any unfinished chapter-specific enrichment data is still needed in vocabulary display or AI Reading word pools.

## 9. How a New Codex Conversation Should Continue

When starting a new Codex conversation, the new assistant should:

1. Read these files first:
   - `/Users/apple/Documents/ivy'challenge/AGENTS.md`
   - `/Users/apple/Documents/ivy'challenge/HANDOFF.md`
   - `/Users/apple/Documents/ivy'challenge/DECISIONS.md`
   - `/Users/apple/Documents/ivy'challenge/PROJECT_HANDOFF.md`

2. Do not reconstruct the entire project from chat history.

3. Treat the codebase as the final source of truth if any document and code differ.

4. First verify the top unfinished priority the user wants at that moment.

5. Make targeted changes only; avoid broad unrelated rewrites.

## Recommended Immediate Next Checks for a New Codex

If the user says "continue this project", the safest first action is:

1. inspect:
   - `/Users/apple/Documents/ivy'challenge/src/pages/AiReadingPage.tsx`
   - `/Users/apple/Documents/ivy'challenge/src/context/VocabularyContext.tsx`
   - `/Users/apple/Documents/ivy'challenge/src/data/personalVocabulary.ts`
2. run the app
3. verify whether double-click in AI Reading actually writes into My Vocabulary Bank
4. only then move to the next requested unfinished feature

## Suggested Resume Prompt For a New Codex Conversation

ivy can paste this:

```text
继续这个项目。先读取 AGENTS.md、HANDOFF.md、DECISIONS.md、PROJECT_HANDOFF.md，不要复述整个历史。先按 HANDOFF.md 里的 Next Action 开始，先检查 AI Reading 双击加入 My Vocabulary Bank 为什么没有稳定生效，再继续处理未完成项。
```

If ivy wants to start from Vocabulary Garden instead, use:

```text
继续这个项目。先读取 AGENTS.md、HANDOFF.md、DECISIONS.md、PROJECT_HANDOFF.md。不要复述整个历史。跳过旧聊天，直接基于当前代码实现 Vocabulary Garden，保持现有 Vocabulary Library、Word Card、Word List、Memory Box 逻辑不变。
```

If ivy wants to start from the cursor issue instead, use:

```text
继续这个项目。先读取 AGENTS.md、HANDOFF.md、DECISIONS.md、PROJECT_HANDOFF.md。不要复述整个历史。先修复系统页兔子 cursor：必须使用我原始提供的兔子图片，不要重画，只保留兔子轮廓，去掉轮廓外全部背景。
```

## Final Status Snapshot

The project is already well beyond scaffold stage. The main learning loop is present:
- landing entry
- chapter library
- word card review
- word list review
- AI reading
- personal vocabulary collection
- review analytics

The remaining work is now mostly about:
- polishing edge interactions
- resolving the cursor asset issue
- adding the next modules such as Vocabulary Garden and future personal-teacher capabilities

