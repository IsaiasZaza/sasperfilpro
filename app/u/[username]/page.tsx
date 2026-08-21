import type { Metadata } from "next";
import Link from "next/link";
import { ProfilePreview } from "@/components/profile/profile-preview";
import { Button } from "@/components/ui/button";
import { loadPublicPage } from "@/lib/public-page";
import { resolvePaintTheme } from "@/lib/theme";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const page = await loadPublicPage(username);
  if (!page) {
    return { title: "Página não encontrada" };
  }
  const name = page.displayName || page.username || username;
  const headline = page.headline?.trim();
  return {
    title: headline ? `${name} · ${headline}` : name,
    description:
      page.bio?.trim() ||
      headline ||
      `Página de ${name} no PerfilPro`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const page = await loadPublicPage(username);

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
        <Link href="/" className="font-serif text-[1.55rem] text-ink">
          PerfilPro
        </Link>
        <h1 className="mt-10 font-serif text-[2rem] text-ink">
          Página não encontrada
        </h1>
        <p className="mt-2 max-w-sm text-[15px] text-muted">
          Este perfil não existe ou ainda não foi publicado.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/cadastro">Criar minha página</Link>
        </Button>
      </div>
    );
  }

  const painted = resolvePaintTheme(page.theme);
  const fontClass =
    painted.font === "serif"
      ? "font-serif"
      : painted.font === "mono"
        ? "font-mono"
        : "font-sans";

  return (
    <div
      className={`relative min-h-screen ${fontClass}`}
      style={{ background: painted.background }}
    >
      <div className="mx-auto min-h-screen w-full max-w-md">
        <ProfilePreview
          page={page}
          showStatusBar={false}
          className="min-h-screen"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-5">
        <Link
          href="/"
          className="pointer-events-auto rounded-full px-3 py-1 text-[11px] font-medium text-muted/80 hover:text-ink"
        >
          Feito com PerfilPro
        </Link>
      </div>
    </div>
  );
}
