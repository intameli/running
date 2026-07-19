import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { env } from "~/env";
import {
  createStravaViewerSession,
  isValidOAuthState,
  stravaCookieOptions,
  STRAVA_SESSION_COOKIE,
  STRAVA_STATE_COOKIE,
} from "~/server/strava-session";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const REQUEST_TIMEOUT_MS = 10_000;

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.number().int().positive(),
});

function redirectHome(request: NextRequest, status: string) {
  const url = new URL("/", request.url);
  url.searchParams.set("strava", status);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");
  const response = redirectHome(request, error ? "denied" : "error");

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.delete(STRAVA_STATE_COOKIE);

  if (error) return response;

  const stateCookie = request.cookies.get(STRAVA_STATE_COOKIE)?.value;
  const state = requestUrl.searchParams.get("state");

  if (!isValidOAuthState(stateCookie, state)) {
    response.headers.set(
      "Location",
      new URL("/?strava=invalid", request.url).toString(),
    );
    return response;
  }

  const code = requestUrl.searchParams.get("code");
  const scopes = new Set(
    (requestUrl.searchParams.get("scope") ?? "").split(/[\s,]+/),
  );

  if (!code || !scopes.has("activity:read_all")) {
    response.headers.set(
      "Location",
      new URL("/?strava=scope", request.url).toString(),
    );
    return response;
  }

  try {
    const tokenResponse = await fetch(STRAVA_TOKEN_URL, {
      body: new URLSearchParams({
        client_id: env.CLIENT_ID,
        client_secret: env.CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!tokenResponse.ok) return response;

    const token = tokenResponseSchema.parse(await tokenResponse.json());
    response.headers.set("Location", new URL("/", request.url).toString());
    response.cookies.set(
      STRAVA_SESSION_COOKIE,
      createStravaViewerSession({
        accessToken: token.access_token,
        expiresAt: token.expires_at,
      }),
      stravaCookieOptions,
    );

    return response;
  } catch {
    return response;
  }
}
