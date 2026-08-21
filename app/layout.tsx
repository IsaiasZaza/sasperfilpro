import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const serif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const title = "PerfilPro — Tudo o que você é, em um só link";
const description =
  "Crie sua página profissional para a bio do Instagram. Mostre serviços, depoimentos e leve o cliente direto para o WhatsApp."

export const metadata: Metadata = {
  metadataBase: new URL("https://perfilpro.vercel.app"),
  title,
  description,
  keywords: [
    "link na bio",
    "Instagram",
    "página profissional",
    "WhatsApp",
    "autônomos",
    "pequenos negócios",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "pt_BR",
    siteName: "PerfilPro",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-background font-sans text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
