'use client';

import CodeReferences from "@/components/dashboard/code-references";
import QuestionCard from "@/components/dashboard/question-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { FileReference } from "@/types/ask-question";
import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";
import { useState } from "react";

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [open, setOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const activeQuestion = questions?.[questionIndex];

  return (
    <div className="flex flex-col gap-6">
      <QuestionCard />

      <section className="flex flex-col gap-3">
        <h1 className="text-xl">Saved Questions</h1>

        <div className="flex flex-col gap-2">
          {questions?.map((question, i) => (
            <button
              key={question.id}
              type="button"
              onClick={() => {
                setQuestionIndex(i);
                setOpen(true);
              }}
              className="flex w-full items-start gap-3 rounded-lg border bg-background p-3 text-left shadow transition-shadow hover:shadow-md"
            >
              {question.user.imageUrl ? (
                <Image
                  src={question.user.imageUrl}
                  alt="user-img"
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-full"
                />
              ) : (
                <div className="size-8 shrink-0 rounded-full border" />
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-1 text-lg font-medium text-grey-700">
                    {question.question}
                  </p>
                  <span className="shrink-0 whitespace-nowrap text-xs text-grey-400">
                    {question.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-grey-500">
                  {question.answer}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="data-[side=right]:sm:max-w-2xl">
          {activeQuestion && (
            <>
              <SheetHeader className="border-b pr-14">
                <SheetTitle className="text-base leading-snug">
                  {activeQuestion.question}
                </SheetTitle>
              </SheetHeader>

              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto scrollbar-none p-6">
                <MDEditor.Markdown source={activeQuestion.answer} />
                <CodeReferences
                  fileReferences={
                    Array.isArray(activeQuestion.filesReferences)
                      ? (activeQuestion.filesReferences as FileReference[])
                      : []
                  }
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default QAPage;