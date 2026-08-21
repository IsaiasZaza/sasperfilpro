"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <Logo href="/" size="lg" />
      <h1 className="mt-10 font-serif text-[2rem] text-ink">
        Algo deu errado
      </h1>
      <p className="mt-2 max-w-sm text-[15px] text-muted">
        Não foi possível carregar esta página. Tente de novo ou volte ao início.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Tentar de novo
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/">Ir para o início</Link>
        </Button>
      </div>
    </div>
  );
}
