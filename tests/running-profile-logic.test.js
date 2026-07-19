import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateRuns,
  buildWeeks,
  getBrisbaneYear,
  getYearStart,
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
