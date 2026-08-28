"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ChoiceDropdown<T extends string>({
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
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const selected = options.find((option) => option.value === value);

  function updateMenuPosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }

  function openMenu() {
    updateMenuPosition();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const onReposition = () => updateMenuPosition();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("touchstart", onPointerDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Label>{label}</Label>
      {hint ? (
        <p className="mb-1.5 mt-0.5 text-[12px] leading-snug text-muted">
          {hint}
        </p>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-white px-3.5 py-2.5 text-left transition",
          open
            ? "border-ink/30 ring-2 ring-ink/5"
            : "border-line hover:border-ink/20 hover:bg-background/60",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
      >
        <span className="min-w-0 truncate text-[13px] font-semibold text-ink">
          {selected?.label ?? value}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && menuStyle && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              aria-label={label}
              className="fixed z-[80] overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[0_12px_32px_-8px_rgba(20,17,14,0.28)]"
              style={{
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
              }}
            >
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
                      "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[13px] transition",
                      isSelected
                        ? "bg-background font-semibold text-ink"
                        : "text-ink hover:bg-background/80",
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-ink" />
                    ) : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
