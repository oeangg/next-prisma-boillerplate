import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";

export const userRouter = router({
  getUsers: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany();
      return users;
    } catch (error) {
      console.error(` GAGAL MENGAMBIL DATA :  ${error}`);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Gagal mengambil data users",
      });
    }
  }),
});
