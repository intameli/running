"use client";

import { useState } from "react";

const STRAVA_DASHBOARD_URL = "https://www.strava.com/dashboard";

export function OpenStravaInBrowserButton() {
  const [wasBlocked, setWasBlocked] = useState(false);

  function openStrava() {
    const stravaTab = window.open("", "_blank");

    if (!stravaTab) {
      setWasBlocked(true);
      return;
    }

    stravaTab.opener = null;
    stravaTab.location.href = STRAVA_DASHBOARD_URL;
  }

  return (
    <div className="mt-3">
      <button
        className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-orange-400 hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
        onClick={openStrava}
        type="button"
      >
        Open Strava in browser
        <span aria-hidden="true">&nbsp;↗</span>
      </button>
      {wasBlocked ? (
        <p className="mt-2 text-sm text-amber-300" role="alert">
          Allow pop-ups for this site, then try again.
        </p>
      ) : null}
    </div>
  );
}
