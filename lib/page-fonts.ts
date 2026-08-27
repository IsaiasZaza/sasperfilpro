export const PAGE_FONT_IDS = [
  "sans",
  "outfit",
  "nunito",
  "serif",
  "playfair",
  "cormorant",
  "lora",
  "syne",
  "mono",
] as const;

export type PageFontId = (typeof PAGE_FONT_IDS)[number];

export const PAGE_FONTS: {
  id: PageFontId;
  label: string;
  hint: string;
  sample: string;
}[] = [
  { id: "sans", label: "Jakarta", hint: "Limpa", sample: "Agendar" },
  { id: "outfit", label: "Outfit", hint: "Moderna", sample: "Agendar" },
  { id: "nunito", label: "Nunito", hint: "Redonda", sample: "Agendar" },
  { id: "serif", label: "Fraunces", hint: "Editorial", sample: "Agendar" },
  { id: "playfair", label: "Playfair", hint: "Elegante", sample: "Agendar" },
  { id: "cormorant", label: "Cormorant", hint: "Luxo", sample: "Agendar" },
  { id: "lora", label: "Lora", hint: "Acolhedora", sample: "Agendar" },
  { id: "syne", label: "Syne", hint: "Ousada", sample: "Agendar" },
  { id: "mono", label: "Mono", hint: "Técnica", sample: "Agendar" },
];

const FONT_ID_SET = new Set<string>(PAGE_FONT_IDS);

export function asPageFont(value: unknown): PageFontId {
  return typeof value === "string" && FONT_ID_SET.has(value)
    ? (value as PageFontId)
    : "sans";
}

export function pageFontClass(font: string | null | undefined): string {
  const id = asPageFont(font);
  return `pp-font-${id}`;
}
