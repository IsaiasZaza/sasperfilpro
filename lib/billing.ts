import { ApiError } from "@/lib/api";
import type { Plan, PlanId, Subscription, SubscriptionStatus } from "@/lib/types/billing";

export const CATALOG_FALLBACK: Plan[] = [
  {
    id: "PRO",
    name: "Pro",
    description: "Página, blocos, serviços, depoimentos e temas.",
    priceCents: 2000,
    priceFormatted: "R$ 20,00",
    currency: "BRL",
    interval: "month",
    trialDays: 7,
    features: [
      "Página pública profissional",
      "Blocos, serviços e depoimentos",
      "Temas e cores",
      "7 dias grátis",
    ],
    entitlements: {
      maxBlocks: null,
      customTheme: true,
      removeBranding: false,
      prioritySupport: false,
    },
  },
  {
    id: "PREMIUM",
    name: "Premium",
    description: "Tudo do Pro, sem marca PerfilPro e com suporte prioritário.",
    priceCents: 3900,
    priceFormatted: "R$ 39,00",
    currency: "BRL",
    interval: "month",
    trialDays: 7,
    features: [
      "Tudo do plano Pro",
      "Sem marca PerfilPro na página",
      "Suporte prioritário",
      "7 dias grátis",
    ],
    entitlements: {
      maxBlocks: null,
      customTheme: true,
      removeBranding: true,
      prioritySupport: true,
    },
  },
];

export const STRIPE_TRIAL_COPY =
  "Cartão agora na Stripe. Cobrança só depois do teste.";

/** Normaliza strings conhecidas da API sem acento (não traduz genérico). */
export function normalizeKnownPtCopy(text: string): string {
  const map: Record<string, string> = {
    "pagina publica profissional": "Página pública profissional",
    "blocos, servicos e depoimentos": "Blocos, serviços e depoimentos",
    "temas e cores": "Temas e cores",
    "tudo do plano pro": "Tudo do plano Pro",
    "sem marca perfilpro na pagina": "Sem marca PerfilPro na página",
    "suporte prioritario": "Suporte prioritário",
    "pagina, blocos, servicos, depoimentos e temas.":
      "Página, blocos, serviços, depoimentos e temas.",
    "tudo do pro, sem marca perfilpro e com suporte prioritario.":
      "Tudo do Pro, sem marca PerfilPro e com suporte prioritário.",
  };
  const key = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
  return map[key] ?? text;
}

export function parsePlanId(value: string | null | undefined): PlanId {
  return value === "PREMIUM" ? "PREMIUM" : "PRO";
}

export function formatPtDate(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  TRIALING: "Período grátis",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento atrasado — atualize o cartão",
  CANCELED: "Encerrada",
  INCOMPLETE: "Checkout não concluído",
  INCOMPLETE_EXPIRED: "Checkout expirado",
  UNPAID: "Pagamento pendente",
  PAUSED: "Pausada",
};

export function subscriptionStatusLabel(status: SubscriptionStatus | null) {
  if (!status) return "Sem assinatura";
  return SUBSCRIPTION_STATUS_LABEL[status] ?? status;
}

export function planById(plans: Plan[], id: PlanId | null) {
  if (!id) return null;
  return plans.find((plan) => plan.id === id) ?? null;
}

export function otherPlanId(plan: PlanId | null): PlanId {
  return plan === "PREMIUM" ? "PRO" : "PREMIUM";
}

/** Painel e editor só com plano ativo e sem cancelamento agendado. */
export function hasWorkspaceAccess(subscription: Subscription) {
  if (!subscription.grantsAccess) return false;
  if (subscription.cancelAtPeriodEnd) return false;
  if (subscription.status === "CANCELED" || subscription.status === "UNPAID") {
    return false;
  }
  return true;
}

/** Continua logado para retomar o plano depois do cancelamento. */
export function canStaySignedIn(subscription: Subscription) {
  return subscription.grantsAccess;
}

export function goToCheckout(checkoutUrl: string | null) {
  if (!checkoutUrl) return false;
  window.location.href = checkoutUrl;
  return true;
}

export function trialUsedFromError(error: unknown): boolean | undefined {
  if (!(error instanceof ApiError)) return undefined;
  const details = error.details;
  if (details && typeof details === "object" && !Array.isArray(details)) {
    const trialUsed = (details as { trialUsed?: unknown }).trialUsed;
    if (typeof trialUsed === "boolean") return trialUsed;
  }
  return undefined;
}
