import type { ProfileTheme } from "@/lib/types/profile";

export type AtmosphereId =
  | "none"
  | "claw"
  | "comic"
  | "arc"
  | "symbiote"
  | "storm"
  | "inferno"
  | "cosmic";

/** Contrato do PUT/GET theme — alinhado ao backend. */
export type ApiTheme = {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonStyle?: "pill" | "rounded" | "square";
  font?: "sans" | "serif" | "mono";
  /** Efeito de fundo animado. Backend deve aceitar e devolver este campo. */
  atmosphere?: AtmosphereId;
  /** Foto de fundo da página (URL http(s) ou "" para limpar). */
  backgroundImage?: string | null;
  /** Escurece a foto de fundo, 0–80. */
  overlay?: number;
};

export type PaintTheme = {
  background: string;
  text: string;
  muted: string;
  accent: string;
  card: string;
  line: string;
  primaryColor: string;
  buttonStyle: "pill" | "rounded" | "square";
  font: "sans" | "serif" | "mono";
  buttonRadius: string;
  atmosphere: AtmosphereId;
  /** Gradiente de fundo (sobre a cor sólida). */
  wash: string;
  backgroundImage: string | null;
  overlay: number;
};

export type ThemePreset = {
  id: string;
  label: string;
  tagline: string;
  theme: ApiTheme;
};

const FALLBACK = {
  background: "#faf6f2",
  text: "#2b211c",
  accent: "#2b211c",
};

export const ATMOSPHERE_IDS: AtmosphereId[] = [
  "none",
  "claw",
  "comic",
  "arc",
  "symbiote",
  "storm",
  "inferno",
  "cosmic",
];

const ATMOSPHERES = new Set<AtmosphereId>(ATMOSPHERE_IDS);

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "creme",
    label: "Creme",
    tagline: "Clássico e limpo",
    theme: {
      backgroundColor: "#faf6f2",
      textColor: "#2b211c",
      primaryColor: "#2b211c",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "none",
    },
  },
  {
    id: "noite",
    label: "Noite",
    tagline: "Minimal escuro",
    theme: {
      backgroundColor: "#111111",
      textColor: "#f5f5f5",
      primaryColor: "#ffffff",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "none",
    },
  },
  {
    id: "claw",
    label: "Claw",
    tagline: "Neon monstro",
    theme: {
      backgroundColor: "#050805",
      textColor: "#e8ffe8",
      primaryColor: "#39ff14",
      buttonStyle: "square",
      font: "mono",
      atmosphere: "claw",
    },
  },
  {
    id: "hero",
    label: "Hero",
    tagline: "Comic punch",
    theme: {
      backgroundColor: "#0a0e1a",
      textColor: "#fff5f0",
      primaryColor: "#e62429",
      buttonStyle: "square",
      font: "sans",
      atmosphere: "comic",
    },
  },
  {
    id: "arc",
    label: "Arc",
    tagline: "Ouro reator",
    theme: {
      backgroundColor: "#0a0c12",
      textColor: "#fff6e8",
      primaryColor: "#fcb414",
      buttonStyle: "rounded",
      font: "sans",
      atmosphere: "arc",
    },
  },
  {
    id: "symbiote",
    label: "Symbiote",
    tagline: "Roxo vivo",
    theme: {
      backgroundColor: "#0a0610",
      textColor: "#f3e8ff",
      primaryColor: "#b24bff",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "symbiote",
    },
  },
  {
    id: "storm",
    label: "Storm",
    tagline: "Choque elétrico",
    theme: {
      backgroundColor: "#030b14",
      textColor: "#e6f7ff",
      primaryColor: "#00d4ff",
      buttonStyle: "rounded",
      font: "mono",
      atmosphere: "storm",
    },
  },
  {
    id: "inferno",
    label: "Inferno",
    tagline: "Fogo vivo",
    theme: {
      backgroundColor: "#120605",
      textColor: "#fff0e8",
      primaryColor: "#ff4d00",
      buttonStyle: "square",
      font: "sans",
      atmosphere: "inferno",
    },
  },
  {
    id: "cosmic",
    label: "Cosmic",
    tagline: "Galáxia pop",
    theme: {
      backgroundColor: "#080612",
      textColor: "#fce7f3",
      primaryColor: "#ff2d95",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "cosmic",
    },
  },
  {
    id: "salvia",
    label: "Sálvia",
    tagline: "Calmo e natural",
    theme: {
      backgroundColor: "#eef2ea",
      textColor: "#1f2a1c",
      primaryColor: "#3d5a40",
      buttonStyle: "rounded",
      font: "sans",
      atmosphere: "none",
    },
  },
  {
    id: "areia",
    label: "Areia",
    tagline: "Quente e suave",
    theme: {
      backgroundColor: "#f4efe6",
      textColor: "#3b2f27",
      primaryColor: "#9a7048",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "none",
    },
  },
  {
    id: "azul",
    label: "Marinho",
    tagline: "Sóbrio profissional",
    theme: {
      backgroundColor: "#f0f4f8",
      textColor: "#0f2744",
      primaryColor: "#1e3a5f",
      buttonStyle: "rounded",
      font: "sans",
      atmosphere: "none",
    },
  },
];

function asHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const next = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(next) ? next.toLowerCase() : fallback;
}

function asButtonStyle(value: unknown): PaintTheme["buttonStyle"] {
  return value === "rounded" || value === "square" || value === "pill"
    ? value
    : "pill";
}

function asFont(value: unknown): PaintTheme["font"] {
  return value === "serif" || value === "mono" || value === "sans"
    ? value
    : "sans";
}

export function asAtmosphere(value: unknown): AtmosphereId {
  return typeof value === "string" && ATMOSPHERES.has(value as AtmosphereId)
    ? (value as AtmosphereId)
    : "none";
}

function asOverlay(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(80, Math.max(0, Math.round(n)));
}

function asImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const next = value.trim();
  if (!next) return null;
  try {
    const url = new URL(next);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname || !url.hostname.includes(".")) return null;
    return next;
  } catch {
    return null;
  }
}

function luminance(hex: string): number {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function washFor(atmosphere: AtmosphereId, accent: string, background: string): string {
  switch (atmosphere) {
    case "claw":
      return `radial-gradient(ellipse 100% 70% at 12% 0%, ${accent}2e 0%, transparent 55%), radial-gradient(ellipse 80% 55% at 100% 100%, ${accent}1a 0%, transparent 50%), linear-gradient(165deg, ${background} 0%, #071208 55%, ${background} 100%)`;
    case "comic":
      return `radial-gradient(ellipse 70% 55% at 88% 8%, ${accent}36 0%, transparent 48%), radial-gradient(ellipse 65% 50% at 8% 95%, #1d4ed840 0%, transparent 50%), linear-gradient(165deg, ${background}, #0d1322)`;
    case "arc":
      return `radial-gradient(ellipse 95% 50% at 50% -5%, ${accent}48 0%, transparent 42%), radial-gradient(ellipse 90% 40% at 50% 105%, #ea580c22 0%, transparent 50%), linear-gradient(180deg, ${background}, #0c1018)`;
    case "symbiote":
      return `radial-gradient(ellipse 75% 60% at 18% 25%, ${accent}38 0%, transparent 52%), radial-gradient(ellipse 70% 55% at 90% 75%, #5b21b638 0%, transparent 50%), linear-gradient(150deg, ${background}, #10061a)`;
    case "storm":
      return `radial-gradient(ellipse 85% 55% at 75% 15%, ${accent}30 0%, transparent 50%), radial-gradient(ellipse 60% 45% at 10% 85%, #1e40af2e 0%, transparent 48%), linear-gradient(170deg, ${background}, #03101c)`;
    case "inferno":
      return `radial-gradient(ellipse 100% 55% at 50% 115%, ${accent}48 0%, transparent 52%), radial-gradient(ellipse 50% 40% at 15% 10%, #fbbf2420 0%, transparent 45%), linear-gradient(180deg, ${background}, #160704)`;
    case "cosmic":
      return `radial-gradient(ellipse 60% 50% at 22% 18%, #7c3aed36 0%, transparent 48%), radial-gradient(ellipse 55% 45% at 85% 72%, ${accent}32 0%, transparent 48%), radial-gradient(ellipse 70% 50% at 50% 50%, #2563eb18 0%, transparent 60%), linear-gradient(160deg, ${background}, #0e0718)`;
    default:
      return background;
  }
}

export function parseStoredTheme(raw: unknown): ProfileTheme {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === "object"
        ? (parsed as ProfileTheme)
        : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as ProfileTheme;
  return {};
}

export function isThemeEmpty(theme: ProfileTheme | null | undefined): boolean {
  const t = parseStoredTheme(theme);
  return !(
    t.backgroundColor ||
    t.background ||
    t.textColor ||
    t.text ||
    t.primaryColor ||
    t.accent
  );
}

export function resolvePaintTheme(
  theme: ProfileTheme | null | undefined,
): PaintTheme {
  const t = parseStoredTheme(theme);
  const background = asHex(
    t.backgroundColor ?? t.background,
    FALLBACK.background,
  );
  const text = asHex(t.textColor ?? t.text, FALLBACK.text);
  const accent = asHex(t.primaryColor ?? t.accent, FALLBACK.accent);
  const dark = luminance(background) < 140;
  const buttonStyle = asButtonStyle(t.buttonStyle);
  const font = asFont(t.font);
  const atmosphere = asAtmosphere(t.atmosphere);
  const backgroundImage = asImageUrl(t.backgroundImage);
  const overlay = asOverlay(t.overlay);

  return {
    background,
    text,
    accent,
    primaryColor: accent,
    muted: asHex(t.muted, dark ? "#a1a1aa" : "#8a6f66"),
    card: asHex(t.card, dark ? "#1c1c1c" : "#ffffff"),
    line: asHex(t.line, dark ? "#2e2e2e" : "#eadfd8"),
    buttonStyle,
    font,
    buttonRadius:
      buttonStyle === "square"
        ? "0.5rem"
        : buttonStyle === "rounded"
          ? "0.75rem"
          : "9999px",
    atmosphere,
    wash: washFor(atmosphere, accent, background),
    backgroundImage,
    overlay: backgroundImage ? overlay : 0,
  };
}

/**
 * Serializa para o contrato da API (só campos válidos).
 * Sempre inclui `atmosphere` para o round-trip ser estável (evita loop de save).
 */
export function themeToApi(
  theme: ProfileTheme | null | undefined,
): ApiTheme | undefined {
  if (isThemeEmpty(theme)) return undefined;
  const painted = resolvePaintTheme(theme);
  const api: ApiTheme = {
    primaryColor: painted.primaryColor,
    backgroundColor: painted.background,
    textColor: painted.text,
    buttonStyle: painted.buttonStyle,
    font: painted.font,
    atmosphere: painted.atmosphere,
  };
  if (painted.backgroundImage) {
    api.backgroundImage = painted.backgroundImage;
    if (painted.overlay > 0) api.overlay = painted.overlay;
  } else {
    const raw = parseStoredTheme(theme);
    if (raw.backgroundImage === "" || raw.backgroundImage === null) {
      // null no PUT substitui a URL antiga. Omitir / "" o backend ignora e a foto volta.
      api.backgroundImage = null;
      api.overlay = 0;
    }
  }
  return api;
}

export function themeFromApi(raw: unknown): ProfileTheme {
  const t = parseStoredTheme(raw);
  if (isThemeEmpty(t)) return {};
  return themeToApi(t) ?? {};
}

/**
 * Após PUT: se a API devolver o tema, usa-o.
 * Se devolver `{}` mas o local tinha tema, marca `lost` (contrato rejeitou).
 * Se a API ainda não devolver `atmosphere`, preserva o local (compat).
 */
export function mergeThemeResponse(
  incoming: unknown,
  local: ProfileTheme | null | undefined,
): { theme: ProfileTheme; lost: boolean } {
  const fromApi = themeFromApi(incoming);
  const localTheme = themeToApi(local);

  if (!isThemeEmpty(fromApi)) {
    const rawIn = parseStoredTheme(incoming);
    const rawLocal = parseStoredTheme(local);
    const clearedImage =
      rawLocal.backgroundImage === "" || rawLocal.backgroundImage === null;
    const next = { ...fromApi };
    const apiHasAtmosphere = rawIn.atmosphere != null;
    if (!apiHasAtmosphere && localTheme?.atmosphere && localTheme.atmosphere !== "none") {
      next.atmosphere = localTheme.atmosphere;
    }
    if (clearedImage) {
      next.backgroundImage = null;
      next.overlay = 0;
    } else if (rawIn.backgroundImage == null && localTheme?.backgroundImage) {
      next.backgroundImage = localTheme.backgroundImage;
    }
    if (!clearedImage && rawIn.overlay == null && localTheme?.overlay) {
      next.overlay = localTheme.overlay;
    }
    return { theme: next, lost: false };
  }

  if (!localTheme) return { theme: {}, lost: false };
  return { theme: localTheme, lost: true };
}

/** Snapshot canônico para dirty-check do editor (ordem de chaves fixa). */
export function themeSnapshot(theme: ProfileTheme | null | undefined): string {
  const api = themeToApi(theme);
  if (!api) return "{}";
  return JSON.stringify({
    backgroundColor: api.backgroundColor ?? "",
    textColor: api.textColor ?? "",
    primaryColor: api.primaryColor ?? "",
    buttonStyle: api.buttonStyle ?? "pill",
    font: api.font ?? "sans",
    atmosphere: api.atmosphere ?? "none",
    backgroundImage: api.backgroundImage ?? "",
    overlay: api.overlay ?? 0,
  });
}
