import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
  users: userRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
