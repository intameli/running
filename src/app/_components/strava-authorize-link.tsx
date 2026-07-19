"use client";

import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";

export function StravaAuthorizeLink({
  children = "View my Strava stats",
}: {
  children?: ReactNode;
}) {
  const [isPending, setIsPending] = useState(false);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const isStandardNavigation =
      event.button === 0 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey;

    if (isStandardNavigation) setIsPending(true);
  }

  return (
    <Link
      aria-busy={isPending}
      aria-label={isPending ? "Opening Strava" : undefined}
      className="relative inline-flex items-center justify-center rounded-lg bg-[#fc4c02] px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#e34402] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
      href="/api/strava/authorize"
      onClick={handleClick}
      prefetch={false}
    >
      <span className={isPending ? "invisible" : undefined}>{children}</span>
      {isPending ? (
        <span
          aria-hidden="true"
          className="absolute h-4 w-4 rounded-full border-2 border-white/30 border-t-white motion-safe:animate-spin"
        />
      ) : null}
    </Link>
  );
}
