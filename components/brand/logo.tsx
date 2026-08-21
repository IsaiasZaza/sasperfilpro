import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  variant = "brand",
}: {
  className?: string;
  variant?: "brand" | "contrast";
}) {
  const square = variant === "contrast" ? "#14110E" : "#D4E05C";
  const glyph = variant === "contrast" ? "#D4E05C" : "#14110E";

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="12" fill={square} />
      <circle cx="31.2" cy="8.8" r="3.1" fill={glyph} />
      <path
        d="M11.2 8.4h12.1c5.55 0 9.15 3.05 9.15 7.85 0 4.85-3.65 7.9-9.15 7.9H16.4v8.35h-5.2V8.4Zm5.2 3.85v7.95h6.55c2.95 0 4.7-1.55 4.7-3.95 0-2.4-1.75-4-4.7-4H16.4Z"
        fill={glyph}
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  tone = "ink",
  mark = "brand",
  size = "md",
  withWordmark = true,
  className,
}: {
  href?: string | null;
  tone?: "ink" | "inverse";
  mark?: "brand" | "contrast";
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  className?: string;
}) {
  const markSize = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-9 w-9" : "h-8 w-8";
  const type =
    size === "sm"
      ? "text-[1.15rem]"
      : size === "lg"
        ? "text-[1.5rem]"
        : "text-[1.32rem]";

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markSize} variant={mark} />
      {withWordmark ? (
        <span
          className={cn(
            "font-serif leading-none tracking-tight",
            type,
            tone === "inverse" ? "text-lime" : "text-ink",
          )}
        >
          PerfilPro
        </span>
      ) : (
        <span className="sr-only">PerfilPro</span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center" aria-label="PerfilPro">
      {content}
    </Link>
  );
}
