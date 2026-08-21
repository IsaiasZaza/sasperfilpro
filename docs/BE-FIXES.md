# PerfilPro — correções para o Backend (Cursor BE)

Prompt copy-paste para o agente de backend. Validado em `2026-08-21` contra `http://localhost:3333`.

---

## Prompt

```text
# Backend PerfilPro — bugs e gaps encontrados pelo Frontend/QA

## Contexto
O FE (Next.js em http://localhost:3000) já consome a API com credentials: "include".
Durante QA ponta a ponta, estes pontos quebraram ou divergiram do contrato documentado.

## P0 — Seed demo ausente / quebrado

O guia do FE promete:

- email: maria@demo.com
- senha: Demo1234!
- página pública: GET /p/maria-oliveira

Comportamento atual na API local:

- POST /auth/login com essas credenciais → **401**
- GET /p/maria-oliveira → **404**
- GET /usernames/check?username=maria-oliveira → available: true

### Pedido
1. Garantir seed idempotente (prisma seed / on boot em DEV) que cria:
   - User maria@demo.com / Demo1234! (hash bcrypt/argon2)
   - Profile username `maria-oliveira`, status PUBLISHED, displayName preenchido
   - Pelo menos 1 bloco HERO visível + WHATSAPP + SERVICES (com ServiceItems) + 1 Testimonial
2. Documentar no README como rodar o seed (`npm run seed` ou equivalente)
3. Após o seed, estes checks devem passar:
   - POST /auth/login { email, password } → 200 + cookies
   - GET /p/maria-oliveira → 200 com blocks/services/testimonials

## P1 — Contrato do username temporário (ok, só documentar)

No register, o profile nasce com username `user-<userIdPrefix>` (ex.: `user-bf425e68`).
O FE usa isso para `needsOnboarding` (libera o app quando o username deixa de ser `user-*`).

### Pedido
Documentar no OpenAPI/README:
- Username temporário sempre com prefixo `user-`
- Publicar exige username definitivo (não `user-*`), displayName e ≥ 1 bloco visível

(Isso já parece implementado — só fechar a documentação.)

## P1 — Publish sem blocos

POST /me/profile/publish com profile ok mas `blocks: []` retorna **400** (esperado).
Mensagem de erro precisa ser clara no `error.message` (ex.: "Adicione pelo menos um bloco visível").

### Pedido
Confirmar mensagem amigável em português no envelope `{ error: { code, message } }`.

## P2 — Recomendações (não bloqueantes)

1. **Cookies CORS**: confirmar `SameSite=None` ou `Lax` + `CORS_ORIGIN=http://localhost:3000` com `credentials: true` (FE já usa credentials include).
2. **Access token curto (~15min)**: FE faz retry via POST /auth/refresh em 401. Garantir que refresh por cookie `pp_refresh_token` funcione cross-origin localhost:3000 → :3333.
3. **Agregação pública**: na GET /p/:username, se houver bloco HERO com `content.name`, preferir isso (ou garantir paridade com `displayName` do profile). O FE faz sync HERO → profile no autosave, mas a página pública deve ser consistente se só um lado for atualizado.
4. **Register**: profile já vem com `displayName` = name do user — ótimo. Manter.

## Como validar (checklist BE)

```bash
# health
curl http://localhost:3333/health

# seed demo
curl -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"maria@demo.com","password":"Demo1234!"}'
# expect 200

curl http://localhost:3333/p/maria-oliveira
# expect 200

# fluxo novo usuário
# register → PUT username → POST block HERO → POST publish → GET /p/:username
```

## Fora de escopo
Não alterar o envelope `{ data, error }`. Não mudar paths públicos `/p/:username`.
```

---

## Notas do QA FE (já contornadas no frontend)

| Item | Status FE |
|------|-----------|
| Loading eterno editor/dashboard | Corrigido (erro + retry) |
| Logout em erro não-401 | Corrigido |
| Autosave loop | Corrigido |
| Sync HERO → displayName | Corrigido |
| Bio / mapsUrl no preview | Corrigido |
| Refresh 401 | FE tenta `/auth/refresh` 1x |
| Seed demo | **Depende do BE** — ver P0 acima |

Fluxo validado na API (sem seed): register → update username → create HERO → publish → GET /p/:username = **200**.
