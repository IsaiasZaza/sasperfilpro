"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const AUTH_INPUT_CLASS =
  "h-12 rounded-xl border-line/80 bg-[#f7f4ef] shadow-none focus:bg-white";

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  extra,
  minLength,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  extra?: React.ReactNode;
  minLength?: number;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <Label htmlFor={id} className="mb-0">
          {label}
        </Label>
        {extra}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(AUTH_INPUT_CLASS, "pr-12")}
        />
        <button
          type="button"
          className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/25 disabled:opacity-50"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={show}
          disabled={disabled}
          onClick={() => setShow((current) => !current)}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
