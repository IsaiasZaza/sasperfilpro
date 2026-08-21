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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  extra?: React.ReactNode;
  minLength?: number;
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(AUTH_INPUT_CLASS, "pr-12")}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setShow((current) => !current)}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
