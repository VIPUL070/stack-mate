<div align="center">

# StackMate

**The AI collaborator for your GitHub projects.**

Understand every commit. Turn meetings into issues. Ask your codebase anything.

</div>

---

## Overview

StackMate connects to a GitHub repository and gives your team a shared memory of the project. It summarizes what changed, captures decisions from meetings, and answers questions about the code in plain English, always pointing back to the files it used.

## Features

- **Commit summaries.** Every commit is condensed into a short, readable summary, so you can catch up without reading diffs.
- **Ask your codebase.** Ask questions such as "Where did we add authentication?" or "Who changed the payment flow?" Answers are grounded in your source code using vector embeddings and include file references. Save the ones worth keeping.
- **Meetings to issues.** Upload a meeting recording. It is transcribed with AssemblyAI and broken into actionable issues, each with a headline, gist, summary, and timestamps.
- **Team projects.** Share a project so everyone sees the same commits, meetings, and saved answers.
- **Credits.** Usage is metered with credits. New accounts start with a free balance, and top-ups are handled through Razorpay.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Motion |
| API | tRPC, TanStack Query, Zod |
| Database | PostgreSQL with pgvector, Prisma 7 |
| Auth | Clerk |
| AI | Google Gemini, Vercel AI SDK, LangChain |
| Transcription | AssemblyAI |
| GitHub | Octokit |
| Storage | Supabase |
| Payments | Razorpay |

## Getting Started

### Prerequisites

- Node.js 20 or later
- A PostgreSQL database with the `pgvector` extension enabled
- Accounts and API keys for Clerk, Google AI Studio, AssemblyAI, Supabase, and Razorpay

### Installation

```bash
git clone https://github.com/VIPUL070/stack-mate.git
cd stack-mate
npm install
```

### Environment

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI
GEMINI_API_KEY=

# Transcription
ASSEMBLYAI_API_KEY=

# GitHub
GITHUB_TOKEN=

# Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Payments (Razorpay)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Database

```bash
npx prisma generate
npx prisma migrate dev
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## How It Works

1. **Connect.** Add a GitHub repository to a project.
2. **Index.** StackMate fetches the commit history and source files, summarizes them, and stores vector embeddings in PostgreSQL.
3. **Ask.** Your question is embedded, matched against the most relevant files, and answered with those files as context.
4. **Capture.** Meeting recordings are transcribed and turned into structured issues.

## Project Structure

```
prisma/    Database schema and migrations
public/    Static assets
src/       Application source (app routes, components, server logic)
```

## Deployment

StackMate deploys to any platform that supports Next.js, such as Vercel. Set the same environment variables in your hosting dashboard, run `npx prisma migrate deploy` against your production database, and point your Clerk and Razorpay configuration at the production domain.

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first to discuss what you would like to change.