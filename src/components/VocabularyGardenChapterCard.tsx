import { gardenStageMeta, gardenStageOrder, type GardenStage } from '../data/vocabularyGarden';

type VocabularyGardenChapterCardProps = {
  chapter: number;
  chapterLabel: string;
  topic: string;
  totalWords: number;
  learnedWords: number;
  progress: number;
  inactiveCount: number;
  averageStability: number;
  averageReviewStrength: number;
  stageCounts: Record<GardenStage, number>;
  growthCells: Array<{
    word: string;
    gardenStage: GardenStage;
    hasStarted: boolean;
  }>;
};

export function VocabularyGardenChapterCard({
  chapter,
  chapterLabel,
  topic,
  totalWords,
  learnedWords,
  progress,
  inactiveCount,
  averageStability,
  averageReviewStrength,
  stageCounts,
  growthCells,
}: VocabularyGardenChapterCardProps) {
  return (
    <article className="flex min-w-0 flex-col gap-5 border border-line/80 bg-white/68 p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">Chapter {chapterLabel}</p>
          <h3 className="mt-3 font-display text-[1.8rem] leading-tight text-ink">{topic}</h3>
        </div>
        <span className="shrink-0 bg-sand/55 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-taupe">
          {progress}%
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-line/70 bg-sand/24 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-taupe/90">Garden Field</p>
            <p className="text-sm text-taupe">{growthCells.length} vocabulary points</p>
          </div>

          <div className="mt-4 flex min-h-[210px] flex-wrap content-start gap-x-3.5 gap-y-4">
            {growthCells.map((item) => (
              item.hasStarted ? (
                <img
                  key={`${chapter}-${item.word}`}
                  src={gardenStageMeta[item.gardenStage].icon}
                  alt={gardenStageMeta[item.gardenStage].label}
                  title={`${item.word} · ${gardenStageMeta[item.gardenStage].label}`}
                  className="h-[1.5rem] w-[1.5rem] shrink-0 opacity-88"
                />
              ) : (
                <span
                  key={`${chapter}-${item.word}`}
                  title={`${item.word} · Not Started`}
                  className="h-[0.75rem] w-[0.75rem] shrink-0 rounded-full bg-[#d8d0c6]"
                />
              )
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 border border-line/70 bg-white/72 px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#d8d0c6]" />
              <span className="text-[11px] uppercase tracking-[0.24em] text-taupe/90">Not Started</span>
            </div>
            <span className="text-sm text-ink">{inactiveCount}</span>
          </div>
          {gardenStageOrder.map((stage) => (
            <div
              key={stage}
              className="flex items-center justify-between gap-3 border border-line/70 bg-white/72 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <img src={gardenStageMeta[stage].icon} alt="" aria-hidden="true" className="h-5 w-5 shrink-0 opacity-80" />
                <span className="text-[11px] uppercase tracking-[0.24em] text-taupe/90">
                  {gardenStageMeta[stage].label}
                </span>
              </div>
              <span className="text-sm text-ink">{stageCounts[stage]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line/70 pt-4 text-sm text-taupe">
        <span>{totalWords} words in this chapter</span>
        <span>
          {totalWords - inactiveCount} active · Stability {averageStability}% · Strength {averageReviewStrength}%
        </span>
      </div>
    </article>
  );
}
