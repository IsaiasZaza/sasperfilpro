"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_THEME,
  type Profile,
  type ProfileTheme,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export const THEME_PRESETS: {
  id: string;
  label: string;
  theme: ProfileTheme;
}[] = [
  {
    id: "creme",
    label: "Creme",
    theme: {
      ...DEFAULT_THEME,
      background: "#faf6f2",
      text: "#2b211c",
      muted: "#8a6f66",
      accent: "#2b211c",
      primaryColor: "#2b211c",
      card: "#ffffff",
      line: "#eadfd8",
      buttonStyle: "pill",
    },
  },
  {
    id: "noite",
    label: "Noite",
    theme: {
      background: "#111111",
      text: "#f5f5f5",
      muted: "#a1a1aa",
      accent: "#ffffff",
      primaryColor: "#ffffff",
      card: "#1c1c1c",
      line: "#2e2e2e",
      buttonStyle: "pill",
      font: "sans",
    },
  },
  {
    id: "salvia",
    label: "Sálvia",
    theme: {
      background: "#eef2ea",
      text: "#1f2a1c",
      muted: "#6b7a66",
      accent: "#3d5a40",
      primaryColor: "#3d5a40",
      card: "#ffffff",
      line: "#d5ddd0",
      buttonStyle: "rounded",
      font: "sans",
    },
  },
  {
    id: "areia",
    label: "Areia",
    theme: {
      background: "#f4efe6",
      text: "#3b2f27",
      muted: "#8c7b6b",
      accent: "#9a7048",
      primaryColor: "#9a7048",
      card: "#fffcf8",
      line: "#e4d9c8",
      buttonStyle: "pill",
      font: "sans",
    },
  },
  {
    id: "azul",
    label: "Marinho",
    theme: {
      background: "#f0f4f8",
      text: "#0f2744",
      muted: "#6b7280",
      accent: "#1e3a5f",
      primaryColor: "#1e3a5f",
      card: "#ffffff",
      line: "#d7e0ea",
      buttonStyle: "rounded",
      font: "sans",
    },
  },
  {
    id: "rosa",
    label: "Blush",
    theme: {
      background: "#faf2f4",
      text: "#3b1f28",
      muted: "#9a6f7a",
      accent: "#b76e79",
      primaryColor: "#b76e79",
      card: "#ffffff",
      line: "#eddce1",
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
    theme?: ProfileTheme;
    displayName?: string;
    headline?: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    username?: string;
  }) => void;
}) {
  const theme: ProfileTheme = {
    ...DEFAULT_THEME,
    ...(profile.theme || {}),
  };

  function patchTheme(partial: Partial<ProfileTheme>) {
    onChange({
      theme: {
        ...theme,
        ...partial,
        primaryColor: partial.accent ?? partial.primaryColor ?? theme.accent,
      },
    });
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
            const active =
              (theme.background || "") === (preset.theme.background || "") &&
              (theme.accent || "") === (preset.theme.accent || "");
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ theme: { ...preset.theme } })}
                className={cn(
                  "rounded-xl border p-2.5 text-left transition",
                  active
                    ? "border-ink bg-white shadow-sm"
                    : "border-line bg-[#fffcf8] hover:border-bronze/40",
                )}
              >
                <span
                  className="mb-2 flex h-10 overflow-hidden rounded-lg border border-black/5"
                  style={{ background: preset.theme.background }}
                >
                  <span
                    className="m-auto h-4 w-16 rounded-full"
                    style={{ background: preset.theme.accent }}
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
          value={(theme.background as string) || "#faf6f2"}
          onChange={(background) => patchTheme({ background })}
        />
        <ColorField
          label="Cor de destaque (botões)"
          value={(theme.accent as string) || "#2b211c"}
          onChange={(accent) => patchTheme({ accent, primaryColor: accent })}
        />
        <ColorField
          label="Texto principal"
          value={(theme.text as string) || "#2b211c"}
          onChange={(text) => patchTheme({ text })}
        />
        <ColorField
          label="Texto secundário"
          value={(theme.muted as string) || "#8a6f66"}
          onChange={(muted) => patchTheme({ muted })}
        />
        <ColorField
          label="Cards / blocos"
          value={(theme.card as string) || "#ffffff"}
          onChange={(card) => patchTheme({ card })}
        />
        <ColorField
          label="Bordas"
          value={(theme.line as string) || "#eadfd8"}
          onChange={(line) => patchTheme({ line })}
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
                theme.buttonStyle === value
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

      <section className="space-y-4 border-t border-line pt-6">
        <h3 className="font-serif text-lg text-ink">Dados da página</h3>
        <p className="text-[13px] text-muted">
          Esses campos aparecem na página pública e no cabeçalho.
        </p>
        {profile.canChangeUsername !== false ? (
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
        ) : null}
        <div>
          <Label>Nome exibido</Label>
          <Input
            value={profile.displayName || ""}
            onChange={(event) => onChange({ displayName: event.target.value })}
          />
        </div>
        <div>
          <Label>Headline</Label>
          <Input
            value={profile.headline || ""}
            onChange={(event) => onChange({ headline: event.target.value })}
          />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea
            value={profile.bio || ""}
            onChange={(event) => onChange({ bio: event.target.value })}
            placeholder="Uma frase sobre o seu trabalho"
          />
        </div>
        <div>
          <Label>Localização</Label>
          <Input
            value={profile.location || ""}
            onChange={(event) => onChange({ location: event.target.value })}
            placeholder="Brasília - DF"
          />
        </div>
        <div>
          <Label>URL do avatar</Label>
          <Input
            value={profile.avatarUrl || ""}
            onChange={(event) => onChange({ avatarUrl: event.target.value })}
            placeholder="https://..."
          />
          <p className="mt-1.5 text-[12px] text-muted-soft">
            Cole o link de uma imagem. Upload nativo pode vir depois.
          </p>
        </div>
      </section>
    </div>
  );
}
