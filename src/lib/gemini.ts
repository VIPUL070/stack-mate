import { GoogleGenAI } from "@google/genai";
import { Document } from "@langchain/core/documents";
import { embedLimiter, generateLimiter } from "./utils";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert programmer, and you are trying to summarize a git diff.
Summarize the diff concisely in bullet points under 100 words.`;

// Helper: parse retry delay from Gemini 429 errors
const getRetryDelayMs = (error: any, fallbackMs: number) => {
  const text = String(error?.message ?? "");
  const m = text.match(/retry in ([\d.]+)s/i) ?? text.match(/"retryDelay":\s*"(\d+)s"/);
  return m ? (parseFloat(m[1]!) + 1) * 1000 : Math.max(fallbackMs, 60_000);
};

export const aiSummarizeCommit = async (diff: string) => {
  if (!diff?.trim()) return "";
  const userPrompt = `Please summarise the following diff file: \n\n${diff.slice(0, 15000)}`;

  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await generateLimiter();
      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: { systemInstruction: SYSTEM_PROMPT },
      });
      return response.text ?? "";
    } catch (error: any) {
      const isRateLimited = error?.status === 429;
      const isRetryable = isRateLimited || error?.status === 503;
      const isLastAttempt = attempt === maxRetries;

      console.error(`Summarize commit error (attempt ${attempt}/${maxRetries}):`, error?.message ?? error);

      if (!isRetryable || isLastAttempt) {
        return "";
      }

      // Wait the exact time Gemini asks, or fallback to exponential backoff
      const waitTime = isRateLimited ? getRetryDelayMs(error, 20000) : 2000 * attempt;
      console.log(`Waiting ${(waitTime / 1000).toFixed(1)}s before retry...`);
      await new Promise((res) => setTimeout(res, waitTime));
    }
  }
  return "";
};

export const summariseCode = async (doc: Document) => {
  if (!doc.pageContent?.trim()) return "";
  const code = doc.pageContent.slice(0, 8000);

  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log("Getting summary for doc:", doc.metadata.source);
      await generateLimiter();
      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: `You are an intelligent senior software engineer onboarding a junior engineer.
Explain the purpose of '${doc.metadata.source}'. Here is the code:
\`\`\`
${code}
\`\`\`
Provide a concise summary under 100 words.`,
      });
      return response.text?.trim() ?? "";
    } catch (error: any) {
      if (error?.status === 429 && attempt < maxRetries) {
        const waitTime = getRetryDelayMs(error, 20000);
        console.log(`Rate limited on ${doc.metadata.source}. Waiting ${(waitTime / 1000).toFixed(1)}s...`);
        await new Promise((res) => setTimeout(res, waitTime));
        continue;
      }
      console.error("Summarizing Code Error:", error?.message ?? error);
      return "";
    }
  }
  return "";
};

const EMBEDDING_MODEL = "gemini-embedding-2";
const EMBEDDING_DIMS = 768; // must match your DB column vector(768)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const generateEmbedding = async (summary: string): Promise<number[]> => {
  if (!summary?.trim()) return [];

  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await embedLimiter();
      const response = await genAI.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: summary,
        config: { outputDimensionality: EMBEDDING_DIMS },
      });

      const values = response.embeddings?.[0]?.values ?? [];
      if (values.length !== EMBEDDING_DIMS) {
        throw new Error(`Expected ${EMBEDDING_DIMS} dims, got ${values.length}`);
      }
      return values;
    } catch (error: any) {
      lastError = error;
      const msg = String(error?.message ?? error);
      console.error(`Embedding attempt ${attempt + 1} failed:`, msg);
      if (!/429|RESOURCE_EXHAUSTED|503|UNAVAILABLE/i.test(msg)) break;
      await sleep(2000 * 2 ** attempt);
    }
  }
  throw new Error(lastError instanceof Error ? lastError.message : "Failed to generate embedding.");
};