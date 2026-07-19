import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";

import {
  DashboardShell,
  RunningStatsSkeleton,
} from "~/app/_components/dashboard";
import { StravaAuthorizeLink } from "~/app/_components/strava-authorize-link";
import {
  getRunningProfile,
  getStravaViewerRunningProfile,
  type RunningWeek,
} from "~/server/running-profile";
import {
  EARLIEST_RUNNING_YEAR,
  getBrisbaneYear,
  hasMetDistanceGoal,
  roundMetresToTenthKilometre,
} from "~/server/running-profile-logic";
import {
  readStravaViewerSession,
  STRAVA_SESSION_COOKIE,
} from "~/server/strava-session";

export const dynamic = "force-dynamic";

const YEAR_GOAL_METRES = 1_000_000;
const WEEK_GOAL_METRES = 20_000;
const BRISBANE_TIME_ZONE = "Australia/Brisbane";

const distanceFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  timeZone: BRISBANE_TIME_ZONE,
});

type HomeProps = {
  searchParams: Promise<{
    strava?: string | string[];
    year?: string | string[];
  }>;
};

const stravaNotices: Record<string, string> = {
  connected: "Your Strava runs are now shown for this browser session.",
  denied: "Strava access was cancelled. Jacob's stats are still shown.",
  disconnected: "The temporary Strava connection has been removed.",
  error: "Strava couldn't connect just now. Please try again.",
  invalid: "That Strava sign-in link expired. Please start again.",
  scope: "Activity access is needed to calculate your running progress.",
};

function getSelectedYear(
  value: string | string[] | undefined,
  currentYear: number,
) {
  const requestedYear = Array.isArray(value) ? value[0] : value;

  if (requestedYear === undefined) return currentYear;
  if (!/^\d{4}$/.test(requestedYear)) return currentYear;

  const parsedYear = Number(requestedYear);

  return Number.isInteger(parsedYear) &&
    parsedYear >= EARLIEST_RUNNING_YEAR &&
    parsedYear <= currentYear
    ? parsedYear
    : currentYear;
}

function getYearHref(year: number, currentYear: number) {
  return year === currentYear ? "/" : `/?year=${year}`;
}

function YearNavigation({
  currentYear,
  year,
}: {
  currentYear: number;
  year: number;
}) {
  const previousYear = year - 1;
  const nextYear = year + 1;
  const buttonClassName =
    "inline-flex min-w-28 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-sans text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300";
  const disabledClassName =
    "inline-flex min-w-28 cursor-not-allowed items-center justify-center rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 font-sans text-sm font-semibold text-slate-600";

  return (
    <nav
      aria-label="Choose running year"
      className="mb-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3"
    >
      {previousYear >= EARLIEST_RUNNING_YEAR ? (
        <Link
          aria-label={`View ${previousYear} running results`}
          className={`${buttonClassName} justify-self-start`}
          href={getYearHref(previousYear, currentYear)}
          prefetch={false}
        >
          <span aria-hidden="true">←</span>&nbsp;{previousYear}
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${disabledClassName} justify-self-start`}
        >
          Earlier
        </span>
      )}

      <div className="text-center">
        <p className="font-sans text-xs uppercase tracking-wider text-slate-500">
          Viewing
        </p>
        <p className="mt-1 text-2xl tabular-nums text-white">{year}</p>
      </div>

      {nextYear <= currentYear ? (
        <Link
          aria-label={`View ${nextYear} running results`}
          className={`${buttonClassName} justify-self-end`}
          href={getYearHref(nextYear, currentYear)}
          prefetch={false}
        >
          {nextYear}&nbsp;<span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${disabledClassName} justify-self-end`}
        >
          Latest
        </span>
      )}
    </nav>
  );
}

function formatDistance(metres: number) {
  const roundedMetres = roundMetresToTenthKilometre(metres);
  return `${distanceFormatter.format(roundedMetres / 1000)} km`;
}

function getProgress(total: number, goal: number) {
  return Math.min(100, Math.max(0, (total / goal) * 100));
}

function GoalProgress({
  goal,
  label,
  total,
}: {
  goal: number;
  label: string;
  total: number;
}) {
  const roundedTotal = roundMetresToTenthKilometre(total);
  const goalMet = roundedTotal >= goal;
  const progress = getProgress(roundedTotal, goal);

  return (
    <>
      <div
        aria-label={`${label}: ${formatDistance(total)} of ${formatDistance(goal)}`}
        aria-valuemax={goal / 1000}
        aria-valuemin={0}
        aria-valuenow={Math.min(roundedTotal, goal) / 1000}
        className="h-2.5 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            goalMet ? "bg-emerald-400" : "bg-cyan-400"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {goalMet
          ? roundedTotal === goal
            ? "Goal reached"
            : `${formatDistance(roundedTotal - goal)} beyond the goal`
          : `${formatDistance(goal - roundedTotal)} to go`}
      </p>
    </>
  );
}

function WeekRow({
  isCurrent,
  week,
}: {
  isCurrent: boolean;
  week: RunningWeek;
}) {
  const goalMet = hasMetDistanceGoal(week.total, WEEK_GOAL_METRES);
  const start = dateFormatter.format(new Date(week.start));
  const end = dateFormatter.format(new Date(week.end - 1));
  const runLabel = `${week.runCount} ${week.runCount === 1 ? "run" : "runs"}`;

  return (
    <li
      aria-current={isCurrent ? "date" : undefined}
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg text-white">
              {isCurrent ? "Current week" : `Week ${week.no}`}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 font-sans text-xs font-semibold ${
                goalMet
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {goalMet ? "Goal met" : runLabel}
            </span>
          </div>
          <p className="mt-1 font-sans text-sm text-slate-400">
            <time dateTime={new Date(week.start).toISOString()}>{start}</time>
            {" – "}
            <time dateTime={new Date(week.end - 1).toISOString()}>{end}</time>
            {goalMet ? ` · ${runLabel}` : null}
          </p>
        </div>
        <p className="shrink-0 text-xl tabular-nums text-white sm:text-2xl">
          {formatDistance(week.total)}
        </p>
      </div>
      <div className="mt-4">
        <GoalProgress
          goal={WEEK_GOAL_METRES}
          label={`${isCurrent ? "Current week" : `Week ${week.no}`} progress`}
          total={week.total}
        />
      </div>
    </li>
  );
}

async function RunningStats({
  currentTime,
  isViewer,
  year,
}: {
  currentTime: number;
  isViewer: boolean;
  year: number;
}) {
  const viewer = isViewer ? await getViewerSession() : undefined;

  if (isViewer && !viewer) {
    throw new Error("The temporary Strava viewer session has expired.");
  }

  const data = viewer
    ? await getStravaViewerRunningProfile(viewer.accessToken, year)
    : await getRunningProfile(year);
  const yearGoalMet = hasMetDistanceGoal(data.ytd, YEAR_GOAL_METRES);

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="year-progress-title"
        className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-400"
              id="year-progress-title"
            >
              {year} progress
            </h2>
            <p className="mt-2 text-4xl tabular-nums text-white sm:text-5xl">
              {formatDistance(data.ytd)}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 font-sans text-sm font-semibold ${
              yearGoalMet
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-cyan-400/15 text-cyan-300"
            }`}
          >
            {yearGoalMet ? "Goal met" : "1,000 km goal"}
          </span>
        </div>
        <div className="mt-5">
          <GoalProgress
            goal={YEAR_GOAL_METRES}
            label={`${year} progress`}
            total={data.ytd}
          />
        </div>
      </section>

      <section aria-labelledby="weekly-progress-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl text-white" id="weekly-progress-title">
            Weekly runs
          </h2>
          <p className="font-sans text-sm text-slate-400">
            20 km goal · Monday–Sunday
          </p>
        </div>

        {data.weeks.length > 0 ? (
          <ol className="space-y-3">
            {data.weeks.map((week) => (
              <WeekRow
                isCurrent={week.start <= currentTime && currentTime < week.end}
                key={week.start}
                week={week}
              />
            ))}
          </ol>
        ) : (
          <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 font-sans text-slate-300">
            Weekly tracking starts on the first Monday of the year.
          </p>
        )}
      </section>
    </div>
  );
}

function AccountSwitcher({ isViewer }: { isViewer: boolean }) {
  return (
    <details
      aria-label="Strava account"
      className="group mb-8 rounded-lg border border-slate-800 bg-slate-900/60"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 whitespace-nowrap px-4 py-2.5 font-sans text-sm font-semibold text-slate-200 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 [&::-webkit-details-marker]:hidden">
        <span>{isViewer ? "Viewing your runs" : "View my Strava stats"}</span>
        <span
          aria-hidden="true"
          className="text-slate-500 transition-transform group-open:rotate-180"
        >
          ↓
        </span>
      </summary>

      <div className="border-t border-slate-800 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-5">
        <p className="max-w-xl font-sans text-sm leading-5 text-slate-400">
          {isViewer
            ? "Your short-lived access token is encrypted in a browser-session cookie and is never saved to this app's database."
            : "Temporarily grant read-only access to your activities, including private activities. Nothing is added to this app's database."}
        </p>

        <div className="mt-3 flex shrink-0 flex-wrap gap-3 sm:mt-0 sm:justify-end">
          {isViewer ? (
            <>
              <Link
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 font-sans text-sm font-semibold text-slate-200 transition-colors hover:border-orange-400 hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                href="/api/strava/authorize"
                prefetch={false}
              >
                Switch account
              </Link>
              <form action="/api/strava/disconnect" method="post">
                <button
                  className="inline-flex items-center justify-center rounded-lg bg-slate-200 px-4 py-2 font-sans text-sm font-semibold text-slate-950 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-200"
                  type="submit"
                >
                  Back to Jacob
                </button>
              </form>
            </>
          ) : (
            <StravaAuthorizeLink />
          )}
        </div>
      </div>
    </details>
  );
}

function StravaNotice({ status }: { status?: string }) {
  const message = status ? stravaNotices[status] : undefined;

  return message ? (
    <p
      className="mb-5 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 font-sans text-sm text-cyan-100"
      role="status"
    >
      {message}
    </p>
  ) : null;
}

async function getViewerSession() {
  const cookieStore = await cookies();

  return readStravaViewerSession(cookieStore.get(STRAVA_SESSION_COOKIE)?.value);
}

export default async function Home({ searchParams }: HomeProps) {
  const now = new Date();
  const currentYear = getBrisbaneYear(now);
  const params = await searchParams;
  const year = getSelectedYear(params.year, currentYear);
  const viewer = await getViewerSession();
  const isViewer = Boolean(viewer);
  const rawStatus = Array.isArray(params.strava)
    ? params.strava[0]
    : params.strava;
  const title = isViewer ? "Your year in running" : undefined;

  return (
    <DashboardShell title={title}>
      <StravaNotice status={rawStatus} />
      <AccountSwitcher isViewer={isViewer} />
      <YearNavigation currentYear={currentYear} year={year} />
      <Suspense
        fallback={<RunningStatsSkeleton />}
        key={`${isViewer ? "viewer" : "owner"}-${year}`}
      >
        <RunningStats
          currentTime={now.getTime()}
          isViewer={isViewer}
          year={year}
        />
      </Suspense>
    </DashboardShell>
  );
}
