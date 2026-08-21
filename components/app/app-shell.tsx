"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi } from "@/lib/api-client";
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
  const { ready, user, profile, clearSession } = useAuth();
  const isEditor = pathname.startsWith("/app/editor");
  const isOnboarding = pathname.startsWith("/onboarding");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (needsOnboarding(profile) && !isOnboarding) {
      router.replace("/onboarding");
    }
  }, [ready, user, profile, pathname, router, isOnboarding]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!ready || !user || (needsOnboarding(profile) && !isOnboarding)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee] text-muted">
        Carregando...
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

  const isDashboard = pathname === "/app";

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
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link
                href={isOnboarding ? "/onboarding" : "/app"}
                className="font-serif text-[1.3rem] leading-none text-ink"
              >
                PerfilPro
              </Link>
              {!isOnboarding ? (
                <nav className="hidden items-center gap-5 sm:flex">
                  <Link
                    href="/app"
                    className={cn(
                      "text-[13px] font-medium",
                      pathname === "/app"
                        ? "text-ink"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    Página
                  </Link>
                  <Link
                    href="/app/editor"
                    className={cn(
                      "text-[13px] font-medium",
                      pathname.startsWith("/app/editor")
                        ? "text-ink"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    Editor
                  </Link>
                </nav>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {!isOnboarding ? (
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/70 sm:hidden"
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
                <Link
                  href="/app"
                  className="rounded-lg px-2 py-3 text-[14px] font-medium text-ink"
                >
                  Página
                </Link>
                <Link
                  href="/app/editor"
                  className="rounded-lg px-2 py-3 text-[14px] font-medium text-ink"
                >
                  Editor
                </Link>
              </div>
            </div>
          ) : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
