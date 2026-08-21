import { cn } from "@/lib/utils";

export function Toast({
  message,
  show,
  className,
}: {
  message: string;
  show: boolean;
  className?: string;
}) {
  if (!show || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white",
        className,
      )}
    >
      {message}
    </div>
  );
}
