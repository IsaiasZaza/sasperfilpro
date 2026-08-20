import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section className="pb-24 pt-8 sm:pb-28">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-[2.15rem] leading-[1.12] text-ink sm:text-[2.75rem]">
              Pronto para profissionalizar sua bio?
            </h2>
            <p className="mt-5 text-base leading-[1.7] text-muted">
              Pare de mandar seus clientes para uma lista de links. Eu te entrego
              um lugar para eles conhecerem seu trabalho.
            </p>
            <div className="mt-8">
              <WhatsAppButton size="xl">Quero minha página agora</WhatsAppButton>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
