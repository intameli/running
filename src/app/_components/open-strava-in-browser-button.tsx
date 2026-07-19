const STRAVA_WEB_ROUTE = "/api/strava/web";

export function OpenStravaInBrowserButton() {
  return (
    <div className="mt-3">
      <a
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-4 py-2 font-sans text-base font-medium text-slate-100 transition-colors hover:border-orange-400 hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
        href={STRAVA_WEB_ROUTE}
        rel="noreferrer"
        target="_blank"
      >
        Log out of Strava
        <span aria-hidden="true">&nbsp;↗</span>
      </a>
    </div>
  );
}
