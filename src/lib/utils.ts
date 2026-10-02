export { cn } from "cn"

export function parseGithubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  const [, owner, repo] = match;
  return { owner, repo: repo.replace(/\.git$/, "") };
}

// Sliding-window limiter: strictly enforces max 5 API calls per 60 seconds
const requestTimestamps: number[] = [];
const MAX_RPM = 5;
const WINDOW_MS = 60 * 1000;

export function enforceRateLimit() {
    const now = Date.now();
    // Evict timestamps older than 60 seconds
    while (requestTimestamps.length > 0 && requestTimestamps[0]! <= now - WINDOW_MS) {
        requestTimestamps.shift();
    }
    // Reject immediately if at or over capacity (no retry)
    if (requestTimestamps.length >= MAX_RPM) {
        const waitSeconds = Math.ceil((requestTimestamps[0]! + WINDOW_MS - now) / 1000);
        throw new Error(
            `Gemini rate limit exceeded (5 requests/minute). Try again in ${waitSeconds}s.`
        );
    }
    requestTimestamps.push(now);
}