"use client";

import useProject from "@/hooks/use-project";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Image from "next/image";
import { askQuestion } from "@/app/(protected)/dashboard/actions";
import { FileReference } from "@/types/ask-question";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { islandToast } from "@/lib/toast";
import useRefetch from "@/hooks/use-refetch";

const QuestionCard = () => {
  const { project } = useProject();
  const [open, setOpen] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [filesReferences, setFilesReferences] = useState<FileReference[]>([]);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState("");

  const refetch = useRefetch();

  const saveAnswer = api.project.saveOutput.useMutation();
  const saveOutput = () => {
    islandToast.loading("Linking DB...", {
      description: "Connecting your DB to StackMate",
    });
    saveAnswer.mutate({
      projectId: project!.id,
      question,
      output,
      filesReferences,
    }, {
      onSuccess: () => {
        islandToast.success(`Answer is saved!` , {
          description: `   `
        });
        refetch();
      }, 
      onError: () => {
        islandToast.error(`Unable to save the answer`, {
          description: `   `
        })
      }
    }
  );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setOutput("");
    setFilesReferences([]);
    e.preventDefault();
    if (!question.trim() || !project) return;
    setLoading(true);

    try {
      const { output, filesReferences } = await askQuestion(
        question,
        project.id
      );
      setOpen(true);
      // 2. Consume the stream here
      setFilesReferences(filesReferences);
      for await (const delta of output) {
        if (delta) {
          setOutput((prev) => prev + delta);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err?.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[50vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image src="/logo.png" alt="logo" width={32} height={32} />
              </DialogTitle>
              <Button variant={`outline`} onClick={saveOutput} disabled={saveAnswer.isPending}>
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          <MDEditor.Markdown
            source={output}
            className="max-w-[45vw] h-full! max-h-[40vh] overflow-scroll scrollbar-none"
          />
          <div className="h-4" />
          <CodeReferences fileReferences={filesReferences} />

          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-4">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              onChange={(e) => setQuestion(e.target.value ?? "")}
            />
            <div className="h-4" />
            <Button type="submit" disabled={loading}>
              Ask Stackmate!
            </Button>
            {error ?? <span className="text-rose-500 m-2">{error}</span>}
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionCard;
