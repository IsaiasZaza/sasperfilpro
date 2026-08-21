import type { Metadata } from "next";
import { PlanosView } from "@/components/billing/planos-view";
import { billingApi } from "@/lib/api-client";
import type { Plan } from "@/lib/types/billing";

export const metadata: Metadata = {
  title: "Planos e preços",
  description:
    "Planos Pro e Premium para sua página profissional. A partir de R$ 20/mês, 7 dias grátis. Cartão na Stripe, cobrança só depois do teste.",
  alternates: { canonical: "/planos" },
  openGraph: {
    title: "Planos e preços — PerfilPro",
    description:
      "Planos Pro e Premium para sua página profissional. A partir de R$ 20/mês, com 7 dias grátis.",
    url: "/planos",
  },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ checkout?: string; reason?: string }>;
};

export default async function PlanosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let trialDays = 7;
  let plans: Plan[] = [];
  let loadError = false;

  try {
    const catalog = await billingApi.plans();
    trialDays = catalog.trialDays;
    plans = catalog.plans;
    loadError = catalog.plans.length === 0;
  } catch {
    loadError = true;
    plans = [];
  }

  return (
    <PlanosView
      trialDays={trialDays}
      plans={plans}
      checkout={params.checkout}
      reason={params.reason}
      loadError={loadError}
    />
  );
}
