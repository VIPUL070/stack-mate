"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { cn } from "../../lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const CommitLogs = () => {
  const { projectId, project } = useProject();

  const { data: commits } = api.project.getCommits.useQuery({ projectId });

  return (
    <>
      <ul className="space-y-6">
        {commits?.map((commit, commitIdx) => {
          return (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                  "absolute top-0 left-0 flex w-6 justify-center"
                )}
              >
                <div className="w-px translate-x-1 bg-gray-200/70"></div>
              </div>

              <>
                <Image
                  src={commit.commitAuthorAvatar}
                  width={8}
                  height={8}
                  alt="commit avatar"
                  className="relative mt-4 size-8 flex-none rounded-full bg-grey-50"
                />
                <div className="flex-auto rounded-md bg-background p-3 shadow-sm ">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                      className="py-0.5 flex items-center gap-x-3 text-sm leading-3 text-grey-500 "
                    >
                      <span className="font-medium text-grey-900 ">
                        {commit.commitAuthorName}
                      </span>
                      <span className="inline-flex items-center">
                        commited
                        <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="font-medium">{commit.commitMessage}</span>

                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-grey-500">
                    {commit.summary}
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLogs;