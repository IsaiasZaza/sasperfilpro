"use client";

import { Check } from "lucide-react";
import { CATALOG_FALLBACK } from "@/lib/billing";
import type { Plan, PlanId } from "@/lib/types/billing";
import { cn } from "@/lib/utils";

export function PlanChoice({
  plans,
  value,
  onChange,
  compact = false,
}: {
  plans: Plan[];
  value: PlanId;
  onChange: (plan: PlanId) => void;
  compact?: boolean;
}) {
  const items = plans.length > 0 ? plans : CATALOG_FALLBACK;

  return (
    <div className={cn("grid gap-2", compact ? "" : "sm:grid-cols-2")}>
      {items.map((plan) => {
        const selected = plan.id === value;
        const recommended = plan.id === "PREMIUM";
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange(plan.id)}
            className={cn(
              "relative rounded-2xl border px-4 py-3 text-left transition",
              selected
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink hover:border-ink/25",
            )}
          >
            {recommended ? (
              <span
                className={cn(
                  "mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  selected ? "bg-lime text-ink" : "bg-lime/80 text-ink",
                )}
              >
                Recomendado
              </span>
            ) : null}
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-[1.15rem] leading-none">{plan.name}</p>
              {plan.priceFormatted ? (
                <p
                  className={cn(
                    "text-[13px] font-semibold",
                    selected ? "text-white/90" : "text-ink",
                  )}
                >
                  {plan.priceFormatted}
                  <span
                    className={cn(
                      "font-normal",
                      selected ? "text-white/60" : "text-muted",
                    )}
                  >
                    /mês
                  </span>
                </p>
              ) : null}
            </div>
            <p
              className={cn(
                "mt-1.5 text-[12px] leading-snug",
                selected ? "text-white/70" : "text-muted",
              )}
            >
              {plan.description}
            </p>
            {selected ? (
              <Check className="absolute right-3 top-3 h-4 w-4 text-lime" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
