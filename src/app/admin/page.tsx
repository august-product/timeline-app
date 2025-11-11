import { AdminWorkspace } from '@/components/admin/AdminWorkspace';

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-900/5 pb-16 pt-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--august-accent)]">
            Admin Console
          </p>
          <h1 className="text-3xl font-semibold text-[var(--august-ink)]">
            Manage August collections, documents, and launch rules
          </h1>
          <p className="mt-2 text-base text-[var(--august-muted)]">
            Configure stages, upload artifacts, and keep every collection aligned before timelines go
            live.
          </p>
        </header>

        <AdminWorkspace />
      </div>
    </main>
  );
}
