'use client';

import { api } from "@/trpc/react";
import { IssueProps } from "@/types/meeting";
import { VideoIcon } from "lucide-react";
import IssueCard from "./issue-card";

const IssuesList = ({meetingId}: IssueProps) => {
    const {data: meeting , isLoading} = api.project.getMeetingById.useQuery({meetingId}, {
        refetchInterval: 10000,
    })
    if(isLoading || !meeting){
        return(
            <div className="font-semibold">Loading Meeting...</div>
        )
    }
    return(
      <div className="p-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-6 lg:mx-0 lg:mx-w-none">
         <div className="flex items-center gap-x-6">
            <div className="rounded-full border bg-active-primary text-active-text p-3">
              <VideoIcon className="h-6 w-6"/>
            </div>
            <h1>
                <div className="text-sm leading-6 text-grey-200">
                   Meeting on {" "} {meeting.createdAt.toLocaleDateString()}
                </div>
                <div className="mt-1 text-base leading-6 text-grey-900">
                   {meeting.name}
                </div>
            </h1>
         </div>
        </div>

        <div className="h-4" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
           {meeting.issues.map((issue) => {
            return(
                <IssueCard key={issue.id}  issue={issue} />
            )
           })}
        </div>
      </div>  
    );
}

export default IssuesList;