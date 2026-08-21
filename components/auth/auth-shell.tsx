import Link from "next/link";
import { MapPin } from "lucide-react";

function AuthPreview() {
  return (
    <div className="w-full max-w-[280px] rounded-[2rem] bg-[#f7f0e4] px-6 py-8 shadow-[0_40px_80px_-32px_rgba(20,17,14,0.45)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(145deg,#e8c4b8,#c98978)] text-lg font-semibold text-white">
        MO
      </div>
      <p className="mt-4 text-center font-serif text-[1.35rem] leading-tight text-ink">
        Maria Oliveira
      </p>
      <p className="mt-1 flex items-center justify-center gap-1 text-[12px] text-muted">
        <MapPin className="h-3 w-3" />
        Brasília · Lash Designer
      </p>
      <div className="mt-6 space-y-2">
        <div className="rounded-full bg-ink py-2.5 text-center text-[13px] font-medium text-white">
          Agendar horário
        </div>
        <div className="rounded-full border border-[#eadfd8] bg-white py-2.5 text-center text-[13px] font-medium text-ink">
          Ver trabalhos
        </div>
        <div className="rounded-full bg-[#25d366]/15 py-2.5 text-center text-[13px] font-medium text-[#128c4b]">
          WhatsApp
        </div>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col bg-lime lg:flex">
        <div className="px-10 pt-8">
          <Link
            href="/"
            className="font-serif text-[1.55rem] leading-none text-ink"
          >
            PerfilPro
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-10 py-16">
          <AuthPreview />
        </div>
      </aside>

      <div className="flex min-h-screen flex-col bg-[#fffcf8]">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="font-serif text-[1.4rem] leading-none text-ink lg:invisible"
          >
            PerfilPro
          </Link>
          {action ? (
            <Link
              href={action.href}
              className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              {action.label}
            </Link>
          ) : (
            <span />
          )}
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-[380px]">
            <h1 className="font-serif text-[2rem] leading-[1.1] tracking-tight text-ink">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                {subtitle}
              </p>
            ) : null}
            <div className="mt-8">{children}</div>
            {footer ? (
              <p className="mt-8 text-center text-[13px] text-muted">{footer}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
