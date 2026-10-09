import { pollCommit } from "@/lib/github";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { checkCredits, indexGithubRepo } from "@/lib/github-loader";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { razorpay } from "@/lib/razorpay";
import crypto from "crypto";

const commonSchema = z.object({
    projectId: z.string(),
})

const projectSchema = z.object({
    name: z.string(),
    githubUrl: z.string().url(),
    githubToken: z.string().optional()
})

const commitSchema = z.object({
    projectId: z.string(),
})

const outputSchema = z.object({
    projectId: z.string(),
    question: z.string(),
    output: z.string(),
    filesReferences: z.any(),
})

const questionSchema = z.object({
    projectId: z.string(),
})

const meetingSchema = z.object({
    projectId: z.string(),
    meetingUrl: z.string(),
    name: z.string()
})

const creditSchema =
    z.object({
        credits: z.number().min(10).max(10000),
    })

const verifySchema = z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
})

const checkCreditSchema = z.object({
    githubUrl: z.string(),
    githubToken: z.string().optional()
})

async function assertProjectAccess(
    db: PrismaClient,
    projectId?: string,
    userId?: string
) {
    const project = await db.project.findFirst({
        where: {
            id: projectId,
            deletedAt: null,
            userToProjects: { some: { userId } },
        },
        select: { id: true },
    });

    if (!project) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found or you don't have access.",
        });
    }
}

export const projectRouter = createTRPCRouter({

    createProject: protectedProcedure.
        input(projectSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.userId },
                select: { credits: true }
            })
            if (!user) {
                throw new Error(`User not found.`)
            }
            const currCredits = user.credits ?? 0;
            const fileCount = await checkCredits(input.githubUrl, input.githubToken);

            if (currCredits < fileCount) {
                throw new Error(`Unable to create project. Not enough credits.`)
            }
            const project = await ctx.db.project.create({
                data: {
                    name: input.name,
                    githubUrl: input.githubUrl,
                    userToProjects: {
                        create: {
                            userId: ctx.userId!,
                        }
                    }
                }
            });

            await ctx.db.user.update(({
                where: { id: ctx.userId },
                data: {
                    credits: { decrement: fileCount }
                }
            }))

            return project;
        }),
    indexProject: protectedProcedure
        .input(z.object({ projectId: z.string(), githubUrl: z.string(), githubToken: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
            await assertProjectAccess(ctx.db, input.projectId, ctx.userId);
            await pollCommit(input.projectId);
            await indexGithubRepo(input.projectId, input.githubUrl, input.githubToken);
            return { success: true };
        }),

    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),

    getCommits: protectedProcedure.input(commitSchema)
        .query(async ({ ctx, input }) => {
            try {
                await assertProjectAccess(ctx.db, input.projectId, ctx.userId);
                return await ctx.db.commit.findMany({
                    where: {
                        projectId: input.projectId
                    },
                    orderBy: {
                        commitDate: "desc"
                    }
                })
            } catch (error) {
                console.error(`Failed to fetch commits for project ${input.projectId}:`, error);
                throw new Error(
                    `Failed to fetch commits: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),
    syncCommits: protectedProcedure.input(commitSchema)
        .mutation(async ({ ctx, input }) => {
            await assertProjectAccess(ctx.db, input.projectId, ctx.userId);
            await pollCommit(input.projectId);
            return { success: true };
        }),

    saveOutput: protectedProcedure.input(outputSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                await assertProjectAccess(ctx.db, input.projectId, ctx.userId);
                return await ctx.db.question.create({
                    data: {
                        userId: ctx.userId!,
                        projectId: input.projectId,
                        filesReferences: input.filesReferences,
                        question: input.question,
                        answer: input.output
                    }
                })
            } catch (error) {
                console.error(`Failed to save output for project ${input.projectId}:`, error);
                throw new Error(
                    `Failed to save output: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),

    getQuestions: protectedProcedure.input(questionSchema)
        .query(async ({ ctx, input }) => {
            try {
                await assertProjectAccess(ctx.db, input.projectId, ctx.userId);
                return await ctx.db.question.findMany({
                    where: {
                        projectId: input.projectId
                    },
                    include: {
                        user: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            } catch (error) {
                console.error(`Failed to fetch questions for project ${input.projectId}:`, error);
                throw new Error(
                    `Failed to fetch questions: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),
    uploadMeeting: protectedProcedure.input(meetingSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                await assertProjectAccess(ctx.db, input.projectId, ctx.userId);
                const meeting = await ctx.db.meeting.create({
                    data: {
                        meetingUrl: input.meetingUrl,
                        projectId: input.projectId,
                        name: input.name,
                        status: "PROCESSING"
                    }
                })
                return meeting;
            } catch (error) {
                console.error(`Failed to save meeting for project ${input.projectId}:`, error);
                throw new Error(
                    `Failed to save meeting: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),

    getMeetings: protectedProcedure.input(commonSchema)
        .query(async ({ ctx, input }) => {
            try {
                await assertProjectAccess(ctx.db, input.projectId, ctx.userId);
                return await ctx.db.meeting.findMany({
                    where: {
                        projectId: input.projectId
                    },
                    include: {
                        issues: true
                    }
                })
            } catch (error) {
                console.error(`Failed to fetch meeting for project ${input.projectId}:`, error);
                throw new Error(
                    `Failed to fetch meeting: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),
    getMeetingById: protectedProcedure
        .input(z.object({ meetingId: z.string() }))
        .query(async ({ ctx, input }) => {
            const meeting = await ctx.db.meeting.findUnique({
                where: {
                    id: input.meetingId,
                    project: {
                        deletedAt: null,
                        userToProjects: { some: { userId: ctx.userId } },
                    },
                },
                include: { issues: true },
            });
            if (!meeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found." });
            }
            return meeting;
        }),

    deleteMeeting: protectedProcedure.input(z.object({ meetingId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                const meeting = await ctx.db.meeting.findFirst({
                    where: { id: input.meetingId },
                    select: { projectId: true },
                });

                if (!meeting) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Meeting not found.",
                    });
                }

                await assertProjectAccess(ctx.db, meeting.projectId, ctx.userId);
                return await ctx.db.meeting.delete({
                    where: {
                        id: input.meetingId,
                    },
                })
            } catch (error) {
                console.error(`Failed to delete meeting`, error);
                throw new Error(
                    `Failed to delete meeting: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),
    archiveProject: protectedProcedure.input(commonSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findUnique({
                    where: { id: input.projectId },
                });

                if (!project) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "project not found.",
                    });
                }

                await assertProjectAccess(ctx.db, project.id, ctx.userId);
                return await ctx.db.project.update({
                    where: {
                        id: input.projectId,
                    },
                    data: { deletedAt: new Date() },
                });
            } catch (error) {
                console.error(`Failed to archive project`, error);
                throw new Error(
                    `Failed to archive project: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),
    getTeamMembers: protectedProcedure.input(commonSchema)
        .query(async ({ ctx, input }) => {
            try {
                const project = await ctx.db.project.findUnique({
                    where: { id: input.projectId },
                });

                if (!project) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "project not found.",
                    });
                }

                await assertProjectAccess(ctx.db, project.id, ctx.userId);
                return await ctx.db.userToProject.findMany({
                    where: {
                        projectId: input.projectId,
                    },
                    include: { user: true },
                });
            } catch (error) {
                console.error(`Failed to fetch team members`, error);
                throw new Error(
                    `Failed to fetch team members: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),
    getMyCredits: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                return await ctx.db.user.findUnique({
                    where: {
                        id: ctx.userId
                    },
                    select: { credits: true }
                });
            } catch (error) {
                console.error(`Failed to get user credits`, error);
                throw new Error(
                    `Failed to get user credits: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        }),
    createCreditOrder: protectedProcedure
        .input(creditSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const credits = input.credits;
                const amountInPaise = credits * 2 * 100;

                // 1. Create order in Razorpay
                const razorpayOrder = await razorpay.orders.create({
                    amount: amountInPaise,
                    currency: "INR",
                    receipt: `ord_${Date.now()}`,
                    notes: {
                        userId: ctx.userId,
                        credits: String(credits),
                    },
                });

                // 2. Create pending order matching your schema
                await ctx.db.order.create({
                    data: {
                        userId: ctx.userId,
                        credits: credits,
                        amount: amountInPaise,
                        currency: "INR",
                        status: "PENDING",
                        razorpayOrderId: razorpayOrder.id,
                    },
                });

                return {
                    orderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                };
            } catch (error) {
                console.error("Order creation failed", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create payment order",
                });
            }
        }),
    verifyCreditPayment: protectedProcedure
        .input(verifySchema)
        .mutation(async ({ ctx, input }) => {
            const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

            // 1. Recreate the signature on your server
            const dataToSign = `${razorpayOrderId}|${razorpayPaymentId}`;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                .update(dataToSign)
                .digest("hex");

            const expectedBuffer = Buffer.from(expectedSignature);
            const signatureBuffer = Buffer.from(razorpaySignature);

            // Guard against buffer length mismatch crash
            const isAuthentic =
                expectedBuffer.length === signatureBuffer.length &&
                crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

            if (!isAuthentic) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Payment verification failed. Invalid signature.",
                });
            }

            // 2. Atomically update Order status and increment User credits
            return await ctx.db.$transaction(async (tx) => {
                // Atomic condition: only flip from PENDING -> PAID
                const updateResult = await tx.order.updateMany({
                    where: {
                        razorpayOrderId,
                        userId: ctx.userId,
                        status: "PENDING",
                    },
                    data: {
                        status: "PAID",
                        razorpayPaymentId,
                    },
                });

                // If count is 0, the webhook already processed it
                if (updateResult.count === 0) {
                    return { success: true, message: "Order already fulfilled." };
                }

                // 3. Grab the order details to credit the user
                const order = await tx.order.findFirst({
                    where: { razorpayOrderId, userId: ctx.userId },
                });

                if (!order) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Order record not found.",
                    });
                }

                // 4. Increment credits — guaranteed to run only ONCE
                await tx.user.update({
                    where: { id: ctx.userId },
                    data: {
                        credits: {
                            increment: order.credits,
                        },
                    },
                });

                return { success: true, creditsAdded: order.credits };
            },
                {
                    maxWait: 10000,
                    timeout: 15000,
                }
            );
        }),
    checkCredits: protectedProcedure.input(checkCreditSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const fileCount = await checkCredits(input.githubUrl, input.githubToken)
                const userCredits = await ctx.db.user.findUnique({
                    where: {
                        id: ctx.userId
                    },
                    select: { credits: true }
                })
                return { fileCount, userCredits: userCredits?.credits }
            } catch (error) {
                console.error(`Failed to check credits`, error);
                throw new Error(
                    `Failed to check credits: ${error instanceof Error ? error.message : "Unknown error"}`
                );
            }
        })
})