"use client";

import { Label } from "@/components/ui/label";
import type { FontSize } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

const OPTIONS: {
  value: FontSize;
  label: string;
  sample: string;
}[] = [
  { value: "sm", label: "Pequena", sample: "11px" },
  { value: "md", label: "Média", sample: "13px" },
  { value: "lg", label: "Grande", sample: "16px" },
  { value: "xl", label: "Bem grande", sample: "19px" },
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
      className="inline-flex h-8 shrink-0 items-center rounded-full border border-line bg-[#f7f4ef] p-0.5"
      role="radiogroup"
      aria-label="Tamanho da letra"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => {
              if (option.value === value) return;
              onChange(option.value);
            }}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full font-serif leading-none transition",
              selected
                ? "bg-ink text-white shadow-sm"
                : "text-muted hover:text-ink",
            )}
            style={{ fontSize: option.sample }}
          >
            A
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
