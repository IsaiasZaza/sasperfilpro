import Link from "next/link";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import {
  ProfileCarlos,
  ProfileJoao,
  ProfileMaria,
} from "@/components/mockups/profile-screens";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const examples = [
  {
    name: "Maria Beauty",
    role: "Lash Designer",
    handle: "/u/maria",
    screen: <ProfileMaria />,
  },
  {
    name: "João Silva",
    role: "Fotógrafo",
    handle: "/u/joao",
    screen: <ProfileJoao />,
  },
  {
    name: "Carlos Imóveis",
    role: "Corretor",
    handle: "/u/carlos",
    screen: <ProfileCarlos />,
  },
];

export function Examples() {
  return (
    <section id="exemplos" className="scroll-mt-20 bg-background py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze">
              Exemplos
            </p>
            <h2 className="font-serif text-[1.95rem] leading-[1.12] text-ink sm:text-[2.7rem]">
              Uma página com a cara do seu trabalho.
            </h2>
            <p className="mt-4 text-base leading-[1.7] text-muted">
              Beleza, foto, imóveis e serviços — o mesmo editor, visuais
              diferentes.
            </p>
          </div>
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
                  <p className="mt-1 text-[12px] font-medium text-bronze">
                    {example.handle}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 flex justify-center">
            <Button asChild size="xl">
              <Link href="/#planos">Criar uma página igual</Link>
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
