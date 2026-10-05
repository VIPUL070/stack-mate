import { AssemblyAI } from "assemblyai";
import { msToTime } from "./utils";

const apiKey = process.env.ASSEMBLYAI_API_KEY;
if (!apiKey) throw new Error("ASSEMBLYAI_API_KEY is not set");

const client = new AssemblyAI({ apiKey });

export const processMeeting = async (meetingUrl: string) => {
  if (!meetingUrl) throw new Error("meetingUrl is required");

  const transcript = await client.transcripts.transcribe({
    audio: meetingUrl,
    auto_chapters: true,
    
  });

  if (transcript.status === "error") {
    throw new Error(`Transcription failed: ${transcript.error}`);
  }

  if (!transcript.text) {
    throw new Error("No transcript text found (audio may be silent or empty).");
  }

  const summaries =
    transcript.chapters?.map((chapter) => ({
      start: msToTime(chapter.start),
      end: msToTime(chapter.end),
      gist: chapter.gist,
      headline: chapter.headline,
      summary: chapter.summary,
    })) ?? [];

  return {
    summaries,
  };
};