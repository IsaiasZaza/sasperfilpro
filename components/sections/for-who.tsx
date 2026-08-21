import {
  Camera,
  ChefHat,
  Dumbbell,
  Home,
  Megaphone,
  Scissors,
  Sparkle,
  Store,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

const audiences = [
  {
    icon: Scissors,
    title: "Beleza",
    text: "Cílios, unha, cabelo e estética.",
    tone: "bg-[#f7e3d4]",
  },
  {
    icon: Camera,
    title: "Fotografia",
    text: "Portfólio e orçamento no WhatsApp.",
    tone: "bg-[#e8e2d8]",
  },
  {
    icon: Dumbbell,
    title: "Fitness",
    text: "Personais e acompanhamento.",
    tone: "bg-sage",
  },
  {
    icon: ChefHat,
    title: "Gastronomia",
    text: "Doces, marmitas e encomendas.",
    tone: "bg-[#f3e7c8]",
  },
  {
    icon: Home,
    title: "Imóveis",
    text: "Imóveis em destaque, contato direto.",
    tone: "bg-[#dde5ee]",
  },
  {
    icon: Sparkle,
    title: "Serviços",
    text: "Autônomos que fecham no Zap.",
    tone: "bg-peach",
  },
  {
    icon: Megaphone,
    title: "Criadores",
    text: "Links, parcerias e trabalhos.",
    tone: "bg-lime/70",
  },
  {
    icon: Store,
    title: "Negócios locais",
    text: "Uma página profissional na bio.",
    tone: "bg-[#eadfd4]",
  },
];

export function ForWho() {
  return (
    <section className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-[1.95rem] leading-[1.12] text-ink sm:text-[2.7rem]">
              Feito para quem transforma seguidor em cliente.
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item, index) => (
            <Reveal key={item.title} delay={index * 45}>
              <article
                className={`h-full rounded-[1.5rem] p-5 transition-transform duration-200 hover:-translate-y-1 ${item.tone}`}
              >
                <item.icon className="h-5 w-5 text-ink" strokeWidth={1.6} />
                <h3 className="mt-4 font-serif text-[1.25rem] leading-snug text-ink">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-[1.7] text-ink/70">
                  {item.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
