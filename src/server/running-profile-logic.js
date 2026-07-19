const BRISBANE_OFFSET_MS = 10 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const EARLIEST_RUNNING_YEAR = 2009;

/**
 * @typedef {object} Activity
 * @property {number} distance
 * @property {string} start_date
 * @property {string} type
 */

/**
 * @typedef {object} RunningWeek
 * @property {number} end
 * @property {number} no
 * @property {number} runCount
 * @property {number} start
 * @property {number} total
 */

/**
 * @param {Date} now
 */
export function getBrisbaneYear(now) {
  return new Date(now.getTime() + BRISBANE_OFFSET_MS).getUTCFullYear();
}

/**
 * @param {number} year
 */
export function getYearStart(year) {
  return Date.UTC(year, 0, 1) - BRISBANE_OFFSET_MS;
}

/**
 * @param {number} year
 */
function getFirstMonday(year) {
  const newYearsDay = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const daysUntilMonday = (8 - newYearsDay) % 7;

  return Date.UTC(year, 0, 1 + daysUntilMonday) - BRISBANE_OFFSET_MS;
}

/**
 * @param {Date} now
 * @param {number} year
 * @returns {RunningWeek[]}
 */
export function buildWeeks(now, year) {
  const firstMonday = getFirstMonday(year);
  const weekCount =
    now.getTime() < firstMonday
      ? 0
      : Math.floor((now.getTime() - firstMonday) / WEEK_MS) + 1;

  return Array.from({ length: weekCount }, (_, index) => {
    const start = firstMonday + index * WEEK_MS;

    return {
      end: start + WEEK_MS,
      no: index + 1,
      runCount: 0,
      start,
      total: 0,
    };
  });
}

/**
 * @param {Activity[]} activities
 * @param {Date} now
 */
export function aggregateRuns(activities, now) {
  const year = getBrisbaneYear(now);
  const yearStart = getYearStart(year);
  const yearEnd = getYearStart(year + 1);
  const weeks = buildWeeks(now, year);
  const firstWeekStart = weeks[0]?.start;
  let ytd = 0;

  for (const activity of activities) {
    if (activity.type !== "Run") continue;

    const startedAt = new Date(activity.start_date).getTime();
    if (!Number.isFinite(startedAt)) continue;

    if (startedAt >= yearStart && startedAt < yearEnd) {
      ytd += activity.distance;
    }

    if (firstWeekStart === undefined || startedAt < firstWeekStart) continue;

    const weekIndex = Math.floor((startedAt - firstWeekStart) / WEEK_MS);
    const week = weeks[weekIndex];

    if (week && startedAt >= week.start && startedAt < week.end) {
      week.runCount += 1;
      week.total += activity.distance;
    }
  }

  return { weeks: weeks.reverse(), ytd };
}
