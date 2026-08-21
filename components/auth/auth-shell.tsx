import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f3ee]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(196,165,116,0.2),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(154,112,72,0.1),_transparent_45%)]"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-5 py-12">
        <Link
          href="/"
          className="mb-10 font-serif text-[1.65rem] leading-none tracking-tight text-ink"
        >
          PerfilPro
        </Link>
        <div className="rounded-3xl border border-line/70 bg-[#fffcf8] p-7 shadow-[0_28px_64px_-40px_rgba(20,17,14,0.4)] sm:p-8">
          <h1 className="font-serif text-[1.9rem] leading-[1.15] tracking-tight text-ink">
            {title}
          </h1>
          <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
        </div>
        {footer ? (
          <div className="mt-6 text-center text-[13px] text-muted">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
