export const telemetryData = [
  { date: "Oct 01", queries: 42, commits: 18, issues: 4 },
  { date: "Oct 03", queries: 68, commits: 24, issues: 7 },
  { date: "Oct 05", queries: 95, commits: 31, issues: 9 },
  { date: "Oct 07", queries: 84, commits: 28, issues: 6 },
  { date: "Oct 09", queries: 142, commits: 45, issues: 12 },
  { date: "Oct 11", queries: 128, commits: 38, issues: 8 },
  { date: "Oct 13", queries: 176, commits: 52, issues: 15 },
];

export const topFiles = [
  { path: "src/server/routers/billing.ts", count: "142 citations", tag: "Razorpay" },
  { path: "src/lib/vector/pgvector.ts", count: "98 citations", tag: "RAG" },
  { path: "src/jobs/assembly-transcribe.ts", count: "64 citations", tag: "Audio" },
];

export const recentInquiries = [
  {
    query: "Where do we verify Razorpay webhook signatures?",
    source: "commit: b49e21f",
    time: "12m ago",
  },
  {
    query: "What decision was made about token limits in yesterday's call?",
    source: "meeting: Sprint-24.mp4",
    time: "48m ago",
  },
];