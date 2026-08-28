import type {
  BlockPadding,
  TestimonialItem,
  TestimonialItemStyle,
  TestimonialsContent,
  TestimonialsLayout,
  TestimonialSpacing,
} from "@/lib/types/profile";

export function resolveTestimonialLayout(
  item: TestimonialItem,
  content?: TestimonialsContent | null,
): TestimonialsLayout {
  return (
    item.layout ??
    content?.itemStyles?.[item.id]?.layout ??
    content?.layout ??
    "stack"
  );
}

export function resolveTestimonialPadding(
  item: TestimonialItem,
  content?: TestimonialsContent | null,
): BlockPadding {
  return (
    item.padding ??
    content?.itemStyles?.[item.id]?.padding ??
    "md"
  );
}

export function resolveTestimonialSpacing(
  item: TestimonialItem,
  content?: TestimonialsContent | null,
): TestimonialSpacing {
  return (
    item.spacing ??
    content?.itemStyles?.[item.id]?.spacing ??
    "md"
  );
}

/** Mescla estilos do bloco quando a API ainda não devolve os campos novos. */
export function mergeTestimonialsWithBlockStyles(
  items: TestimonialItem[],
  content?: TestimonialsContent | null,
): TestimonialItem[] {
  if (!content?.itemStyles) return items;
  return items.map((item) => {
    const fallback = content.itemStyles?.[item.id];
    if (!fallback) return item;
    return {
      ...item,
      layout: item.layout ?? fallback.layout,
      padding: item.padding ?? fallback.padding,
      spacing: item.spacing ?? fallback.spacing,
    };
  });
}

export function buildItemStyles(
  items: TestimonialItem[],
): Record<string, TestimonialItemStyle> {
  const styles: Record<string, TestimonialItemStyle> = {};
  for (const item of items) {
    if (!item.layout && !item.padding && !item.spacing) continue;
    styles[item.id] = {
      ...(item.layout ? { layout: item.layout } : {}),
      ...(item.padding ? { padding: item.padding } : {}),
      ...(item.spacing ? { spacing: item.spacing } : {}),
    };
  }
  return styles;
}

export function pruneItemStyles(
  styles: Record<string, TestimonialItemStyle> | undefined,
  items: TestimonialItem[],
): Record<string, TestimonialItemStyle> | undefined {
  if (!styles) return undefined;
  const ids = new Set(items.map((item) => item.id));
  const next: Record<string, TestimonialItemStyle> = {};
  for (const [id, style] of Object.entries(styles)) {
    if (ids.has(id)) next[id] = style;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

export function remapItemStyles(
  styles: Record<string, TestimonialItemStyle> | undefined,
  fromId: string,
  toId: string,
): Record<string, TestimonialItemStyle> | undefined {
  if (!styles?.[fromId]) return styles;
  const next = { ...styles };
  next[toId] = { ...next[toId], ...next[fromId] };
  delete next[fromId];
  return Object.keys(next).length > 0 ? next : undefined;
}

export function remapItemStylesBatch(
  styles: Record<string, TestimonialItemStyle> | undefined,
  idMap: Map<string, string>,
): Record<string, TestimonialItemStyle> | undefined {
  if (!styles || idMap.size === 0) return styles;
  let next = { ...styles };
  for (const [fromId, toId] of idMap) {
    next = remapItemStyles(next, fromId, toId) ?? {};
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

export function testimonialsBlockSummary(
  items: TestimonialItem[],
  content?: TestimonialsContent | null,
): string {
  const count = items.length;
  if (count === 0) return "Nenhum depoimento ainda";
  const defaultLayout = content?.layout || "stack";
  let cards = 0;
  let quotes = 0;
  for (const item of items) {
    if (resolveTestimonialLayout(item, content) === "quote") quotes += 1;
    else cards += 1;
  }
  const base = `${count} depoimento${count === 1 ? "" : "s"}`;
  if (cards > 0 && quotes > 0) {
    return `${base} · ${cards} card${cards === 1 ? "" : "s"}, ${quotes} citação${quotes === 1 ? "" : "ões"}`;
  }
  if (quotes === count) return `${base} · citações`;
  return `${base} · cards`;
}
