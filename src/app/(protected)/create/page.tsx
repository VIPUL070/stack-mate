"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { islandToast } from "@/lib/toast";
import { api } from "@/trpc/react";
import { CreateFormInput } from "@/types/create-project";
import Image from "next/image";
import { useForm } from "react-hook-form";

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<CreateFormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();

  function onSubmit(data: CreateFormInput) {
    islandToast.loading("Linking Repository...", {
      description: "Connecting your GitHub repo to StackMate",
    });

    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          islandToast.success("Project Created", {
            description: `${data.projectName} is ready to use`,
          });
          refetch();
          reset();
        },
        onError: (error) => {
          islandToast.error("Failed to Create", {
            description: error.message || "Could not link repository.",
          });
        },
      }
    );
    return true;
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
            <div className="h-4"></div>
            <Button
              size="lg"
              type="submit"
              className="bg-active-primary text-active-text"
              disabled={createProject.isPending}
            >
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;