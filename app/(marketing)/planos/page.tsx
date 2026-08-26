import type { Metadata } from "next";
import { PlanosView } from "@/components/billing/planos-view";
import { billingApi } from "@/lib/api-client";
import type { Plan } from "@/lib/types/billing";

export const metadata: Metadata = {
  title: "Planos e preços",
  description:
    "Planos Free, Pro e Premium para sua página profissional. Comece grátis, sem cartão. Faça upgrade quando quiser.",
  alternates: { canonical: "/planos" },
  openGraph: {
    title: "Planos e preços — PerfilPro",
    description:
      "Planos Free, Pro e Premium para sua página profissional. Comece grátis e faça upgrade quando quiser.",
    url: "/planos",
  },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ checkout?: string; reason?: string }>;
};

export default async function PlanosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  let plans: Plan[] = [];
  let loadError = false;

  try {
    const catalog = await billingApi.plans();
    plans = catalog.plans;
    loadError = catalog.plans.length === 0;
  } catch {
    loadError = true;
    plans = [];
  }

  return (
    <PlanosView
      plans={plans}
      checkout={params.checkout}
      reason={params.reason}
      loadError={loadError}
    />
  );
}
