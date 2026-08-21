import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
      <Logo href="/" size="lg" />
      <h1 className="mt-10 font-serif text-[2rem] text-ink">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-sm text-[15px] text-muted">
        Esse endereço não existe ou saiu do ar. Volte para a página inicial.
      </p>
      <Button asChild className="mt-8" size="lg">
        <Link href="/">Ir para o início</Link>
      </Button>
    </div>
  );
}
