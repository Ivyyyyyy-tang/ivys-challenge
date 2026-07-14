import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import systemAvatar from '../assets/system-avatar.jpg';

export function LandingPage() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="flex min-h-[calc(100vh-3rem)] flex-1 flex-col justify-between border border-line/70 bg-white/40 px-8 py-8 shadow-card md:px-12 md:py-10 lg:px-16 lg:py-14">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-line bg-white/80 shadow-sm">
            <img src={systemAvatar} alt="Ivy avatar" className="h-full w-full object-cover" />
          </div>
          <p className="font-display text-xl tracking-[0.02em] text-ink">
            See it. Move beyond it.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.32em] text-taupe/90">Current Time</p>
          <p className="mt-3 font-display text-3xl tracking-[0.08em] text-ink">{time}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.42em] text-taupe/90">
          Private English Learning Space
        </p>
        <h1 className="mt-8 font-display text-5xl tracking-tight text-ink md:text-6xl lg:text-[4.5rem]">
          Ivy&apos;s Challenge
        </h1>
        <Link
          to="/vocabulary-library"
          className="mt-16 inline-flex min-w-36 items-center justify-center border border-ink px-10 py-4 text-sm uppercase tracking-[0.26em] text-ink transition-colors hover:bg-ink hover:text-sand"
        >
          Words
        </Link>
      </div>

      <div aria-hidden="true" className="h-12" />
    </section>
  );
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
