"use client";

import MeetingCard from "@/components/dashboard/meeting-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import Link from "next/link";

const MeetingsPage = () => {
  const { projectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    {
      refetchInterval: 20000,
    }
  );

  return (
    <>
      <MeetingCard />
      <div className="h-4" />
      <h1 className="text-xl">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No Meetings Found.</div>}
      {isLoading && <div>Loading Your Meetings...</div>}

      <ul className="divide-y divide-gray-200 mt-4">
        {meetings?.map((meeting) => {
          return (
            <li
              key={meeting.id}
              className="flex items-center justify-between p-4 gap-x-5 shadow-md border rounded-lg"
            >
              <div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/meetings/${meeting.id}`} className="text-sm">
                      {meeting.name}
                    </Link>
                    {meeting.status === "PROCESSING" && (
                      <Badge className="bg-yellow-300 text-active-text">
                        Processing...
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-500 gap-x-2">
                  <p className="whitespace-nowrap">
                    {meeting.createdAt.toLocaleDateString()}
                  </p>
                  <p className="truncate">{meeting.issues.length} issues</p>
                </div>
              </div>
              <div className="flex items-center flex-none gapx-4">
                <Link href={`/meetings/${meeting.id}`}>
                  <Button>View</Button>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default MeetingsPage;