import Link from "next/link";
import { Suspense } from "react";

import {
  DashboardShell,
  RunningStatsSkeleton,
} from "~/app/_components/dashboard";
import { getRunningProfile, type RunningWeek } from "~/server/running-profile";
import {
  EARLIEST_RUNNING_YEAR,
  getBrisbaneYear,
} from "~/server/running-profile-logic";

export const dynamic = "force-dynamic";

const YEAR_GOAL_METRES = 1_000_000;
const WEEK_GOAL_METRES = 20_000;
const BRISBANE_TIME_ZONE = "Australia/Brisbane";

const distanceFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const preciseDistanceFormatter = new Intl.NumberFormat("en-AU", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  timeZone: BRISBANE_TIME_ZONE,
});

type HomeProps = {
  searchParams: Promise<{ year?: string | string[] }>;
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

function formatDistance(metres: number, precise = false) {
  const formatter = precise ? preciseDistanceFormatter : distanceFormatter;
  return `${formatter.format(metres / 1000)} km`;
}

function formatGoalDistance(metres: number, goal: number) {
  const isNearGoal = metres !== goal && Math.abs(goal - metres) < 1_000;
  return formatDistance(metres, isNearGoal);
}

function formatDifference(metres: number) {
  if (metres < 1_000) {
    return `${Math.max(1, Math.ceil(metres))} m`;
  }

  return formatDistance(metres);
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
  const goalMet = total >= goal;
  const progress = getProgress(total, goal);

  return (
    <>
      <div
        aria-label={`${label}: ${formatGoalDistance(total, goal)} of ${formatDistance(goal)}`}
        aria-valuemax={goal / 1000}
        aria-valuemin={0}
        aria-valuenow={Number((Math.min(total, goal) / 1000).toFixed(1))}
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
          ? total === goal
            ? "Goal reached"
            : `${formatDifference(total - goal)} beyond the goal`
          : `${formatDifference(goal - total)} to go`}
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
  const goalMet = week.total >= WEEK_GOAL_METRES;
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
          {formatGoalDistance(week.total, WEEK_GOAL_METRES)}
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
  year,
}: {
  currentTime: number;
  year: number;
}) {
  const data = await getRunningProfile(year);
  const yearGoalMet = data.ytd >= YEAR_GOAL_METRES;

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
              {formatGoalDistance(data.ytd, YEAR_GOAL_METRES)}
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

export default async function Home({ searchParams }: HomeProps) {
  const now = new Date();
  const currentYear = getBrisbaneYear(now);
  const year = getSelectedYear((await searchParams).year, currentYear);

  return (
    <DashboardShell>
      <YearNavigation currentYear={currentYear} year={year} />
      <Suspense fallback={<RunningStatsSkeleton />} key={year}>
        <RunningStats currentTime={now.getTime()} year={year} />
      </Suspense>
    </DashboardShell>
  );
}
