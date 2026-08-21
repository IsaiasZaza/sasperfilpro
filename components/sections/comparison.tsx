import { Check, Minus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const traditional = [
  "Só uma lista de links",
  "Visual genérico",
  "Cliente ainda precisa perguntar o preço",
  "Sem cara do seu negócio",
  "WhatsApp escondido no direct",
];

const perfilpro = [
  "Página com a sua identidade",
  "Serviços e preços na frente",
  "WhatsApp em um toque",
  "Depoimentos e localização",
  "Editor visual, publica quando quiser",
];

export function Comparison() {
  return (
    <section className="scroll-mt-20 bg-peach/50 py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-[1.95rem] leading-[1.12] text-ink sm:text-[2.7rem]">
              O único link na bio que também vende.
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-[1.6rem] border border-line bg-[#f3efe8] p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-soft">
                Link tradicional
              </p>
              <ul className="mt-6 space-y-3.5">
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
                "h-full rounded-[1.6rem] border border-ink bg-ink p-7 text-white",
                "shadow-[0_24px_50px_-28px_rgba(20,17,14,0.7)]",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">
                PerfilPro
              </p>
              <ul className="mt-6 space-y-3.5">
                {perfilpro.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-lime" />
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
