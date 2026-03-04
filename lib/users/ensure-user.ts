import { currentUser } from "@clerk/nextjs/server";
import User, { IUser } from "@/models/User";

export async function ensureUserByClerkId(userId: string): Promise<IUser> {
  const existingUser = await User.findOne({ clerkId: userId });
  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    `${userId}@no-email.local`;

  const createdOrUpdatedUser = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      $setOnInsert: {
        clerkId: userId,
        credits: 50,
        lastFreeCreditReset: new Date(),
        isPremium: false,
        paymentHistory: [],
      },
      $set: {
        email: primaryEmail,
      },
    },
    { upsert: true, new: true }
  );

  if (!createdOrUpdatedUser) {
    throw new Error("Failed to ensure user record");
  }

  return createdOrUpdatedUser;
}
