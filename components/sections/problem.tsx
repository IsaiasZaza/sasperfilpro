import {
  Link2,
  MessageCircleOff,
  Search,
  ShieldAlert,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const problems = [
  {
    icon: Link2,
    title: "Link com aparência genérica",
    text: "Uma lista de botões não representa o nível do seu trabalho.",
  },
  {
    icon: Search,
    title: "Cliente precisa procurar informações",
    text: "Preço, serviço e contato ficam espalhados nos stories e no direct.",
  },
  {
    icon: Sparkles,
    title: "Falta de apresentação profissional",
    text: "Quem chega pela bio precisa entender rápido quem você é.",
  },
  {
    icon: Shuffle,
    title: "Serviços espalhados em vários lugares",
    text: "Cardápio no destaque, preço no story, contato na bio.",
  },
  {
    icon: MessageCircleOff,
    title: "Dificuldade para chegar ao WhatsApp",
    text: "Quanto mais cliques, maior a chance de o cliente desistir.",
  },
  {
    icon: ShieldAlert,
    title: "Pouca confiança para quem está conhecendo",
    text: "Um perfil bonito com um link fraco passa uma mensagem contraditória.",
  },
];

export function Problem() {
  return (
    <section className="scroll-mt-20 bg-[#efeae3]/40 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading title="Seu Instagram já faz o trabalho duro. Não deixe o link da bio perder o cliente." />
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((item, index) => (
            <Reveal key={item.title} delay={index * 60}>
              <article className="h-full rounded-2xl border border-line bg-card p-5 shadow-[0_10px_30px_-24px_rgba(20,17,14,0.35)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7db] text-ink">
                  <item.icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.7] text-muted">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
