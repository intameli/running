"use client";

import { DashboardShell } from "~/app/_components/dashboard";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <DashboardShell>
      <section
        aria-labelledby="error-title"
        className="rounded-2xl border border-rose-400/20 bg-slate-900/80 p-6"
        role="alert"
      >
        <p className="font-sans text-sm font-semibold uppercase tracking-wider text-rose-300">
          Data unavailable
        </p>
        <h2 className="mt-2 text-2xl text-white" id="error-title">
          The latest runs couldn&apos;t be loaded.
        </h2>
        <p className="mt-3 max-w-lg font-sans leading-6 text-slate-300">
          This is usually temporary. Try again in a moment to reconnect to the
          running data.
        </p>
        <button
          className="mt-5 rounded-lg bg-cyan-300 px-4 py-2 font-sans font-semibold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </DashboardShell>
  );
}
