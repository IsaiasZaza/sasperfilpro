import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import {
  ProfileCarlos,
  ProfileJoao,
  ProfileMaria,
} from "@/components/mockups/profile-screens";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const examples = [
  {
    name: "Maria Beauty",
    role: "Lash Designer",
    screen: <ProfileMaria />,
  },
  {
    name: "João Silva",
    role: "Fotógrafo",
    screen: <ProfileJoao />,
  },
  {
    name: "Carlos Imóveis",
    role: "Corretor de imóveis",
    screen: <ProfileCarlos />,
  },
];

export function Examples() {
  return (
    <section id="exemplos" className="scroll-mt-20 bg-[#efeae3]/40 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Exemplos"
            title="Veja como seu PerfilPro pode ficar."
            subtitle="Eu personalizo cada página para o tipo de negócio — beleza, foto, imóveis e mais."
          />
        </Reveal>

        <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {examples.map((example, index) => (
            <Reveal
              key={example.name}
              delay={index * 90}
              className="min-w-[240px] snap-center md:min-w-0"
            >
              <figure className="text-center">
                <PhoneFrame size="sm">{example.screen}</PhoneFrame>
                <figcaption className="mt-5">
                  <p className="font-serif text-lg text-ink">{example.name}</p>
                  <p className="mt-0.5 text-sm text-muted">{example.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex justify-center">
            <WhatsAppButton size="xl">Quero uma página igual</WhatsAppButton>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
