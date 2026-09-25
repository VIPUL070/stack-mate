import { createTRPCRouter, protectedProcedure } from "../trpc";
import {z} from "zod";

const projectSchema = z.object({
    name: z.string(),
    githubUrl : z.string(),
    githubToken : z.string().optional()
})

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure.input(projectSchema)
    .mutation(async ({ctx,input}) => {
        const project = await ctx.db.project.create({
            data: {
                name: input.name,
                githubUrl : input.githubUrl,
                userToProjects : {
                    create: {
                        userId: ctx.user.userId!,
                    }
                }
            }
        })
        return project;
    }),

    getProjects: protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId : ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    })
})