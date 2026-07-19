"use client";

import { useState } from "react";

export function StravaSwitchForm() {
  const [isPending, setIsPending] = useState(false);

  return (
    <form
      action="/api/strava/switch"
      method="post"
      onSubmit={() => setIsPending(true)}
    >
      <button
        aria-busy={isPending}
        className="relative inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 font-sans text-sm font-semibold text-slate-200 transition-colors hover:border-orange-400 hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 disabled:cursor-wait disabled:text-slate-500"
        disabled={isPending}
        type="submit"
      >
        <span className={isPending ? "invisible" : undefined}>
          Switch account
        </span>
        {isPending ? (
          <span
            aria-hidden="true"
            className="absolute h-4 w-4 rounded-full border-2 border-slate-500/30 border-t-slate-300 motion-safe:animate-spin"
          />
        ) : null}
      </button>
    </form>
  );
}
