import Link from "next/link";

import { DashboardShell } from "~/app/_components/dashboard";
import { OpenStravaInBrowserButton } from "~/app/_components/open-strava-in-browser-button";
import { StravaAuthorizeLink } from "~/app/_components/strava-authorize-link";

export default function SwitchStravaAccount() {
  return (
    <DashboardShell
      description="Do these two steps."
      title="Switch Strava account"
    >
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 sm:p-6">
        <ol className="space-y-6 font-sans">
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-sm text-orange-300">
              1
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-normal text-white">
                Log out of Strava
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                This will sign you out of Strava. Then come back here.
              </p>
              <OpenStravaInBrowserButton />
            </div>
          </li>

          <li className="flex gap-4 border-t border-slate-800 pt-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-sm text-orange-300">
              2
            </span>
            <div>
              <h2 className="text-lg font-normal text-white">
                Connect a different account
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                Tap the orange button and sign in to the account you want.
              </p>
              <div className="mt-3">
                <StravaAuthorizeLink>Connect account</StravaAuthorizeLink>
              </div>
            </div>
          </li>
        </ol>

        <div className="mt-6 border-t border-slate-800 pt-5">
          <Link
            className="font-sans text-sm font-semibold text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            href="/"
          >
            ← Cancel
          </Link>
        </div>
      </section>
    </DashboardShell>
  );
}
