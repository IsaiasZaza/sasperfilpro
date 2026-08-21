"use client";

import Link from "next/link";
import { Copy, ExternalLink, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfilePreview } from "@/components/profile/profile-preview";
import { Button } from "@/components/ui/button";
import { profileApi } from "@/lib/api-client";
import type { PublicPage } from "@/lib/types/profile";

export function DashboardHome() {
  const { user, profile, refresh } = useAuth();
  const [preview, setPreview] = useState<PublicPage | null>(null);
  const [previewState, setPreviewState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [copied, setCopied] = useState(false);

  async function loadPreview() {
    setPreviewState("loading");
    try {
      const page = await profileApi.preview();
      setPreview(page);
      setPreviewState("ready");
    } catch {
      setPreview(null);
      setPreviewState("error");
    }
  }

  useEffect(() => {
    void loadPreview();
  }, [profile?.username, profile?.status]);

  if (!user || !profile) {
    return (
      <div className="px-5 py-16 text-center text-muted">Carregando painel...</div>
    );
  }

  const publicPath = profile.username ? `/u/${profile.username}` : null;

  async function copyLink() {
    if (!publicPath) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}${publicPath}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-bronze">
          Painel
        </p>
        <h1 className="mt-2 font-serif text-[2.15rem] leading-tight text-ink">
          Olá, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted">
          Edite sua página, publique e cole o link na bio do Instagram.
        </p>

        <div className="mt-7 flex flex-wrap gap-2.5">
          <Button asChild size="lg">
            <Link href="/app/editor">
              <Pencil className="h-4 w-4" />
              Abrir editor
            </Link>
          </Button>
          {publicPath && profile.status === "PUBLISHED" ? (
            <Button asChild variant="secondary" size="lg">
              <Link href={publicPath} target="_blank">
                <ExternalLink className="h-4 w-4" />
                Ver página
              </Link>
            </Button>
          ) : null}
          {publicPath ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => void copyLink()}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copiado" : "Copiar link"}
            </Button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-[#fffcf8] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
              Status
            </p>
            <p className="mt-2 text-[16px] font-semibold text-ink">
              {profile.status === "PUBLISHED" ? "Publicada" : "Rascunho"}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-[#fffcf8] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-soft">
              Link
            </p>
            <p className="mt-2 truncate text-[16px] font-semibold text-ink">
              {publicPath ? publicPath : "Defina no onboarding"}
            </p>
          </div>
        </div>
      </div>

      <div className="justify-self-center lg:justify-self-end">
        {previewState === "ready" && preview ? (
          <PhoneFrame>
            <ProfilePreview page={preview} />
          </PhoneFrame>
        ) : previewState === "error" ? (
          <div className="flex h-[480px] w-[260px] flex-col items-center justify-center gap-3 rounded-[2.2rem] border border-line bg-white px-6 text-center">
            <p className="text-[14px] text-muted">
              Não foi possível carregar o preview.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                void refresh();
                void loadPreview();
              }}
            >
              Tentar de novo
            </Button>
          </div>
        ) : (
          <div className="flex h-[480px] w-[260px] items-center justify-center rounded-[2.2rem] border border-line bg-white text-sm text-muted">
            Carregando preview...
          </div>
        )}
      </div>
    </div>
  );
}
