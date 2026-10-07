import { RouterOutputs } from "@/trpc/react";

export interface MeetingProps {
    meetingUrl: string;
    meetingId: string;
}

export interface MeetingDetailProps {
    params: Promise<{ meetingId: string }>
}

export interface IssueProps {
    meetingId: string;
}

export interface IssueCardProps {
    issue : NonNullable<RouterOutputs["project"]["getMeetingById"]>["issues"][number]
}