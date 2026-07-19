import "server-only";

import { env } from "~/env";

const STRAVA_REVOKE_URL = "https://www.strava.com/oauth/revoke";
const REQUEST_TIMEOUT_MS = 10_000;

export async function revokeStravaAccessToken(accessToken: string) {
  try {
    await fetch(STRAVA_REVOKE_URL, {
      body: new URLSearchParams({
        token: accessToken,
        token_type_hint: "access_token",
      }),
      cache: "no-store",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${env.CLIENT_ID}:${env.CLIENT_SECRET}`,
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    // Clearing the local session remains useful if Strava is unavailable.
  }
}
