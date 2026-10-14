export const data = {
  header: {
    titleLine1: "Your codebase,",
    titleLine2: "remembered.",
    description:
      "StackMate connects to your GitHub repository and gives your team a shared memory of the project. It summarizes what changed, captures decisions from meetings, and answers questions about the code in plain English, always pointing back to the files it used.",
  },
  accordionItems: [
    {
      id: "commits",
      number: "1.",
      title: "Catch up without\nreading diffs",
      content: {
        paragraph:
          "Every commit is condensed into a short, readable summary, so you always know what changed and why without digging through the code.",
        bullets: [
          "Short, readable summary for every commit",
          "Catch up on a day or a week in minutes",
          "Share one timeline across the whole team",
        ],
      },
    },
    {
      id: "ask",
      number: "2.",
      title: "Ask your codebase",
      content: {
        paragraph:
          "Ask questions in plain English, like \"Where did we add authentication?\" or \"Who changed the payment flow?\" Answers are grounded in your source code using vector embeddings.",
        bullets: [
          "Answers include references to the files used",
          "Understand unfamiliar code faster",
          "Save the answers worth keeping",
        ],
      },
    },
    {
      id: "meetings",
      number: "3.",
      title: "Turn meetings\ninto issues",
      content: {
        paragraph:
          "Upload a meeting recording. It is transcribed with AssemblyAI and broken into actionable issues, so decisions never get lost.",
        bullets: [
          "Each issue has a headline, gist and summary",
          "Timestamps link back to the exact moment",
          "Share projects so everyone sees the same meetings",
        ],
      },
    },
  ],
  diagram: {
    root: "S",
    branches: [
      {
        text: "Commits",
        x: 290,
        y: 100,
        delay: 0.8,
        children: [
          { text: "Summaries", x: 560, y: 60, delay: 1.8 },
          { text: "Timeline", x: 560, y: 140, delay: 2.0 },
        ],
      },
      {
        text: "Ask",
        x: 290,
        y: 260,
        delay: 1.05,
        children: [
          { text: "File refs", x: 560, y: 220, delay: 2.2 },
          { text: "Saved answers", x: 560, y: 300, delay: 2.4 },
        ],
      },
      {
        text: "Meetings",
        x: 290,
        y: 420,
        delay: 1.3,
        children: [
          { text: "Issues", x: 560, y: 380, delay: 2.6 },
          { text: "Timestamps", x: 560, y: 460, delay: 2.8 },
        ],
      },
    ],
  },
};