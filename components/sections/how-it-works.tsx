import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    number: "01",
    title: "Você envia suas informações",
    text: "Nome, foto, serviços, redes sociais e WhatsApp. Só o essencial do seu negócio.",
  },
  {
    number: "02",
    title: "Eu crio sua página",
    text: "Personalizo visual, tom e estrutura de acordo com o seu negócio.",
  },
  {
    number: "03",
    title: "Você coloca na bio do Instagram",
    text: "Pronto. Seu cliente encontra tudo em um único lugar, a um clique do WhatsApp.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-[#efeae3]/40 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Como funciona"
            title="Três passos. Sem complicação."
            subtitle="Você não precisa de site, domínio ou saber programar. Eu cuido de tudo."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 80}>
              <article className="relative h-full overflow-hidden rounded-2xl border border-line bg-card p-6">
                <span className="font-serif text-5xl text-bronze/25">
                  {step.number}
                </span>
                <h3 className="mt-4 font-serif text-[1.35rem] leading-snug text-ink">
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
