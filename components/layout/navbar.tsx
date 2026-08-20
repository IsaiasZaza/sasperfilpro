"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { WhatsAppButton } from "@/components/cta/whatsapp-button";
import { Container } from "@/components/ui/container";
import { NAV_LINKS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || open
          ? "border-line/80 bg-[#f6f3ee]/90 backdrop-blur-md"
          : "border-transparent bg-[#f6f3ee]/70 backdrop-blur-sm",
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <a href="#inicio" className="font-serif text-[1.4rem] leading-none text-ink">
          PerfilPro
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium tracking-[-0.01em] text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <WhatsAppButton size="sm">Falar no WhatsApp</WhatsAppButton>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/60 lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-line bg-[#f6f3ee] lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 text-[15px] text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <WhatsAppButton className="w-full" size="lg">
                Quero minha página no WhatsApp
              </WhatsAppButton>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
