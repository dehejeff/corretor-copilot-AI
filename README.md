# Corretor Copilot AI

MVP SaaS mobile-first para corretores imobiliarios gerenciarem leads, classificarem oportunidades, criarem follow-ups com IA e abrirem o WhatsApp com mensagem pronta.

## Stack

- Next.js 16 com App Router
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Postgres + RLS
- Route Handlers + Server Actions
- OpenAI configuravel por variavel de ambiente
- Deploy pronto para Vercel

## Setup

1. Copie `.env.example` para `.env.local`.
2. Preencha as variaveis do Supabase, OpenAI e cron secret.
3. Rode a migracao SQL em `supabase/migrations/001_initial_schema.sql`.
4. Instale dependencias com `npm install`.
5. Suba o projeto com `npm run dev`.

## Variaveis esperadas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## MVP entregue

- Autenticacao com login, cadastro e logout
- Layout principal protegido
- Dashboard com metricas do funil
- CRUD de leads
- Importacao de CSV/Excel
- Scoring e classificacao automatica
- Pagina de detalhe do lead
- Geracao de mensagens com IA
- Botao `wa.me` para WhatsApp
- Tarefas do dia
- Motor de automacao no backend
- Endpoint protegido de cron
- Kanban com drag and drop simples

## Rotas principais

- `/dashboard`
- `/leads`
- `/leads/new`
- `/leads/[id]`
- `/import`
- `/tasks`
- `/kanban`

## Observacoes

- O MVP nao dispara mensagens automaticamente pelo WhatsApp.
- A arquitetura ja deixa o backend preparado para futura integracao com WhatsApp Cloud API.
- Quando `OPENAI_API_KEY` nao estiver configurada, o sistema usa templates fallback para nao bloquear o fluxo comercial.
