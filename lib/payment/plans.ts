export type PlanCode = "FREE" | "STARTER" | "PROFESSIONAL";

export interface PlanConfig {
  code: PlanCode;
  name: string;
  amountVnd: number;
  credits: number;
}

export const PLAN_CONFIGS: Record<PlanCode, PlanConfig> = {
  FREE: {
    code: "FREE",
    name: "FREE Plan",
    amountVnd: 0,
    credits: 50,
  },
  STARTER: {
    code: "STARTER",
    name: "STARTER Plan",
    amountVnd: 20000,
    credits: 150,
  },
  PROFESSIONAL: {
    code: "PROFESSIONAL",
    name: "PROFESSIONAL Plan",
    amountVnd: 49000,
    credits: 450,
  },
};

export const PAYMENT_CONTENT_PREFIX = "CVPLAN";

export function buildPaymentContent(plan: PlanCode, clerkId: string) {
  return `${PAYMENT_CONTENT_PREFIX}_${plan}_${clerkId}`;
}

function normalizeClerkId(raw: string): string {
  const value = raw.trim();

  // Keep original when already in standard Clerk format: user_xxx
  if (/^user_[a-zA-Z0-9_]+$/i.test(value)) {
    return value;
  }

  // Some banks may strip separators: userabc123 -> user_abc123
  if (/^user[a-zA-Z0-9_]+$/i.test(value)) {
    return `user_${value.slice(4)}`;
  }

  return value;
}

export function parsePlanFromPaymentContent(content: string): { plan: PlanCode; clerkId: string } | null {
  if (!content) return null;

  const normalized = content.trim();

  // Standard format: CVPLAN_STARTER_user_xxx
  const directMatch = normalized.match(/^CVPLAN_(FREE|STARTER|PROFESSIONAL)_(user_?[a-zA-Z0-9_]+)$/i);
  if (directMatch) {
    return {
      plan: directMatch[1].toUpperCase() as PlanCode,
      clerkId: normalizeClerkId(directMatch[2]),
    };
  }

  // Flexible format for bank-normalized content:
  // - CVPLANSTARTERuserxxx
  // - CVPLAN STARTER user_xxx
  // - BankAPINotify CVPLANSTARTERuserxxx
  const flexibleMatch = normalized.match(/CVPLAN[_\s-]*(FREE|STARTER|PROFESSIONAL)[_\s-]*(user_?[a-zA-Z0-9_]+)/i);
  if (flexibleMatch) {
    return {
      plan: flexibleMatch[1].toUpperCase() as PlanCode,
      clerkId: normalizeClerkId(flexibleMatch[2]),
    };
  }

  return null;
}

export function getPlanByAmount(amount: number): PlanConfig | null {
  const values = Object.values(PLAN_CONFIGS);
  return values.find((plan) => plan.amountVnd === amount) || null;
}
