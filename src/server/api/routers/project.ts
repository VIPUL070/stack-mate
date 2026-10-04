import { pollCommit } from "@/lib/github";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { indexGithubRepo } from "@/lib/github-loader";

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
    filesReferences : z.any(),
})

const questionSchema = z.object({
    projectId: z.string(),
})

const meetingSchema = z.object({
    projectId: z.string(),
    meetingUrl : z.string(),
    name: z.string()
})

export const projectRouter = createTRPCRouter({

    createProject: protectedProcedure.
        input(projectSchema)
        .mutation(async ({ ctx, input }) => {
            const project = await ctx.db.project.create({
                data: {
                    name: input.name,
                    githubUrl: input.githubUrl,
                    userToProjects: {
                        create: {
                            userId: ctx.user.userId!,
                        }
                    }
                }
            });

                (async () => {
                    try {
                        console.log("Starting background commit polling...");
                        await pollCommit(project.id);
                        console.log("Commits finished. Starting repo indexing...");
                        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
                        console.log("Background indexing completed successfully!");
                    } catch (err) {
                        console.error("Background task error:", err);
                    }
                })();

            return project;
        }),

    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),

    getCommits: protectedProcedure.input(commitSchema)
        .query(async ({ ctx, input }) => {
            try {
                pollCommit(input.projectId).catch(err => console.error("pollCommit failed:", err));
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

    saveOutput: protectedProcedure.input(outputSchema)
        .mutation(async ({ctx,input}) => {
            try {
                return await ctx.db.question.create({
                    data: {
                        userId: ctx.user.userId!,
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
        .query(async({ctx, input}) => {
            try {
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
        .mutation(async ({ctx, input}) => {
            try {
                const meeting = await ctx.db.meeting.create({
                    data: {
                       meetingUrl : input.meetingUrl,
                       projectId: input.projectId,
                       name: input.name,
                       status : "PROCESSING"
                    }
                })
            } catch (error) {
               console.error(`Failed to save meeting for project ${input.projectId}:`, error);
                throw new Error(
                    `Failed to save meeting: ${error instanceof Error ? error.message : "Unknown error"}`
                ); 
            }
        }),

    getMeetings: protectedProcedure.input(commonSchema)
        .query(async ({ctx, input}) => {
            try {
                return await ctx.db.meeting.findMany({
                    where : {
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
        })
})