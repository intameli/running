import { type NextRequest, NextResponse } from "next/server";

import { revokeStravaAccessToken } from "~/server/strava-revoke";
import {
  readStravaViewerSession,
  STRAVA_SESSION_COOKIE,
  STRAVA_STATE_COOKIE,
} from "~/server/strava-session";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get(STRAVA_SESSION_COOKIE)?.value;
  const session = readStravaViewerSession(sessionCookie);

  if (session) await revokeStravaAccessToken(session.accessToken);

  const response = NextResponse.redirect(
    new URL("/strava/switch", request.url),
    303,
  );
  response.headers.set("Cache-Control", "no-store");
  response.cookies.delete(STRAVA_SESSION_COOKIE);
  response.cookies.delete(STRAVA_STATE_COOKIE);

  return response;
}
