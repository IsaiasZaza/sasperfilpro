import { Check } from "lucide-react";
import { InstagramBio } from "@/components/mockups/instagram-bio";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfileJoao, ProfileMaria } from "@/components/mockups/profile-screens";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const customize = [
  "Blocos de WhatsApp, serviços e depoimentos",
  "Cores, foto e textos no seu ritmo",
  "Prévia no celular enquanto você edita",
];

const share = [
  "Cole na bio do Instagram e do TikTok",
  "Mande no status e no direct",
  "Um endereço só, fácil de lembrar",
];

const convert = [
  "Serviços e preços organizados",
  "Cliente fala com você em um toque",
  "Depoimentos que geram confiança",
];

export function FeaturesShowcase() {
  return (
    <div id="recursos" className="scroll-mt-20">
      <section className="bg-peach py-16 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/60">
              Editor visual
            </p>
            <h2 className="mt-3 font-serif text-[2.1rem] leading-[1.08] text-ink sm:text-[2.9rem]">
              Monte a página como quem monta um story: bloco a bloco.
            </h2>
            <p className="mt-4 max-w-md text-base leading-[1.7] text-ink/70">
              Arraste, publique e veja o resultado na hora. Sem planilha, sem
              pedir para alguém “fazer o site”.
            </p>
            <ul className="mt-8 space-y-3">
              {customize.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-lime">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <PhoneFrame>
              <ProfileMaria extended />
            </PhoneFrame>
          </Reveal>
        </Container>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <div className="mx-auto max-w-sm">
              <InstagramBio />
            </div>
          </Reveal>
          <Reveal delay={80} className="order-1 lg:order-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lime">
              Compartilhe em qualquer lugar
            </p>
            <h2 className="mt-3 font-serif text-[2.1rem] leading-[1.08] sm:text-[2.9rem]">
              Um link na bio. O cliente encontra tudo.
            </h2>
            <p className="mt-4 max-w-md text-base leading-[1.7] text-white/70">
              Pare de atualizar destaques, stories e o direct com a mesma
              informação. Seu PerfilPro fica no ar 24h.
            </p>
            <ul className="mt-8 space-y-3">
              {share.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-white/90">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section className="bg-sage py-16 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/60">
              Feito para vender
            </p>
            <h2 className="mt-3 font-serif text-[2.1rem] leading-[1.08] text-ink sm:text-[2.9rem]">
              Muito mais que uma lista de botões.
            </h2>
            <p className="mt-4 max-w-md text-base leading-[1.7] text-ink/70">
              Quem chega pela bio precisa entender o que você faz, quanto custa
              e como te chamar — sem caçar informação.
            </p>
            <ul className="mt-8 space-y-3">
              {convert.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-sage">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={80}>
            <PhoneFrame>
              <ProfileJoao />
            </PhoneFrame>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
