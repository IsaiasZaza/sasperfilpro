"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  AvatarShape,
  AvatarSize,
  BlockAlign,
  BlockLook,
  ButtonWidth,
  FontSize,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export function BlockLookControls({
  look,
  onChange,
  fallbackTextColor = "#14110e",
  showTextColor = true,
  showAlign = true,
  showWidth = false,
  showPulse = false,
  showFontSize = true,
  showAvatar = false,
}: {
  look: BlockLook;
  onChange: (next: BlockLook) => void;
  fallbackTextColor?: string;
  showTextColor?: boolean;
  showAlign?: boolean;
  showWidth?: boolean;
  showPulse?: boolean;
  showFontSize?: boolean;
  showAvatar?: boolean;
}) {
  const patch = (partial: Partial<BlockLook>) =>
    onChange({ ...look, ...partial });

  return (
    <section className="space-y-3">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
        Aparência deste bloco
      </h3>
      {showTextColor ? (
        <div>
          <Label>Cor do texto</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={look.textColor || fallbackTextColor}
              onChange={(event) => patch({ textColor: event.target.value })}
              className="h-11 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
              aria-label="Cor do texto"
            />
            <Input
              value={look.textColor || ""}
              onChange={(event) =>
                patch({ textColor: event.target.value || undefined })
              }
              placeholder="Tema da página"
              className="font-mono text-[13px]"
            />
            {look.textColor ? (
              <button
                type="button"
                className="shrink-0 text-[12px] font-semibold text-muted hover:text-ink"
                onClick={() => patch({ textColor: undefined })}
              >
                Tema
              </button>
            ) : null}
          </div>
        </div>
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
      {showAvatar ? (
        <>
          <ChoiceRow
            label="Tamanho da foto"
            value={look.avatarSize || "md"}
            onChange={(avatarSize) => patch({ avatarSize })}
            options={[
              { value: "sm", label: "P" },
              { value: "md", label: "M" },
              { value: "lg", label: "G" },
              { value: "xl", label: "GG" },
            ]}
          />
          <ChoiceRow
            label="Formato da foto"
            value={look.avatarShape || "circle"}
            onChange={(avatarShape) => patch({ avatarShape })}
            options={[
              { value: "circle", label: "Redonda" },
              { value: "rounded", label: "Arredondada" },
              { value: "square", label: "Quadrada" },
            ]}
          />
        </>
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
    </section>
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
  return (
    <div>
      <Label>{label}</Label>
      <div
        className={cn(
          "grid gap-1.5",
          options.length === 4
            ? "grid-cols-4"
            : options.length === 3
              ? "grid-cols-3"
              : "grid-cols-2",
        )}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-[12px] font-semibold transition",
                selected
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-bronze/40",
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
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
  return {
    ...content,
    textColor: look.textColor,
    align: look.align,
    width: look.width,
    pulse: look.pulse,
    fontSize: look.fontSize,
    avatarSize: look.avatarSize,
    avatarShape: look.avatarShape,
  };
}

export type {
  AvatarShape,
  AvatarSize,
  BlockAlign,
  ButtonWidth,
  FontSize,
};
