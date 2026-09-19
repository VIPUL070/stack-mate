"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { syncUserToDb } from "./actions";

export default function SyncUserPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState("Syncing your account...");

  useEffect(() => {
    async function sync() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        router.push("/signin");
        return;
      }

      // Check if Clerk has loaded the email yet
      if (!user?.primaryEmailAddress?.emailAddress) {
        setStatus("Waiting for email confirmation...");
        return;
      }

      try {
        const res = await syncUserToDb();
        if (res.success) {
          router.replace("/dashboard");
        } else {
          // Retry briefly if the backend was slightly behind
          setTimeout(sync, 1000);
        }
      } catch (err) {
        console.error(err);
        setStatus("Something went wrong syncing your account.");
      }
    }

    sync();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground text-sm">{status}</p>
    </div>
  );
}