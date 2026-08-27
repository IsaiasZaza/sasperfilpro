# Prompt para o backend — PerfilPro (tema + look dos blocos)

Cole este arquivo no chat do agente do **backend**. O frontend já envia esses campos. A API é a fonte da verdade: persista, valide e **enforce plano**. Não invente rotas novas.

Envelope continua:

```ts
{
  data: T | null
  error: { code: string; message: string; details?: unknown } | null
}
```

Auth: cookie httpOnly ou `Authorization: Bearer`. Rotas: `/me/profile` e `/me/profile/blocks/*`. Página pública: `GET /p/:username`.

---

## O que mudou no front (já no Next)

1. **Tema da página** (`PUT /me/profile` → `theme`) ganhou foto de fundo + overlay. `atmosphere` já existia.
2. **Look por bloco** (`PATCH /me/profile/blocks/:id` → `content`) ganhou superfície, hover, sombra extra e layouts.
3. Campos novos de **conteúdo visual** (capa do HERO, miniatura do link, mapa, etc.).

Isso é feature paga. **FREE não customiza visual.** Pro e Premium sim (`entitlements.customTheme === true`). Premium não precisa de entitlement extra para isso.

O front já esconde o painel **Aparência** no Free. O back **não pode confiar nisso**.

---

## Entitlement (não crie outro)

Reuse `customTheme`:

| Plano    | `customTheme` | Visual (tema + look + layouts visuais) |
|----------|---------------|----------------------------------------|
| FREE     | `false`       | bloqueado                              |
| PRO      | `true`        | liberado                               |
| PREMIUM  | `true`        | liberado                               |

`402 PLAN_FEATURE_LOCKED` com:

```ts
{
  currentPlan: "FREE"
  suggestedPlan: "PRO"
  entitlement: "customTheme"
}
```

**Não** use `SUBSCRIPTION_REQUIRED` aqui. Free tem acesso ao painel; só o visual é pago.

---

## 1) `theme` no `PUT /me/profile`

Persistir JSON (não descarte chaves desconhecidas de `theme`). Contrato:

```ts
type AtmosphereId =
  | "none"
  | "claw"
  | "comic"
  | "arc"
  | "symbiote"
  | "storm"
  | "inferno"
  | "cosmic";

type ApiTheme = {
  primaryColor?: string; // hex #rrggbb
  backgroundColor?: string;
  textColor?: string;
  buttonStyle?: "pill" | "rounded" | "square";
  font?: "sans" | "serif" | "mono";
  atmosphere?: AtmosphereId; // já existia; round-trip obrigatório
  backgroundImage?: string; // NOVO — URL http(s) pública
  overlay?: number; // NOVO — 0–80; só faz sentido com backgroundImage
};
```

Regras:

- Sempre devolver o `theme` gravado no GET (`/me/profile`, `/me/profile/preview`, `/p/:username`).
- `atmosphere` inválido → `"none"`.
- `backgroundImage`: só `http://` ou `https://`, hostname com ponto. Senão ignore/null.
- `overlay`: inteiro 0–80. Sem `backgroundImage`, trate como `0` e não grave overlay sozinho.
- Não baixe a imagem. Não suba ao Storage. É URL, como `avatarUrl` legado. Avatar de perfil continua no `POST /me/profile/avatar`.
- Não apague `atmosphere` / `backgroundImage` / `overlay` se o client omitir no PUT e o registro já tiver. Merge raso: o que vier substitui; o que não vier **mantém** (o front às vezes omite `backgroundImage` quando vazio).

### Free + theme

Se `customTheme === false`:

- PUT com `theme` “de verdade” (qualquer cor/atmosfera/imagem diferente do default vazio) → **402** `PLAN_FEATURE_LOCKED` / `customTheme`.
- PUT **sem** `theme`, ou `theme: {}` / omitido → 200; não apague tema antigo no banco (upgrade depois restaura). Alternativa aceitável: ignorar `theme` no write e não 402, **desde que** o GET público do Free continue `theme: {}`.
- `GET /p/:username` no Free: `theme: {}` (já era assim). Também **não** vaze `backgroundImage`.

Pro/Premium: grave e devolva o tema completo na pública.

---

## 2) `content` dos blocos

`content` é JSON opaco **com schema**. Persista as chaves abaixo. Não use `PATCH /users/:id`.

Look comum (todo bloco):

```ts
type BlockLook = {
  textColor?: string; // #rrggbb
  backgroundColor?: string;
  borderColor?: string;
  align?: "left" | "center" | "right";
  width?: "full" | "fit";
  pulse?: boolean;
  fontSize?: "sm" | "md" | "lg" | "xl";
  titleFontSize?: "sm" | "md" | "lg" | "xl";
  headlineFontSize?: "sm" | "md" | "lg" | "xl";
  bioFontSize?: "sm" | "md" | "lg" | "xl";
  headingFontSize?: "sm" | "md" | "lg" | "xl";
  bodyFontSize?: "sm" | "md" | "lg" | "xl";
  metaFontSize?: "sm" | "md" | "lg" | "xl";
  buttonFontSize?: "sm" | "md" | "lg" | "xl";
  priceFontSize?: "sm" | "md" | "lg" | "xl";
  avatarSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  avatarShape?: "circle" | "rounded" | "square";
  radius?: "none" | "sm" | "md" | "lg" | "pill";
  padding?: "sm" | "md" | "lg";
  shadow?: "none" | "soft" | "hard" | "glow"; // hard/glow novos
  hover?: "none" | "lift" | "scale" | "glow"; // NOVO
  surface?: "clean" | "card" | "glass" | "neon" | "comic"; // NOVO
};
```

Por tipo (além do look):

```ts
// HERO
{
  name?: string
  headline?: string
  bio?: string
  avatarUrl?: string
  location?: string
  layout?: "stack" | "split" | "banner" // NOVO
  bannerUrl?: string // NOVO, https
}

// CTA_BUTTON
{
  label: string
  url?: string
  style: "primary" | "secondary" | "outline"
}

// LINK_BUTTON
{
  label: string
  url?: string
  icon?: string
  subtitle?: string
  thumbnailUrl?: string // NOVO, https
  layout?: "row" | "cover" | "minimal" // NOVO
  badge?: string // NOVO, máx ~24 chars
}

// WHATSAPP
{
  phone: string
  message?: string
  label?: string
}

// SOCIAL
{
  items: { network: string; url: string; label?: string }[]
  layout?: "icons" | "buttons"
  style?: "brand" | "mono" | "ghost" // NOVO
}

// SERVICES
{
  heading?: string
  layout?: "list" | "cards" // NOVO
}

// TESTIMONIALS
{
  heading?: string
  layout?: "stack" | "quote" // NOVO
}

// LOCATION
{
  address: string
  mapsUrl?: string
  url?: string
  label?: string
  layout?: "card" | "map" // NOVO
}
```

URLs (`bannerUrl`, `thumbnailUrl`, `avatarUrl` legado no HERO): mesmas regras de https. Não baixe arquivo. Miniatura/capa **não** passam pelo `POST /me/profile/avatar`.

Enum inválido → ignore a chave (não 500).

---

## 3) Free: como bloquear sem quebrar o editor

O autosave do HERO manda `content` inteiro (nome + look). Se o Free mudar o nome e o content ainda tiver `surface`, **não** dê 402 no bloco inteiro.

**Write (POST/PATCH/PUT de blocks), se `customTheme === false`:**

1. Salve sempre os campos **funcionais**: textos, urls, phone, items, isVisible, sortOrder, title.
2. **Descarte** (não grave / zere) os visuais pagos:

```
textColor, backgroundColor, borderColor,
width, pulse,
fontSize e *FontSize,
radius, padding, shadow, hover, surface,
layout (quando for visual: HERO / LINK / SOCIAL / SERVICES / TESTIMONIALS / LOCATION),
bannerUrl, thumbnailUrl, badge, style (SOCIAL)
```

3. Pode **manter no Free** (já existiam e são básicos): `align`, `avatarSize`, `avatarShape`. Se quiser trancar 100% do visual, descarte esses também — documente.
4. Se o body **só** tenta mudar visual pago (diff só nessas chaves) → 402 `PLAN_FEATURE_LOCKED` / `customTheme`. Se mistura nome + visual → salve o nome, descarte o visual, 200.

**Read:**

- `GET /me/profile`, `/me/profile/blocks` e `/me/profile/preview`: devolve o que está no banco (já stripped no write).
- `GET /p/:username` no Free: defesa extra — não emita as chaves visuais acima, mesmo que tenham lixo antigo no JSON. `theme: {}`.

Pro/Premium: persista e devolva tudo. Pública também.

Cancelou Pro → volta Free: a página **não some**. GET público passa a stripar visual (tema `{}` + look pago fora). Dados podem ficar no banco para o upgrade.

---

## 4) Rotas — sem mudança de path

| Método | Rota | Ação |
|---|---|---|
| PUT | `/me/profile` | merge `theme` (campos novos) + gate `customTheme` |
| GET | `/me/profile` | `theme` completo se pago; Free: tema vazio ou o persistido, mas pública stripa |
| GET | `/me/profile/preview` | igual editor: dono vê o que tem direito |
| POST/PATCH | `/me/profile/blocks`, `/blocks/:id` | merge `content` + strip/402 |
| PUT | `/me/profile/blocks/reorder` | não mexe em content |
| GET | `/p/:username` | strip visual se Free |

Não crie `POST /me/profile/banner` nem upload de thumbnail. URL no JSON.

---

## 5) Preview vs pública

Mesma regra de plano. Preview autenticado do dono Pro mostra capa/neon/mapa. Visitante no `/p/:user` Free não vê.

Não calcule CSS no back. Só persistir/devolver JSON.

---

## 6) Checklist

- [ ] `theme.atmosphere` round-trip (não dropar)
- [ ] `theme.backgroundImage` + `theme.overlay` persistidos
- [ ] Free: pública com `theme: {}` e sem `backgroundImage`
- [ ] Free PUT theme custom → 402 `customTheme` **ou** ignore theme sem 500
- [ ] Block `content`: persistir look + layouts novos
- [ ] Free PATCH bloco: não 402 o save de texto; strip visual
- [ ] Free GET `/p/:username`: strip visual pago
- [ ] Enums inválidos não derrubam a request
- [ ] Cancelar Pro: página no ar, visual Free
- [ ] Sem chave Supabase no contrato desses campos (não é upload)

---

## 7) Testes sugeridos

1. Pro: PUT theme com `atmosphere: "claw"`, `backgroundImage: "https://example.com/a.jpg"`, `overlay: 40` → GET devolve igual.
2. Free: PUT o mesmo theme → 402 ou ignore; `/p/:user` sem imagem.
3. Free: PATCH HERO `{ name: "Maria", surface: "neon" }` → 200, GET content **sem** `surface`, **com** `name`.
4. Pro: PATCH LINK `{ thumbnailUrl, layout: "cover", badge: "Novo" }` → pública inclui.
5. Conta Pro → cancel → pública stripa; banco pode manter JSON.

---

Docs complementares: alinhar `API-FRONTEND.md` e `FRONTEND-PLANOS.md` com `customTheme` cobrindo tema **e** look/layout visual.
