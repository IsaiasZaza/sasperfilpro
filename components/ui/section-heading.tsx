import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-[1.95rem] leading-[1.12] text-ink sm:text-[2.55rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-[1.7] text-muted">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
