"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ChoiceDropdown } from "@/components/editor/choice-dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pickerHex, SURFACE_PRESETS } from "@/lib/block-look";
import type {
  AvatarShape,
  AvatarSize,
  BlockAlign,
  BlockHover,
  BlockLook,
  BlockPadding,
  BlockRadius,
  BlockShadow,
  BlockSurface,
  ButtonWidth,
  FontSize,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export function BlockLookControls({
  look,
  onChange,
  fallbackTextColor = "#14110e",
  fallbackBackground = "#ffffff",
  title = "Aparência deste bloco",
  backgroundLabel = "Fundo do bloco",
  showTextColor = true,
  showBackground = true,
  showBorder = true,
  showAlign = true,
  showWidth = false,
  showPulse = false,
  showFontSize = true,
  showAvatar = false,
  showRadius = true,
  showPadding = true,
  showShadow = true,
  showSurface = true,
  showHover = true,
}: {
  look: BlockLook;
  onChange: (next: BlockLook) => void;
  fallbackTextColor?: string;
  fallbackBackground?: string;
  title?: string | null;
  backgroundLabel?: string;
  showTextColor?: boolean;
  showBackground?: boolean;
  showBorder?: boolean;
  showAlign?: boolean;
  showWidth?: boolean;
  showPulse?: boolean;
  showFontSize?: boolean;
  showAvatar?: boolean;
  showRadius?: boolean;
  showPadding?: boolean;
  showShadow?: boolean;
  showSurface?: boolean;
  showHover?: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(
    () => Boolean(look.pulse) || look.shadow === "glow" || look.shadow === "hard",
  );

  const patch = (partial: Partial<BlockLook>) => {
    const next: BlockLook = { ...look };
    for (const key of Object.keys(partial) as (keyof BlockLook)[]) {
      const value = partial[key];
      if (value === undefined || value === false) {
        delete next[key];
      } else {
        Object.assign(next, { [key]: value });
      }
    }
    if (JSON.stringify(next) === JSON.stringify(look)) return;
    onChange(next);
  };

  const hasAdvanced =
    showBorder ||
    showFontSize ||
    showAlign ||
    showWidth ||
    showRadius ||
    showPadding ||
    showShadow ||
    showPulse ||
    showHover;

  return (
    <section className="space-y-4">
      {title ? (
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            {title}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            Vale só neste bloco. O tema da página fica em Aparência.
          </p>
        </div>
      ) : null}
      {showAvatar ? (
        <>
          <ChoiceDropdown
            label="Tamanho da foto"
            hint="Olhe a prévia: Mini é discreta, Máx preenche quase a largura."
            value={look.avatarSize || "md"}
            onChange={(avatarSize) => patch({ avatarSize })}
            options={[
              { value: "xs", label: "Mini" },
              { value: "sm", label: "P" },
              { value: "md", label: "M" },
              { value: "lg", label: "G" },
              { value: "xl", label: "GG" },
              { value: "2xl", label: "Máx" },
            ]}
          />
          <ChoiceDropdown
            label="Formato da foto"
            value={look.avatarShape || "circle"}
            onChange={(avatarShape) => patch({ avatarShape })}
            options={[
              { value: "circle", label: "Redonda" },
              { value: "rounded", label: "Suave" },
              { value: "square", label: "Reta" },
            ]}
          />
        </>
      ) : null}
      {showSurface ? (
        <ChoiceDropdown
          label="Estilo da superfície"
          hint="Limpo some o fundo. Cartão vira um retângulo. Vidro é translúcido. Neon brilha. Quadrinhos tem borda forte."
          value={look.surface || "clean"}
          onChange={(surface) => patch({ ...SURFACE_PRESETS[surface] })}
          options={[
            { value: "clean", label: "Limpo" },
            { value: "card", label: "Cartão" },
            { value: "glass", label: "Vidro" },
            { value: "neon", label: "Neon" },
            { value: "comic", label: "Quadrinhos" },
          ]}
        />
      ) : null}
      {showBackground || showTextColor ? (
        <div className="space-y-3">
          {showBackground ? (
            <ColorControl
              label={backgroundLabel}
              value={look.backgroundColor}
              fallback={fallbackBackground}
              placeholder="Tema da página"
              onChange={(backgroundColor) => patch({ backgroundColor })}
            />
          ) : null}
          {showTextColor ? (
            <ColorControl
              label="Cor do texto"
              value={look.textColor}
              fallback={fallbackTextColor}
              placeholder="Tema da página"
              onChange={(textColor) => patch({ textColor })}
            />
          ) : null}
        </div>
      ) : null}
      {hasAdvanced ? (
        <div>
          <button
            type="button"
            className="inline-flex h-auto min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-left text-[13px] font-semibold text-ink"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
          >
            <span>
              <span className="block">Ajuste fino</span>
              <span className="mt-0.5 block text-[11px] font-medium text-muted">
                Cantos, sombra e o que acontece ao tocar
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted transition",
                moreOpen && "rotate-180",
              )}
            />
          </button>
          {moreOpen ? (
            <div className="mt-3 space-y-3">
              {showBorder ? (
                <ColorControl
                  label="Cor da borda"
                  value={look.borderColor}
                  fallback="#eadfd8"
                  placeholder="Sem borda extra"
                  onChange={(borderColor) => patch({ borderColor })}
                />
              ) : null}
              {showFontSize ? (
                <ChoiceDropdown
                  label="Tamanho da letra"
                  hint="Vale para os textos deste bloco. P é discreto, GG é o maior."
                  value={look.fontSize || "md"}
                  onChange={(fontSize) => patch({ fontSize })}
                  options={[
                    { value: "sm", label: "P" },
                    { value: "md", label: "M" },
                    { value: "lg", label: "G" },
                    { value: "xl", label: "GG" },
                  ]}
                />
              ) : null}
              {showAlign ? (
                <ChoiceDropdown
                  label={showAvatar ? "Posição (foto e textos)" : "Alinhamento"}
                  hint="Move o conteúdo para a esquerda, centro ou direita."
                  value={look.align || "center"}
                  onChange={(align) => patch({ align })}
                  options={[
                    { value: "left", label: "Esquerda" },
                    { value: "center", label: "Centro" },
                    { value: "right", label: "Direita" },
                  ]}
                />
              ) : null}
              {showWidth ? (
                <ChoiceDropdown
                  label="Largura"
                  hint="Toda a linha ocupa a página. Ajustar deixa o botão só do tamanho do texto."
                  value={look.width || "full"}
                  onChange={(width) => patch({ width })}
                  options={[
                    { value: "full", label: "Toda a linha" },
                    { value: "fit", label: "Ajustar" },
                  ]}
                />
              ) : null}
              {showRadius ? (
                <ChoiceDropdown
                  label="Arredondamento"
                  hint="Pílula deixa o botão bem oval. Reto é quadrado."
                  value={look.radius || "md"}
                  onChange={(radius) => patch({ radius })}
                  options={[
                    { value: "none", label: "Reto" },
                    { value: "sm", label: "Leve" },
                    { value: "md", label: "Médio" },
                    { value: "lg", label: "Grande" },
                    { value: "pill", label: "Pílula" },
                  ]}
                />
              ) : null}
              {showPadding ? (
                <ChoiceDropdown
                  label="Espaço interno"
                  hint="Distância entre a borda e o texto."
                  value={look.padding || "md"}
                  onChange={(padding) => patch({ padding })}
                  options={[
                    { value: "sm", label: "Compacto" },
                    { value: "md", label: "Médio" },
                    { value: "lg", label: "Folgado" },
                  ]}
                />
              ) : null}
              {showShadow ? (
                <ChoiceDropdown
                  label="Sombra"
                  hint="Suave é um relevo leve. Forte parece quadrinhos. Neon brilha."
                  value={look.shadow || "none"}
                  onChange={(shadow) => patch({ shadow })}
                  options={[
                    { value: "none", label: "Sem" },
                    { value: "soft", label: "Suave" },
                    { value: "hard", label: "Forte" },
                    { value: "glow", label: "Neon" },
                  ]}
                />
              ) : null}
              {showHover ? (
                <ChoiceDropdown
                  label="Ao tocar"
                  hint="O que o botão faz quando alguém passa o mouse ou clica."
                  value={look.hover || "lift"}
                  onChange={(hover) => patch({ hover })}
                  options={[
                    { value: "lift", label: "Sobe" },
                    { value: "scale", label: "Cresce" },
                    { value: "glow", label: "Brilha" },
                    { value: "none", label: "Parado" },
                  ]}
                />
              ) : null}
              {showPulse ? (
                <ChoiceDropdown
                  label="O botão pulsa"
                  hint="Cresce e brilha sozinho para chamar atenção. Use só no WhatsApp ou no botão principal — em vários ao mesmo tempo cansa."
                  value={look.pulse ? "yes" : "no"}
                  onChange={(value) => patch({ pulse: value === "yes" })}
                  options={[
                    { value: "yes", label: "Sim" },
                    { value: "no", label: "Não" },
                  ]}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ColorControl({
  label,
  value,
  fallback,
  placeholder,
  onChange,
}: {
  label: string;
  value?: string;
  fallback: string;
  placeholder: string;
  onChange: (value: string | undefined) => void;
}) {
  const committed = (value || "").toLowerCase();
  const base = pickerHex(value, fallback);
  // Draft local evita loop: input type=color dispara onChange a cada frame
  // enquanto o valor controlado no pai re-renderiza.
  const [draft, setDraft] = useState<string | null>(null);
  const draftRef = useRef<string | null>(null);

  useEffect(() => {
    draftRef.current = null;
    setDraft(null);
  }, [committed]);

  const picker = draft ?? base;
  const hexText = value || "";

  function commitDraft() {
    const next = (draftRef.current || draft || "").toLowerCase();
    draftRef.current = null;
    setDraft(null);
    if (!next || next === committed) return;
    onChange(next);
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={picker}
          onChange={(event) => {
            const next = event.target.value.toLowerCase();
            draftRef.current = next;
            setDraft(next);
          }}
          onPointerUp={commitDraft}
          onBlur={commitDraft}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-white p-1"
          aria-label={label}
        />
        <Input
          value={hexText}
          onChange={(event) => {
            const raw = event.target.value.trim();
            if (!raw) {
              if (committed) onChange(undefined);
              return;
            }
            const next = pickerHex(raw, "");
            if (next === "#000000" && !/^#0+$/i.test(raw)) return;
            if (next === committed) return;
            onChange(next);
          }}
          placeholder={placeholder}
          className="font-mono text-[13px]"
        />
        {value ? (
          <button
            type="button"
            className="shrink-0 text-[12px] font-semibold text-muted hover:text-ink"
            onClick={() => onChange(undefined)}
          >
            Tema
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function mergeLook<T extends object>(
  content: T,
  look: BlockLook,
): T & BlockLook {
  const next = { ...content } as T & BlockLook;
  const keys = [
    "textColor",
    "backgroundColor",
    "borderColor",
    "align",
    "width",
    "pulse",
    "fontSize",
    "titleFontSize",
    "headlineFontSize",
    "bioFontSize",
    "headingFontSize",
    "bodyFontSize",
    "metaFontSize",
    "buttonFontSize",
    "priceFontSize",
    "avatarSize",
    "avatarShape",
    "radius",
    "padding",
    "shadow",
    "hover",
    "surface",
  ] as const;

  for (const key of keys) {
    const value = look[key];
    if (value === undefined || value === false) {
      delete next[key];
    } else {
      Object.assign(next, { [key]: value });
    }
  }
  return next;
}

export type {
  AvatarShape,
  AvatarSize,
  BlockAlign,
  BlockHover,
  BlockPadding,
  BlockRadius,
  BlockShadow,
  BlockSurface,
  ButtonWidth,
  FontSize,
};
