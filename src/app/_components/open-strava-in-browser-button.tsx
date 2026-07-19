const STRAVA_WEB_LOGIN_URL = "https://www.strava.com/login";

export function OpenStravaInBrowserButton() {
  return (
    <div className="mt-3">
      <a
        className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-orange-400 hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
        href={STRAVA_WEB_LOGIN_URL}
        rel="noreferrer"
        target="_blank"
      >
        Open Strava in browser
        <span aria-hidden="true">&nbsp;↗</span>
      </a>
    </div>
  );
}
