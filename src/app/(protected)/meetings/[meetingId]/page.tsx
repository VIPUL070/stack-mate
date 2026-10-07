import IssuesList from "@/components/meeting/issues-list";
import { MeetingDetailProps } from "@/types/meeting";

const MeetingDetailsPage = async ({params}: MeetingDetailProps) => {
  const {meetingId} = await params;
  return(
    <IssuesList meetingId={meetingId} />
  );
}

export default MeetingDetailsPage;