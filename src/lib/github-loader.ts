import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import pLimit from 'p-limit';
import { db } from "@/server/db";

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    if (!githubUrl) {
        throw new Error("GitHub URL is required");
    }
    try {
        const loader = new GithubRepoLoader(githubUrl, {
            accessToken: githubToken || "",
            branch: "main",
            ignoreFiles: [
                // Lock files
                "package-lock.json",
                "yarn.lock",
                "pnpm-lock.yaml",
                "bun.lockb",

                // Environment & Secret files
                ".env",
                ".env.local",
                ".env.development",
                ".env.production",

                // Build & Cache outputs
                "dist",
                "build",
                ".next",
                "out",
                ".cache",

                // IDE & System files
                ".DS_Store",
                "Thumbs.db",
                ".vscode",
                ".idea",
            ],
            recursive: true,
            unknown: 'warn',
            maxConcurrency: 5
        })
        const docs = await loader.load();
        const ignoredExtensions = [
            ".png", ".jpg", ".jpeg", ".gif", ".ico",
            ".svg", ".pdf", ".zip", ".mp4", ".woff", ".woff2"
        ];

        return docs.filter((doc) => {
            const source = doc.metadata.source?.toLowerCase() || "";
            return !ignoredExtensions.some((ext) => source.endsWith(ext));
        });
    } catch (error) {
        console.log('Loading GithubRepo Error', error)
        throw new Error(
            `Failed to load github repo: ${error instanceof Error ? error.message : "Unknown error"}`
        )
    }
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    if (!githubUrl || !projectId) {
        throw new Error("GitHub URL and Project Id is required");
    }
    try {
        const docs = await loadGithubRepo(githubUrl, githubToken);
        const allEmbeddings = await generateEmbeddings(docs);

        const limitDb = pLimit(10);
        await Promise.allSettled(allEmbeddings.map((embedding, i) =>

            limitDb(async () => {
                if (!embedding || !embedding.summary) return;
                console.log(`Processing DB persistence ${i + 1} of ${allEmbeddings.length}`);

                try {
                    const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
                        data: {
                            summary: embedding.summary,
                            projectId,
                            sourceCode: embedding.sourceCode,
                            fileName: embedding.fileName
                        }
                    })

                    await db.$executeRaw`
            UPDATE "SiurceCodeEmbedding"
            SET "summaryEmbedding" = ${embedding.embedding}::vector
            WHERE id = ${sourceCodeEmbedding.id}
          `;
                } catch (error) {
                    console.log('Save to DB Error', error)
                    throw new Error(
                        `Failed to save embedding to db: ${error instanceof Error ? error.message : "Unknown error"}`
                    )
                }

            })
        ))

    } catch (error) {
        console.log('Indexing GithubRepo Error', error)
        throw new Error(
            `Failed to index github repo: ${error instanceof Error ? error.message : "Unknown error"}`
        )
    }
}

export const generateEmbeddings = async (docs: Document[]) => {
    const limit = pLimit(5);
    try {
        const tasks = docs.map((doc) =>
            limit(async () => {
                const summary = await summariseCode(doc);
                const embedding = await generateEmbedding(summary)
                return {
                    summary,
                    embedding,
                    sourceCode: doc.pageContent,
                    fileName: doc.metadata.source as string,
                }
            })
        );
        return await Promise.all(tasks);
    } catch (error) {
        console.log('generate Embeddings Error', error)
        throw new Error(
            `Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`
        )
    }
}