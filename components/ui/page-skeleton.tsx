export function PageSkeleton({
  className = "px-5 py-16",
}: {
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <div className="mx-auto max-w-xl animate-pulse space-y-3">
        <div className="h-8 w-48 rounded-full bg-ink/10" />
        <div className="h-4 w-full max-w-sm rounded-full bg-ink/8" />
        <div className="mt-6 h-36 rounded-[1.4rem] bg-ink/8" />
      </div>
      <span className="sr-only">Carregando</span>
    </div>
  );
}
