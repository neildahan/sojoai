import Link from 'next/link';

/**
 * Public landing page placeholder.
 * Exercises the locked design tokens (warm-* / indigo-* palettes, Fraunces display,
 * Jakarta body, custom shadow tokens) so we know the theme is wired correctly.
 * Real landing copy and components land in Phase 3.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-8 py-24">
      <span className="font-mono text-xs tracking-widest text-warm-400 uppercase">
        ✦ Sojo AI · v0.0.0
      </span>
      <h1 className="mt-4 font-display text-5xl leading-tight font-medium text-warm-900 sm:text-6xl">
        Built for <em className="text-indigo-600">humans</em>,
        <br />
        powered by <em className="text-indigo-600">agents</em>.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-warm-500">
        Hire a virtual team of ten specialists. They talk to each other, ship real deliverables,
        and run your standup — so you can build without hiring.
      </p>
      <div className="mt-10 flex items-center gap-3">
        <Link
          href="/app"
          className="inline-flex h-11 items-center rounded-md bg-warm-900 px-6 text-sm font-medium text-warm-50 shadow-card transition hover:-translate-y-px"
        >
          Open the workspace
        </Link>
        <a
          href="https://github.com/anthropics/claude-code"
          className="inline-flex h-11 items-center rounded-md border border-warm-200 bg-surface-card px-6 text-sm font-medium text-warm-800 shadow-desk transition hover:bg-warm-50"
        >
          Read the docs
        </a>
      </div>
    </main>
  );
}
