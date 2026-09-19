import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect('/signin')
  }

  const client = await clerkClient();
  let user = await client.users.getUser(userId);

  let attempts = 0;
  while (!user.emailAddresses[0]?.emailAddress && attempts < 3) {
    await new Promise((r) => setTimeout(r, 500));
    user = await client.users.getUser(userId);
    attempts++;
  }
  window.location.reload();

  if (!user.emailAddresses[0]?.emailAddress) {
    return notFound();
  }

  await db.user.upsert({
    where: {
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
    },
    update: {
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    create: {
      id: userId,
      emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
  return redirect("/dashboard");
};

export default Page;
