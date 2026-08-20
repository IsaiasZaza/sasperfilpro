import { Check } from "lucide-react";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfileMaria } from "@/components/mockups/profile-screens";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const features = [
  "Apresente seu trabalho",
  "Mostre seus serviços",
  "Receba contatos pelo WhatsApp",
  "Adicione suas redes sociais",
  "Mostre depoimentos",
  "Mostre localização",
  "Tenha uma presença profissional",
];

export function Solution() {
  return (
    <section id="recursos" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="A solução"
            title="Tudo que seu cliente precisa, em um só lugar."
            subtitle="Eu monto uma página para o seu negócio — não um agrupador de links genérico."
          />
        </Reveal>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <PhoneFrame>
              <ProfileMaria extended />
            </PhoneFrame>
          </Reveal>

          <Reveal delay={80}>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  <span className="text-[15px] text-ink">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <WhatsAppButton>Quero minha página no WhatsApp</WhatsAppButton>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
