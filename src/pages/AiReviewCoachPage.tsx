import { useMemo } from 'react';
import { useVocabulary } from '../context/VocabularyContext';

type WeakWord = {
  id: string;
  word: string;
  reason: string;
  score: number;
};

export function AiReviewCoachPage() {
  const { words, todayLearned, todayReviewed, getPersonalVocabularyWords } = useVocabulary();

  const report = useMemo(() => {
    const reviewedWords = words.filter((word) => word.spelling.attempts > 0);
    const unknownWords = words.filter((word) => word.lastReviewAction === 'unknown');
    const wordsWithResets = words.filter((word) => word.memoryHistory.length > 0);
    const totalMarks = words.reduce(
      (accumulator, word) => {
        const checks = word.memoryMarks.filter((mark) => mark === 'check').length;
        const crosses = word.memoryMarks.filter((mark) => mark === 'cross').length;
        return {
          checks: accumulator.checks + checks,
          crosses: accumulator.crosses + crosses,
        };
      },
      { checks: 0, crosses: 0 },
    );

    const totalSpellingAttempts = words.reduce((sum, word) => sum + word.spelling.attempts, 0);
    const totalSpellingCorrect = words.reduce((sum, word) => sum + word.spelling.correct, 0);
    const spellingAccuracy =
      totalSpellingAttempts === 0 ? 0 : Math.round((totalSpellingCorrect / totalSpellingAttempts) * 100);

    const personalReadingWords = getPersonalVocabularyWords().filter((entry) => entry.source.label === 'AI Reading');
    const readingReviewedCount = personalReadingWords.filter((entry) => entry.word.spelling.attempts > 0).length;

    const weakWords = words
      .map<WeakWord | null>((word) => {
        const spellingErrors = word.spelling.errors;
        const resetCount = word.memoryHistory.length;
        const unknownCount = word.lastReviewAction === 'unknown' ? 1 : 0;
        const unsureCount = Math.max(0, word.spelling.attempts - word.spelling.correct - word.spelling.errors);
        const score = spellingErrors * 3 + resetCount * 4 + unknownCount * 2 + unsureCount;

        if (score <= 0) return null;

        let reason = 'review friction';
        if (resetCount > 0) {
          reason = 'memory reset';
        } else if (spellingErrors > 0) {
          reason = 'spelling errors';
        } else if (unknownCount > 0) {
          reason = 'marked unknown';
        } else if (unsureCount > 0) {
          reason = 'hesitation';
        }

        return {
          id: word.id,
          word: word.word,
          reason,
          score,
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6) as WeakWord[];

    return {
      weakWords,
      sevenBoxCheckRate:
        totalMarks.checks + totalMarks.crosses === 0
          ? 0
          : Math.round((totalMarks.checks / (totalMarks.checks + totalMarks.crosses)) * 100),
      sevenBoxCompleted: totalMarks.checks + totalMarks.crosses,
      resetCycles: wordsWithResets.reduce((sum, word) => sum + word.memoryHistory.length, 0),
      spellingAccuracy,
      totalSpellingAttempts,
      unknownWords: unknownWords.length,
      readingPerformance:
        personalReadingWords.length === 0 ? 0 : Math.round((readingReviewedCount / personalReadingWords.length) * 100),
      readingReviewedCount,
      readingTrackedCount: personalReadingWords.length,
    };
  }, [getPersonalVocabularyWords, words]);

  return (
    <section className="flex h-full flex-col gap-10">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-8">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.38em] text-taupe/90">AI Review Coach</p>
          <h2 className="font-display text-5xl leading-none tracking-tight text-ink">Ivy's AI Coach</h2>
        </div>

        <div className="space-y-4 pt-1 text-right">
          <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">Today&apos;s Report</p>
          <div className="space-y-2 text-sm text-taupe">
            <div className="flex items-baseline justify-end gap-3">
              <span className="uppercase tracking-[0.24em]">Learned</span>
              <span>{todayLearned} words</span>
            </div>
            <div className="flex items-baseline justify-end gap-3">
              <span className="uppercase tracking-[0.24em]">Reviewed</span>
              <span>{todayReviewed} words</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-line/80 bg-white/68 p-6 shadow-card">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">Today&apos;s Report</p>
              <h3 className="mt-3 font-display text-[1.85rem] leading-tight text-ink">
                Review behavior is visible now, so tomorrow can be narrower and sharper.
              </h3>
            </div>
            <div className="min-w-[170px] space-y-3 text-right text-sm text-taupe">
              <p>{report.spellingAccuracy}% spelling accuracy</p>
              <p>{report.resetCycles} reset cycle{report.resetCycles === 1 ? '' : 's'}</p>
              <p>{report.unknownWords} unknown marks</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Seven Box Performance"
              value={`${report.sevenBoxCheckRate}%`}
              note={`${report.sevenBoxCompleted} completed box marks`}
            />
            <MetricCard
              label="Reset Cycles"
              value={String(report.resetCycles)}
              note="Memory-box restarts after difficult rounds"
            />
            <MetricCard
              label="Spelling Accuracy"
              value={`${report.spellingAccuracy}%`}
              note={`${report.totalSpellingAttempts} total spelling attempts`}
            />
            <MetricCard
              label="Unknown Words"
              value={String(report.unknownWords)}
              note="Words last marked as unknown"
            />
            <MetricCard
              label="Reading Performance"
              value={`${report.readingPerformance}%`}
              note={`${report.readingReviewedCount} of ${report.readingTrackedCount} AI Reading words reviewed`}
            />
          </div>
        </section>

        <section className="border border-line/80 bg-white/68 p-6 shadow-card">
          <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">Weak Words</p>
          <div className="mt-5 space-y-4">
            {report.weakWords.length > 0 ? (
              report.weakWords.map((item) => (
                <article key={item.id} className="border border-line/70 bg-sand/26 px-4 py-4">
                  <p className="font-display text-[1.7rem] leading-none text-ink">{item.word}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-taupe/90">Reason</p>
                  <p className="mt-1 text-sm text-taupe">{item.reason}</p>
                </article>
              ))
            ) : (
              <div className="border border-line/70 bg-sand/22 px-4 py-6 text-sm leading-7 text-taupe">
                No weak-word signal yet. Start word cards or word lists and the coach will surface friction here.
              </div>
            )}
          </div>
        </section>
      </div>

    </section>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="border border-line/70 bg-sand/22 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.28em] text-taupe/90">{label}</p>
      <p className="mt-3 font-display text-[2rem] leading-none text-ink">{value}</p>
      <p className="mt-3 text-sm leading-7 text-taupe">{note}</p>
    </article>
  );
}
