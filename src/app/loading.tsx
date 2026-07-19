import {
  DashboardShell,
  RunningStatsSkeleton,
} from "~/app/_components/dashboard";

export default function Loading() {
  return (
    <DashboardShell>
      <RunningStatsSkeleton />
    </DashboardShell>
  );
}
