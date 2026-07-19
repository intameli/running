import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRunningProfile } from "~/server/running-profile";

export const postRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async () => {
    try {
      return await getRunningProfile();
    } catch (cause) {
      throw new TRPCError({
        cause,
        code: "BAD_GATEWAY",
        message: "The running data provider is temporarily unavailable.",
      });
    }
  }),
});
