type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent?: string;
};

export function PageShell({ eyebrow, title, description, accent }: PageShellProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr] lg:gap-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-taupe">{eyebrow}</p>
          <h2 className="max-w-4xl font-display text-5xl leading-tight tracking-tight md:text-6xl">
            {title}
          </h2>
          <p className="max-w-2xl text-base leading-8 text-taupe md:text-lg">{description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-line bg-white/70 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.25em] text-taupe">Status</p>
            <p className="mt-4 font-display text-2xl">Structure Ready</p>
            <p className="mt-2 text-sm leading-7 text-taupe">
              Routing and desktop layout are in place, ready for learning modules and data wiring.
            </p>
          </div>
          <div className="border border-line bg-white/70 p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.25em] text-taupe">Focus</p>
            <p className="mt-4 font-display text-2xl">Premium Simplicity</p>
            <p className="mt-2 text-sm leading-7 text-taupe">
              Large whitespace, calm tones, and restrained navigation define the base experience.
            </p>
          </div>
        </div>
      </div>

      <aside className="border border-line bg-white/75 p-8 shadow-card">
        <div
          className="h-full min-h-[360px] border border-line/70 p-8"
          style={{
            background:
              accent ??
              'radial-gradient(circle at top left, rgba(196, 174, 150, 0.32), transparent 52%), linear-gradient(180deg, rgba(255,255,255,0.55), rgba(245,240,232,0.95))',
          }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-taupe">Workspace Preview</p>
              <div className="space-y-3">
                <div className="h-3 w-20 rounded-full bg-ink/10" />
                <div className="h-3 w-36 rounded-full bg-ink/10" />
                <div className="h-3 w-28 rounded-full bg-ink/10" />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="h-24 border border-line/80 bg-white/60" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-28 border border-line/80 bg-white/60" />
                <div className="h-28 border border-line/80 bg-white/60" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
