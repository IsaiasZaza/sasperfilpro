"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { SubscriptionBanners } from "@/components/billing/subscription-banners";
import { Logo } from "@/components/brand/logo";
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
  const { ready, user, profile, subscription, clearSession } = useAuth();
  const isEditor = pathname.startsWith("/app/editor");
  const isOnboarding = pathname.startsWith("/onboarding");
  const [menuOpen, setMenuOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  const workspace = hasWorkspaceAccess(subscription);
  const signedInOk = canStaySignedIn(subscription);
  const isDashboard = pathname === "/app";
  const isAssinatura =
    pathname === "/assinatura" || pathname.startsWith("/assinatura/");

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
    if (workspace && needsOnboarding(profile) && !isOnboarding) {
      router.replace("/onboarding");
    }
  }, [
    ready,
    user,
    profile,
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
    (workspace && needsOnboarding(profile) && !isOnboarding)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee]">
        <PageSkeleton />
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
                <nav className="hidden items-center gap-5 sm:flex">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-[13px] font-medium",
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/70 sm:hidden"
                  aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  {menuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </button>
              ) : null}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                {initials(user.name)}
              </div>
              <button
                type="button"
                className="text-[13px] text-muted hover:text-ink"
                onClick={() => void handleLogout()}
              >
                Sair
              </button>
            </div>
          </div>
          {menuOpen && !isOnboarding ? (
            <div
              className={cn(
                "border-t sm:hidden",
                isDashboard
                  ? "border-ink/10 bg-lime"
                  : "border-line bg-[#f6f3ee]",
              )}
            >
              <div className="mx-auto flex max-w-6xl flex-col px-5 py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-2 py-3 text-[14px] font-medium text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
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
