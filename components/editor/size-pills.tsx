"use client";

import { Label } from "@/components/ui/label";
import type { FontSize } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

const OPTIONS: { value: FontSize; label: string }[] = [
  { value: "sm", label: "P" },
  { value: "md", label: "M" },
  { value: "lg", label: "G" },
  { value: "xl", label: "GG" },
];

export function SizePills({
  value,
  onChange,
}: {
  value: FontSize;
  onChange: (value: FontSize) => void;
}) {
  return (
    <div
      className="flex shrink-0 gap-0.5"
      role="group"
      aria-label="Tamanho da letra"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (option.value === value) return;
              onChange(option.value);
            }}
            className={cn(
              "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[10px] font-semibold",
              selected
                ? "bg-ink text-white"
                : "border border-line bg-white text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function FieldHead({
  label,
  size,
  onSizeChange,
}: {
  label: string;
  size?: FontSize;
  onSizeChange?: (size: FontSize) => void;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <Label className="mb-0">{label}</Label>
      {onSizeChange ? (
        <SizePills value={size || "md"} onChange={onSizeChange} />
      ) : null}
    </div>
  );
}

export function SizeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: FontSize;
  onChange: (value: FontSize) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <SizePills value={value} onChange={onChange} />
    </div>
  );
}
