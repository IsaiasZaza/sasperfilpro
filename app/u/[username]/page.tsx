import type { Metadata } from "next";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ProfilePreview } from "@/components/profile/profile-preview";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { loadPublicPage } from "@/lib/public-page";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { resolvePaintTheme } from "@/lib/theme";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const page = await loadPublicPage(username);
  const path = `/u/${username}`;

  if (!page) {
    return {
      title: "Página não encontrada",
      robots: { index: false, follow: false },
    };
  }

  const name = page.displayName || page.username || username;
  const headline = page.headline?.trim();
  const title = headline ? `${name} · ${headline}` : name;
  const description =
    page.bio?.trim() ||
    headline ||
    `Página profissional de ${name} no ${SITE_NAME}. Serviços, contato e WhatsApp em um só link.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "profile",
      url: path,
      locale: "pt_BR",
      siteName: SITE_NAME,
      images: page.avatarUrl ? [{ url: page.avatarUrl, alt: name }] : undefined,
    },
    twitter: {
      card: page.avatarUrl ? "summary" : "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const page = await loadPublicPage(username);

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 text-center">
        <Logo href="/" size="lg" />
        <h1 className="mt-10 font-serif text-[2rem] text-ink">
          Página não encontrada
        </h1>
        <p className="mt-2 max-w-sm text-[15px] text-muted">
          Este perfil não existe ou ainda não foi publicado.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/planos">Criar minha página</Link>
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
  const name = page.displayName || page.username || username;
  const url = absoluteUrl(`/u/${page.username || username}`);

  return (
    <div
      className={`relative min-h-screen ${fontClass}`}
      style={{ background: painted.background }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url,
          name,
          description: page.bio || page.headline || undefined,
          mainEntity: {
            "@type": "Person",
            name,
            description: page.headline || page.bio || undefined,
            image: page.avatarUrl || undefined,
            url,
          },
        }}
      />
      <div className="mx-auto min-h-screen w-full max-w-md">
        <ProfilePreview
          page={page}
          showStatusBar={false}
          className="min-h-screen"
        />
      </div>
      {page.showBranding !== false ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-5">
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-muted hover:text-ink"
          >
            <LogoMark className="h-4 w-4" />
            Feito com PerfilPro
          </Link>
        </div>
      ) : null}
    </div>
  );
}
