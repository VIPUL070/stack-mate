"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { islandToast } from "@/lib/toast";
import { api } from "@/trpc/react";
import { CreateFormInput } from "@/types/create-project";
import { Info } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<CreateFormInput>();
  const createProject = api.project.createProject.useMutation();
  const checkCreditsCount = api.project.checkCredits.useMutation();
  const indexProject = api.project.indexProject.useMutation();
  const refetch = useRefetch();

  const hasEnoughCredits = checkCreditsCount.data
  ? checkCreditsCount.data.fileCount <= (checkCreditsCount.data.userCredits ?? 0)
  : false;

  const handleCreateProject = (data: CreateFormInput) => {
    islandToast.loading("Linking Repository...", {
      description: "Connecting your GitHub repo to StackMate",
    });
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken || undefined,
      },
      {
        onSuccess: (project) => {
          islandToast.success("Project Created", {
            description: `${data.projectName} created. Starting code indexing...`,
          });

          indexProject.mutate(
            {
              projectId: project!.id,
              githubUrl: data.repoUrl,
              githubToken: data.githubToken || undefined,
            },
            {
              onSuccess: () => {
                islandToast.success("Indexing Complete", {
                  description: `${data.projectName} is fully indexed and ready to query.`,
                });
              },
              onError: (err) => {
                islandToast.error("Indexing Failed", {
                  description: err.message || "Could not index repository files.",
                });
              },
            }
          );
          refetch();
          reset();
          checkCreditsCount.reset();
        },
        onError: (error) => {
          islandToast.error("Failed to Create", {
            description: error.message || "Could not link repository.",
          });
        },
      }
    );
  }

function onSubmit(data: CreateFormInput) {
  if (!checkCreditsCount.data) {
    checkCreditsCount.mutate({
      githubUrl: data.repoUrl,
      githubToken: data.githubToken,
    });
  } else if (hasEnoughCredits) {
    handleCreateProject(data);
  }
}

  return (
    <div className="flex items-center justify-center gap-12 h-full">
      <Image
        src="/work-github.svg"
        alt="work-github"
        width={206}
        height={206}
      />
      <div>
        <div>
          <h1 className="semi-bold text-2xl">Link of your GitHub Repository</h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repossitory link to StackMate.
          </p>
          <div className="h-4"></div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="GitHub URL"
              type="url"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (Optional)"
            />
            {checkCreditsCount.data && (
              <>
              <div className="mt-4 rounded-md border border-active-primary/30 bg-active-primary/5 p-4 text-active-primary shadow-sm">
                <div className="flex items-center gap-2">
                  <Info className="size-4"/>
                  <p className="text-sm">You will be charged <strong>{checkCreditsCount.data?.fileCount}</strong> credits for this repository.</p>
                </div>
                <p className="text-sm ml-8">You have <strong>{checkCreditsCount.data?.userCredits}</strong> credits remaining.</p>
              </div>
              </>
            )}
            <div className="h-4"></div>
            <Button
              size="lg"
              type="submit"
              className="bg-active-primary text-active-text"
              disabled={createProject.isPending || checkCreditsCount.isPending || (!!checkCreditsCount.data && !hasEnoughCredits)}
            >
              {createProject.isPending
                ? "Creating..."
                : checkCreditsCount.data
                ? "Create project"
                : "Check Credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;