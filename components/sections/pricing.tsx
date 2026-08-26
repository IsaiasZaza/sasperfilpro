import Link from "next/link";
import { PlanCards } from "@/components/billing/plan-cards";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import type { Plan } from "@/lib/types/billing";

export function Pricing({ plans }: { plans: Plan[] }) {
  return (
    <section id="planos" className="scroll-mt-20 bg-background py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 inline-flex items-center rounded-full border border-ink/10 bg-lime/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
              Comece no Free
            </p>
            <h2 className="mt-4 font-serif text-[1.95rem] leading-[1.12] text-ink sm:text-[2.7rem]">
              Sua página profissional no ar em minutos.
            </h2>
            <p className="mt-4 text-base leading-[1.7] text-muted">
              Sem cartão para começar. Pro e Premium entram quando você quiser
              mais blocos, tema e recursos.
            </p>
          </div>
        </Reveal>

        {plans.length === 0 ? (
          <p className="mt-10 text-center text-[15px] text-muted">
            Não foi possível carregar os planos.{" "}
            <Link href="/planos" className="font-semibold text-ink underline-offset-4 hover:underline">
              Tentar de novo
            </Link>
          </p>
        ) : (
          <div className="mt-10">
            <PlanCards plans={plans} />
          </div>
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
  );
}
