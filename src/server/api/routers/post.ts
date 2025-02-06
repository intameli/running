import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios, { type AxiosResponse } from "axios";

type TokenResponse = {
  access_token: string;
  expires_at: number;
  refresh_token: string;
};

type Activity = {
  distance: number;
  type: string;
  start_date: string;
};

export type Weeks = {
  start: number;
  end: number;
  no: number;
  runs: Activity[];
  total: number;
};

function getYearStart() {
  const now = new Date();
  const date = new Date("1/1/" + now.getFullYear());
  // returns date as seconds since epoc
  return Math.floor(date.getTime() / 1000);
}

function getFirstMonday() {
  const now = new Date();
  const date = new Date("1/1/" + now.getFullYear());
  while (date.getDay() != 1) {
    date.setDate(date.getDate() + 1);
  }
  return date.getTime();
}

export const postRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    try {
      const info = await ctx.db.post.findFirst();
      let accessToken = info?.access_token;
      if (!info) {
        throw new Error("empty db");
      }
      if (info.expires_at * BigInt(1000) <= BigInt(Date.now())) {
        const firstPart = `https://www.strava.com/api/v3/oauth/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=refresh_token&refresh_token=`;
        const url = firstPart + info?.refresh_token;
        const response: AxiosResponse<TokenResponse> = await axios.post(url);
        accessToken = response.data.access_token;
        await ctx.db.post.update({
          where: {
            id: 1,
          },
          data: {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expires_at: response.data.expires_at,
          },
        });
        console.log("------ access token: " + response.data.access_token);
      }
      console.log(accessToken);
      const activities: AxiosResponse<Activity[]> = await axios.get(
        "https://www.strava.com/api/v3/athlete/activities?after=" +
          getYearStart() +
          "&per_page=200",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      let year_total = 0;
      for (const activity of activities.data) {
        if (activity.type === "Run") {
          year_total += activity.distance;
        }
      }

      const weeks: Weeks[] = [];
      let startDate = getFirstMonday();
      let endDate = 0;
      for (let i = 1; i < 53; i++) {
        if (startDate > Date.now()) {
          break;
        }
        endDate = startDate + 7 * 24 * 60 * 60 * 1000;
        weeks.push({
          start: startDate,
          end: endDate,
          no: i,
          runs: [],
          total: 0,
        });
        startDate = endDate;
      }

      for (const activity of activities.data) {
        const date = new Date(activity.start_date);
        for (const week of weeks) {
          if (week.end > date.getTime() && date.getTime() > week.start) {
            week.runs.push(activity);
            week.total += activity.distance;
          }
        }
      }
      weeks.reverse();
      console.log(weeks);

      return {
        ytd: year_total,
        weeks: weeks,
      };
    } catch (error) {
      console.error("Error calling external API:", error);
      console.log(error);
      throw new Error("Failed to fetch external API data");
    }
  }),
});
