import { projectRouter } from "./routers/project";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  project: projectRouter,
});


export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);