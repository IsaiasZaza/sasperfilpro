# Prompt para o backend — PerfilPro (depoimentos por item)

Cole este arquivo no chat do agente do **backend**. O frontend já envia esses campos. A API é a fonte da verdade: persista, valide e devolva na página pública. Não invente rotas novas.

Envelope continua:

```ts
{
  data: T | null
  error: { code: string; message: string; details?: unknown } | null
}
```

Auth: cookie httpOnly ou `Authorization: Bearer`. Rotas existentes: `/me/profile/testimonials` e `/me/profile/testimonials/:id`. Página pública: `GET /p/:username`.

---

## O que mudou no front (já no Next)

1. Cada depoimento pode ter **estilo próprio** (card ou citação), **padding interno** e **espaço abaixo** — independente dos outros.
2. O bloco `TESTIMONIALS` mantém um **estilo padrão** (`content.layout`) para novos depoimentos.
3. O front envia `layout`, `padding` e `spacing` no **POST** e **PATCH** de testimonial.
4. Enquanto o back não persistir, o front guarda fallback em `blocks[].content.itemStyles` (mapa `id → estilo`). Quando o back passar a persistir, o front continua enviando os mesmos campos e pode parar de depender só do fallback.

---

## 1) Modelo `Testimonial` (Prisma ou equivalente)

Adicionar colunas opcionais (nullable, com default sensível):

```ts
type TestimonialsLayout = "stack" | "quote";
type BlockPadding = "sm" | "md" | "lg";
type TestimonialSpacing = "sm" | "md" | "lg";

type Testimonial = {
  id: string;
  profileId: string;
  authorName: string;
  text: string;
  rating: number;           // 1–5, default 5
  sortOrder: number;
  isVisible: boolean;       // default true
  layout?: TestimonialsLayout | null;   // NOVO — null = herda do bloco
  padding?: BlockPadding | null;        // NOVO — null = "md" no front
  spacing?: TestimonialSpacing | null;  // NOVO — null = "md" no front
  createdAt: DateTime;
  updatedAt: DateTime;
};
```

**Defaults sugeridos no banco:** `rating = 5`, `isVisible = true`, `sortOrder` auto-incrementado por profile. Campos visuais (`layout`, `padding`, `spacing`) podem ficar `NULL` — o front interpreta null como “usar padrão da seção / md”.

---

## 2) Rotas autenticadas

### `GET /me/profile/testimonials`

Retornar array ordenado por `sortOrder`, incluindo os campos novos:

```json
{
  "data": [
    {
      "id": "uuid",
      "authorName": "Ana Clara",
      "text": "Excelente atendimento.",
      "rating": 5,
      "sortOrder": 0,
      "isVisible": true,
      "layout": "quote",
      "padding": null,
      "spacing": "lg"
    }
  ],
  "error": null
}
```

### `POST /me/profile/testimonials`

Body aceito (campos novos opcionais):

```ts
{
  authorName: string;      // obrigatório, 1–80 chars
  text: string;            // obrigatório, 1–500 chars
  rating?: number;         // 1–5, default 5
  sortOrder?: number;
  isVisible?: boolean;     // default true
  layout?: "stack" | "quote";
  padding?: "sm" | "md" | "lg";
  spacing?: "sm" | "md" | "lg";
}
```

Validação:

| Campo       | Regra |
|------------|-------|
| `authorName` | trim, min 1, max 80 |
| `text`       | trim, min 1, max 500 |
| `rating`     | inteiro 1–5 |
| `layout`     | enum `stack` \| `quote` ou omitir |
| `padding`    | enum `sm` \| `md` \| `lg` ou omitir |
| `spacing`    | enum `sm` \| `md` \| `lg` ou omitir |
| `sortOrder`  | inteiro ≥ 0 |

**Limite por plano:** respeitar `maxTestimonials` do entitlement (Free = 2, Pro/Premium = ilimitado). Se exceder:

```ts
402 PLAN_LIMIT_REACHED
{
  currentPlan: "FREE"
  limit: 2
  resource: "testimonials"
}
```

### `PATCH /me/profile/testimonials/:id`

Mesmos campos do POST, todos opcionais (partial update). Retornar o item completo com campos novos.

### `DELETE /me/profile/testimonials/:id`

Sem mudança. Após delete, recompactar `sortOrder` é opcional mas recomendado.

---

## 3) Página pública `GET /p/:username`

Incluir `layout`, `padding` e `spacing` em cada item de `testimonials[]` — mesma forma do GET autenticado. Ordenar por `sortOrder`. Filtrar `isVisible === false` na resposta pública (se já não filtra).

O bloco `TESTIMONIALS` em `blocks[]` pode conter `content.itemStyles` como fallback legado. **Preferência:** campos no testimonial; use `itemStyles` só se o item não tiver `layout`/`padding`/`spacing` preenchidos (compatibilidade durante migração).

---

## 4) Bloco `TESTIMONIALS` (sem mudança obrigatória)

O `content` do bloco já pode ter:

```ts
type TestimonialsContent = {
  heading?: string;
  layout?: "stack" | "quote";  // estilo padrão da seção
  itemStyles?: Record<
    string,
    {
      layout?: "stack" | "quote";
      padding?: "sm" | "md" | "lg";
      spacing?: "sm" | "md" | "lg";
    }
  >;
  // ...campos de look (BlockLook) existentes
};
```

**Não descartar** `itemStyles` ao salvar blocos — é fallback até todos os depoimentos migrarem para colunas próprias. Opcional: script de migração que copia `itemStyles[id]` → colunas do testimonial e limpa o mapa.

---

## 5) Seed / demo

No seed `maria-oliveira`, incluir pelo menos 2 depoimentos com estilos diferentes:

```ts
{ authorName: "Juliana R.", text: "...", rating: 5, layout: "stack", padding: "md", spacing: "md" }
{ authorName: "Camila S.", text: "...", rating: 5, layout: "quote", spacing: "lg" }
```

---

## 6) Checklist de aceite

Após implementar:

- [ ] `POST /me/profile/testimonials` com `layout: "quote"` → persiste e retorna no GET
- [ ] `PATCH` altera `padding` e `spacing` individualmente
- [ ] `GET /p/:username` devolve os 3 campos novos em cada testimonial
- [ ] Limite Free (2 depoimentos) retorna `402` no terceiro POST
- [ ] Valores inválidos (`layout: "carousel"`) → `400` com mensagem clara
- [ ] Recarregar editor: estilos por item **permanecem** sem depender só de `itemStyles` no bloco

---

## 7) O que NÃO fazer

- Não criar rota separada para estilo de depoimento — tudo fica no CRUD existente.
- Não exigir Pro/Premium para `layout`/`padding`/`spacing` por item — isso é conteúdo, não tema pago (diferente de `customTheme` nos blocos).
- Não remover `itemStyles` do JSON do bloco — o front ainda envia como backup.
