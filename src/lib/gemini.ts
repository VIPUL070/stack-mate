import { GoogleGenAI } from "@google/genai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert programmer, and you are trying to summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.
[...]
EXAMPLE SUMMARY COMMENTS:
\`\`\`
* Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
* Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
* Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
* Added an OpenAI API for completions [packages/utils/apis/openai.ts]
* Lowered numeric tolerance for test files
\`\`\`
Most commits will have less comments than this examples list.
The last comment does not include the file names,
because there were more than two relevant files in the hypothetical commit.
Do not include parts of the example in your summary.
It is given only as an example of appropriate comments.`;

export const aiSummarizeCommit = async (diff: string) => {
    const userPrompt = `Please summarise the following diff file: \n\n${diff}`;
    if (!diff?.trim()) return "";

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await genAI.models.generateContent({
                model: "gemini-3.8-flash",
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                },
            });
            return response.text ?? "";
        } catch (error: any) {
            const isRetryable = error?.status === 503 || error?.status === 429;
            const isLastAttempt = attempt === maxRetries;

            console.error(`Summarize commit error (attempt ${attempt}/${maxRetries}):`, error?.message ?? error);

            if (!isRetryable || isLastAttempt) {
                throw new Error("Failed to summarize commit");
            }

            // exponential backoff: 1s, 2s, 4s...
            await new Promise((res) => setTimeout(res, 1000 * 2 ** (attempt - 1)));
        }
    }
    return "";
};

export const summariseCode = async (doc: Document) => {
    try {
        console.log('getting summary for docs', doc.metadata.source);
        const code = doc.pageContent.slice(0, 10000)
        const response = await genAI.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `You are an intelligent senior software engineer who specialisis in onboarding junior software engineer onto projects. 
            You are onbarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file. Here is the code : 
            \`\`\`
            ${code}
            \`\`\`
              Give a summary no more than 100 words of the code above.
            `
        })
        return response.text?.trim() ?? ""
    } catch (error) {
        console.log('Summarizing Code Error', error)
        return ""; 
    }
}

export const generateEmbedding = async (summary: string) => {
  try {
    const response = await genAI.models.embedContent({
      model: "text-embedding-004",
      contents: summary,
    });
    const embedding = response.embeddings?.[0]?.values ?? []
    return embedding;
  } catch (error) {
    console.error("Embedding generation error:", error);
    return [];
  }
}