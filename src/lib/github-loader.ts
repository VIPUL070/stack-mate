import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { generateEmbedding, summariseCode } from "./gemini";
import pLimit from 'p-limit';
import { db } from "@/server/db";
import { Octokit } from "octokit";
import { parseGithubUrl } from "./utils";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export const getFileCount = async (path:string, octokit:Octokit, owner:string, repo:string, acc:number = 0) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (!Array.isArray(data) && data.type === 'file') {
      return acc + 1;
    }

    if (Array.isArray(data)) {
      let fileCount = 0;
      const dirs: string[] = [];

      for (const item of data) {
        if (item.type === 'dir') {
          dirs.push(item.path);
        } else {
          fileCount++;
        }
      }

      if (dirs.length > 0) {
        const subdirectoryCounts = await Promise.all(
          dirs.map((directoryPath) =>
            getFileCount(directoryPath, octokit, owner, repo, 0 )
          )
        );

        fileCount += subdirectoryCounts.reduce((acc, count) => acc + count, 0);
      }

      return fileCount + acc;
    }

    return acc;
  } catch (error) {
    console.log('Failed to get file count.', error);
    throw new Error(
      `Failed to get file count: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
    // how many total files are there in a repo
    try {
        if (!githubUrl) {
        throw new Error("No GitHub URL");
    }
       const { owner, repo } = parseGithubUrl(githubUrl);
       if (!owner || !repo) {
        throw new Error("No GitHub Owner and Repo Found.");
    }

    const fileCount = await getFileCount('',octokit,owner,repo,0)
    return fileCount;
    } catch (error) {
        console.log('Failed to check credits.', error)
        throw new Error(
            `Failed to check credits: ${error instanceof Error ? error.message : "Unknown error"}`
        )
    }
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    if (!githubUrl) {
        throw new Error("GitHub URL is required");
    }
    try {
        const loader = new GithubRepoLoader(githubUrl, {
            accessToken: githubToken || "",
            branch: "main",
            recursive: true,
            unknown: 'warn',
            maxConcurrency: 5
        })
        const docs = await loader.load();

        const ignoredExtensions = [
            ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg",
            ".pdf", ".zip", ".mp4", ".woff", ".woff2", ".lock",
        ];
        const ignoredPaths = ["node_modules/", ".next/", "dist/", "build/"];

        return docs.filter((doc) => {
            const source = (doc.metadata.source || "").toLowerCase();
            const isIgnoredExt = ignoredExtensions.some((ext) => source.endsWith(ext));
            const isIgnoredPath = ignoredPaths.some((p) => source.includes(p));
            const hasContent = Boolean(doc.pageContent?.trim());
            return !isIgnoredExt && !isIgnoredPath && hasContent;
        });
    } catch (error) {
        console.log('Loading GithubRepo Error', error)
        throw new Error(
            `Failed to load github repo: ${error instanceof Error ? error.message : "Unknown error"}`
        )
    }
}

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string
) => {
  if (!githubUrl || !projectId) {
    throw new Error("GitHub URL and Project Id is required");
  }

  const allDocs = await loadGithubRepo(githubUrl, githubToken);

  const existing = await db.sourceCodeEmbedding.findMany({
    where: { projectId },
    select: { fileName: true },
  });
  const done = new Set(existing.map((e) => e.fileName));
  const docs = allDocs.filter((d) => !done.has(d.metadata.source as string));

  const limit = pLimit(2);
  const failed: string[] = [];
  let saved = 0;

  await Promise.all(
    docs.map((doc, i) =>
      limit(async () => {
        const fileName = doc.metadata.source as string;
        try {
          console.log(`Processing ${i + 1}/${docs.length}: ${fileName}`);

          const summary = await summariseCode(doc);
          if (!summary) throw new Error("Empty summary");

          const embedding = await generateEmbedding(summary);
          if (embedding.length === 0) throw new Error("Empty embedding");

          const row = await db.sourceCodeEmbedding.create({
            data: { summary, projectId, sourceCode: doc.pageContent, fileName },
          });

          try {
            await db.$executeRaw`
              UPDATE "SourceCodeEmbedding"
              SET "summaryEmbedding" = ${JSON.stringify(embedding)}::vector
              WHERE id = ${row.id}
            `;
          } catch (e) {
            throw e;
          }

          saved++;
        } catch (error) {
          console.error(`FAILED ${fileName}:`, error instanceof Error ? error.message : error);
          failed.push(fileName);
        }
      })
    )
  );

  console.log(`Indexed ${saved}/${docs.length} files. Failed: ${failed.length}`);
  return { saved, failed };
};