import { NextResponse } from "next/server";

// Strava uses this unassociated web path for its own signed-in logout link.
const STRAVA_WEB_LOGOUT_URL = "https://www.strava.com/logout";

export function GET() {
  // A server redirect also prevents Safari from treating the destination as a
  // directly tapped universal link.
  const response = NextResponse.redirect(STRAVA_WEB_LOGOUT_URL, 302);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");

  return response;
}
