"use client";

import { useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pickerHex } from "@/lib/block-look";
import type {
  AvatarShape,
  AvatarSize,
  BlockAlign,
  BlockLook,
  BlockPadding,
  BlockRadius,
  BlockShadow,
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
}) {
  const [moreOpen, setMoreOpen] = useState(false);

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
    showPulse;

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
          <ChoiceRow
            label="Tamanho da foto"
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
          <ChoiceRow
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
            className="inline-flex h-11 w-full items-center justify-between rounded-xl border border-line bg-white px-3 text-[13px] font-semibold text-ink"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
          >
            Mais opções
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted transition",
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
                <ChoiceRow
                  label="Tamanho da letra"
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
                <ChoiceRow
                  label={showAvatar ? "Posição (foto e textos)" : "Posição"}
                  value={look.align || "center"}
                  onChange={(align) => patch({ align })}
                  options={[
                    { value: "left", label: "Esquerda", icon: AlignLeft },
                    { value: "center", label: "Centro", icon: AlignCenter },
                    { value: "right", label: "Direita", icon: AlignRight },
                  ]}
                />
              ) : null}
              {showWidth ? (
                <ChoiceRow
                  label="Largura"
                  value={look.width || "full"}
                  onChange={(width) => patch({ width })}
                  options={[
                    { value: "full", label: "Toda a linha" },
                    { value: "fit", label: "Encaixar" },
                  ]}
                />
              ) : null}
              {showRadius ? (
                <ChoiceRow
                  label="Cantos"
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
                <ChoiceRow
                  label="Espaço interno"
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
                <ChoiceRow
                  label="Sombra"
                  value={look.shadow || "none"}
                  onChange={(shadow) => patch({ shadow })}
                  options={[
                    { value: "none", label: "Sem" },
                    { value: "soft", label: "Suave" },
                  ]}
                />
              ) : null}
              {showPulse ? (
                <ChoiceRow
                  label="O botão pulsa"
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

function ChoiceRow<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: typeof AlignLeft }[];
}) {
  const cols =
    options.length >= 6
      ? "grid-cols-3"
      : options.length === 5
        ? "grid-cols-3 sm:grid-cols-5"
        : options.length === 4
          ? "grid-cols-4"
          : options.length === 3
            ? "grid-cols-3"
            : "grid-cols-2";

  return (
    <div>
      <Label>{label}</Label>
      <div className={cn("grid gap-1.5", cols)}>
        {options.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (option.value === value) return;
                onChange(option.value);
              }}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border px-1.5 text-[11px] font-semibold transition sm:text-[12px]",
                selected
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-bronze/40",
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
              {option.label}
            </button>
          );
        })}
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
  BlockPadding,
  BlockRadius,
  BlockShadow,
  ButtonWidth,
  FontSize,
};
