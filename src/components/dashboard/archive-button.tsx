'use client'

import { api } from "@/trpc/react";
import { Button } from "../ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { islandToast } from "@/lib/toast";

const Archive = () => {
  const {projectId} = useProject();
  const archiveProject = api.project.archiveProject.useMutation();
  const refetch = useRefetch();

  const handleArchive = () => {
    const confirm = window.confirm(`Are you sure you want to archive this project?`)
    if(confirm) archiveProject.mutate({projectId: projectId}, {
       onSuccess: () => {
        islandToast.success(`Project archived.`);
        refetch();
       },
       onError: () => {
        islandToast.error(`Failed to archive project.`)
       }
    })
  }

  return(
    <Button onClick={handleArchive} disabled={archiveProject.isPending} variant={`destructive`} >
        Archive
    </Button>
  )
}

export default Archive;