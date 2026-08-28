"use client";

import { ChoiceDropdown } from "@/components/editor/choice-dropdown";
import { Label } from "@/components/ui/label";
import type { FontSize } from "@/lib/types/profile";

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "sm", label: "Pequena" },
  { value: "md", label: "Média" },
  { value: "lg", label: "Grande" },
  { value: "xl", label: "Bem grande" },
];

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
        <ChoiceDropdown
          compact
          label={`Tamanho: ${label}`}
          value={size || "md"}
          onChange={onSizeChange}
          options={FONT_SIZE_OPTIONS}
        />
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
    <ChoiceDropdown
      label={label}
      value={value}
      onChange={onChange}
      options={FONT_SIZE_OPTIONS}
    />
  );
}
