import { useMemo, useState } from 'react';
import { VocabularyGardenChapterCard } from '../components/VocabularyGardenChapterCard';
import { useVocabulary } from '../context/VocabularyContext';
import {
  calculateGardenGrowthState,
  gardenStageMeta,
  gardenStageOrder,
  summarizeChapterGardenGrowth,
  type ChapterGardenGrowthSummary,
} from '../data/vocabularyGarden';

export function VocabularyGardenPage() {
  const { words, chapterSummaries, getPersonalVocabularyWords } = useVocabulary();
  const [wholeGardenCollapsed, setWholeGardenCollapsed] = useState(false);

  const chapterGardenSummaries = useMemo<ChapterGardenGrowthSummary[]>(() => {
    return chapterSummaries.map((chapter) => {
      const chapterWords = words.filter((word) => word.chapter === chapter.chapter);
      return summarizeChapterGardenGrowth(chapter, chapterWords);
    });
  }, [chapterSummaries, words]);

  const globalStageCounts = useMemo(() => {
    return words.reduce(
      (accumulator, word) => {
      const state = calculateGardenGrowthState(word);
        if (!state.hasStarted) {
          accumulator.inactive += 1;
          return accumulator;
        }

        accumulator[state.gardenStage] += 1;
      return accumulator;
      },
      {
        inactive: 0,
        seed: 0,
        sprout: 0,
        growing: 0,
        tree: 0,
        'ancient-tree': 0,
      },
    );
  }, [words]);

  const personalEntries = getPersonalVocabularyWords();
  const flourishingWords = globalStageCounts.tree + globalStageCounts['ancient-tree'];
  const activeGardenWords = words.length - globalStageCounts.inactive;
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

        <div className="flex flex-col items-end gap-4 pt-1 text-right">
          <GardenStat label="Active Growth" value={String(activeGardenWords)} />
          <GardenStat label="Flourishing Words" value={String(flourishingWords)} />
          <GardenStat label="Personal Bank" value={String(personalEntries.length)} />
          <button
            type="button"
            onClick={() => setWholeGardenCollapsed((value) => !value)}
            aria-label={wholeGardenCollapsed ? 'Expand Whole Garden' : 'Collapse Whole Garden'}
            className="group relative mt-1 flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full border border-line/80 bg-[radial-gradient(circle_at_32%_30%,rgba(255,255,255,0.95),rgba(245,240,232,0.9)_42%,rgba(233,223,211,0.95)_100%)] shadow-[0_16px_36px_rgba(201,185,167,0.22)] transition-all hover:border-taupe/60 hover:shadow-[0_18px_40px_rgba(180,160,137,0.26)]"
          >
            <span className="pointer-events-none absolute inset-[0.38rem] rounded-full border border-white/60" />
            <span className="pointer-events-none absolute inset-[0.92rem] rounded-full border border-line/60" />
            <span className="pointer-events-none absolute left-[1.18rem] top-[1.08rem] h-1.5 w-1.5 rounded-full bg-[#efe7dc]" />
            <img
              src={gardenStageMeta.seed.icon}
              alt=""
              aria-hidden="true"
              className="relative z-10 h-6 w-6 opacity-85 transition-transform group-hover:scale-[1.04]"
            />
            <span className="absolute -bottom-4.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.22em] text-taupe/85">
              {wholeGardenCollapsed ? 'Open Garden' : 'Fold Garden'}
            </span>
          </button>
        </div>
      </header>

      <div className="max-w-none">
        {wholeGardenCollapsed ? (
          <div className="hidden" />
        ) : (
          <section className="border border-line/80 bg-white/68 p-6 shadow-card">
            <div className="flex items-start justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">Whole Garden</p>
                <h3 className="mt-3 font-display text-[1.72rem] leading-tight text-ink">
                  Each chapter becomes a cultivation zone, and each studied word leaves a visible trace of growth.
                </h3>
              </div>
              <div className="min-w-[170px] space-y-3 text-right text-sm text-taupe">
                <p>{words.length} total vocabulary words</p>
                <p>{chapterGardenSummaries.length} chapter zones</p>
                <p>{strongestChapter ? `Highest growth: Chapter ${strongestChapter.chapterLabel}` : 'No growth yet'}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <article className="border border-line/70 bg-sand/22 px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#d8d0c6]" />
                  <p className="text-[11px] uppercase tracking-[0.28em] text-taupe/90">Not Started</p>
                </div>
                <p className="mt-3 font-display text-[2rem] leading-none text-ink">{globalStageCounts.inactive}</p>
                <p className="mt-3 text-sm leading-7 text-taupe">Quiet words that have not entered active study yet.</p>
              </article>
              {gardenStageOrder.map((stage) => (
                <article key={stage} className="border border-line/70 bg-sand/22 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img src={gardenStageMeta[stage].icon} alt="" aria-hidden="true" className="h-6 w-6 shrink-0 opacity-85" />
                    <p className="text-[11px] uppercase tracking-[0.28em] text-taupe/90">
                      {gardenStageMeta[stage].label}
                    </p>
                  </div>
                  <p className="mt-3 font-display text-[2rem] leading-none text-ink">{globalStageCounts[stage]}</p>
                  <p className="mt-3 text-sm leading-7 text-taupe">{gardenStageMeta[stage].note}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">Chapter Sections</p>
            <h3 className="mt-3 font-display text-[2rem] leading-tight text-ink">Growth by cultivation zone</h3>
          </div>
          <p className="max-w-xl text-right text-sm leading-7 text-taupe">
            Each chapter now surfaces representative vocabulary growth cards so the garden reads as language growth,
            not just as abstract statistics.
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
              inactiveCount={chapter.inactiveCount}
              averageStability={chapter.averageStability}
              averageReviewStrength={chapter.averageReviewStrength}
              stageCounts={chapter.stageCounts}
              growthCells={chapter.states.map((state) => ({
                word: words.find((word) => word.id === state.wordId)?.word ?? state.wordId,
                gardenStage: state.gardenStage,
                hasStarted: state.hasStarted,
              }))}
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
