'use client';

import CodeReferences from "@/components/dashboard/code-references";
import QuestionCard from "@/components/dashboard/question-card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { FileReference } from "@/types/ask-question";
import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";
import React, { useState } from "react";

const QAPage = () => {
  const {projectId} = useProject();
  const {data:questions} = api.project.getQuestions.useQuery({projectId});

  const [questionIndex , setQuestionIndex ] = useState(0);
  const activeQuestion = questions?.[questionIndex];

  return (
    <Sheet>
       <QuestionCard />
       <div className="h-4" />
       <h1 className="text-xl ">Saved Questions</h1>
       <div className="h-2"/>
       <div className="flex flex-col gap-2">
          {questions?.map((question,i) => {
            return (
              <React.Fragment key={question.id}>
                <SheetTrigger onClick={() => setQuestionIndex(i)}>
                  <div className="flex items-center gap-4 bg-background rounded-lg shadow border">
                    <Image src={question.user.imageUrl ?? ""} alt="user-img" width={30} height={30} className="rounded-full"/>
                    
                    <div className="text-left flex flex-col">
                      <div className="flex items-center gap-2">
                          <p className="text-grey-700 lime-clamp-1 text-lg font-medium">
                             {question.question}
                          </p> 
                          <span className="text-xs text-grey-400 whitespace-nowrap">
                            {question.createdAt.toLocaleDateString()}
                          </span>
                      </div>
                      <p className="text-grey-500 line-clamp-1 text-sm">
                        {question.answer}
                      </p>
                    </div>

                  </div>
                </SheetTrigger>
              </React.Fragment>
            )
          })}
       </div>
       {activeQuestion && (
          <SheetContent className="sm:mx-w-[60vw]">
            <SheetHeader>
                <SheetTitle>
                   {activeQuestion.question}
                </SheetTitle>
                <MDEditor.Markdown source={activeQuestion.answer} />
                <CodeReferences
                  fileReferences={Array.isArray(activeQuestion.filesReferences)
                    ? activeQuestion.filesReferences as FileReference[]
                    : []}
                />
            </SheetHeader>
          </SheetContent>
       )}
    </Sheet>
  )
}

export default QAPage;