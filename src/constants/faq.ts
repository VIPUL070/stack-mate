import { FaqItem } from "@/components/landing/faq";

const faqs = [
  [
    "What is StackMate?",
    "StackMate is an AI collaborator for your GitHub projects. Connect a repository and it summarizes your commits, turns meeting recordings into actionable issues, and answers questions about your codebase in plain English.",
  ],
  [
    "How do I get started?",
    "Sign in, create a project, and paste your GitHub repository link. For private repositories, add a GitHub access token. StackMate then pulls in your commit history and indexes your source code so it's ready to answer questions.",
  ],
  [
    "What do the commit summaries show?",
    "Every commit gets a short, readable summary next to its author, date, and message. You can catch up on what changed in the project without opening a single diff.",
  ],
  [
    "Can I ask questions about my project?",
    "Yes. Ask things like \"Where did we add login?\" or \"Who changed the payment flow?\" StackMate searches your code using embeddings, then answers with the files it used as references. You can save useful answers to come back to later.",
  ],
  [
    "How do meeting uploads work?",
    "Upload a recording of your project meeting. StackMate transcribes it with AssemblyAI, then breaks the conversation into issues, each with a headline, a short gist, a summary, and timestamps. You'll see the meeting marked as processing until it's done.",
  ],
  [
    "Can my team use the same project?",
    "Yes. Projects can be shared with teammates, so everyone sees the same commit summaries, meeting issues, and saved answers in one place.",
  ],
  [
    "How do credits work?",
    "Credits power StackMate's AI features. Every new account starts with free credits, and you can top up anytime through a secure Razorpay checkout in INR.",
  ],
  [
    "Is my code safe?",
    "Your projects stay private to your account and the teammates you add. StackMate only reads the repository you connect, in order to generate summaries and answers.",
  ],
];

export const formattedFaqs: FaqItem[] = faqs.map(([question, answer], index) => ({
  id: `faq-${index}`,
  question,
  answer,
}));