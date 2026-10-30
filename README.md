# solid-masterclass-api

[![ci](https://github.com/Ricardoleaom/solid-masterclass-api/actions/workflows/ci.yml/badge.svg)](https://github.com/Ricardoleaom/solid-masterclass-api/actions/workflows/ci.yml)

Fiz este workshop pra praticar SOLID.
É uma API que cria usuário, salva no Postgres e "notifica" por
e-mail, SMS ou WhatsApp (só um `console.log`, não manda mensagem de verdade).

## Rodar

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:migrate
pnpm test
pnpm dev
```

API: http://localhost:8080
Docs: http://localhost:8080/docs

```bash
curl -X POST http://localhost:8080/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Silva",
    "email": "ana@example.com",
    "age": 25,
    "password": "password123",
    "passwordConfirmation": "password123",
    "marketingChannel": "email"
  }'
```

## SOLID neste repo

- **S:** `CreateUser` não mexe com HTTP. A rota fica no `api.ts`.
- **O:** canal novo (tipo Telegram) = outra strategy + um `case` na factory.
- **L:** e-mail, SMS e WhatsApp implementam a mesma interface e se comportam igual.
- **I:** `UserRepository` só tem `create` e `findByEmail`.
- **D:** `CreateUser` recebe interface, não o Drizzle direto.

O teste do `CreateUser` não precisa de banco. Os da API e do repositório
precisam do Docker ligado. O CI roda tudo a cada push.

O e-mail único quem garante é o banco: se dois cadastros iguais chegam ao
mesmo tempo, o `DrizzleUserRepository` traduz o conflito em
`EmailAlreadyInUseError` e a API devolve 409, não 500.

## Exercício

Pra adicionar Telegram:

1. Criar `TelegramNotifierStrategy implements NotifierStrategy`
2. Colocar um `case "telegram"` em `NotifierStrategyFactory`
3. Incluir `"telegram"` no enum do Zod em `api.ts`

O `CreateUser` não muda. Esse é o O.

## O que eu não fiz de propósito

- autenticação / JWT
- envio real de e-mail ou SMS
- CRUD completo
- fila, cache, clean architecture pesada

Queria ver o SOLID, não montar um produto.
