import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateRuns,
  buildWeeks,
  getBrisbaneYear,
  getYearStart,
  hasMetDistanceGoal,
  roundMetresToTenthKilometre,
} from "../src/server/running-profile-logic.js";

test("the running year rolls over at midnight in Brisbane", () => {
  assert.equal(getBrisbaneYear(new Date("2025-12-31T13:59:59.999Z")), 2025);
  assert.equal(getBrisbaneYear(new Date("2025-12-31T14:00:00.000Z")), 2026);
  assert.equal(getYearStart(2026), Date.parse("2025-12-31T14:00:00.000Z"));
});

test("weekly totals include runs only and include an exact Monday start", () => {
  const profile = aggregateRuns(
    [
      {
        distance: 3_000,
        start_date: "2026-01-02T00:00:00.000Z",
        type: "Run",
      },
      {
        distance: 5_000,
        start_date: "2026-01-04T14:00:00.000Z",
        type: "Run",
      },
      {
        distance: 9_000,
        start_date: "2026-01-04T15:00:00.000Z",
        type: "Ride",
      },
    ],
    new Date("2026-01-05T00:00:00.000Z"),
  );

  assert.equal(profile.ytd, 8_000);
  assert.equal(profile.weeks.length, 1);
  assert.deepEqual(profile.weeks[0], {
    end: Date.parse("2026-01-11T14:00:00.000Z"),
    no: 1,
    runCount: 1,
    start: Date.parse("2026-01-04T14:00:00.000Z"),
    total: 5_000,
  });
});

test("a run at the end boundary belongs to the following week", () => {
  const profile = aggregateRuns(
    [
      {
        distance: 1_000,
        start_date: "2026-01-04T14:00:00.000Z",
        type: "Run",
      },
      {
        distance: 2_000,
        start_date: "2026-01-11T14:00:00.000Z",
        type: "Run",
      },
    ],
    new Date("2026-01-12T00:00:00.000Z"),
  );

  assert.deepEqual(
    profile.weeks.map((week) => ({ no: week.no, total: week.total })),
    [
      { no: 2, total: 2_000 },
      { no: 1, total: 1_000 },
    ],
  );
});

test("week generation supports a 53rd Monday", () => {
  const weeks = buildWeeks(new Date("2024-12-31T00:00:00.000Z"), 2024);

  assert.equal(weeks.length, 53);
  assert.equal(weeks.at(-1)?.no, 53);
  assert.equal(weeks.at(-1)?.start, Date.parse("2024-12-29T14:00:00.000Z"));
});

test("historical totals stay within the year while the final week can cross it", () => {
  const profile = aggregateRuns(
    [
      {
        distance: 1_000,
        start_date: "2024-12-30T00:00:00.000Z",
        type: "Run",
      },
      {
        distance: 2_000,
        start_date: "2025-01-01T00:00:00.000Z",
        type: "Run",
      },
    ],
    new Date("2024-12-31T13:59:59.999Z"),
  );

  assert.equal(profile.ytd, 1_000);
  assert.deepEqual(
    {
      no: profile.weeks[0]?.no,
      runCount: profile.weeks[0]?.runCount,
      total: profile.weeks[0]?.total,
    },
    { no: 53, runCount: 2, total: 3_000 },
  );
});

test("annual totals include the Brisbane year start and exclude its end", () => {
  const profile = aggregateRuns(
    [
      {
        distance: 1_000,
        start_date: new Date(getYearStart(2024)).toISOString(),
        type: "Run",
      },
      {
        distance: 2_000,
        start_date: new Date(getYearStart(2025)).toISOString(),
        type: "Run",
      },
    ],
    new Date(getYearStart(2025) - 1),
  );

  assert.equal(profile.ytd, 1_000);
  assert.equal(profile.weeks.at(-1)?.total, 1_000);
  assert.equal(profile.weeks[0]?.total, 2_000);
});

test("weekly goals use normal rounding to one decimal place", () => {
  assert.equal(roundMetresToTenthKilometre(19_900), 19_900);
  assert.equal(roundMetresToTenthKilometre(19_949.999), 19_900);
  assert.equal(roundMetresToTenthKilometre(19_950), 20_000);
  assert.equal(roundMetresToTenthKilometre(20_049.999), 20_000);
  assert.equal(roundMetresToTenthKilometre(20_050), 20_100);

  assert.equal(hasMetDistanceGoal(19_900, 20_000), false);
  assert.equal(hasMetDistanceGoal(19_949.999, 20_000), false);
  assert.equal(hasMetDistanceGoal(19_950, 20_000), true);
});
