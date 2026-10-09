import { db } from "@/server/db";
import { JoinProps } from "@/types/create-project";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const JoinHandler = async ({ params }: JoinProps) => {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return redirect(`/signin`);
  }

  const dbUser = await db.user.findUnique({
    where: { id: userId },
  });
  if (!dbUser) {
    return redirect(`/sync-user`);
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });
  if (!project) {
    return redirect("/dashboard");
  }

  // Add the user to the project (no-op if already a member)
  await db.userToProject.upsert({
    where: {
      userId_projectId: { userId: dbUser.id, projectId: project.id },
    },
    update: {},
    create: { userId: dbUser.id, projectId: project.id },
  });

  return redirect(`/dashboard`);
};

export default JoinHandler;