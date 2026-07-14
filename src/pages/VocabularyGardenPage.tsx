import { useMemo } from 'react';
import { VocabularyGardenChapterCard } from '../components/VocabularyGardenChapterCard';
import { useVocabulary } from '../context/VocabularyContext';
import { type VocabularyWord } from '../data/vocabulary';

type GardenStage = 'dormant' | 'emergent' | 'rooted' | 'flourishing' | 'fading';

type ChapterGardenSummary = {
  chapter: number;
  chapterLabel: string;
  topic: string;
  totalWords: number;
  learnedWords: number;
  progress: number;
  stageCounts: Record<GardenStage, number>;
  stageSequence: GardenStage[];
};

const stageMeta: Array<{ id: GardenStage; label: string; note: string; tone: string }> = [
  { id: 'dormant', label: 'Dormant', note: 'Waiting for first stable contact.', tone: 'bg-[#d9d1c7]' },
  { id: 'emergent', label: 'Emergent', note: 'Recently learned, still delicate.', tone: 'bg-[#bca98f]' },
  { id: 'rooted', label: 'Rooted', note: 'Retention is forming with repetition.', tone: 'bg-[#8d9a7c]' },
  { id: 'flourishing', label: 'Flourishing', note: 'Confidently available in memory.', tone: 'bg-[#50664c]' },
  { id: 'fading', label: 'Fading', note: 'Needs attention after friction or reset.', tone: 'bg-[#8d6f63]' },
];

export function VocabularyGardenPage() {
  const { words, chapterSummaries, getPersonalVocabularyWords } = useVocabulary();

  const chapterGardenSummaries = useMemo<ChapterGardenSummary[]>(() => {
    return chapterSummaries.map((chapter) => {
      const chapterWords = words.filter((word) => word.chapter === chapter.chapter);
      const stageSequence = chapterWords.map(getGardenStage);
      const stageCounts = createEmptyStageCounts();

      stageSequence.forEach((stage) => {
        stageCounts[stage] += 1;
      });

      return {
        chapter: chapter.chapter,
        chapterLabel: chapter.chapterLabel,
        topic: chapter.topic,
        totalWords: chapter.totalWords,
        learnedWords: chapter.learnedWords,
        progress: chapter.progress,
        stageCounts,
        stageSequence,
      };
    });
  }, [chapterSummaries, words]);

  const globalStageCounts = useMemo(() => {
    return words.reduce((accumulator, word) => {
      accumulator[getGardenStage(word)] += 1;
      return accumulator;
    }, createEmptyStageCounts());
  }, [words]);

  const personalEntries = getPersonalVocabularyWords();
  const flourishingWords = globalStageCounts.flourishing;
  const activeGardenWords = words.filter((word) => getGardenStage(word) !== 'dormant').length;
  const strongestChapter = [...chapterGardenSummaries].sort((left, right) => right.progress - left.progress)[0];

  return (
    <section className="flex h-full flex-col gap-10">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-[11px] uppercase tracking-[0.38em] text-taupe/90">Vocabulary Garden</p>
          <h2 className="font-display text-5xl leading-none tracking-tight text-ink">Vocabulary Garden</h2>
          <p className="max-w-2xl text-sm leading-7 text-taupe">
            A quiet view of how your vocabulary is taking root across chapters, with each word reflected as living
            growth rather than a flat checklist.
          </p>
        </div>

        <div className="space-y-4 pt-1 text-right">
          <GardenStat label="Active Growth" value={String(activeGardenWords)} />
          <GardenStat label="Flourishing Words" value={String(flourishingWords)} />
          <GardenStat label="Personal Bank" value={String(personalEntries.length)} />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-line/80 bg-white/68 p-6 shadow-card">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">Whole Garden</p>
              <h3 className="mt-3 font-display text-[1.9rem] leading-tight text-ink">
                Each chapter becomes a cultivation zone, and each studied word leaves a visible trace of growth.
              </h3>
            </div>
            <div className="min-w-[170px] space-y-3 text-right text-sm text-taupe">
              <p>{words.length} total vocabulary words</p>
              <p>{chapterGardenSummaries.length} chapter zones</p>
              <p>{strongestChapter ? `Highest growth: Chapter ${strongestChapter.chapterLabel}` : 'No growth yet'}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stageMeta.map((stage) => (
              <article key={stage.id} className="border border-line/70 bg-sand/22 px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className={['h-3.5 w-3.5 rounded-full', stage.tone].join(' ')} />
                  <p className="text-[11px] uppercase tracking-[0.28em] text-taupe/90">{stage.label}</p>
                </div>
                <p className="mt-3 font-display text-[2rem] leading-none text-ink">{globalStageCounts[stage.id]}</p>
                <p className="mt-3 text-sm leading-7 text-taupe">{stage.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-line/80 bg-white/68 p-6 shadow-card">
          <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">Growth Notes</p>
          <div className="mt-5 space-y-4 text-sm leading-7 text-taupe">
            <p>
              The garden reads your existing study truth only. It does not replace the vocabulary system, seven-box
              process, or word-card decisions.
            </p>
            <p>
              Words move from quiet presence to stable growth according to recognition, review strength, and visible
              signs of friction.
            </p>
            <p>
              Phase 1 focuses on legibility: chapter sections, calm visualization, and basic growth statistics across
              the full vocabulary landscape.
            </p>
          </div>
        </section>
      </div>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">Chapter Sections</p>
            <h3 className="mt-3 font-display text-[2rem] leading-tight text-ink">Growth by cultivation zone</h3>
          </div>
          <p className="max-w-xl text-right text-sm leading-7 text-taupe">
            Each chapter uses the current learning state to show where the garden is quiet, stabilizing, thriving, or
            fading.
          </p>
        </div>

        <div className="grid gap-6 2xl:grid-cols-2">
          {chapterGardenSummaries.map((chapter) => (
            <VocabularyGardenChapterCard
              key={chapter.chapter}
              chapter={chapter.chapter}
              chapterLabel={chapter.chapterLabel}
              topic={chapter.topic}
              totalWords={chapter.totalWords}
              learnedWords={chapter.learnedWords}
              progress={chapter.progress}
              stageCounts={chapter.stageCounts}
              stageSequence={chapter.stageSequence}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function GardenStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-end gap-3">
      <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">{label}</p>
      <p className="text-[11px] uppercase leading-none tracking-[0.3em] text-taupe/90">{value}</p>
    </div>
  );
}

function getGardenStage(word: VocabularyWord): GardenStage {
  const memoryDepth = word.memory.filter(Boolean).length;
  const totalMarks = word.memoryMarks.filter((mark) => mark !== 'empty').length;
  const crossCount = word.memoryMarks.filter((mark) => mark === 'cross').length;
  const attempts = word.spelling.attempts;
  const errors = word.spelling.errors;
  const hasActivity = memoryDepth > 0 || attempts > 0 || totalMarks > 0 || word.memoryHistory.length > 0;

  if (!hasActivity) {
    return 'dormant';
  }

  const hasMeaningfulSetback =
    word.lastReviewAction === 'unknown' || word.memoryHistory.length > 0 || (crossCount >= 3 && crossCount >= errors);

  if (hasMeaningfulSetback && memoryDepth <= 2) {
    return 'fading';
  }

  if (memoryDepth >= 6 && (attempts === 0 || word.spelling.correct >= Math.max(1, attempts - 1))) {
    return 'flourishing';
  }

  if (memoryDepth >= 3 || word.spelling.correct >= 2 || totalMarks >= 4) {
    return 'rooted';
  }

  if (hasMeaningfulSetback) {
    return 'fading';
  }

  return 'emergent';
}

function createEmptyStageCounts(): Record<GardenStage, number> {
  return {
    dormant: 0,
    emergent: 0,
    rooted: 0,
    flourishing: 0,
    fading: 0,
  };
}
