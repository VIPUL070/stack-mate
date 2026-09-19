"use server";

import { db } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function syncUserToDb() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    return { success: false, error: "Email not ready yet" };
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

  return { success: true };
}