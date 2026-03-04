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

export function parsePlanFromPaymentContent(content: string): { plan: PlanCode; clerkId: string } | null {
  if (!content) return null;

  const normalized = content.trim();
  const directMatch = normalized.match(/^CVPLAN_(FREE|STARTER|PROFESSIONAL)_(user_[a-zA-Z0-9_]+)$/);
  if (directMatch) {
    return {
      plan: directMatch[1] as PlanCode,
      clerkId: directMatch[2],
    };
  }

  // Fallback for content with spaces or additional text
  const fallbackMatch = normalized.match(/CVPLAN\s*(FREE|STARTER|PROFESSIONAL)\s*(user_[a-zA-Z0-9_]+)/i);
  if (fallbackMatch) {
    return {
      plan: fallbackMatch[1].toUpperCase() as PlanCode,
      clerkId: fallbackMatch[2],
    };
  }

  return null;
}

export function getPlanByAmount(amount: number): PlanConfig | null {
  const values = Object.values(PLAN_CONFIGS);
  return values.find((plan) => plan.amountVnd === amount) || null;
}
