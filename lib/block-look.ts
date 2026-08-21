import type { CSSProperties } from "react";
import type {
  AvatarShape,
  AvatarSize,
  BlockAlign,
  BlockLook,
  ButtonWidth,
  FontSize,
} from "@/lib/types/profile";
import { cn } from "@/lib/utils";

const FONT_SIZES: FontSize[] = ["sm", "md", "lg", "xl"];
const AVATAR_SIZES: AvatarSize[] = ["sm", "md", "lg", "xl"];
const AVATAR_SHAPES: AvatarShape[] = ["circle", "rounded", "square"];

export function lookFrom(content: object): BlockLook {
  const c = content as BlockLook;
  const align: BlockAlign | undefined =
    c.align === "left" || c.align === "right" || c.align === "center"
      ? c.align
      : undefined;
  const width: ButtonWidth | undefined =
    c.width === "fit" || c.width === "full" ? c.width : undefined;
  const fontSize: FontSize | undefined = FONT_SIZES.includes(
    c.fontSize as FontSize,
  )
    ? (c.fontSize as FontSize)
    : undefined;
  const avatarSize: AvatarSize | undefined = AVATAR_SIZES.includes(
    c.avatarSize as AvatarSize,
  )
    ? (c.avatarSize as AvatarSize)
    : undefined;
  const avatarShape: AvatarShape | undefined = AVATAR_SHAPES.includes(
    c.avatarShape as AvatarShape,
  )
    ? (c.avatarShape as AvatarShape)
    : undefined;
  return {
    textColor:
      typeof c.textColor === "string" && c.textColor.trim()
        ? c.textColor
        : undefined,
    align,
    width,
    pulse: Boolean(c.pulse),
    fontSize,
    avatarSize,
    avatarShape,
  };
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
  if (size === "sm") return 64;
  if (size === "lg") return 112;
  if (size === "xl") return 136;
  return 88;
}

export function avatarRadius(shape?: AvatarShape) {
  if (shape === "square") return "12px";
  if (shape === "rounded") return "22%";
  return "9999px";
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
