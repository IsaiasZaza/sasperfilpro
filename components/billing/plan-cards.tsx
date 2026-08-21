import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STRIPE_TRIAL_COPY } from "@/lib/billing";
import type { Plan } from "@/lib/types/billing";
import { cn } from "@/lib/utils";

function pitch(plan: Plan) {
  if (plan.id === "PREMIUM") {
    return "Tudo do Pro, sem a marca PerfilPro e com suporte prioritário.";
  }
  return "Página, blocos, serviços, depoimentos e temas.";
}

export function PlanCards({
  plans,
  ctaHref,
}: {
  plans: Plan[];
  ctaHref?: (plan: Plan) => string;
}) {
  return (
    <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
      {plans.map((plan) => {
        const recommended = plan.id === "PREMIUM";
        const href = ctaHref
          ? ctaHref(plan)
          : `/cadastro?plan=${encodeURIComponent(plan.id)}`;
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
              <span
                className={cn(
                  "ml-1 font-sans text-[15px] font-medium",
                  recommended ? "text-white/55" : "text-muted",
                )}
              >
                /mês
              </span>
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
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className="mt-8 w-full"
              variant={recommended ? "secondary" : "primary"}
            >
              <Link href={href}>Começar grátis</Link>
            </Button>
            <p
              className={cn(
                "mt-3 text-center text-[12px] leading-relaxed",
                recommended ? "text-white/50" : "text-muted-soft",
              )}
            >
              {STRIPE_TRIAL_COPY}
            </p>
          </article>
        );
      })}
    </div>
  );
}
