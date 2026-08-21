import { cn } from "@/lib/utils";

export function PhoneFrame({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "relative mx-auto",
        size === "sm" ? "w-[220px]" : "w-[260px] sm:w-[280px]",
        className,
      )}
    >
      <div
        className={cn(
          "phone-shine relative overflow-hidden border-[#1c1814] bg-[#1c1814] shadow-[0_30px_70px_-24px_rgba(20,17,14,0.5)]",
          size === "sm"
            ? "rounded-[2rem] border-[8px]"
            : "rounded-[2.4rem] border-[10px]",
        )}
      >
        <div
          className={cn(
            "absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-black",
            size === "sm" ? "top-1.5 h-[18px] w-[72px]" : "top-2 h-[22px] w-[88px]",
          )}
        />
        <div
          className={cn(
            "relative overflow-hidden bg-white",
            size === "sm"
              ? "h-[440px] rounded-[1.4rem]"
              : "h-[520px] rounded-[1.7rem] sm:h-[560px]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function StatusBar({
  dark = false,
  color,
}: {
  dark?: boolean;
  color?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end justify-between px-6 pb-1 pt-3.5 text-[10px] font-semibold tracking-wide",
        !color && (dark ? "text-white/80" : "text-zinc-800"),
      )}
      style={color ? { color } : undefined}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="inline-block h-[7px] w-[15px] rounded-[2px] border border-current opacity-80">
          <span className="ml-[1px] mt-[1px] block h-[3px] w-[10px] rounded-[1px] bg-current" />
        </span>
      </div>
    </div>
  );
}
