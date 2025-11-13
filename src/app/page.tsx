import { TimelineWorkspace } from '@/components/dashboard/TimelineWorkspace';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950/5 pb-16 pt-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-semibold capitalize text-[var(--august-ink)]">
            Visibility From Acquisition To Go-Live
          </h1>
          <h2 className="text-sm font-semibold tracking-[0.15em] text-[#7f9186]">
            August Timeline Control Tower
          </h2>
        </header>

        <TimelineWorkspace />
      </div>
    </main>
  );
}
