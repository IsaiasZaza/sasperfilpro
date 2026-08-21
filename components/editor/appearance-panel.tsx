"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resolvePaintTheme,
  themeToApi,
  type ApiTheme,
} from "@/lib/theme";
import type { Profile } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export const THEME_PRESETS: {
  id: string;
  label: string;
  theme: ApiTheme;
}[] = [
  {
    id: "creme",
    label: "Creme",
    theme: {
      backgroundColor: "#faf6f2",
      textColor: "#2b211c",
      primaryColor: "#2b211c",
      buttonStyle: "pill",
      font: "sans",
    },
  },
  {
    id: "noite",
    label: "Noite",
    theme: {
      backgroundColor: "#111111",
      textColor: "#f5f5f5",
      primaryColor: "#ffffff",
      buttonStyle: "pill",
      font: "sans",
    },
  },
  {
    id: "salvia",
    label: "Sálvia",
    theme: {
      backgroundColor: "#eef2ea",
      textColor: "#1f2a1c",
      primaryColor: "#3d5a40",
      buttonStyle: "rounded",
      font: "sans",
    },
  },
  {
    id: "areia",
    label: "Areia",
    theme: {
      backgroundColor: "#f4efe6",
      textColor: "#3b2f27",
      primaryColor: "#9a7048",
      buttonStyle: "pill",
      font: "sans",
    },
  },
  {
    id: "azul",
    label: "Marinho",
    theme: {
      backgroundColor: "#f0f4f8",
      textColor: "#0f2744",
      primaryColor: "#1e3a5f",
      buttonStyle: "rounded",
      font: "sans",
    },
  },
  {
    id: "rosa",
    label: "Blush",
    theme: {
      backgroundColor: "#faf2f4",
      textColor: "#3b1f28",
      primaryColor: "#b76e79",
      buttonStyle: "pill",
      font: "sans",
    },
  },
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 cursor-pointer rounded-lg border border-line bg-white p-1"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#faf6f2"
          className="font-mono text-[13px]"
        />
      </div>
    </div>
  );
}

export function AppearancePanel({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (patch: {
    theme?: ApiTheme;
    displayName?: string;
    headline?: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    username?: string;
  }) => void;
}) {
  const painted = resolvePaintTheme(profile.theme);

  function patchTheme(partial: Partial<ApiTheme>) {
    const next = themeToApi({
      backgroundColor: painted.background,
      textColor: painted.text,
      primaryColor: painted.primaryColor,
      buttonStyle: painted.buttonStyle,
      font: painted.font,
      ...partial,
    });
    if (next) onChange({ theme: next });
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-serif text-lg text-ink">Temas prontos</h3>
        <p className="mt-1 text-[13px] text-muted">
          Escolha um estilo e ajuste as cores depois.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const presetPaint = resolvePaintTheme(preset.theme);
            const active =
              painted.background === presetPaint.background &&
              painted.primaryColor === presetPaint.primaryColor;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ theme: { ...preset.theme } })}
                className={cn(
                  "rounded-xl border p-2.5 text-left transition",
                  active
                    ? "border-ink bg-white shadow-sm"
                    : "border-line bg-card hover:border-ink/15",
                )}
              >
                <span
                  className="mb-2 flex h-10 overflow-hidden rounded-lg border border-black/5"
                  style={{ background: presetPaint.background }}
                >
                  <span
                    className="m-auto h-4 w-16 rounded-full"
                    style={{ background: presetPaint.primaryColor }}
                  />
                </span>
                <span className="text-[12px] font-semibold text-ink">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-serif text-lg text-ink">Cores da página</h3>
        <ColorField
          label="Fundo da tela"
          value={painted.background}
          onChange={(backgroundColor) => patchTheme({ backgroundColor })}
        />
        <ColorField
          label="Cor de destaque (botões)"
          value={painted.primaryColor}
          onChange={(primaryColor) => patchTheme({ primaryColor })}
        />
        <ColorField
          label="Texto principal"
          value={painted.text}
          onChange={(textColor) => patchTheme({ textColor })}
        />
      </section>

      <section>
        <h3 className="font-serif text-lg text-ink">Estilo dos botões</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              ["pill", "Pílula"],
              ["rounded", "Arredondado"],
              ["square", "Reto"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => patchTheme({ buttonStyle: value })}
              className={cn(
                "border px-2 py-3 text-[12px] font-semibold",
                painted.buttonStyle === value
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink",
                value === "pill" && "rounded-full",
                value === "rounded" && "rounded-xl",
                value === "square" && "rounded-md",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-serif text-lg text-ink">Fonte</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              ["sans", "Sans"],
              ["serif", "Serif"],
              ["mono", "Mono"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => patchTheme({ font: value })}
              className={cn(
                "rounded-xl border px-2 py-3 text-[12px] font-semibold",
                painted.font === value
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink",
                value === "serif" && "font-serif",
                value === "mono" && "font-mono",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {profile.canChangeUsername !== false ? (
        <section className="space-y-4 border-t border-line pt-6">
          <h3 className="font-serif text-lg text-ink">Endereço da página</h3>
          <div>
            <Label>Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted">/u/</span>
              <Input
                value={profile.username || ""}
                onChange={(event) =>
                  onChange({ username: event.target.value.toLowerCase() })
                }
              />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
