"use client";

import Link from "next/link";
import { formatPtDate, isPaidPlanId, planById } from "@/lib/billing";
import type { Plan, Subscription } from "@/lib/types/billing";

export function SubscriptionBanners({
  subscription,
  plans,
}: {
  subscription: Subscription;
  plans: Plan[];
}) {
  const current = planById(plans, subscription.plan);
  const periodEnd = formatPtDate(subscription.currentPeriodEnd);

  if (subscription.cancelAtPeriodEnd && periodEnd && isPaidPlanId(subscription.plan)) {
    return (
      <div className="border-b border-ink/10 bg-[#f3dcc6] px-5 py-2.5 text-center text-[13px] text-ink sm:px-6">
        Acesso pago até <strong>{periodEnd}</strong>. Depois você volta para o
        Free; a página continua no ar.{" "}
        <Link href="/assinatura" className="font-semibold underline-offset-4 hover:underline">
          Retomar plano
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

  if (subscription.plan === "FREE" && subscription.grantsAccess) {
    return (
      <div className="border-b border-ink/10 bg-lime/50 px-5 py-2.5 text-center text-[13px] text-ink sm:px-6">
        Você está no Free.{" "}
        {current?.name ? null : null}
        <Link href="/planos" className="font-semibold underline-offset-4 hover:underline">
          Ver Assinatura
        </Link>
      </div>
    );
  }

  return null;
}
