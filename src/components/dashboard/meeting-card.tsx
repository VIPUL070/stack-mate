'use client'

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Loader2, Presentation, Upload } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { uploadFile } from "@/lib/uploadFile";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { islandToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

const MeetingCard = () => {
  const {project} = useProject();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadtMeeting = api.project.uploadMeeting.useMutation();
  const router = useRouter();

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        setError(rejected[0].errors[0].message);
        return;
      }

      const file = accepted[0];
      if (!file) return;
      if (!project) return;

      setError(null);
      setIsUploading(true);
      try {
        const downloadUrl = await uploadFile(file);

        uploadtMeeting.mutate(
          {
            projectId: project.id,
            meetingUrl: downloadUrl,
            name: file.name,
          },
          {
            onSuccess: () => {
              islandToast.success("Meeting uploaded successfully!");
              router.push("/meetings");
            },
            onError: () => {
              islandToast.error("Meeting uploaded successfully!");
            },
          }
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [project, router, uploadtMeeting]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "audio/*": [".mp3", ".wav", ".m4a"] },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    onDrop,
    disabled: isUploading,
  });

  return (
    <Card
      className="relative sm:col-span-2 flex cursor-pointer flex-col items-center justify-center p-6"
      {...getRootProps()}
    >
      {!isUploading ? (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-grey-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with StackMate.
            <br />
            Powered by AI.
          </p>
          <div className="mt-3">
            <Button type="button" disabled= {isUploading}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          
        </>
      ) : (
        <>
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="mt-2 text-sm text-gray-500">Uploading your meeting...</p>
        </>
      )}
    </Card>
  );
};

export default MeetingCard;