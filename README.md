# Running dashboard

A small Next.js dashboard that tracks Jacob's yearly and weekly running distance
from Strava.

## Local setup

1. Install dependencies with pnpm.
2. Copy `.env.example` to `.env` and fill in the database and Strava values.
3. Ensure the database contains the Strava access token, refresh token, and
   expiry timestamp expected by `prisma/schema.prisma`.
4. Start the app with `pnpm dev`.

## Useful commands

- `pnpm check` runs linting, TypeScript, and formatting checks.
- `pnpm test` runs the running-profile unit tests.
- `pnpm build` creates a production build.
- `pnpm db:push` syncs the Prisma schema during local development.
