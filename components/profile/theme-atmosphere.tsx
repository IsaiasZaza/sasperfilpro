"use client";

import type { AtmosphereId } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Atmosfera ambient: só glows suaves.
 * Sem gimmicks (garras, raios, estrelas) — movimento lento e premium.
 */
export function ThemeAtmosphere({
  atmosphere,
  accent,
  className,
}: {
  atmosphere: AtmosphereId;
  accent: string;
  className?: string;
}) {
  if (atmosphere === "none") return null;

  return (
    <div
      className={cn("theme-fx", `theme-fx--${atmosphere}`, className)}
      style={{ ["--theme-accent" as string]: accent }}
      aria-hidden
    >
      <span className="theme-fx__glow theme-fx__glow--primary" />
      <span className="theme-fx__glow theme-fx__glow--secondary" />
      <span className="theme-fx__glow theme-fx__glow--accent" />
      <span className="theme-fx__veil" />
    </div>
  );
}
