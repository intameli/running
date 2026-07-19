# Running dashboard

A small Next.js dashboard that tracks Jacob's yearly and weekly running distance
from Strava.

## Local setup

1. Install dependencies with pnpm.
2. Copy `.env.example` to `.env` and fill in the database and Strava values.
3. Ensure the database contains the Strava access token, refresh token, and
   expiry timestamp expected by `prisma/schema.prisma`.
4. In the Strava API settings, set the Authorization Callback Domain to the
   site's hostname (or `localhost` for local development). New Strava apps must
   also use the dashboard's self-service access upgrade before accounts other
   than the app owner's can connect.
5. Start the app with `pnpm dev`.

## Temporary viewer sessions

The “View my Strava stats” button uses Strava's web OAuth flow and requests
read-only activity access. Guest access tokens are encrypted in an HTTP-only,
browser-session cookie and are not written to the database. Refresh tokens are
discarded, so the guest connection expires with the Strava access token (up to
six hours) or when the browser session ends. “Back to Jacob” clears the cookie
and asks Strava to revoke the temporary access.

## Useful commands

- `pnpm check` runs linting, TypeScript, and formatting checks.
- `pnpm test` runs the running-profile unit tests.
- `pnpm build` creates a production build.
- `pnpm db:push` syncs the Prisma schema during local development.
