# Solid Masterclass API

Workshop em Node.js + TypeScript para praticar os princípios **SOLID**
criando um usuário, salvando no Postgres e avisando por e-mail, SMS ou WhatsApp.

Feito para quem está começando: o código é propositalmente pequeno.
Cada pasta tem um motivo.

## O que você aprende

| Princípio | Onde ver no código |
|---|---|
| **S** — uma responsabilidade | `CreateUser` só cadastra. `api.ts` só fala HTTP. |
| **O** — aberto para extensão | Canal novo = nova classe em `NotifierGateway.ts` + um `case` na factory. |
| **L** — substituível | E-mail, SMS e WhatsApp implementam a mesma interface e se comportam igual. |
| **I** — interface pequena | `UserRepository` só tem `create` e `findByEmail`. |
| **D** — depender de abstração | `CreateUser` recebe interfaces. Drizzle e bcrypt ficam em `resources/`. |

## Stack

- Fastify + Zod (HTTP e validação)
- Drizzle + PostgreSQL (banco)
- Vitest (testes)
- Docker Compose (Postgres local)

## Como rodar

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm db:migrate
pnpm test
pnpm dev
```

- API: http://localhost:8080
- Docs: http://localhost:8080/docs

Exemplo de cadastro:

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

## Arquitetura

```
src/
  application/                 # regras de negócio (não conhece Fastify nem Drizzle)
    entities/User.ts
    errors/
    use-cases/CreateUser.ts    # S — caso de uso
    repositories/              # D — interface do banco
    services/                  # D — interface do hash
    notifiers/                 # O, L, I — interfaces de notificação
  resources/                   # implementações concretas (infra)
    api.ts
    DrizzleUserRepository.ts
    BcryptPasswordHasher.ts
    NotifierGateway.ts
    NotifierStrategyFactory.ts
  db/
```

A seta de dependência aponta para dentro:

```
api.ts  →  CreateUser  →  interfaces
                ↑
         resources implementam
```

## Como estender (exercício)

Para adicionar o canal **Telegram**:

1. Criar `TelegramNotifierStrategy implements NotifierStrategy`
2. Registrar um `case "telegram"` em `NotifierStrategyFactory`
3. Incluir `"telegram"` no enum do Zod em `api.ts`

O `CreateUser` **não muda**. Esse é o O do SOLID.

## Testes

- `src/application/use-cases/CreateUser.test.ts` — unitário, sem banco.
  Usa repositório, hasher e notifier falsos. É assim que o D fica testável.
- `src/resources/NotifierGateway.test.ts` — as 3 strategies são substituíveis.
- `src/api.test.ts` — integração HTTP + Postgres. Precisa do Docker ligado.

```bash
pnpm test          # todos
pnpm test:watch    # enquanto você edita
```

## O que ficou de fora de propósito

- autenticação / JWT
- envio real de e-mail ou SMS (aqui só tem `console.log`)
- CRUD completo de usuário
- filas, cache, clean architecture pesada

O objetivo é enxergar o SOLID, não montar um produto.
