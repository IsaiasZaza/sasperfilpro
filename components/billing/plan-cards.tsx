"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { CheckoutDialog } from "@/components/billing/checkout-dialog";
import { Button } from "@/components/ui/button";
import { normalizeKnownPtCopy, isPaidPlanId } from "@/lib/billing";
import type { PaidPlanId, Plan, PlanId } from "@/lib/types/billing";
import { cn } from "@/lib/utils";
import { useState } from "react";

function pitch(plan: Plan) {
  if (plan.id === "FREE") {
    return "Página no ar, com limites. Sem cartão.";
  }
  if (plan.id === "PREMIUM") {
    return "Tudo do Pro, sem a marca PerfilPro e com suporte prioritário.";
  }
  return "Página, blocos, serviços, depoimentos e temas.";
}

export function PlanCards({
  plans,
  currentPlan,
  defaultEmail,
}: {
  plans: Plan[];
  currentPlan?: PlanId | null;
  defaultEmail?: string;
}) {
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlanId | null>(null);

  return (
    <>
      <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const recommended = plan.id === "PREMIUM";
          const current = currentPlan === plan.id;
          const free = plan.id === "FREE";
          const paid = isPaidPlanId(plan.id);
          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-[1.7rem] border p-7 sm:p-8",
                recommended
                  ? "border-ink bg-ink text-white shadow-[0_28px_60px_-32px_rgba(20,17,14,0.7)]"
                  : "border-line bg-card text-ink",
              )}
            >
              {recommended ? (
                <span className="absolute right-6 top-6 rounded-full bg-lime px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
                  Recomendado
                </span>
              ) : null}
              <p
                className={cn(
                  "text-[12px] font-semibold uppercase tracking-[0.16em]",
                  recommended ? "text-lime" : "text-muted-soft",
                )}
              >
                {plan.name}
              </p>
              <p className="mt-3 font-serif text-[2rem] leading-none">
                {plan.priceFormatted}
                {plan.priceCents > 0 ? (
                  <span
                    className={cn(
                      "ml-1 font-sans text-[15px] font-medium",
                      recommended ? "text-white/55" : "text-muted",
                    )}
                  >
                    /mês
                  </span>
                ) : null}
              </p>
              <p
                className={cn(
                  "mt-4 text-[15px] leading-relaxed",
                  recommended ? "text-white/75" : "text-muted",
                )}
              >
                {pitch(plan)}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-[14px] leading-snug"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        recommended ? "text-lime" : "text-ink",
                      )}
                    />
                    {normalizeKnownPtCopy(feature)}
                  </li>
                ))}
              </ul>
              {current ? (
                <p
                  className={cn(
                    "mt-8 text-center text-[14px] font-semibold",
                    recommended ? "text-lime" : "text-ink",
                  )}
                >
                  Você já está no {plan.name}
                </p>
              ) : free ? (
                <Button asChild size="lg" className="mt-8 w-full">
                  <Link href="/cadastro">Começar grátis</Link>
                </Button>
              ) : paid ? (
                <Button
                  type="button"
                  size="lg"
                  className="mt-8 w-full"
                  variant={recommended ? "secondary" : "primary"}
                  onClick={() => setCheckoutPlan(plan.id as PaidPlanId)}
                >
                  Assinar
                </Button>
              ) : null}
            </article>
          );
        })}
      </div>
      <CheckoutDialog
        open={checkoutPlan !== null}
        planId={checkoutPlan}
        plans={plans}
        defaultEmail={defaultEmail}
        onClose={() => setCheckoutPlan(null)}
      />
    </>
  );
}
