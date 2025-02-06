import { api, HydrateClient } from "~/trpc/server";
import { Weeks } from "~/server/api/routers/post";

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
            <span className={yearColour}>
              <HoverBoxNum number={data.ytd} />
            </span>
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
                <span className={colour}>
                  <HoverBoxNum number={week.total} />
                </span>
                /20 km - <HoverBoxDate week={week} index={i} />
              </div>
            );
          })}
        </div>
      </main>
    </HydrateClient>
  );
}

type HoverBoxNumProps = {
  number: number;
};

const HoverBoxNum: React.FC<HoverBoxNumProps> = ({ number }) => {
  return (
    <div className="group relative inline-block">
      {/* The text that triggers the hover box */}
      <span className="cursor-pointer">{Math.floor(number / 1000)}</span>

      {/* The hover box */}
      <div
        className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-gray-800 px-3 py-1 text-sm text-white shadow-lg transition-all group-hover:block"
        style={{ whiteSpace: "nowrap" }}
      >
        {(number / 1000).toFixed(2)}
      </div>
    </div>
  );
};

type HoverBoxDateProps = {
  week: Weeks;
  index: number;
};

const HoverBoxDate: React.FC<HoverBoxDateProps> = ({ week, index }) => {
  const start = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(week.start));

  const end = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(week.end - 1)); // -1 because end is first second of the next week

  return (
    <div className="group relative inline-block">
      {/* The text that triggers the hover box */}
      <span className="cursor-pointer">
        {index === 0 ? "Current week" : "Week " + week.no}
      </span>

      {/* The hover box */}
      <div
        className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-gray-800 px-3 py-1 text-sm text-white shadow-lg transition-all group-hover:block"
        style={{ whiteSpace: "nowrap" }}
      >
        {start} - {end}
      </div>
    </div>
  );
};
