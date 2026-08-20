import { Container } from "@/components/ui/container";
import { NAV_LINKS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-line bg-[#efeae3]">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-[1.35rem] text-ink">PerfilPro</p>
          <p className="mt-2 max-w-xs text-[15px] leading-[1.7] text-muted">
            Seu Instagram apresenta. Seu PerfilPro transforma visitantes em
            clientes.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
      <Container className="border-t border-line/80 py-5 pb-24 sm:pb-5">
        <p className="text-xs tracking-wide text-muted-soft">
          © {new Date().getFullYear()} PerfilPro · criado por Isaias
        </p>
      </Container>
    </footer>
  );
}
