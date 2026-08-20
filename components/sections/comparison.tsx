import { Check, Minus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const traditional = [
  "Apenas links",
  "Visual genérico",
  "Pouca informação",
  "Sem identidade",
  "Não apresenta seu trabalho",
];

const perfilpro = [
  "Página personalizada",
  "Visual profissional",
  "Serviços",
  "Portfólio",
  "WhatsApp",
  "Redes sociais",
  "Depoimentos",
  "Informações do negócio",
];

export function Comparison() {
  return (
    <section className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading title="Muito mais que um link na bio." />
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-2xl border border-line bg-[#f3efe8] p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-soft">
                Link tradicional
              </p>
              <ul className="mt-5 space-y-3">
                {traditional.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-muted">
                    <Minus className="h-4 w-4 shrink-0 text-muted-soft" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
          <Reveal delay={80}>
            <article
              className={cn(
                "h-full rounded-2xl border border-ink bg-ink p-6 text-white",
                "shadow-[0_24px_50px_-28px_rgba(20,17,14,0.7)]",
              )}
            >
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-bronze-soft">
                PerfilPro
              </p>
              <ul className="mt-5 space-y-3">
                {perfilpro.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-bronze-soft" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
