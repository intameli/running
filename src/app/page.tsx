import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();
  const data = await api.post.getProfile();

  let yearColour = "text-red-500";
  if (data.ytd > 1000000) {
    yearColour = "text-green-500";
  }

  return (
    <HydrateClient>
      <main className="flex justify-center p-1">
        <div className="flex min-h-screen max-w-2xl flex-col items-start gap-3">
          <div className="pt-3 text-3xl">Jacob&apos;s year in running</div>
          --------------------------------------
          <div className="text-2xl">
            <span className={yearColour}>{Math.floor(data.ytd / 1000)}</span>
            /1000 km since year start
          </div>
          --------------------------------------
          {data.weeks.map((week, i) => {
            let colour = "text-red-500";
            if (week.total > 20000) {
              colour = "text-green-500";
            }
            return (
              <div className="text-2xl" key={week.no}>
                <span className={colour}>{Math.floor(week.total / 1000)}</span>
                /20 km - {i === 0 ? "Current week" : "Week " + week.no}
              </div>
            );
          })}
        </div>
      </main>
    </HydrateClient>
  );
}
