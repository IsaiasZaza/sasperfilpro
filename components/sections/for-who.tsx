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
import { SectionHeading } from "@/components/ui/section-heading";

const audiences = [
  {
    icon: Scissors,
    title: "Beleza",
    text: "Cabeleireiras, nail, lash, maquiadores e esteticistas.",
  },
  {
    icon: Camera,
    title: "Fotografia",
    text: "Mostre seu olhar e receba pedidos de orçamento.",
  },
  {
    icon: Dumbbell,
    title: "Fitness",
    text: "Personais e profissionais que vendem acompanhamento.",
  },
  {
    icon: ChefHat,
    title: "Gastronomia",
    text: "Confeiteiros, marmitas, doces e encomendas.",
  },
  {
    icon: Home,
    title: "Imóveis",
    text: "Corretores que precisam apresentar imóveis com clareza.",
  },
  {
    icon: Sparkle,
    title: "Serviços",
    text: "Prestadores autônomos que fecham no WhatsApp.",
  },
  {
    icon: Megaphone,
    title: "Criadores",
    text: "Quem usa o Instagram para divulgar trabalho e parcerias.",
  },
  {
    icon: Store,
    title: "Pequenos negócios",
    text: "Marcas locais que precisam de uma presença mais profissional.",
  },
];

export function ForWho() {
  return (
    <section className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading title="Feito para quem transforma seguidores em clientes." />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item, index) => (
            <Reveal key={item.title} delay={index * 50}>
              <article className="h-full rounded-2xl border border-line bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5">
                <item.icon className="h-5 w-5 text-bronze" strokeWidth={1.6} />
                <h3 className="mt-4 font-serif text-[1.25rem] leading-snug text-ink">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-[1.7] text-muted">
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
