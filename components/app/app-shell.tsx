"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { authApi } from "@/lib/api-client";
import { needsOnboarding } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

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

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee] text-muted">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee] text-muted">
        Redirecionando...
      </div>
    );
  }

  if (needsOnboarding(profile) && !isOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee] text-muted">
        Redirecionando...
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

  return (
    <div className="min-h-screen bg-[#f6f3ee]">
      {!isEditor ? (
        <header className="sticky top-0 z-40 border-b border-line/80 bg-[#f6f3ee]/92 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
            <div className="flex items-center gap-6">
              <Link
                href={isOnboarding ? "/onboarding" : "/app"}
                className="font-serif text-[1.3rem] text-ink"
              >
                PerfilPro
              </Link>
              {!isOnboarding ? (
                <nav className="hidden items-center gap-4 sm:flex">
                  <Link
                    href="/app"
                    className={cn(
                      "text-[13px] font-medium",
                      pathname === "/app"
                        ? "text-ink"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    Painel
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
              <span className="hidden text-[13px] text-muted sm:inline">
                {user.name}
              </span>
              {!isOnboarding ? (
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/70 sm:hidden"
                  aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {menuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </button>
              ) : null}
              <button
                type="button"
                className="text-[13px] font-medium text-ink underline-offset-4 hover:underline"
                onClick={() => void handleLogout()}
              >
                Sair
              </button>
            </div>
          </div>
          {menuOpen && !isOnboarding ? (
            <div className="border-t border-line bg-[#f6f3ee] sm:hidden">
              <div className="mx-auto flex max-w-6xl flex-col px-5 py-2">
                <Link
                  href="/app"
                  className="rounded-lg px-2 py-3 text-[14px] font-medium text-ink"
                >
                  Painel
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
