import { NextResponse } from "next/server";

import { env } from "~/env";
import {
  createOAuthState,
  stravaCookieOptions,
  STRAVA_STATE_COOKIE,
} from "~/server/strava-session";

const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize";

export function GET(request: Request) {
  const state = createOAuthState();
  const callbackUrl = new URL("/api/strava/callback", request.url);
  const authorizeUrl = new URL(STRAVA_AUTHORIZE_URL);

  authorizeUrl.searchParams.set("client_id", env.CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl.toString());
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("approval_prompt", "force");
  authorizeUrl.searchParams.set("scope", "activity:read_all");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(STRAVA_STATE_COOKIE, state, {
    ...stravaCookieOptions,
    maxAge: 10 * 60,
  });

  return response;
}
