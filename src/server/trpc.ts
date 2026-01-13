import { initTRPC, TRPCError } from "@trpc/server";

import { ZodError } from "zod";
import { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not Authenticated" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
