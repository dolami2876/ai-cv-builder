import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdminClerkId } from "@/lib/admin";

export async function requireAdmin() {
  const { userId } = await auth();
  if (!isAdminClerkId(userId)) {
    return { ok: false as const, userId, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, userId };
}

