"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { CATALOG_FALLBACK, paidPlans } from "@/lib/billing";
import type { PaidPlanId, Plan } from "@/lib/types/billing";
import { cn } from "@/lib/utils";

export function PlanChoice({
  plans,
  value,
  onChange,
  compact = false,
}: {
  plans: Plan[];
  value: PaidPlanId;
  onChange: (plan: PaidPlanId) => void;
  compact?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = paidPlans(plans.length > 0 ? plans : CATALOG_FALLBACK);

  if (!mounted) {
    return (
      <div
        className={cn("grid gap-2", compact ? "" : "sm:grid-cols-2")}
        aria-busy="true"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className="min-h-[5.5rem] animate-pulse rounded-2xl border border-line bg-white/80"
          />
        ))}
        <span className="sr-only">Carregando planos</span>
      </div>
    );
  }

  // Radiogroup navega por setas: Tab entra no grupo, setas trocam a opção.
  // O tabIndex acompanha a seleção, então o foco tem que ir junto.
  function moveFocus(currentIndex: number, delta: number) {
    const next = (currentIndex + delta + items.length) % items.length;
    const nextId = items[next].id;
    if (nextId === "PRO" || nextId === "PREMIUM") onChange(nextId);
    groupRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      ?.[next]?.focus();
  }

  return (
    <div
      ref={groupRef}
      className={cn("grid gap-2", compact ? "" : "sm:grid-cols-2")}
      role="radiogroup"
      aria-label="Plano"
    >
      {items.map((plan, index) => {
        const selected = plan.id === value;
        const recommended = plan.id === "PREMIUM";
        return (
          <button
            key={plan.id}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              if (plan.id === "PRO" || plan.id === "PREMIUM") onChange(plan.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                moveFocus(index, 1);
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                moveFocus(index, -1);
              }
            }}
            className={cn(
              "min-h-[5.5rem] rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25",
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
            <div className="flex items-center justify-between gap-3">
              <p className="font-serif text-[1.15rem] leading-none">{plan.name}</p>
              <div className="flex shrink-0 items-center gap-2">
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
                {selected ? (
                  <Check className="h-4 w-4 shrink-0 text-lime" />
                ) : null}
              </div>
            </div>
            <p
              className={cn(
                "mt-1.5 text-[12px] leading-snug",
                selected ? "text-white/70" : "text-muted",
              )}
            >
              {plan.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
