import { GitCommitHorizontal, SearchCode, AudioLines } from "lucide-react";

export const features = [
  {
    label: "Commit summaries",
    text: "Every commit is condensed into a short, readable summary, so you can catch up without reading diffs.",
    icon: GitCommitHorizontal,
    imgUrl: '/commits.png'
  },
  {
    label: "Ask your codebase",
    text: "Ask \"Where did we add authentication?\" and get answers grounded in your source code, with references to the files used.",
    icon: SearchCode,
    imgUrl: '/questions.png'
  },
  {
    label: "Meetings to issues",
    text: "Upload a recording. It is transcribed and broken into actionable issues, each with a headline, gist, summary and timestamps.",
    icon: AudioLines,
    imgUrl: '/issues.png'
  },
];