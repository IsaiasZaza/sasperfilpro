import Link from "next/link";
import { Container } from "@/components/ui/container";
import { NAV_LINKS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="font-serif text-[1.5rem] text-lime">
            PerfilPro
          </Link>
          <p className="mt-3 max-w-xs text-[15px] leading-[1.7] text-white/60">
            Um link na bio para apresentar seu trabalho e receber clientes no
            WhatsApp.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-lime">
              {link.label}
            </a>
          ))}
          <Link href="/login" className="hover:text-lime">
            Entrar
          </Link>
          <Link href="/cadastro" className="hover:text-lime">
            Criar página
          </Link>
        </nav>
      </Container>
      <Container className="border-t border-white/10 py-5 pb-24 sm:pb-5">
        <p className="text-xs tracking-wide text-white/40">
          © {new Date().getFullYear()} PerfilPro · criado por Isaias
        </p>
      </Container>
    </footer>
  );
}
