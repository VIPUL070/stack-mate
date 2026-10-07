"use client";

import { useEffect, useState } from "react";
import useProject from "@/hooks/use-project";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { islandToast } from "@/lib/toast";

const Invite = () => {
  const { projectId } = useProject();
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState("");

  // window only exists on the client, so build the link after mount
  useEffect(() => {
    setLink(`${window.location.origin}/join/${projectId}`);
  }, [projectId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      islandToast.success("Copied to clipboard.");
    } catch {
      islandToast.error("Couldn't copy. Please copy the link manually.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Share this link with the people you want to invite.
          </p>
          <div className="mt-4 flex gap-2">
            <Input
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button size="sm" onClick={handleCopy} disabled={!link}>
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button onClick={() => setOpen(true)}>Invite Members</Button>
    </>
  );
};

export default Invite;