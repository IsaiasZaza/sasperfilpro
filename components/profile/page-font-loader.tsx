import {
  Cormorant_Garamond,
  Lora,
  Nunito,
  Outfit,
  Playfair_Display,
  Syne,
} from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/** Variáveis CSS das fontes da página pública — usar no editor e em /u. */
export function pageFontVariables(): string {
  return [
    outfit.variable,
    nunito.variable,
    playfair.variable,
    cormorant.variable,
    lora.variable,
    syne.variable,
  ].join(" ");
}
