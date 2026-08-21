import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfileMaria } from "@/components/mockups/profile-screens";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,_rgba(196,165,116,0.16),_transparent_58%)]" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <div>
          <p className="animate-fade-up mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze">
            Crie sua página em minutos
          </p>
          <h1 className="animate-fade-up font-serif text-[2.45rem] leading-[1.05] text-ink sm:text-[3.4rem] lg:text-[3.9rem] [animation-delay:80ms]">
            Transforme o link da sua bio em uma página que vende por você.
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-base leading-[1.7] text-muted sm:text-[1.125rem] [animation-delay:140ms]">
            Monte seu PerfilPro bloco a bloco — mostre serviços, depoimentos e
            leve o cliente direto para o WhatsApp.
          </p>
          <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row [animation-delay:220ms]">
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/cadastro">Criar minha página</Link>
            </Button>
            <a
              href="#exemplos"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-line bg-white/70 px-6 text-base font-medium text-ink transition-colors hover:bg-white"
            >
              Ver exemplo
              <ArrowDownRight className="h-4 w-4" />
            </a>
          </div>
          <p className="animate-fade-up mt-5 text-sm leading-relaxed text-muted-soft [animation-delay:280ms]">
            Editor visual estilo WordPress. Publique e cole o link na bio.
          </p>
        </div>

        <div className="animate-float relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(circle,_rgba(166,124,82,0.14),_transparent_65%)]" />
          <PhoneFrame>
            <ProfileMaria />
          </PhoneFrame>
        </div>
      </Container>
    </section>
  );
}
