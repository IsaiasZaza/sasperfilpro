import { CreditCard, Link2, Share2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function HowItWorks({ trialDays = 7 }: { trialDays?: number }) {
  const steps = [
    {
      number: "01",
      icon: Link2,
      title: "Reserve o link",
      text: "Escolha o /u/ que vai na bio. Se estiver livre, você leva para o cadastro.",
    },
    {
      number: "02",
      icon: CreditCard,
      title: "Escolha o plano e cadastre o cartão",
      text: `Pro ou Premium, ${trialDays} dias grátis. O cartão entra na Stripe agora; a cobrança só depois do teste.`,
    },
    {
      number: "03",
      icon: Share2,
      title: "Publique na bio",
      text: "Copie o link, cole no Instagram, TikTok ou WhatsApp. Pronto para receber cliente.",
    },
  ];

  return (
    <section id="como-funciona" className="scroll-mt-20 bg-background py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze">
              Como funciona
            </p>
            <h2 className="font-serif text-[1.95rem] leading-[1.12] text-ink sm:text-[2.7rem]">
              Crie e personalize sua página em minutos.
            </h2>
            <p className="mt-4 text-base leading-[1.7] text-muted">
              Sem site, sem domínio, sem programar. Você monta, publica e cola o
              link onde o cliente já está.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 80}>
              <article className="relative h-full overflow-hidden rounded-[1.6rem] border border-line bg-card p-6 shadow-[0_18px_40px_-32px_rgba(20,17,14,0.4)]">
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime text-ink">
                    <step.icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="font-serif text-4xl text-ink/10">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-serif text-[1.4rem] leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-muted">
                  {step.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
