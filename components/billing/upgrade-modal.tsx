"use client";

import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { PaidPlanId, Plan } from "@/lib/types/billing";
import { planById } from "@/lib/billing";

export function UpgradeModal({
  open,
  plans,
  suggestedPlan = "PRO",
  message,
  onClose,
  onChoosePlan,
}: {
  open: boolean;
  plans: Plan[];
  suggestedPlan?: PaidPlanId;
  message?: string;
  onClose: () => void;
  onChoosePlan: (plan: PaidPlanId) => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const pro = planById(plans, "PRO");
  const premium = planById(plans, "PREMIUM");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_-24px_rgba(20,17,14,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p id={titleId} className="font-serif text-[1.45rem] text-ink">
          Esse recurso é do plano pago
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          {message ||
            "No Free há limite de blocos, serviços e visual. Assine Pro ou Premium para liberar."}
        </p>
        <div className="mt-5 grid gap-2">
          <Button
            type="button"
            variant={suggestedPlan === "PRO" ? "primary" : "secondary"}
            onClick={() => onChoosePlan("PRO")}
          >
            Assinar Pro
            {pro?.priceFormatted ? ` · ${pro.priceFormatted}/mês` : ""}
          </Button>
          <Button
            type="button"
            variant={suggestedPlan === "PREMIUM" ? "primary" : "secondary"}
            onClick={() => onChoosePlan("PREMIUM")}
          >
            Assinar Premium
            {premium?.priceFormatted ? ` · ${premium.priceFormatted}/mês` : ""}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Agora não
          </Button>
        </div>
      </div>
    </div>
  );
}
