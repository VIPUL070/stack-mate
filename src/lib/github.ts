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
            where: { projectId },
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

        // process one commit at a time, with a gap between calls,
        // so we never exceed 5 requests/minute on the free tier
        const summaries: string[] = [];
        for (const commit of unprocessedCommits) {
            const summary = await summarizeCommit(githubUrl, commit.commitHash);
            summaries.push(summary ?? "");
            await new Promise((res) => setTimeout(res, 13000));
        }

        // save this summary in the db of commit table
        let commits;
        try {
            console.log("start save in db")

            commits = await db.commit.createMany({
                data: summaries.map((summary, i) => {
                    console.log(`processing commit: ${i}`)
                    return {
                        projectId: projectId,
                        commitHash: unprocessedCommits[i]!.commitHash,
                        commitMessage: unprocessedCommits[i]!.commitMessage,
                        commitAuthorName: unprocessedCommits[i]!.commitAuthorName,
                        commitAuthorAvatar: unprocessedCommits[i]!.commitAuthorAvatar,
                        commitDate: new Date(unprocessedCommits[i]!.commitDate),
                        summary
                    }
                }),
                skipDuplicates: true,
            })
        } catch (error) {
            console.error(`Failed to add commitSummary:`, error);
            throw new Error(
                `Failed to save commitSummary: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
        return commits;

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
        const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
            headers: {
                Accept: 'application/vnd.github.v3.diff',
                timeout: 10000,
            }
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
    }
}