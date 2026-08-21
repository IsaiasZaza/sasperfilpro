import type { ProfileTheme } from "@/lib/types/profile";

export type ApiTheme = {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonStyle?: "pill" | "rounded" | "square";
  font?: "sans" | "serif" | "mono";
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
};

const FALLBACK = {
  background: "#faf6f2",
  text: "#2b211c",
  accent: "#2b211c",
};

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

function luminance(hex: string): number {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
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
  };
}

export function themeToApi(
  theme: ProfileTheme | null | undefined,
): ApiTheme | undefined {
  if (isThemeEmpty(theme)) return undefined;
  const painted = resolvePaintTheme(theme);
  return {
    primaryColor: painted.primaryColor,
    backgroundColor: painted.background,
    textColor: painted.text,
    buttonStyle: painted.buttonStyle,
    font: painted.font,
  };
}

export function themeFromApi(raw: unknown): ProfileTheme {
  const t = parseStoredTheme(raw);
  if (isThemeEmpty(t)) return {};
  return themeToApi(t) ?? {};
}

export function mergeThemeResponse(
  incoming: unknown,
  local: ProfileTheme | null | undefined,
): { theme: ProfileTheme; lost: boolean } {
  const fromApi = themeFromApi(incoming);
  if (!isThemeEmpty(fromApi)) return { theme: fromApi, lost: false };
  if (isThemeEmpty(local)) return { theme: {}, lost: false };
  return { theme: themeToApi(local) ?? {}, lost: true };
}
