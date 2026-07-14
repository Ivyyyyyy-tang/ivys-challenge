type GardenStage = 'dormant' | 'emergent' | 'rooted' | 'flourishing' | 'fading';

type VocabularyGardenChapterCardProps = {
  chapter: number;
  chapterLabel: string;
  topic: string;
  totalWords: number;
  learnedWords: number;
  progress: number;
  stageCounts: Record<GardenStage, number>;
  stageSequence: GardenStage[];
};

const stageTone: Record<GardenStage, string> = {
  dormant: 'bg-[#d9d1c7]',
  emergent: 'bg-[#bca98f]',
  rooted: 'bg-[#8d9a7c]',
  flourishing: 'bg-[#50664c]',
  fading: 'bg-[#8d6f63]',
};

const stageLabel: Record<GardenStage, string> = {
  dormant: 'Dormant',
  emergent: 'Emergent',
  rooted: 'Rooted',
  flourishing: 'Flourishing',
  fading: 'Fading',
};

export function VocabularyGardenChapterCard({
  chapter,
  chapterLabel,
  topic,
  totalWords,
  learnedWords,
  progress,
  stageCounts,
  stageSequence,
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
            <p className="text-sm text-taupe">{learnedWords} active words</p>
          </div>

          <div className="mt-4 flex min-h-[140px] flex-wrap content-start gap-2">
            {stageSequence.map((stage, index) => (
              <span
                key={`${chapter}-${index}`}
                title={stageLabel[stage]}
                className={[
                  'h-3.5 w-3.5 rounded-full border border-white/40 shadow-[0_0_0_1px_rgba(32,26,21,0.04)]',
                  stageTone[stage],
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {(['dormant', 'emergent', 'rooted', 'flourishing', 'fading'] as GardenStage[]).map((stage) => (
            <div
              key={stage}
              className="flex items-center justify-between gap-3 border border-line/70 bg-white/72 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <span className={['h-3 w-3 rounded-full', stageTone[stage]].join(' ')} />
                <span className="text-[11px] uppercase tracking-[0.24em] text-taupe/90">{stageLabel[stage]}</span>
              </div>
              <span className="text-sm text-ink">{stageCounts[stage]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line/70 pt-4 text-sm text-taupe">
        <span>{totalWords} words in this chapter</span>
        <span>{progress >= 60 ? 'Stable cultivation zone' : 'Still in active growth'}</span>
      </div>
    </article>
  );
}
