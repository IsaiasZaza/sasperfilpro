import { ApiError } from "@/lib/api";
import type {
  Entitlements,
  PaidPlanId,
  Plan,
  PlanErrorDetails,
  PlanId,
  Subscription,
  SubscriptionStatus,
} from "@/lib/types/billing";
import type { BlockType } from "@/lib/types/profile";

export const ALL_BLOCK_TYPES: BlockType[] = [
  "HERO",
  "CTA_BUTTON",
  "LINK_BUTTON",
  "WHATSAPP",
  "SOCIAL",
  "SERVICES",
  "TESTIMONIALS",
  "LOCATION",
];

export const FREE_BLOCK_TYPES: BlockType[] = [
  "HERO",
  "LINK_BUTTON",
  "WHATSAPP",
  "SOCIAL",
];

export const FREE_ENTITLEMENTS: Entitlements = {
  maxBlocks: 4,
  maxServices: 2,
  maxTestimonials: 2,
  allowedBlockTypes: FREE_BLOCK_TYPES,
  customTheme: false,
  removeBranding: false,
  prioritySupport: false,
};

const PRO_ENTITLEMENTS: Entitlements = {
  maxBlocks: null,
  maxServices: null,
  maxTestimonials: null,
  allowedBlockTypes: ALL_BLOCK_TYPES,
  customTheme: true,
  removeBranding: false,
  prioritySupport: false,
};

const PREMIUM_ENTITLEMENTS: Entitlements = {
  ...PRO_ENTITLEMENTS,
  removeBranding: true,
  prioritySupport: true,
};

export const CATALOG_FALLBACK: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    description: "Comece com o essencial, sem cartão.",
    priceCents: 0,
    priceFormatted: "R$ 0,00",
    currency: "BRL",
    interval: "month",
    features: [
      "Página pública no ar",
      "4 blocos (capa, links, WhatsApp e redes)",
      "2 serviços e 2 depoimentos",
      "Marca PerfilPro na página",
    ],
    entitlements: FREE_ENTITLEMENTS,
  },
  {
    id: "PRO",
    name: "Pro",
    description: "Página, blocos, serviços, depoimentos e temas.",
    priceCents: 2000,
    priceFormatted: "R$ 20,00",
    currency: "BRL",
    interval: "month",
    features: [
      "Página pública profissional",
      "Blocos, serviços e depoimentos ilimitados",
      "Temas e cores",
    ],
    entitlements: PRO_ENTITLEMENTS,
  },
  {
    id: "PREMIUM",
    name: "Premium",
    description: "Tudo do Pro, sem marca PerfilPro e com suporte prioritário.",
    priceCents: 3900,
    priceFormatted: "R$ 39,00",
    currency: "BRL",
    interval: "month",
    features: [
      "Tudo do plano Pro",
      "Sem marca PerfilPro na página",
      "Suporte prioritário",
    ],
    entitlements: PREMIUM_ENTITLEMENTS,
  },
];

export const CANCEL_TO_FREE_COPY =
  "Você volta para o Free no fim do período. A página continua no ar, com limites e a marca PerfilPro.";

/** Normaliza strings conhecidas da API sem acento (não traduz genérico). */
export function normalizeKnownPtCopy(text: string): string {
  const map: Record<string, string> = {
    "pagina publica profissional": "Página pública profissional",
    "pagina publica no ar": "Página pública no ar",
    "blocos, servicos e depoimentos": "Blocos, serviços e depoimentos",
    "blocos, servicos e depoimentos ilimitados":
      "Blocos, serviços e depoimentos ilimitados",
    "temas e cores": "Temas e cores",
    "tudo do plano pro": "Tudo do plano Pro",
    "sem marca perfilpro na pagina": "Sem marca PerfilPro na página",
    "suporte prioritario": "Suporte prioritário",
    "comece com o essencial, sem cartao.": "Comece com o essencial, sem cartão.",
    "pagina, blocos, servicos, depoimentos e temas.":
      "Página, blocos, serviços, depoimentos e temas.",
    "tudo do pro, sem marca perfilpro e com suporte prioritario.":
      "Tudo do Pro, sem marca PerfilPro e com suporte prioritário.",
    "4 blocos (capa, links, whatsapp e redes)":
      "4 blocos (capa, links, WhatsApp e redes)",
    "2 servicos e 2 depoimentos": "2 serviços e 2 depoimentos",
    "marca perfilpro na pagina": "Marca PerfilPro na página",
  };
  const key = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
  return map[key] ?? text;
}

export function parsePlanId(value: string | null | undefined): PlanId | null {
  if (value === "FREE" || value === "PRO" || value === "PREMIUM") return value;
  return null;
}

export function parsePaidPlanId(
  value: string | null | undefined,
): PaidPlanId | null {
  if (value === "PRO" || value === "PREMIUM") return value;
  return null;
}

export function isPaidPlanId(value: PlanId | null | undefined): value is PaidPlanId {
  return value === "PRO" || value === "PREMIUM";
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
  TRIALING: "Período de teste",
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

export function otherPaidPlanId(plan: PlanId | null): PaidPlanId | null {
  if (plan === "PRO") return "PREMIUM";
  if (plan === "PREMIUM") return "PRO";
  return null;
}

/** Painel e editor: cookie/token + grantsAccess. Free entra. */
export function hasWorkspaceAccess(subscription: Subscription) {
  return subscription.grantsAccess;
}

export function canStaySignedIn(subscription: Subscription) {
  return subscription.grantsAccess;
}

export function goToCheckout(checkoutUrl: string | null) {
  if (!checkoutUrl) return false;
  window.location.href = checkoutUrl;
  return true;
}

export function entitlementsOf(subscription: Subscription): Entitlements {
  return subscription.entitlements ?? FREE_ENTITLEMENTS;
}

export function isBlockTypeAllowed(entitlements: Entitlements, type: BlockType) {
  if (!entitlements.allowedBlockTypes) return true;
  return entitlements.allowedBlockTypes.includes(type);
}

export function canAddBlock(
  entitlements: Entitlements,
  count: number,
  type: BlockType,
) {
  if (!isBlockTypeAllowed(entitlements, type)) return false;
  if (entitlements.maxBlocks != null && count >= entitlements.maxBlocks) {
    return false;
  }
  return true;
}

export function canAddCountedItem(limit: number | null, count: number) {
  if (limit == null) return true;
  return count < limit;
}

export function isPlanGateError(error: unknown) {
  if (!(error instanceof ApiError)) return false;
  return (
    error.code === "PLAN_LIMIT_REACHED" ||
    error.code === "PLAN_FEATURE_LOCKED"
  );
}

export function isCheckoutRequiredError(error: unknown) {
  return error instanceof ApiError && error.code === "CHECKOUT_REQUIRED";
}

export function planErrorDetails(error: unknown): PlanErrorDetails | null {
  if (!(error instanceof ApiError)) return null;
  const details = error.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return null;
  }
  const data = details as Partial<PlanErrorDetails>;
  const currentPlan = parsePlanId(String(data.currentPlan ?? ""));
  const suggestedPlan = parsePlanId(String(data.suggestedPlan ?? ""));
  if (!currentPlan || !suggestedPlan || !data.entitlement) return null;
  return {
    currentPlan,
    suggestedPlan,
    entitlement: data.entitlement,
    blockType: data.blockType,
    limit: data.limit,
    current: data.current,
  };
}

export function paidPlans(plans: Plan[]) {
  return plans.filter((plan) => isPaidPlanId(plan.id));
}
