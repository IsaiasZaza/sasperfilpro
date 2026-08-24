import { Check, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "info" | "success" | "error";

const ICONS: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: Check,
  error: TriangleAlert,
};

export function Toast({
  message,
  show,
  variant = "info",
  onDismiss,
  className,
}: {
  message: string;
  show: boolean;
  variant?: ToastVariant;
  onDismiss?: () => void;
  className?: string;
}) {
  if (!show || !message) return null;

  const Icon = ICONS[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "toast-in fixed bottom-6 left-1/2 z-50 flex max-w-[min(28rem,calc(100vw-2rem))] items-center gap-2.5 rounded-2xl py-2.5 pl-3.5 pr-3 text-[13px] font-medium shadow-[0_18px_40px_-18px_rgba(20,17,14,0.65)]",
        variant === "error" ? "bg-red-700 text-white" : "bg-ink text-white",
        className,
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          variant === "success" && "text-lime",
          variant === "info" && "text-white/60",
        )}
      />
      <span className="min-w-0 leading-snug">{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
