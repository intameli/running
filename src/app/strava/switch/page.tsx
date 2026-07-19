import Link from "next/link";

import { DashboardShell } from "~/app/_components/dashboard";
import { StravaAuthorizeLink } from "~/app/_components/strava-authorize-link";

export default function SwitchStravaAccount() {
  return (
    <DashboardShell
      description="The temporary connection to the previous account has been removed."
      title="Switch Strava account"
    >
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 sm:p-6">
        <p className="font-sans text-sm leading-6 text-slate-300 sm:text-base">
          Strava keeps its own browser sign-in and does not give connected apps
          an account chooser. Log out on Strava first so it cannot silently
          reconnect the same account.
        </p>

        <ol className="mt-6 space-y-5 font-sans">
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-sm font-semibold text-orange-300">
              1
            </span>
            <div>
              <h2 className="font-semibold text-white">Log out on Strava</h2>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                Open Strava in a new tab, use the profile menu to log out, then
                return to this tab.
              </p>
              <a
                className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-orange-400 hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                href="https://www.strava.com/dashboard"
                rel="noreferrer"
                target="_blank"
              >
                Open Strava
                <span aria-hidden="true">&nbsp;↗</span>
              </a>
            </div>
          </li>

          <li className="flex gap-4 border-t border-slate-800 pt-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-sm font-semibold text-orange-300">
              2
            </span>
            <div>
              <h2 className="font-semibold text-white">
                Connect the other account
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-400">
                Start again and sign in with the Strava account you want to
                view.
              </p>
              <div className="mt-3">
                <StravaAuthorizeLink>
                  Continue with another account
                </StravaAuthorizeLink>
              </div>
            </div>
          </li>
        </ol>

        <div className="mt-6 border-t border-slate-800 pt-5">
          <Link
            className="font-sans text-sm font-semibold text-slate-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            href="/"
          >
            ← Cancel and view Jacob&apos;s stats
          </Link>
        </div>
      </section>
    </DashboardShell>
  );
}
