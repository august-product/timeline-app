import { TimelineWorkspace } from '@/components/dashboard/TimelineWorkspace';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950/5 pb-16 pt-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--august-accent)]">
            August Timeline Control Tower
          </p>
          <h1 className="text-3xl font-semibold text-[var(--august-ink)]">
            Real-time visibility from acquisition to go-live
          </h1>
          <p className="max-w-3xl text-base text-[var(--august-muted)]">
            Leadership, operations, and marketing teams share a single source of truth for launches,
            rules, and stage ownership. Update actuals, review automation rules, and understand the
            downstream impact of any delay in seconds.
          </p>
        </header>

        <TimelineWorkspace />
      </div>
    </main>
  );
}
