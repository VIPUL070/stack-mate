export { cn } from "cn"

export function parseGithubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  const [, owner, repo] = match;
  return { owner, repo: repo.replace(/\.git$/, "") };
}