"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Copy, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PhoneFrame } from "@/components/mockups/phone-frame";
import { ProfilePreview } from "@/components/profile/profile-preview";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { profileApi } from "@/lib/api-client";
import type { PublicPage } from "@/lib/types/profile";

function publishedLabel(iso: string | null) {
  if (!iso) return "No ar";
  const formatted = new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
  return `No ar desde ${formatted}`;
}

export function DashboardHome() {
  const { user, profile, setProfile, refresh } = useAuth();
  const [preview, setPreview] = useState<PublicPage | null>(null);
  const [previewState, setPreviewState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);

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
    return <PageSkeleton />;
  }

  const publicPath = profile.username ? `/u/${profile.username}` : null;
  const published = profile.status === "PUBLISHED";
  const name =
    profile.displayName || preview?.displayName || user.name.split(" ")[0];
  const headline = profile.headline || preview?.headline || null;

  async function copyLink() {
    if (!publicPath) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}${publicPath}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function publish() {
    setPublishing(true);
    try {
      const updated = await profileApi.publish();
      setProfile(updated);
      await loadPreview();
    } catch {
      // o editor cobre o erro com mais contexto
    } finally {
      setPublishing(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-lime pb-12 pt-6 sm:pb-20 sm:pt-12">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[#f4d7b8]/80 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] bottom-[-4rem] h-80 w-80 rounded-full bg-white/35 blur-3xl" />

      <Container className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <div className="max-w-xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-ink/10 bg-white/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
            {published ? "Sua página no ar" : "Sua página · rascunho"}
          </p>
          <h1 className="break-words font-serif text-[2.15rem] leading-[1.02] text-ink sm:text-[3.6rem] lg:text-[4.15rem] lg:leading-[0.98]">
            {name}
          </h1>
          {headline ? (
            <p className="mt-3 text-[1.05rem] leading-snug text-ink/70 sm:mt-4 sm:text-[1.125rem]">
              {headline}
            </p>
          ) : null}
          <p className="mt-5 max-w-lg text-[15px] leading-[1.7] text-ink/75 sm:mt-6 sm:text-[1.125rem]">
            {published
              ? "Copie o link, cole na bio do Instagram e receba o cliente nesta página."
              : "Sua página está pronta. Publique quando quiser colocar o link na bio."}
          </p>
          <p className="mt-3 text-[13px] text-ink/55">
            {published
              ? publishedLabel(profile.publishedAt)
              : "Visível só para você, por enquanto."}
          </p>

          {publicPath ? (
            <div className="mt-7 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:items-center sm:overflow-hidden sm:rounded-full sm:border sm:border-ink/10 sm:bg-white sm:p-1.5 sm:pl-5 sm:shadow-[0_18px_40px_-24px_rgba(20,17,14,0.45)]">
              <button
                type="button"
                onClick={() => void copyLink()}
                className="flex min-w-0 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-3 text-left text-[14px] shadow-sm sm:flex-1 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[15px] sm:shadow-none"
              >
                <span className="min-w-0 truncate font-medium text-ink">
                  perfilpro.app{publicPath}
                </span>
                {copied ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0 text-muted" />
                )}
              </button>
              <Button asChild size="md" className="h-12 w-full sm:h-11 sm:w-auto sm:shrink-0">
                <Link href="/app/editor">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-7 sm:mt-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/app/editor">
                  <Pencil className="h-4 w-4" />
                  Editar página
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-4">
            {published && publicPath ? (
              <Link
                href={publicPath}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink/80 underline-offset-4 hover:text-ink hover:underline"
              >
                Abrir no ar
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                disabled={publishing}
                onClick={() => void publish()}
                className="text-[14px] font-medium text-ink/80 underline-offset-4 hover:text-ink hover:underline disabled:opacity-50"
              >
                {publishing ? "Publicando..." : "Publicar agora"}
              </button>
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[280px] justify-self-center sm:max-w-[360px] lg:max-w-[380px]">
          <div className="relative overflow-hidden rounded-[1.8rem] bg-[#f7f0e4] px-4 pb-5 pt-6 shadow-[0_40px_80px_-36px_rgba(20,17,14,0.45)] sm:rounded-[2.6rem] sm:px-8 sm:pb-7 sm:pt-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime/50 blur-2xl" />
            <div className="relative sm:animate-float">
              {previewState === "ready" && preview ? (
                <PhoneFrame>
                  <ProfilePreview page={preview} />
                </PhoneFrame>
              ) : previewState === "error" ? (
                <div className="flex h-[420px] flex-col items-center justify-center px-4 text-center sm:h-[520px]">
                  <p className="text-[14px] text-muted">
                    Não foi possível abrir a prévia.
                  </p>
                  <button
                    type="button"
                    className="mt-4 text-[13px] font-medium text-ink underline underline-offset-4"
                    onClick={() => {
                      void refresh();
                      void loadPreview();
                    }}
                  >
                    Tentar de novo
                  </button>
                </div>
              ) : (
                <div className="flex h-[420px] items-center justify-center text-sm text-muted sm:h-[520px]">
                  Abrindo sua página...
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
