import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();
  const data = await api.post.getProfile();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center gap-9">
        <div className="pb-5 pt-10 text-7xl">Jacob has run</div>
        <div className="text-5xl">
          {(data.week / 1000).toFixed(2)} km since week start
        </div>
        <div className="text-5xl">
          {(data.ytd / 1000).toFixed(2)} km since year start
        </div>
      </main>
    </HydrateClient>
  );
}
