export { cn } from "cn"

export function parseGithubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  const [, owner, repo] = match;
  return { owner, repo: repo.replace(/\.git$/, "") };
}

export const msToTime = (ms: number) => {
    const seconds = ms / 1000;
    const mins = Math.floor(seconds / 60);
    const remainingSecs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2,'0')}: ${remainingSecs.toString().padStart(2,'0')}`
}

// Sliding-window limiter: strictly enforces max 5 API calls per 60 seconds
const makeLimiter = (name: string, maxPerMinute: number) => {
  // store on globalThis so Next.js dev hot-reload doesn't reset the counter
  const g = globalThis as any;
  g.__limiters ??= {};
  g.__limiters[name] ??= [] as number[];
  const stamps: number[] = g.__limiters[name];

  return async () => {
    while (true) {
      const now = Date.now();
      while (stamps.length && stamps[0]! <= now - 60_000) stamps.shift();
      if (stamps.length < maxPerMinute) {
        stamps.push(now);
        return;
      }
      const wait = stamps[0]! + 60_000 - now + 200;
      await new Promise((r) => setTimeout(r, wait));
    }
  };
};

// Separate budgets because Google counts them separately.
export const embedLimiter = makeLimiter("embed", 5);        // raise if your embedding quota is higher
export const generateLimiter = makeLimiter("generate", 10); // your error showed a 15/min limit