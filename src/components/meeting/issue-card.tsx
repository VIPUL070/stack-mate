'use client'

import { IssueCardProps } from "@/types/meeting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

const IssueCard = ({ issue }: IssueCardProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-base leading-snug">{issue.gist}</DialogTitle>
            <DialogDescription>{issue.createdAt.toLocaleDateString()}</DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto scrollbar-none">
            <p className="text-grey-600">{issue.headline}</p>
            <blockquote className="border-l-4 border-grey-300 bg-grey-50 p-4">
              <span className="text-sm text-grey-600">
                {issue.start} - {issue.end}
              </span>
              <p className="mt-1 font-medium italic leading-relaxed text-grey-800">
                {issue.summary}
              </p>
            </blockquote>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="relative flex h-full flex-col">
        <CardHeader className="gap-2">
          <CardTitle className="line-clamp-2 text-xl">{issue.gist}</CardTitle>
          <div className="border-b" />
          <CardDescription className="line-clamp-3">{issue.headline}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-0">
          <Button onClick={() => setOpen(true)}>Details</Button>
        </CardContent>
      </Card>
    </>
  )
}

export default IssueCard;