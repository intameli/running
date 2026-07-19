import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import {
  readStravaViewerSession,
  STRAVA_SESSION_COOKIE,
} from "~/server/strava-session";

const STRAVA_REVOKE_URL = "https://www.strava.com/oauth/revoke";
const REQUEST_TIMEOUT_MS = 10_000;

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get(STRAVA_SESSION_COOKIE)?.value;
  const session = readStravaViewerSession(sessionCookie);

  if (session) {
    try {
      await fetch(STRAVA_REVOKE_URL, {
        body: new URLSearchParams({
          token: session.accessToken,
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

  const response = NextResponse.redirect(
    new URL("/?strava=disconnected", request.url),
    303,
  );
  response.headers.set("Cache-Control", "no-store");
  response.cookies.delete(STRAVA_SESSION_COOKIE);

  return response;
}
