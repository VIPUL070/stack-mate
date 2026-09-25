import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { db } from '../db';
import { auth } from '@clerk/nextjs/server';

// 1. CONTEXT — available in every procedure via `ctx`
export const createTRPCContext = async (opts: { headers: Headers }) => {
    return {
        db,
        ...opts,
    };
};

// 2. INIT tRPC
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
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

// 3. EXPORT REUSABLE PIECES
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// Later, for auth:
export const isAuthenticated = t.middleware(async ({ next, ctx }) => {
    const user = await auth();
    if (!user) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this resource."
        })
    }
    return next({
        ctx: {
            ...ctx,
            user
        }
    })
})

// Optional: timing middleware (T3 default, nice for dev)
const timingMiddleware = t.middleware(async ({ next, path }) => {
    const start = Date.now();
    const result = await next();
    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms`);
    return result;
});

export const timedProcedure = publicProcedure.use(timingMiddleware);
export const protectedProcedure = t.procedure.use(isAuthenticated);