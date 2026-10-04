"use client";

import CommitLogs from "@/components/dashboard/commit-log";
import MeetingCard from "@/components/dashboard/meeting-card";
import QuestionCard from "@/components/dashboard/question-card";
import useProject from "@/hooks/use-project";
import { ExternalLink, GitBranch } from "lucide-react";
import Link from "next/link";

const Dashboard = () => {
  const { project } = useProject();
  console.log(project)
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-y-4">
        {/* githublink */}
        <div className="w-fit rounded-md bg-active-primary px-4 py-3">
          <div className="flex items-center justify-center">
            <GitBranch className="size-4 text-secondary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary">
                This project is linked to {"   "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="inline-flex items-center text-secondary/90 hover:underline"
                >
                  {project?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4"></div>
        {/* members , link and archive */}
        <div className="flex items-center gap-4">
          Team Members
          Invite Button
          Archive button 
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <QuestionCard />
          <MeetingCard />
        </div>
      </div>

      <div className="mt-8">
        <CommitLogs />
      </div>

    </div>
  );
};

export default Dashboard;