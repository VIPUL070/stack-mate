"use client";

import MeetingCard from "@/components/dashboard/meeting-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { islandToast } from "@/lib/toast";
import { api } from "@/trpc/react";
import Link from "next/link";

const MeetingsPage = () => {
  const { projectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    {
      refetchInterval: 10000,
    }
  );
  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const refetch = useRefetch();

  const handleDeleteMeeting = (meetingId: string) => {
    deleteMeeting.mutate(
      {
        meetingId,
      },
      {
        onSuccess: () => {
          islandToast.success("Meeting deleted successfully!");
          refetch();
        },
        onError: () => {
          islandToast.error("Meeting deletion failed");
        },
      }
    );
  };

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
                      <Badge className="bg-yellow-500 text-active-text p-2.5 text-xs">
                        Processing...
                      </Badge>
                    )}
                    {meeting.status === "COMPLETED" && (
                      <Badge className="bg-green-500 text-active-text p-2.5 text-xs">
                        Completed
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
              <div className="flex items-center flex-none gap-x-4">
                <Link href={`/meetings/${meeting.id}`}>
                  <Button >View Meeting</Button>
                </Link>
                <Button
                  variant={`destructive`}
                  disabled={deleteMeeting.isPending}
                  onClick={() => handleDeleteMeeting(meeting.id)}
                >
                  Delete Meeting
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default MeetingsPage;