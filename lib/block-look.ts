import type { CSSProperties } from "react";
import type { BlockAlign, BlockLook, ButtonWidth } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

export function lookFrom(content: object): BlockLook {
  const c = content as BlockLook;
  const align: BlockAlign | undefined =
    c.align === "left" || c.align === "right" || c.align === "center"
      ? c.align
      : undefined;
  const width: ButtonWidth | undefined =
    c.width === "fit" || c.width === "full" ? c.width : undefined;
  return {
    textColor:
      typeof c.textColor === "string" && c.textColor.trim()
        ? c.textColor
        : undefined,
    align,
    width,
    pulse: Boolean(c.pulse),
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

export function buttonShellClass(
  look: BlockLook,
  extra?: string,
) {
  const full = look.width !== "fit";
  return cn(
    "inline-flex min-h-12 items-center gap-2 font-semibold",
    full ? "w-full" : "w-auto px-6",
    justifyAlign(look.align),
    pulseClass(look.pulse),
    extra,
  );
}
