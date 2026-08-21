"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Preciso ter um site?",
    a: "Não. O PerfilPro é a página que você cola na bio — sem domínio, hospedagem ou WordPress.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. A página e o editor foram pensados para quem abre tudo pelo celular.",
  },
  {
    q: "Posso colocar meu WhatsApp?",
    a: "Sim. O cliente toca no botão e já cai na conversa, com mensagem pronta se você quiser.",
  },
  {
    q: "Dá para mostrar serviços e preços?",
    a: "Dá. Você adiciona cada serviço no editor, com valor e descrição.",
  },
  {
    q: "Posso mudar o visual depois?",
    a: "Pode. Cores, foto, textos e a ordem dos blocos ficam no editor, quando você quiser.",
  },
  {
    q: "Quanto tempo leva?",
    a: "Minutos. Escolhe o link, monta os blocos, publica e cola na bio.",
  },
  {
    q: "Preciso saber programar?",
    a: "Não. Se você já usa Instagram, você consegue usar o PerfilPro.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-background py-16 sm:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-[1.95rem] leading-[1.12] text-ink sm:text-[2.7rem]">
              Dúvidas? Respondidas.
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto mt-10 max-w-2xl divide-y divide-line overflow-hidden rounded-[1.6rem] border border-line bg-card">
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
