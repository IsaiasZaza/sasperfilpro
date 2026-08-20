import Image from "next/image";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function About() {
  return (
    <section id="sobre" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="relative mx-auto max-w-sm lg:mx-0">
              <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(166,124,82,0.18),transparent_60%)]" />
              <Image
                src="/isaias-perfilpro.png"
                alt="Isaias, criador do PerfilPro"
                width={768}
                height={1024}
                className="w-full rounded-[1.6rem] border border-line object-cover shadow-[0_28px_60px_-32px_rgba(20,17,14,0.45)]"
                priority={false}
              />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze">
              Quem cria a sua página
            </p>
            <h2 className="mt-3 font-serif text-[1.95rem] leading-[1.12] text-ink sm:text-[2.55rem]">
              Oi, eu sou o Isaias.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-[1.75] text-muted">
              Eu crio o PerfilPro para quem vive do Instagram: beleza, foto,
              treino, doces, imóveis e serviços. A ideia é simples — seu cliente
              clica na bio e já entende o que você faz, quanto custa e como te
              chamar no WhatsApp.
            </p>
            <p className="mt-4 max-w-xl text-base leading-[1.75] text-muted">
              Sem site complicado. Sem mensalidade. Você me manda suas
              informações e eu monto uma página com a cara do seu negócio.
            </p>
            <div className="mt-8">
              <WhatsAppButton size="xl">Falar comigo no WhatsApp</WhatsAppButton>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
