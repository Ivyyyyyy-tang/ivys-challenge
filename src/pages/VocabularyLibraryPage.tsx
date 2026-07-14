import { useNavigate } from 'react-router-dom';
import { useVocabulary } from '../context/VocabularyContext';

export function VocabularyLibraryPage() {
  const navigate = useNavigate();
  const { chapterSummaries, todayLearned, todayReviewed } = useVocabulary();

  return (
    <section className="flex h-full flex-col gap-10">
      <header className="flex items-start justify-between gap-8 border-b border-line/70 pb-8">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.38em] text-taupe/90">Vocabulary Library</p>
          <h2 className="font-display text-5xl leading-none tracking-tight text-ink">Vocabulary Library</h2>
        </div>

        <div className="space-y-5 pt-1 text-right">
          <div className="flex items-baseline justify-end gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">Today Learned</p>
            <p className="text-[11px] uppercase leading-none tracking-[0.3em] text-taupe/90">
              {todayLearned}
            </p>
          </div>
          <div className="flex items-baseline justify-end gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">Today Reviewed</p>
            <p className="text-[11px] uppercase leading-none tracking-[0.3em] text-taupe/90">
              {todayReviewed}
            </p>
          </div>
        </div>
      </header>

      <div className="vocabulary-grid mt-3">
        {chapterSummaries.map((chapter) => {
          return (
            <article
              key={chapter.chapter}
              className="flex min-w-0 flex-col justify-between border border-line/80 bg-white/68 p-5 shadow-card"
              style={{
                aspectRatio: '16 / 9',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 text-center">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-taupe/90">{chapter.chapterLabel}</p>
                  <h3 className="mx-auto mt-3 max-w-[14ch] font-display text-[1.7rem] leading-[1.08] text-ink">
                    {chapter.topic}
                  </h3>
                </div>
                <span className="bg-sand/55 px-2.5 py-1 text-[11px] uppercase tracking-[0.24em] text-taupe">
                  {chapter.progress}%
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm text-taupe">
                  <span>Progress</span>
                  <span>
                    {chapter.learnedWords} / {chapter.totalWords}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e9dfd3]">
                  <div className="h-full rounded-full bg-ink/80" style={{ width: `${chapter.progress}%` }} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/vocabulary-library/chapter/${chapter.chapter}/word-card`)}
                  className="border border-ink px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-sand"
                >
                  Word Card
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/vocabulary-library/chapter/${chapter.chapter}/word-list`)}
                  className="border border-line bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-taupe transition-colors hover:border-taupe hover:text-ink"
                >
                  Word List
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
