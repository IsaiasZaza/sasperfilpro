import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-muted-soft focus:border-ink/25 focus:ring-2 focus:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
