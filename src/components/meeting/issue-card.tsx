'use client'

import { IssueCardProps } from "@/types/meeting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

const IssueCard = ({issue}: IssueCardProps) => {
  const [open ,setOpen] = useState<boolean>(false);

  return(
    <>
    <Dialog open={open}  onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{issue.gist}</DialogTitle>
                <DialogDescription>{issue.createdAt.toLocaleDateString()}</DialogDescription>
                <p className="text-grey-600">
                    {issue.headline}
                </p>
                <blockquote className="mt-3 border-l-4 border-grey-300 bg-grey-50 p-4">
                  <span className="text-sm text-grey-600">
                      {issue.start} - {issue.end}
                  </span>
                  <p className="font-medium italic leading-relaxed text-grey-800">
                     {issue.summary}
                  </p>
                </blockquote>
            </DialogHeader>
        </DialogContent>
    </Dialog>
    <Card className="relative">
        <CardHeader>
            <CardTitle className="text-xl">
                {issue.gist}
            </CardTitle>
            <div className="border-b" />
            <CardDescription>
                {issue.headline}
            </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-0">
            <Button onClick={() => setOpen(true)} >
                Details
            </Button>
        </CardContent>
    </Card>
    </>
  )
}

export default IssueCard;