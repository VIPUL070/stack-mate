'use server';

import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { generateEmbedding } from '@/lib/gemini';
import { db } from '@/server/db';
import { enforceRateLimit } from '@/lib/utils';

export async function askQuestion(question: string, projectId: string) {
    try {
        // 1. Check rate limit & generate embedding (Request 1)
        enforceRateLimit();
        const queryVector = await generateEmbedding(question);

        if (!queryVector || queryVector.length === 0) {
      throw new Error('Failed to generate embedding: Gemini returned an empty vector.');
    }
        const vectorQuery = `[${queryVector.join(',')}]`;

        const docs = (await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector ) AS similarity
      FROM "SourceCodeEmbedding"
      WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector ) > .5
      AND "projectId" = ${projectId}
      ORDER BY similarity DESC
      LIMIT 10
    `) as { fileName: string; sourceCode: string; summary: string }[];

        let context = '';
        for (const doc of docs) {
            context += `Source File: ${doc.fileName}\nCode:\n${doc.sourceCode}\nSummary: ${doc.summary}\n\n`;
        }

        // 3. Check rate limit & stream answer (Request 2)
        enforceRateLimit();

        const { textStream } = streamText({
            model: google(`gemini-2.0-flash`),
            prompt: `You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to understand the codebase.
AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the world.
If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions.
START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION
AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question."
AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.
Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure there is no ambiguity.`,
    });

    return {
      output: textStream,
      filesReferences: docs,
    };
    } catch (error) {
        throw new Error(error instanceof Error ? error?.message : 'Failed to complete question request.');
    }
}