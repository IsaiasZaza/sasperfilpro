export const SITE_NAME = "PerfilPro";

export const SITE_TITLE =
  "PerfilPro — Link na bio profissional para Instagram e WhatsApp";

export const SITE_DESCRIPTION =
  "Crie sua página profissional para a bio do Instagram. Mostre serviços e depoimentos e leve o cliente direto para o WhatsApp. 7 dias grátis, sem site e sem domínio.";

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }

  return "https://perfilpro.vercel.app";
}

export function getGoogleSiteVerification() {
  return (
    process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
    undefined
  );
}

/** Domínio sem protocolo, para exibir o link ao usuário. */
export function getSiteHost() {
  return getSiteUrl().replace(/^https?:\/\//, "");
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
