import type { CSSProperties } from "react";
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

const FONT_SIZES: FontSize[] = ["sm", "md", "lg", "xl"];
const AVATAR_SIZES: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const AVATAR_SHAPES: AvatarShape[] = ["circle", "rounded", "square"];
const BLOCK_RADII: BlockRadius[] = ["none", "sm", "md", "lg", "pill"];
const BLOCK_PADDINGS: BlockPadding[] = ["sm", "md", "lg"];
const BLOCK_SHADOWS: BlockShadow[] = ["none", "soft"];

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
  if (FONT_SIZES.includes(c.fontSize as FontSize)) {
    look.fontSize = c.fontSize as FontSize;
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

export function lookPadding(padding?: BlockPadding) {
  if (padding === "sm") return "8px 12px";
  if (padding === "md") return "14px 16px";
  if (padding === "lg") return "22px 20px";
  return undefined;
}

export function lookShadow(shadow?: BlockShadow, fallback?: string) {
  if (shadow === "none") return "none";
  if (shadow === "soft") return "0 10px 28px -16px rgba(20,17,14,0.45)";
  return fallback;
}

/** A API atual descarta campos de look no `content`; guardamos no `title`. */
const LOOK_TITLE_PREFIX = "__pp_look__:";

export function packLookTitle(
  title: string | null | undefined,
  look: BlockLook,
): string | null {
  const base =
    typeof title === "string" && !title.startsWith(LOOK_TITLE_PREFIX)
      ? title.trim()
      : "";
  const packed: Record<string, unknown> = {};
  if (look.textColor) packed.textColor = look.textColor;
  if (look.backgroundColor) packed.backgroundColor = look.backgroundColor;
  if (look.borderColor) packed.borderColor = look.borderColor;
  if (look.align) packed.align = look.align;
  if (look.width) packed.width = look.width;
  if (look.pulse) packed.pulse = true;
  if (look.fontSize) packed.fontSize = look.fontSize;
  if (look.avatarSize) packed.avatarSize = look.avatarSize;
  if (look.avatarShape) packed.avatarShape = look.avatarShape;
  if (look.radius) packed.radius = look.radius;
  if (look.padding) packed.padding = look.padding;
  if (look.shadow) packed.shadow = look.shadow;

  if (Object.keys(packed).length === 0) {
    return base.length > 0 ? base : null;
  }
  const encoded = `${LOOK_TITLE_PREFIX}${JSON.stringify(packed)}`;
  return base ? `${base}\n${encoded}` : encoded;
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
  } = {},
): CSSProperties {
  const style: CSSProperties = {};
  const background = look.backgroundColor || fallbacks.background;
  if (background) style.background = background;
  const color = look.textColor || fallbacks.color;
  if (color) style.color = color;
  const radius = lookRadius(look.radius, fallbacks.radius);
  if (radius) style.borderRadius = radius;
  if (look.borderColor) {
    style.border = `1px solid ${look.borderColor}`;
  } else if (fallbacks.border) {
    style.border = fallbacks.border;
  }
  const padding = lookPadding(look.padding) || fallbacks.padding;
  if (padding) style.padding = padding;
  const shadow = lookShadow(look.shadow, fallbacks.shadow);
  if (shadow) style.boxShadow = shadow;
  return style;
}

export function buttonShellClass(look: BlockLook, extra?: string) {
  const full = look.width !== "fit";
  return cn(
    "inline-flex min-h-12 items-center gap-2 font-semibold",
    full ? "w-full" : "w-auto px-6",
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
