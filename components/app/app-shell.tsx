"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, TriangleAlert, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { SubscriptionBanners } from "@/components/billing/subscription-banners";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { authApi, billingApi } from "@/lib/api-client";
import { hasWorkspaceAccess, canStaySignedIn } from "@/lib/billing";
import type { Plan } from "@/lib/types/billing";
import { needsOnboarding } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, user, profile, subscription, sessionError, refresh, clearSession } =
    useAuth();
  const isEditor = pathname.startsWith("/app/editor");
  const isOnboarding = pathname.startsWith("/onboarding");
  const [menuOpen, setMenuOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  const workspace = hasWorkspaceAccess(subscription);
  const signedInOk = canStaySignedIn(subscription);
  const isDashboard = pathname === "/app";
  const isAssinatura =
    pathname === "/assinatura" || pathname.startsWith("/assinatura/");
  // Perfil ausente não é o mesmo que perfil incompleto: sem ele não há como
  // saber se o onboarding é necessário, e mandar o usuário para o wizard
  // deixaria ele preso numa tela que também depende do perfil.
  const mustOnboard = profile != null && needsOnboarding(profile);
  const profileMissing = Boolean(
    ready && user && signedInOk && workspace && !profile,
  );

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!signedInOk) {
      router.replace("/planos?reason=expired");
      return;
    }
    if (!workspace && !isAssinatura) {
      router.replace("/assinatura");
      return;
    }
    if (mustOnboard && !isOnboarding) {
      router.replace("/onboarding");
    }
  }, [
    ready,
    user,
    mustOnboard,
    workspace,
    signedInOk,
    isAssinatura,
    pathname,
    router,
    isOnboarding,
  ]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user || !workspace) return;
    void billingApi
      .plans()
      .then((catalog) => setPlans(catalog.plans))
      .catch(() => undefined);
  }, [user, workspace]);

  if (
    !ready ||
    !user ||
    !signedInOk ||
    (!workspace && !isAssinatura) ||
    (mustOnboard && !isOnboarding)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee]">
        <PageSkeleton />
      </div>
    );
  }

  // O editor busca o próprio perfil e já tem tela de erro com nova tentativa.
  if (profileMissing && !isAssinatura && !isEditor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f3ee] px-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink">
          <TriangleAlert className="h-5 w-5" />
        </span>
        <p className="text-[17px] font-semibold text-ink">
          Não conseguimos carregar seu perfil
        </p>
        <p className="max-w-sm text-[14px] leading-relaxed text-muted">
          {sessionError ||
            "A conexão falhou no meio do caminho. Seus dados estão salvos — é só tentar de novo."}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={() => void refresh()}>
            Tentar de novo
          </Button>
          <Button asChild variant="secondary">
            <Link href="/assinatura">Ver minha assinatura</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearSession();
    router.push("/login");
  }

  const navItems = [
    ...(workspace
      ? [
          { href: "/app", label: "Página", active: pathname === "/app" },
          {
            href: "/app/editor",
            label: "Editor",
            active: pathname.startsWith("/app/editor"),
          },
        ]
      : []),
    { href: "/assinatura", label: "Assinatura", active: isAssinatura },
  ];

  return (
    <div className={cn("min-h-screen", isDashboard ? "bg-lime" : "bg-[#f6f3ee]")}>
      {!isEditor ? (
        <header
          className={cn(
            "sticky top-0 z-40 border-b backdrop-blur-md",
            isDashboard
              ? "border-transparent bg-lime/85"
              : "border-line/80 bg-[#f6f3ee]/90",
          )}
        >
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-6">
              <Logo
                href={isOnboarding ? "/onboarding" : workspace ? "/app" : "/assinatura"}
                size="sm"
                mark={isDashboard ? "contrast" : "brand"}
              />
              {!isOnboarding ? (
                <nav
                  aria-label="Navegação principal"
                  className="hidden items-center gap-5 sm:flex"
                >
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={item.active ? "page" : undefined}
                      className={cn(
                        "rounded-lg text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25",
                        item.active ? "text-ink" : "text-muted hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {!isOnboarding ? (
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/70 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 sm:hidden"
                  aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                  aria-expanded={menuOpen}
                  aria-controls="app-mobile-menu"
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  {menuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </button>
              ) : null}
              <div
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white"
              >
                {initials(user.name)}
              </div>
              <span className="sr-only">Conectado como {user.name}</span>
              <button
                type="button"
                className="inline-flex h-11 items-center rounded-lg px-2 text-[13px] text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25"
                onClick={() => void handleLogout()}
              >
                Sair
              </button>
            </div>
          </div>
          {menuOpen && !isOnboarding ? (
            <div
              id="app-mobile-menu"
              className={cn(
                "border-t sm:hidden",
                isDashboard
                  ? "border-ink/10 bg-lime"
                  : "border-line bg-[#f6f3ee]",
              )}
            >
              <nav
                aria-label="Navegação principal"
                className="mx-auto flex max-w-6xl flex-col px-5 py-2"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-lg px-2 text-[14px] font-medium transition-colors",
                      item.active
                        ? "bg-white/70 text-ink"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        item.active ? "bg-ink" : "bg-transparent",
                      )}
                    />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
          {sessionError ? (
            <div
              role="status"
              className="border-t border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6 lg:px-8"
            >
              <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-amber-900">
                <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0">{sessionError}</span>
                <button
                  type="button"
                  className="font-semibold underline underline-offset-2"
                  onClick={() => void refresh()}
                >
                  Tentar de novo
                </button>
              </div>
            </div>
          ) : null}
          {!isAssinatura ? (
            <SubscriptionBanners subscription={subscription} plans={plans} />
          ) : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
