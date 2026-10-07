"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import Image from "next/image";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });
  console.log(members);
  return (
    <div className="flex items-center gap-2 cursor-pointer hover:-rotate-30 transition-transform ">
      {members?.map((member) => (
        <Image
          key={member.id}
          src={member.user.imageUrl || "/logo.png"}
          alt={member.user.firstName ?? "member-img"}
          className="w-8 h-8 rounded-full"
          width={30}
          height={30}
        />
      ))}
    </div>
  );
};

export default TeamMembers;
