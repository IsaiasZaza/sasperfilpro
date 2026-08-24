"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { MARKETING_FAQS } from "@/lib/marketing-faq";
import { cn } from "@/lib/utils";

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
          {MARKETING_FAQS.map((item, index) => {
            const isOpen = open === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  id={buttonId}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-black/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/20"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <span className="text-[15px] font-medium tracking-[-0.01em] text-ink">
                    {item.q}
                  </span>
                  <Plus
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted transition-transform duration-200",
                      isOpen && "rotate-45",
                    )}
                  />
                </button>
                {/* inert em vez de hidden: tira a resposta fechada da árvore de
                    acessibilidade sem matar a animação de altura. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!isOpen}
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
