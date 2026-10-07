"use client";
import useProject from "@/hooks/use-project";
import { Button } from "../ui/button";
import { islandToast } from "@/lib/toast";
import { api } from "@/trpc/react";

const SyncCommit = () => {
  const { projectId } = useProject();
  const sync = api.project.syncCommits.useMutation();

  const handleSync = () => {
    sync.mutate(
      {
        projectId: projectId,
      },
      {
        onSuccess: () => {
          islandToast.success(`Commits synced successfully.`);
        },
        onError: () => {
          islandToast.error(`Unable to sync commits`);
        },
      }
    );
  };

  return (
    <Button onClick={handleSync} disabled={sync.isPending}>
      Sync Commits
    </Button>
  );
};

export default SyncCommit;