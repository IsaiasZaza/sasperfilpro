import { ClaimUsername } from "@/components/marketing/claim-username";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfileMaria } from "@/components/mockups/profile-screens";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden bg-lime pb-16 pt-6 sm:pb-24 sm:pt-10"
    >
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#f4d7b8]/80 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] bottom-[-4rem] h-80 w-80 rounded-full bg-white/35 blur-3xl" />

      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <div className="max-w-xl">
          <p className="animate-fade-up mb-4 inline-flex items-center rounded-full border border-ink/10 bg-white/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            7 dias grátis · Pro e Premium
          </p>
          <h1 className="animate-fade-up font-serif text-[2.6rem] leading-[0.98] text-ink sm:text-[3.6rem] lg:text-[4.15rem] [animation-delay:80ms]">
            Tudo o que você é. Em um só link.
          </h1>
          <p className="animate-fade-up mt-6 max-w-lg text-base leading-[1.7] text-ink/75 sm:text-[1.125rem] [animation-delay:140ms]">
            Monte sua página, mostre serviços e depoimentos, e leve o cliente
            direto para o WhatsApp. Escolha o plano, cadastre o cartão na Stripe
            e comece o teste grátis.
          </p>
          <div className="animate-fade-up mt-8 [animation-delay:220ms]">
            <ClaimUsername />
          </div>
        </div>

        <div className="animate-fade-up relative mx-auto w-full max-w-[320px] justify-self-center sm:max-w-[360px] [animation-delay:180ms] lg:max-w-[380px]">
          <div className="relative overflow-hidden rounded-[2.2rem] bg-[#f7f0e4] px-6 pb-7 pt-8 shadow-[0_40px_80px_-36px_rgba(20,17,14,0.45)] sm:rounded-[2.6rem] sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime/50 blur-2xl" />
            <div className="animate-float relative">
              <PhoneFrame>
                <ProfileMaria />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
