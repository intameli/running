import "server-only";

import { unstable_cache } from "next/cache";
import { z } from "zod";

import { env } from "~/env";
import { db } from "~/server/db";
import {
  aggregateRuns,
  buildWeeks,
  EARLIEST_RUNNING_YEAR,
  getBrisbaneYear,
  getYearStart,
} from "~/server/running-profile-logic";

const STRAVA_API_URL = "https://www.strava.com/api/v3";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const PAGE_SIZE = 200;
const REQUEST_TIMEOUT_MS = 10_000;
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

let tokenRefreshPromise: Promise<string> | undefined;

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.number().int().positive(),
  refresh_token: z.string().min(1),
});

const activitySchema = z.object({
  distance: z.number().nonnegative(),
  start_date: z.string().datetime(),
  type: z.string(),
});

const activitiesSchema = z.array(activitySchema);

type Activity = z.infer<typeof activitySchema>;

export type RunningProfile = ReturnType<typeof aggregateRuns>;
export type RunningWeek = RunningProfile["weeks"][number];

async function parseResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  operation: string,
) {
  if (!response.ok) {
    throw new Error(`${operation} failed with status ${response.status}`);
  }

  return schema.parse(await response.json());
}

async function refreshAccessToken(
  id: number,
  refreshToken: string,
): Promise<string> {
  if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
    throw new Error(
      "Strava credentials are missing. Set CLIENT_ID and CLIENT_SECRET.",
    );
  }

  const body = new URLSearchParams({
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(STRAVA_TOKEN_URL, {
    body,
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const token = await parseResponse(
    response,
    tokenResponseSchema,
    "Strava token refresh",
  );

  await db.post.update({
    data: {
      access_token: token.access_token,
      expires_at: token.expires_at,
      refresh_token: token.refresh_token,
    },
    where: { id },
  });

  return token.access_token;
}

async function refreshAccessTokenOnce(id: number, refreshToken: string) {
  const refresh = (tokenRefreshPromise ??= refreshAccessToken(
    id,
    refreshToken,
  ));

  try {
    return await refresh;
  } finally {
    if (tokenRefreshPromise === refresh) {
      tokenRefreshPromise = undefined;
    }
  }
}

async function getAccessToken() {
  const credentials = await db.post.findFirst({ orderBy: { id: "asc" } });

  if (!credentials) {
    throw new Error("No Strava credentials are configured in the database.");
  }

  const refreshAt =
    BigInt(Math.floor(Date.now() / 1000)) + BigInt(TOKEN_EXPIRY_BUFFER_SECONDS);

  if (credentials.expires_at <= refreshAt) {
    return refreshAccessTokenOnce(credentials.id, credentials.refresh_token);
  }

  return credentials.access_token;
}

async function fetchActivities(
  accessToken: string,
  after: number,
  before: number,
) {
  const activities: Activity[] = [];

  for (let page = 1; ; page += 1) {
    const url = new URL(`${STRAVA_API_URL}/athlete/activities`);
    url.searchParams.set("after", after.toString());
    url.searchParams.set("before", before.toString());
    url.searchParams.set("page", page.toString());
    url.searchParams.set("per_page", PAGE_SIZE.toString());

    const response = await fetch(url, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const pageOfActivities = await parseResponse(
      response,
      activitiesSchema,
      "Strava activity request",
    );

    activities.push(...pageOfActivities);

    if (pageOfActivities.length < PAGE_SIZE) {
      return activities;
    }
  }
}

async function fetchRunningProfile(requestedYear?: number) {
  const now = new Date();
  const currentYear = getBrisbaneYear(now);
  const year = requestedYear ?? currentYear;

  if (
    !Number.isInteger(year) ||
    year < EARLIEST_RUNNING_YEAR ||
    year > currentYear
  ) {
    throw new RangeError(
      `Running year ${year} is outside the available range.`,
    );
  }

  const referenceDate =
    year === currentYear ? now : new Date(getYearStart(year + 1) - 1);
  const finalWeekEnd = buildWeeks(referenceDate, year).at(-1)?.end;
  const accessToken = await getAccessToken();
  const activities = await fetchActivities(
    accessToken,
    Math.floor(getYearStart(year) / 1000) - 1,
    Math.floor((finalWeekEnd ?? getYearStart(year + 1)) / 1000),
  );

  return aggregateRuns(activities, referenceDate);
}

export const getRunningProfile = unstable_cache(
  fetchRunningProfile,
  ["running-profile-by-year"],
  { revalidate: 300 },
);
