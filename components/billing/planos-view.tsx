"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { PlanCards } from "@/components/billing/plan-cards";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { STRIPE_TRIAL_COPY } from "@/lib/billing";
import type { Plan } from "@/lib/types/billing";

function bannerMessage(checkout?: string, reason?: string) {
  if (reason === "expired") {
    return "Sua assinatura não está ativa. Escolha um plano para continuar.";
  }
  if (checkout === "canceled") {
    return "Checkout cancelado. Cadastre o cartão na Stripe para liberar a conta.";
  }
  return null;
}

export function PlanosView({
  trialDays,
  plans,
  checkout,
  reason,
  loadError,
}: {
  trialDays: number;
  plans: Plan[];
  checkout?: string;
  reason?: string;
  loadError?: boolean;
}) {
  const initial = bannerMessage(checkout, reason);
  const [banner, setBanner] = useState<string | null>(initial);

  return (
    <main className="bg-background">
      {banner ? (
        <div className="border-b border-ink/10 bg-ink text-white">
          <Container className="flex items-start justify-between gap-3 py-3 sm:items-center">
            <p className="text-[13px] leading-relaxed sm:text-[14px]">{banner}</p>
            <button
              type="button"
              aria-label="Fechar aviso"
              className="shrink-0 rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              onClick={() => setBanner(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </Container>
        </div>
      ) : null}

      <section className="relative overflow-hidden bg-lime pb-16 pt-10 sm:pb-20 sm:pt-14">
        <div className="pointer-events-none absolute -left-20 top-6 h-64 w-64 rounded-full bg-white/35 blur-3xl" />
        <Container className="relative text-center">
          <p className="inline-flex items-center rounded-full border border-ink/10 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            {trialDays} dias grátis
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl font-serif text-[2.35rem] leading-[1.05] text-ink sm:text-[3.4rem]">
            Sua página profissional no ar em minutos. {trialDays} dias grátis.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink/70 sm:text-base">
            {STRIPE_TRIAL_COPY}
          </p>
        </Container>
      </section>

      <section className="pb-20 pt-10 sm:pb-28">
        <Container>
          {loadError || plans.length === 0 ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-line bg-card p-8 text-center">
              <p className="font-serif text-2xl text-ink">
                Não foi possível carregar os planos
              </p>
              <p className="mt-2 text-[15px] text-muted">
                Tente de novo em instantes. Os preços vêm direto da API.
              </p>
              <Button asChild className="mt-6">
                <Link href="/planos">Recarregar</Link>
              </Button>
            </div>
          ) : (
            <PlanCards plans={plans} />
          )}
          <p className="mt-10 text-center text-[14px] text-muted">
            Já tenho conta.{" "}
            <Link
              href="/login"
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </Container>
      </section>
    </main>
  );
}
