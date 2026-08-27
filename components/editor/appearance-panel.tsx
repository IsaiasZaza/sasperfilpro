"use client";

import { ThemeAtmosphere } from "@/components/profile/theme-atmosphere";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileApi } from "@/lib/api-client";
import {
  THEME_PRESETS,
  resolvePaintTheme,
  themeToApi,
  type ApiTheme,
  type AtmosphereId,
} from "@/lib/theme";
import type { Profile } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

const ATMOSPHERE_OPTIONS: {
  id: AtmosphereId;
  label: string;
  hint: string;
}[] = [
  { id: "none", label: "Limpo", hint: "Sem efeito" },
  { id: "claw", label: "Claw", hint: "Neon monstro" },
  { id: "comic", label: "Hero", hint: "Comic punch" },
  { id: "arc", label: "Arc", hint: "Brilho reator" },
  { id: "symbiote", label: "Symbiote", hint: "Roxo vivo" },
  { id: "storm", label: "Storm", hint: "Choque" },
  { id: "inferno", label: "Inferno", hint: "Fogo" },
  { id: "cosmic", label: "Cosmic", hint: "Galáxia" },
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
  themeLocked = false,
  onUnlockTheme,
}: {
  profile: Profile;
  themeLocked?: boolean;
  onUnlockTheme?: () => void;
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
    if (themeLocked) {
      onUnlockTheme?.();
      return;
    }
    const next = themeToApi({
      backgroundColor: painted.background,
      textColor: painted.text,
      primaryColor: painted.primaryColor,
      buttonStyle: painted.buttonStyle,
      font: painted.font,
      atmosphere: painted.atmosphere,
      backgroundImage: painted.backgroundImage || undefined,
      overlay: painted.overlay,
      ...partial,
    });
    if (next) onChange({ theme: next });
  }

  return (
    <div className="space-y-8">
      {themeLocked ? (
        <div className="rounded-2xl border border-line bg-background px-4 py-3.5">
          <p className="text-[14px] font-semibold text-ink">Tema do Free</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Cores, temas e modelos visuais ficam no Pro e no Premium. O
            endereço da página você continua editando.
          </p>
          <button
            type="button"
            className="mt-3 text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
            onClick={() => onUnlockTheme?.()}
          >
            Ver planos
          </button>
        </div>
      ) : null}
      {themeLocked ? null : (
      <>
      <section>
        <h3 className="font-serif text-lg text-ink">Temas prontos</h3>
        <p className="mt-1 text-[13px] text-muted">
          Do clássico ao estilo monstro e comic — com fundos vivos.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const presetPaint = resolvePaintTheme(preset.theme);
            const active =
              painted.background === presetPaint.background &&
              painted.primaryColor === presetPaint.primaryColor &&
              painted.atmosphere === presetPaint.atmosphere;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  const next = themeToApi(preset.theme);
                  if (next) patchTheme(next);
                }}
                className={cn(
                  "rounded-xl border p-2.5 text-left transition",
                  active
                    ? "border-ink bg-white shadow-sm"
                    : "border-line bg-card hover:border-ink/15",
                )}
              >
                <span
                  className="theme-preset-swatch relative mb-2 flex h-12 overflow-hidden rounded-lg border border-black/5"
                  style={{ background: presetPaint.wash }}
                >
                  <ThemeAtmosphere
                    atmosphere={presetPaint.atmosphere}
                    accent={presetPaint.accent}
                  />
                  <span
                    className="relative z-[1] m-auto h-4 w-16 rounded-full shadow-sm"
                    style={{
                      background: presetPaint.primaryColor,
                      boxShadow:
                        presetPaint.atmosphere !== "none"
                          ? `0 0 14px ${presetPaint.primaryColor}99`
                          : undefined,
                    }}
                  />
                </span>
                <span className="block text-[12px] font-semibold text-ink">
                  {preset.label}
                </span>
                <span className="mt-0.5 block text-[10px] text-muted">
                  {preset.tagline}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-serif text-lg text-ink">Atmosfera</h3>
        <p className="mt-1 text-[13px] text-muted">
          Efeito animado por cima das cores.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ATMOSPHERE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => patchTheme({ atmosphere: option.id })}
              className={cn(
                "rounded-xl border px-2 py-2.5 text-left transition",
                painted.atmosphere === option.id
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-ink/15",
              )}
            >
              <span className="block text-[12px] font-semibold">
                {option.label}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[10px]",
                  painted.atmosphere === option.id
                    ? "text-white/70"
                    : "text-muted",
                )}
              >
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-serif text-lg text-ink">Foto de fundo</h3>
        <p className="text-[13px] leading-relaxed text-muted">
          Uma imagem atrás dos blocos. Envia agora; só entra no ar quando você
          clicar em Atualizar.
        </p>
        <ImageUploadField
          value={painted.backgroundImage}
          variant="cover"
          buttonLabel={
            painted.backgroundImage ? "Trocar foto de fundo" : "Enviar foto"
          }
          emptyLabel="Fundo"
          onUploaded={(bannerUrl) =>
            patchTheme({
              backgroundImage: bannerUrl,
              overlay: painted.overlay || 40,
            })
          }
          upload={async (file) => {
            const data = await profileApi.uploadBanner(file);
            return data.bannerUrl;
          }}
          onLocked={onUnlockTheme}
        />
        {painted.backgroundImage ? (
          <>
            <div>
              <Label>Escurecer a foto</Label>
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {[0, 20, 40, 60].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => patchTheme({ overlay: value })}
                    className={cn(
                      "min-h-11 rounded-xl border text-[12px] font-semibold",
                      painted.overlay === value
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white text-ink hover:border-ink/15",
                    )}
                  >
                    {value === 0 ? "Não" : `${value}%`}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="text-[13px] font-semibold text-muted hover:text-ink"
              onClick={() =>
                patchTheme({ backgroundImage: "", overlay: 0 })
              }
            >
              Remover foto de fundo
            </button>
          </>
        ) : null}
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
              ["sans", "Simples"],
              ["serif", "Clássica"],
              ["mono", "Fixa"],
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
      </>
      )}

      {profile.canChangeUsername !== false ? (
        <section className="space-y-4 border-t border-line pt-6">
          <h3 className="font-serif text-lg text-ink">Endereço da página</h3>
          <div>
            <Label>Nome de usuário</Label>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted">/u/</span>
              <Input
                value={profile.username || ""}
                onChange={(event) =>
                  onChange({ username: event.target.value.toLowerCase() })
                }
              />
            </div>
            <p className="mt-1.5 text-[12px] text-muted">
              É o endereço da sua página. Letras minúsculas, números e hífen.
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
