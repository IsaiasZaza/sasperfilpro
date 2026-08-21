export default function PublicProfileLoading() {
  return (
    <div className="flex min-h-screen justify-center bg-background px-5 pt-16">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="h-[88px] w-[88px] rounded-full bg-line" />
        <div className="mt-5 h-7 w-36 rounded-full bg-line" />
        <div className="mt-3 h-4 w-24 rounded-full bg-line/80" />
        <div className="mt-3 h-4 w-48 rounded-full bg-line/70" />
        <div className="mt-8 h-12 w-full rounded-full bg-line" />
        <div className="mt-6 h-14 w-full rounded-xl bg-line/70" />
        <div className="mt-2 h-14 w-full rounded-xl bg-line/70" />
        <span className="sr-only">Carregando página</span>
      </div>
    </div>
  );
}
