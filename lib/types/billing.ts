export type PlanId = "PRO" | "PREMIUM";

export type SubscriptionStatus =
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "PAUSED";

export type Entitlements = {
  maxBlocks: number | null;
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
  trialDays: number;
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
  trialDays?: number;
};

export type PlansCatalog = {
  trialDays: number;
  plans: Plan[];
};

export type RegisterResponse = {
  user: { id: string; name: string; email: string };
  checkoutUrl: string | null;
  sessionId: string | null;
  plan: PlanId;
  trialGranted: boolean;
  trialDays: number;
  subscription: Subscription;
};

export type LoginResponse = {
  user: { id: string; name: string; email: string };
  accessToken: string;
  subscription: Subscription;
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
