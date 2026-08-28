"use client";

import { Check, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ChoicePickerSheet<T extends string>({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <div>
        <Label>{label}</Label>
        {hint ? (
          <p className="mb-1.5 mt-0.5 text-[12px] leading-snug text-muted">
            {hint}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 text-left transition hover:border-ink/20 hover:bg-background/60"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
            {selected?.label ?? value}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        </button>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="panel-in w-full max-w-sm rounded-t-[1.6rem] bg-white p-5 pb-6 shadow-[0_-10px_44px_-14px_rgba(20,17,14,0.4)] outline-none sm:rounded-[1.6rem] sm:pb-5 sm:shadow-[0_24px_60px_-24px_rgba(20,17,14,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p id={titleId} className="text-[15px] font-semibold text-ink">
              {label}
            </p>
            {hint ? (
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {hint}
              </p>
            ) : null}
            <div className="mt-4 space-y-2" role="listbox" aria-label={label}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition",
                      isSelected
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white text-ink hover:border-ink/20 hover:bg-background",
                    )}
                  >
                    <span className="text-[14px] font-semibold">
                      {option.label}
                    </span>
                    {isSelected ? (
                      <Check className="h-4 w-4 shrink-0 opacity-90" />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl text-[13px] font-medium text-muted transition hover:bg-background hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
