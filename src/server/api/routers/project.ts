import { pollCommit } from "@/lib/github";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { indexGithubRepo } from "@/lib/github-loader";

const projectSchema = z.object({
    name: z.string(),
    githubUrl: z.string().url(),
    githubToken: z.string().optional()
})

const commitSchema = z.object({
    projectId: z.string(),
})

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(projectSchema)
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
            })
            indexGithubRepo(project.id, input.githubUrl, input.githubToken).then().catch((err) => console.error("index github repo failed:", err))
            pollCommit(project.id).catch(err => console.error("pollCommit failed:", err));
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
                pollCommit(input.projectId).then().catch(err => console.error("pollCommit failed:", err));

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
        })
})