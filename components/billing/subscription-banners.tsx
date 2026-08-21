"use client";

import Link from "next/link";
import { formatPtDate, planById } from "@/lib/billing";
import type { Plan, Subscription } from "@/lib/types/billing";

export function SubscriptionBanners({
  subscription,
  plans,
}: {
  subscription: Subscription;
  plans: Plan[];
}) {
  const current = planById(plans, subscription.plan);
  const trialEnd = formatPtDate(subscription.trialEndsAt);
  const periodEnd = formatPtDate(subscription.currentPeriodEnd);

  if (subscription.isTrialing && trialEnd) {
    return (
      <div className="border-b border-ink/10 bg-lime/70 px-5 py-2.5 text-center text-[13px] text-ink sm:px-6">
        Teste grátis até <strong>{trialEnd}</strong>
        {current?.priceFormatted
          ? `. Depois vira ${current.priceFormatted}/mês no cartão.`
          : ". Depois a cobrança mensal começa no cartão."}{" "}
        <Link href="/assinatura" className="font-semibold underline-offset-4 hover:underline">
          Ver assinatura
        </Link>
      </div>
    );
  }

  if (subscription.cancelAtPeriodEnd && periodEnd) {
    return (
      <div className="border-b border-ink/10 bg-[#f3dcc6] px-5 py-2.5 text-center text-[13px] text-ink sm:px-6">
        Editor bloqueado. Página no ar até <strong>{periodEnd}</strong>.{" "}
        <Link href="/assinatura" className="font-semibold underline-offset-4 hover:underline">
          Manter plano
        </Link>
      </div>
    );
  }

  if (subscription.status === "PAST_DUE") {
    return (
      <div className="border-b border-ink/10 bg-red-50 px-5 py-2.5 text-center text-[13px] text-red-800 sm:px-6">
        Pagamento atrasado — atualize o cartão.{" "}
        <Link href="/assinatura" className="font-semibold underline-offset-4 hover:underline">
          Atualizar cartão
        </Link>
      </div>
    );
  }

  return null;
}
