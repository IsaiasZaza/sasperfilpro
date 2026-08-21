import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function CtaBanner() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(196,165,116,0.18),_transparent_55%)]" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-serif text-[2.15rem] leading-[1.12] sm:text-[2.75rem]">
                Seu próximo cliente pode estar a um clique da sua bio.
              </h2>
              <p className="mt-5 text-base leading-[1.7] text-white/70">
                Crie uma página profissional, publique e cole o link no
                Instagram. Serviços, WhatsApp e depoimentos em um só lugar.
              </p>
              <div className="mt-8">
                <Button asChild variant="secondary" size="xl">
                  <Link href="/#planos">Criar minha página agora</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
