export function isAdminClerkId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const raw = process.env.ADMIN_CLERK_IDS || "";
  const allow = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allow.includes(userId);
}

