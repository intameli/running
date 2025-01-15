import { DateTime } from "luxon";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios, { type AxiosResponse } from "axios";

type TokenResponse = {
  access_token: string;
  expires_at: number;
  refresh_token: string;
};

type Profile = {
  ytd_run_totals: {
    count: number;
    distance: number;
  };
};

type Activity = {
  distance: number;
  type: string;
};

function getPreviousMondayEpoch() {
  // Get the current time in your timezone (+10)
  const now = DateTime.now().setZone("Australia/Brisbane"); // Use IANA timezone name

  // Find the most recent Monday
  let monday = now;
  while (monday.weekday !== 1) {
    // Monday is 1 in Luxon
    monday = monday.minus({ days: 1 });
  }

  // Set the time to midnight (00:00:00)
  monday = monday.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  // Get the epoch timestamp in seconds
  return monday.toSeconds();
}

export const postRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    try {
      const info = await ctx.db.post.findFirst();
      let accessToken = info?.access_token;
      if (info?.expires_at && info.expires_at >= Date.now()) {
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
      }

      const response2: AxiosResponse<Profile> = await axios.get(
        "https://www.strava.com/api/v3/athletes/151370251/stats",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const activities: AxiosResponse<Activity[]> = await axios.get(
        "https://www.strava.com/api/v3/athlete/activities?after=" +
          getPreviousMondayEpoch() +
          "&per_page=200",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      let total = 0;
      for (const activity of activities.data) {
        if (activity.type === "Run") {
          total += activity.distance;
          console.log(activity.distance);
        }
      }
      return {
        ytd: response2.data.ytd_run_totals.distance,
        week: total,
      };
    } catch (error) {
      console.error("Error calling external API:", error);
      throw new Error("Failed to fetch external API data");
    }
  }),
});
