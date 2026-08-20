"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Preciso ter um site?",
    a: "Não. O PerfilPro é uma página profissional simples para colocar direto na bio do Instagram.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. Eu penso a experiência principalmente para quem abre pelo celular.",
  },
  {
    q: "Posso colocar meu WhatsApp?",
    a: "Sim. O WhatsApp fica em destaque para o cliente falar com você em um clique.",
  },
  {
    q: "Posso adicionar meus serviços?",
    a: "Sim. Seus serviços ficam organizados na página, com valores se você quiser mostrar.",
  },
  {
    q: "Posso colocar fotos do meu trabalho?",
    a: "Sim. Dá para incluir portfólio e fotos do que você entrega.",
  },
  {
    q: "Quanto tempo leva para ficar pronto?",
    a: "Assim que você me envia as informações, eu começo a montar a sua página.",
  },
  {
    q: "Preciso saber programar?",
    a: "Não. Você me manda nome, foto, serviços e WhatsApp. Eu cuido do resto.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-[#efeae3]/40 py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading title="Perguntas frequentes" />
        </Reveal>
        <div className="mx-auto mt-10 max-w-2xl divide-y divide-line rounded-2xl border border-line bg-card">
          {faqs.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className="text-[15px] font-medium tracking-[-0.01em] text-ink">
                    {item.q}
                  </span>
                  <Plus
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted transition-transform duration-200",
                      isOpen && "rotate-45",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <p className="overflow-hidden px-5 text-[15px] leading-[1.7] text-muted">
                    <span className="block pb-4">{item.a}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
