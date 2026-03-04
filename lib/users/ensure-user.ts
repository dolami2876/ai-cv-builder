import { currentUser } from "@clerk/nextjs/server";
import User from "@/models/User";

export async function ensureUserByClerkId(userId: string) {
  let user = await User.findOne({ clerkId: userId });
  if (user) {
    return user;
  }

  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    `${userId}@no-email.local`;

  user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      $setOnInsert: {
        clerkId: userId,
        email: primaryEmail,
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

  return user;
}
