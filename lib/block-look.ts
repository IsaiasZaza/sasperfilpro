import type { CSSProperties } from "react";
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

const FONT_SIZES: FontSize[] = ["sm", "md", "lg", "xl"];
const ROLE_FONT_KEYS = [
  "fontSize",
  "titleFontSize",
  "headlineFontSize",
  "bioFontSize",
  "headingFontSize",
  "bodyFontSize",
  "metaFontSize",
  "buttonFontSize",
  "priceFontSize",
] as const;

export type TextRole =
  | "title"
  | "headline"
  | "bio"
  | "heading"
  | "body"
  | "meta"
  | "button"
  | "price";

function asFontSize(value: unknown): FontSize | undefined {
  return FONT_SIZES.includes(value as FontSize)
    ? (value as FontSize)
    : undefined;
}
const AVATAR_SIZES: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const AVATAR_SHAPES: AvatarShape[] = ["circle", "rounded", "square"];
const BLOCK_RADII: BlockRadius[] = ["none", "sm", "md", "lg", "pill"];
const BLOCK_PADDINGS: BlockPadding[] = ["sm", "md", "lg"];
const BLOCK_SHADOWS: BlockShadow[] = ["none", "soft", "hard", "glow"];
const BLOCK_HOVERS: BlockHover[] = ["none", "lift", "scale", "glow"];
const BLOCK_SURFACES: BlockSurface[] = [
  "clean",
  "card",
  "glass",
  "neon",
  "comic",
];

export const SURFACE_PRESETS: Record<BlockSurface, Partial<BlockLook>> = {
  clean: { surface: "clean", shadow: "none", radius: "md" },
  card: { surface: "card", shadow: "soft", radius: "lg" },
  glass: { surface: "glass", shadow: "soft", radius: "lg" },
  neon: { surface: "neon", shadow: "glow", radius: "md" },
  comic: { surface: "comic", shadow: "hard", radius: "none" },
};

function asLookColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const next = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(next)) return next;
  if (/^#[0-9a-f]{3}$/.test(next)) {
    return `#${next[1]}${next[1]}${next[2]}${next[2]}${next[3]}${next[3]}`;
  }
  return undefined;
}

export function pickerHex(value: string | undefined, fallback: string): string {
  return asLookColor(value) || asLookColor(fallback) || "#000000";
}

export function lookFrom(content: object): BlockLook {
  const c = content as BlockLook;
  const look: BlockLook = {};

  const textColor = asLookColor(c.textColor);
  if (textColor) look.textColor = textColor;
  const backgroundColor = asLookColor(c.backgroundColor);
  if (backgroundColor) look.backgroundColor = backgroundColor;
  const borderColor = asLookColor(c.borderColor);
  if (borderColor) look.borderColor = borderColor;

  if (c.align === "left" || c.align === "right" || c.align === "center") {
    look.align = c.align;
  }
  if (c.width === "fit" || c.width === "full") look.width = c.width;
  if (c.pulse) look.pulse = true;
  for (const key of ROLE_FONT_KEYS) {
    const value = asFontSize(c[key]);
    if (value) look[key] = value;
  }
  if (AVATAR_SIZES.includes(c.avatarSize as AvatarSize)) {
    look.avatarSize = c.avatarSize as AvatarSize;
  }
  if (AVATAR_SHAPES.includes(c.avatarShape as AvatarShape)) {
    look.avatarShape = c.avatarShape as AvatarShape;
  }
  if (BLOCK_RADII.includes(c.radius as BlockRadius)) {
    look.radius = c.radius as BlockRadius;
  }
  if (BLOCK_PADDINGS.includes(c.padding as BlockPadding)) {
    look.padding = c.padding as BlockPadding;
  }
  if (BLOCK_SHADOWS.includes(c.shadow as BlockShadow)) {
    look.shadow = c.shadow as BlockShadow;
  }
  if (BLOCK_HOVERS.includes(c.hover as BlockHover)) {
    look.hover = c.hover as BlockHover;
  }
  if (BLOCK_SURFACES.includes(c.surface as BlockSurface)) {
    look.surface = c.surface as BlockSurface;
  }

  return look;
}

export function alignStack(align?: BlockAlign) {
  if (align === "left") return "items-start text-left";
  if (align === "right") return "items-end text-right";
  return "items-center text-center";
}

export function justifyAlign(align?: BlockAlign) {
  if (align === "left") return "justify-start";
  if (align === "right") return "justify-end";
  return "justify-center";
}

export function pulseClass(pulse?: boolean) {
  return pulse ? "block-pulse" : undefined;
}

export function pulseStyle(color: string): CSSProperties {
  return { ["--pulse-color" as string]: color };
}

export function lookFontSize(look: BlockLook, role: TextRole): FontSize {
  const specific = {
    title: look.titleFontSize,
    headline: look.headlineFontSize,
    bio: look.bioFontSize,
    heading: look.headingFontSize,
    body: look.bodyFontSize,
    meta: look.metaFontSize,
    button: look.buttonFontSize,
    price: look.priceFontSize,
  }[role];
  return specific || look.fontSize || "md";
}

export function lookFontPx(look: BlockLook, role: TextRole): string {
  const scale = fontScale(lookFontSize(look, role));
  if (role === "title") return scale.title;
  if (role === "headline") return scale.headline;
  if (role === "heading") return scale.label;
  if (role === "button") return scale.button;
  if (role === "meta") return scale.meta;
  return scale.body;
}

export function buttonMetrics(size?: FontSize) {
  const key = size || "md";
  if (key === "sm") {
    return { minHeight: 34, padding: "6px 12px", gap: 6, icon: 14 };
  }
  if (key === "lg") {
    return { minHeight: 48, padding: "11px 16px", gap: 8, icon: 18 };
  }
  if (key === "xl") {
    return { minHeight: 56, padding: "13px 18px", gap: 10, icon: 20 };
  }
  return { minHeight: 40, padding: "8px 14px", gap: 7, icon: 16 };
}

export function fontScale(size?: FontSize) {
  const key = size || "md";
  return {
    title:
      key === "sm"
        ? "1.35rem"
        : key === "lg"
          ? "2rem"
          : key === "xl"
            ? "2.25rem"
            : "1.75rem",
    headline:
      key === "sm"
        ? "13px"
        : key === "lg"
          ? "17px"
          : key === "xl"
            ? "18px"
            : "15px",
    body:
      key === "sm"
        ? "12px"
        : key === "lg"
          ? "15px"
          : key === "xl"
            ? "16px"
            : "14px",
    meta:
      key === "sm"
        ? "11px"
        : key === "lg"
          ? "13px"
          : key === "xl"
            ? "14px"
            : "12px",
    button:
      key === "sm"
        ? "13px"
        : key === "lg"
          ? "16px"
          : key === "xl"
            ? "17px"
            : "15px",
    label:
      key === "sm"
        ? "10px"
        : key === "lg"
          ? "12px"
          : key === "xl"
            ? "13px"
            : "11px",
  };
}

export function avatarPixels(size?: AvatarSize) {
  if (size === "xs") return 48;
  if (size === "sm") return 64;
  if (size === "lg") return 112;
  if (size === "xl") return 144;
  if (size === "2xl") return 180;
  return 88;
}

export function avatarRadius(shape?: AvatarShape) {
  if (shape === "square") return "12px";
  if (shape === "rounded") return "22%";
  return "9999px";
}

export function lookRadius(radius?: BlockRadius, fallback?: string) {
  if (radius === "none") return "0px";
  if (radius === "sm") return "8px";
  if (radius === "md") return "16px";
  if (radius === "lg") return "28px";
  if (radius === "pill") return "9999px";
  return fallback;
}

/** Capas, fotos e mapas: pílula vira recorte oval e destrói a mídia. */
export function mediaRadius(radius?: BlockRadius, fallback = "1.25rem") {
  if (radius === "pill") return fallback;
  return lookRadius(radius, fallback) || fallback;
}

/** Capa do HERO: cantos de baixo só — o topo encosta na tela. */
export function coverRadius(radius?: BlockRadius) {
  if (radius === "none") return "0";
  if (radius === "sm") return "0 0 10px 10px";
  if (radius === "md") return "0 0 16px 16px";
  return "0 0 1.35rem 1.35rem";
}

export function lookPadding(padding?: BlockPadding) {
  if (padding === "sm") return "8px 12px";
  if (padding === "md") return "14px 16px";
  if (padding === "lg") return "22px 20px";
  return undefined;
}

export function lookShadow(
  shadow?: BlockShadow,
  fallback?: string,
  color?: string,
) {
  const ink = color || "#14110e";
  if (shadow === "none") return "none";
  if (shadow === "soft") return "0 10px 28px -16px rgba(20,17,14,0.45)";
  if (shadow === "hard") return `4px 4px 0 ${ink}`;
  if (shadow === "glow") return `0 0 22px ${ink}73`;
  return fallback;
}

export function hoverClass(look: BlockLook) {
  if (look.pulse) return undefined;
  const hover = look.hover || "lift";
  if (hover === "none") return undefined;
  if (hover === "scale") return "pp-tap pp-tap-scale";
  if (hover === "glow") return "pp-tap pp-tap-glow";
  return "pp-tap";
}

export function surfaceClass(look: BlockLook) {
  if (look.surface === "glass") return "pp-glass";
  if (look.surface === "neon") return "pp-neon";
  if (look.surface === "comic") return "pp-comic";
  return undefined;
}

/** Look fica no `content`. Title só texto humano (legado `__pp_look__:` ainda é lido). */
const LOOK_TITLE_PREFIX = "__pp_look__:";
const TITLE_MAX = 80;

export function packLookTitle(
  title: string | null | undefined,
  _look?: BlockLook,
): string | null {
  if (typeof title !== "string") return null;
  const base = title
    .split("\n")
    .filter((line) => !line.startsWith(LOOK_TITLE_PREFIX))
    .join("\n")
    .trim();
  if (!base) return null;
  return base.slice(0, TITLE_MAX);
}

export function unpackLookTitle(title: string | null | undefined): {
  title: string | null;
  look: BlockLook;
} {
  if (!title || typeof title !== "string") {
    return { title: title ?? null, look: {} };
  }
  const lines = title.split("\n");
  const lookLine = lines.find((line) => line.startsWith(LOOK_TITLE_PREFIX));
  const base = lines
    .filter((line) => !line.startsWith(LOOK_TITLE_PREFIX))
    .join("\n")
    .trim();

  if (!lookLine) {
    return { title: base.length > 0 ? base : null, look: {} };
  }

  try {
    const raw = JSON.parse(
      lookLine.slice(LOOK_TITLE_PREFIX.length),
    ) as unknown;
    if (!raw || typeof raw !== "object") {
      return { title: base.length > 0 ? base : null, look: {} };
    }
    return {
      title: base.length > 0 ? base : null,
      look: lookFrom(raw),
    };
  } catch {
    return { title: base.length > 0 ? base : null, look: {} };
  }
}

export function hydrateBlockLook<
  T extends { title?: string | null; content: object },
>(block: T): T {
  const { title, look } = unpackLookTitle(block.title);
  const content = { ...look, ...(block.content as object) };
  return { ...block, title, content };
}

export function surfaceStyle(
  look: BlockLook,
  fallbacks: {
    background?: string;
    color?: string;
    radius?: string;
    border?: string;
    padding?: string;
    shadow?: string;
    shadowColor?: string;
  } = {},
): CSSProperties {
  const style: CSSProperties = {};
  const surface = look.surface;
  const accent = fallbacks.shadowColor || fallbacks.color || "#14110e";

  let background = look.backgroundColor || fallbacks.background;
  if (!look.backgroundColor && surface === "glass") {
    background = fallbacks.background
      ? `color-mix(in srgb, ${fallbacks.background} 62%, transparent)`
      : "rgba(255,255,255,0.48)";
  }
  if (background) style.background = background;

  const color = look.textColor || fallbacks.color;
  if (color) style.color = color;

  const radiusFallback =
    surface === "comic" ? "6px" : fallbacks.radius;
  const radius = lookRadius(look.radius, radiusFallback);
  if (radius) style.borderRadius = radius;

  if (look.borderColor) {
    style.border = `${surface === "comic" ? 2 : 1}px solid ${look.borderColor}`;
  } else if (surface === "neon") {
    style.border = `1px solid ${accent}`;
  } else if (surface === "comic") {
    style.border = `2.5px solid ${accent}`;
  } else if (fallbacks.border) {
    style.border = fallbacks.border;
  }

  const padding = lookPadding(look.padding) || fallbacks.padding;
  if (padding) style.padding = padding;

  const defaultShadow =
    surface === "neon"
      ? `0 0 22px ${accent}73`
      : surface === "comic"
        ? `4px 4px 0 ${accent}`
        : surface === "card" || surface === "glass"
          ? "0 10px 28px -16px rgba(20,17,14,0.45)"
          : fallbacks.shadow;
  const shadow = lookShadow(look.shadow, defaultShadow, accent);
  if (shadow) style.boxShadow = shadow;
  return style;
}

/** Evita misturar `padding` com `paddingTop` no mesmo style. */
export function withoutPadding(style: CSSProperties): CSSProperties {
  const next = { ...style };
  delete next.padding;
  delete next.paddingTop;
  delete next.paddingRight;
  delete next.paddingBottom;
  delete next.paddingLeft;
  delete next.paddingBlock;
  delete next.paddingInline;
  delete next.paddingBlockStart;
  delete next.paddingBlockEnd;
  delete next.paddingInlineStart;
  delete next.paddingInlineEnd;
  return next;
}

export function buttonShellClass(look: BlockLook, extra?: string) {
  const full = look.width !== "fit";
  return cn(
    "inline-flex items-center font-semibold",
    full ? "w-full" : "w-auto px-4",
    justifyAlign(look.align),
    pulseClass(look.pulse),
    extra,
  );
}

export function socialIconPixels(size?: FontSize) {
  if (size === "sm") return 40;
  if (size === "lg") return 56;
  if (size === "xl") return 64;
  return 48;
}
