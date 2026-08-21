"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfilePreview } from "@/components/profile/profile-preview";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { publicApi } from "@/lib/api-client";
import { resolvePaintTheme } from "@/lib/theme";
import type { PublicPage } from "@/lib/types/profile";

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [page, setPage] = useState<PublicPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await publicApi.getPage(username);
        if (!cancelled) setPage(data);
      } catch (err) {
        if (!cancelled) {
          setPage(null);
          setError(
            err instanceof ApiError ? err.message : "Página não encontrada",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee] text-muted">
        Carregando...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f3ee] px-5 text-center">
        <Link href="/" className="font-serif text-[1.55rem] text-ink">
          PerfilPro
        </Link>
        <h1 className="mt-10 font-serif text-[2rem] text-ink">
          Página não encontrada
        </h1>
        <p className="mt-2 max-w-sm text-[15px] text-muted">
          {error || "Este perfil não existe ou ainda não foi publicado."}
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/cadastro">Criar minha página</Link>
        </Button>
      </div>
    );
  }

  const painted = resolvePaintTheme(page.theme);

  return (
    <div
      className={
        painted.font === "serif"
          ? "relative min-h-screen pb-16 font-serif"
          : painted.font === "mono"
            ? "relative min-h-screen pb-16 font-mono"
            : "relative min-h-screen pb-16 font-sans"
      }
      style={{ background: painted.background }}
    >
      <div className="mx-auto min-h-screen w-full max-w-md">
        <ProfilePreview page={page} showStatusBar={false} />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center pb-4 pt-10 bg-gradient-to-t from-black/10 to-transparent">
        <Link
          href="/"
          className="pointer-events-auto rounded-full border border-line bg-white/95 px-3.5 py-1.5 text-[11px] font-medium text-muted shadow-sm backdrop-blur"
        >
          Feito com PerfilPro
        </Link>
      </div>
    </div>
  );
}
