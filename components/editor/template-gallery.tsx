"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { BLOCK_ICONS } from "@/components/editor/editor-meta";
import { ThemeAtmosphere } from "@/components/profile/theme-atmosphere";
import { Button } from "@/components/ui/button";
import { PAGE_TEMPLATES, type PageTemplate } from "@/lib/page-templates";
import { resolvePaintTheme } from "@/lib/theme";
import { BLOCK_META } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

/** Miniatura da página: barras nas cores do tema, na ordem dos blocos. */
function TemplateThumb({ template }: { template: PageTemplate }) {
  const paint = resolvePaintTheme(template.theme);
  // O hero já aparece como avatar + linha de nome; as barras representam os
  // blocos de ação abaixo dele.
  const rows = template.blocks
    .filter((block) => block.type !== "HERO")
    .slice(0, 4);

  return (
    <span
      className="theme-preset-swatch relative flex h-[116px] w-full flex-col items-center gap-2 overflow-hidden rounded-xl border border-black/5 px-5 pt-4"
      style={{ background: paint.wash }}
    >
      <ThemeAtmosphere atmosphere={paint.atmosphere} accent={paint.accent} />
      <span
        className="relative z-[1] h-7 w-7 shrink-0 rounded-full"
        style={{
          background: `linear-gradient(145deg, ${paint.muted}, ${paint.accent})`,
        }}
      />
      <span
        className="relative z-[1] h-1 w-14 shrink-0 rounded-full opacity-60"
        style={{ background: paint.text }}
      />
      {rows.map((block, index) => (
        <span
          key={`${block.type}-${index}`}
          className="relative z-[1] w-full shrink-0 rounded-full"
          style={{
            height: 8,
            background:
              index === 0
                ? paint.accent
                : `color-mix(in srgb, ${paint.card} 80%, transparent)`,
            border: index === 0 ? undefined : `1px solid ${paint.line}`,
            boxShadow:
              index === 0 && paint.atmosphere !== "none"
                ? `0 0 12px ${paint.accent}99`
                : undefined,
          }}
        />
      ))}
    </span>
  );
}

export function TemplateGallery({
  hasContent,
  applyingId,
  onApply,
  locked = false,
  onUnlock,
}: {
  /** Já existem blocos na página — aplicar um modelo vai substituí-los. */
  hasContent: boolean;
  applyingId: string | null;
  onApply: (template: PageTemplate) => void;
  locked?: boolean;
  onUnlock?: () => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {locked ? (
        <div className="rounded-2xl border border-line bg-background px-4 py-3.5">
          <p className="text-[14px] font-semibold text-ink">
            Modelos no Pro e Premium
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Os modelos prontos montam tema, serviços e depoimentos. No Free
            você monta a página bloco a bloco.
          </p>
          <button
            type="button"
            className="mt-3 text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
            onClick={() => onUnlock?.()}
          >
            Ver planos
          </button>
        </div>
      ) : (
        <p className="text-[13px] leading-relaxed text-muted">
          Cada modelo monta os blocos, o tema e alguns textos de exemplo. Depois
          você troca o que quiser — nada fica travado.
        </p>
      )}

      {PAGE_TEMPLATES.map((template) => {
        const applying = applyingId === template.id;
        const confirming = confirmId === template.id;
        const busy = applyingId !== null;

        return (
          <article
            key={template.id}
            className={cn(
              "rounded-2xl border bg-card p-3 transition-colors",
              confirming ? "border-ink" : "border-line",
              busy && !applying && "opacity-50",
            )}
          >
            <TemplateThumb template={template} />

            <div className="mt-3">
              <h4 className="text-[14px] font-semibold text-ink">
                {template.label}
              </h4>
              <p className="mt-0.5 text-[12px] text-muted-soft">
                {template.audience}
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                {template.tagline}
              </p>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1">
              {template.blocks.map((block, index) => {
                const Icon = BLOCK_ICONS[block.type];
                return (
                  <span
                    key={`${block.type}-${index}`}
                    title={BLOCK_META[block.type].label}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-background text-muted"
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                );
              })}
            </div>

            {locked ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-3 h-10 w-full"
                onClick={() => onUnlock?.()}
              >
                Disponível no Pro
              </Button>
            ) : confirming ? (
              <div className="mt-3 rounded-xl bg-background p-2.5">
                <p className="text-[12px] leading-relaxed text-muted">
                  Isso troca os blocos atuais pelos do modelo. Seu nome, foto,
                  WhatsApp, serviços e depoimentos são mantidos.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 flex-1"
                    disabled={busy}
                    onClick={() => {
                      setConfirmId(null);
                      onApply(template);
                    }}
                  >
                    Substituir
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-10"
                    onClick={() => setConfirmId(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-3 h-10 w-full"
                disabled={busy}
                onClick={() => {
                  if (hasContent) {
                    setConfirmId(template.id);
                    return;
                  }
                  onApply(template);
                }}
              >
                {applying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Montando página...
                  </>
                ) : (
                  "Usar este modelo"
                )}
              </Button>
            )}
          </article>
        );
      })}
    </div>
  );
}
