import { Octokit } from "octokit";
import { parseGithubUrl } from "./utils";
import { db } from "@/server/db";
import { GithubResponse } from "@/types/github-types";
import axios, { isAxiosError } from "axios";
import { aiSummarizeCommit } from "./gemini";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export const getCommitHash = async (githubUrl: string) => {
    if (!githubUrl) {
        throw new Error("No GitHub URL");
    }

    const { owner, repo } = parseGithubUrl(githubUrl);
    console.log("start listCommits")
    try {
        const { data } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: 5,
            request: { timeout: 10000 }
        });

        const sortedCommits = [...data].sort(
            (a: any, b: any) =>
                new Date(b.commit.author.date).getTime() -
                new Date(a.commit.author.date).getTime()
        );

        return sortedCommits.slice(0, 5).map((commit: any) => ({
            commitHash: commit.sha as string,
            commitMessage: commit.commit.message ?? "",
            commitAuthorName: commit.commit?.author?.name ?? "",
            commitAuthorAvatar: commit?.author?.avatar_url ?? "",
            commitDate: commit.commit?.author?.date ?? "",
        }));
    } catch (error) {
        console.error(`Failed to fetch commits for ${owner}/${repo}:`, error);
        throw new Error(
            `Failed to fetch commits: ${error instanceof Error ? error?.message : "Unknown error"}`
        );
    }
};

const fetchProjectGithubUrl = async (projectId: string) => {
    console.log("start fetchProject githuburl")
    try {
        const project = await db.project.findUnique({
            where: { id: projectId },
            select: {
                githubUrl: true,
            },
        });
        return { project, githubUrl: project?.githubUrl };
    } catch (error) {
        console.error(`Failed to fetch project ${projectId}:`, error);
        throw new Error(
            `Failed to fetch project: ${error instanceof Error ? error?.message : "Unknown error"}`
        );
    }
};

const filterUnprocessedCommits = async (projectId: string, commitHashes: GithubResponse[]) => {
    console.log("start filter unprocessed commits")

    try {
        const processedCommits = await db.commit.findMany({
            where: { projectId, summary: { not: "" } },
            select: { commitHash: true },
        });

        const processedHashes = new Set(processedCommits.map((c) => c.commitHash));

        const unprocessedCommits = commitHashes.filter(
            (commit) => !processedHashes.has(commit.commitHash)
        );

        return unprocessedCommits;
    } catch (error) {
        console.error(`Failed to fetch commitHashes ${projectId}:`, error);
        throw new Error(
            `Failed to fetch commitHashes: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
};

export const pollCommit = async (projectId: string) => {
    console.log("start poll commit")

    try {
        const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
        if (!project || !githubUrl) {
            throw new Error("Project or GitHub URL not found");
        }

        const commitHashes = await getCommitHash(githubUrl);
        const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes)

        if (unprocessedCommits.length === 0) {
            return [];
        }

        // process one commit at a time, with a gap between calls,
        // so we never exceed 5 requests/minute on the free tier
        const successfulCommits: {
            projectId: string;
            commitHash: string;
            commitMessage: string;
            commitAuthorName: string;
            commitAuthorAvatar: string;
            commitDate: Date;
            summary: string;
        }[] = [];

        // Process sequentially with delay to stay within the 5 RPM Free Tier limit
        for (const commit of unprocessedCommits) {
            const summary = await summarizeCommit(
                githubUrl,
                commit.commitHash,
            );

            if (summary && summary.trim().length > 0) {
                successfulCommits.push({
                    projectId,
                    commitHash: commit.commitHash,
                    commitMessage: commit.commitMessage,
                    commitAuthorName: commit.commitAuthorName,
                    commitAuthorAvatar: commit.commitAuthorAvatar,
                    commitDate: commit.commitDate
                        ? new Date(commit.commitDate)
                        : new Date(),
                    summary,
                });
            }

            await new Promise((res) => setTimeout(res, 14000));
        }

        // save this summary in the db of commit table
        if (successfulCommits.length > 0) {
            await db.commit.createMany({
                data: successfulCommits,
                skipDuplicates: true,
            });
        }
       
       return successfulCommits;

} catch (error) {
    console.error(`pollCommit failed for project ${projectId}:`, error);
    throw error;
}
};


const summarizeCommit = async (githubUrl: string, commitHash: string) => {
    // get the diff and pass the diff to AI
    if (!githubUrl || !commitHash) return "";
    console.log("start summarize commit")

    try {
        const headers: Record<string, string> = {
            Accept: "application/vnd.github.v3.diff",
        };

        const token = process.env.GITHUB_TOKEN;
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
            headers,
            timeout: 10000,
        })

        const summary = await aiSummarizeCommit(data) || "";
        return summary;
    } catch (error) {
        if (isAxiosError(error)) {
            console.log(error.response?.data.message)
        }
        else if (error instanceof Error) {
            console.log(error.message)
        }
        else {
            console.log(error ?? "Something went wrong")
        }
        return "";
    }
}