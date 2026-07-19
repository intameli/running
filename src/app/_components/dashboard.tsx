import type { ReactNode } from "react";

function PixelAccent() {
  return (
    <svg
      aria-hidden="true"
      className="mb-3 h-7 w-[120px]"
      focusable="false"
      shapeRendering="crispEdges"
      viewBox="0 0 120 28"
    >
      <g className="fill-cyan-300">
        <rect height="4" opacity="0.35" width="12" x="0" y="20" />
        <rect height="4" opacity="0.55" width="12" x="8" y="16" />
        <rect height="4" opacity="0.75" width="12" x="16" y="12" />
        <rect height="4" width="12" x="24" y="8" />
        <rect height="4" opacity="0.75" width="12" x="32" y="12" />
        <rect height="4" opacity="0.55" width="12" x="40" y="16" />
        <rect height="4" opacity="0.35" width="12" x="48" y="20" />
        <rect height="4" opacity="0.5" width="12" x="56" y="20" />
        <rect height="4" opacity="0.7" width="12" x="64" y="16" />
        <rect height="4" width="12" x="72" y="12" />
        <rect height="4" opacity="0.7" width="12" x="80" y="16" />
        <rect height="4" opacity="0.5" width="12" x="88" y="20" />
      </g>
      <g className="fill-orange-400">
        <rect height="4" width="4" x="104" y="0" />
        <rect height="4" width="12" x="100" y="4" />
        <rect height="4" width="4" x="104" y="8" />
      </g>
      <g className="fill-slate-600">
        <rect height="4" width="20" x="0" y="24" />
        <rect height="4" width="32" x="24" y="24" />
        <rect height="4" width="20" x="60" y="24" />
        <rect height="4" width="16" x="84" y="24" />
        <rect height="4" width="12" x="108" y="24" />
      </g>
      <rect className="fill-orange-100" height="4" width="4" x="104" y="4" />
    </svg>
  );
}

export function DashboardShell({
  children,
  description = "Progress toward a 1,000 km year, one 20 km week at a time.",
  title = "Jacob's year in running",
}: {
  children: ReactNode;
  description?: string;
  title?: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 sm:mb-10">
          <PixelAccent />
          <h1 className="text-4xl leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            {description}
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}

export function RunningStatsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="space-y-8 motion-safe:animate-pulse"
      role="status"
    >
      <span className="sr-only">Loading running progress</span>

      <section
        aria-hidden="true"
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6"
      >
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-20 rounded bg-slate-700" />
            <div className="h-10 w-40 rounded bg-slate-700" />
          </div>
          <div className="h-7 w-24 rounded-full bg-slate-700" />
        </div>
        <div className="mt-5 h-2.5 w-full rounded-full bg-slate-800">
          <div className="h-full w-1/2 rounded-full bg-slate-700" />
        </div>
        <div className="mt-3 h-3 w-36 rounded bg-slate-800" />
      </section>

      <section aria-hidden="true">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="h-7 w-32 rounded bg-slate-800" />
          <div className="h-4 w-36 rounded bg-slate-800" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              key={index}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-5 w-28 rounded bg-slate-700" />
                  <div className="h-3 w-36 rounded bg-slate-800" />
                </div>
                <div className="h-7 w-20 rounded bg-slate-700" />
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
