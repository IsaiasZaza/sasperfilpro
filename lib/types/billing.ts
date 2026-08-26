import type { BlockType } from "@/lib/types/profile";

export type PlanId = "FREE" | "PRO" | "PREMIUM";
export type PaidPlanId = "PRO" | "PREMIUM";

export type SubscriptionStatus =
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "PAUSED";

export type EntitlementKey =
  | "maxBlocks"
  | "maxServices"
  | "maxTestimonials"
  | "allowedBlockTypes"
  | "customTheme";

export type Entitlements = {
  maxBlocks: number | null;
  maxServices: number | null;
  maxTestimonials: number | null;
  allowedBlockTypes: BlockType[] | null;
  customTheme: boolean;
  removeBranding: boolean;
  prioritySupport: boolean;
};

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  priceCents: number;
  priceFormatted: string;
  currency: "BRL";
  interval: "month";
  features: string[];
  entitlements: Entitlements;
};

export type Subscription = {
  plan: PlanId | null;
  status: SubscriptionStatus | null;
  trialUsed: boolean;
  isTrialing: boolean;
  grantsAccess: boolean;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  entitlements: Entitlements | null;
};

export type PlansCatalog = {
  plans: Plan[];
};

export type RegisterResponse = {
  user: { id: string; name: string; email: string };
  accessToken: string;
  subscription: Subscription;
};

export type LoginResponse = {
  user: { id: string; name: string; email: string };
  accessToken: string;
  subscription: Subscription;
};

export type CheckoutResponse = {
  checkoutUrl: string | null;
  sessionId: string | null;
  plan: PaidPlanId;
  subscription: Subscription;
};

export type PlanErrorDetails = {
  currentPlan: PlanId;
  suggestedPlan: PlanId;
  entitlement: EntitlementKey;
  blockType?: BlockType;
  limit?: number;
  current?: number;
};

export const EMPTY_SUBSCRIPTION: Subscription = {
  plan: null,
  status: null,
  trialUsed: false,
  isTrialing: false,
  grantsAccess: false,
  trialEndsAt: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  entitlements: null,
};
