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
3. Rode as migracoes SQL em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_call_notes.sql`
   - `supabase/migrations/003_whatsapp_conversations.sql`
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
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_API_VERSION=v21.0
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
- Aba `Conversa` no lead com histórico de mensagens
- Sugestão contextual de resposta por IA baseada no histórico
- Endpoints de webhook e envio para WhatsApp Cloud API
- Estrutura para mensagens de áudio recebidas do lead

## Documentacao interna

- Evolucao da inbox e copilot de conversa via WhatsApp: [docs/whatsapp-copilot.md](docs/whatsapp-copilot.md)

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
- A evolucao planejada de inbox, historico de conversa e sugestao contextual por IA esta descrita em `docs/whatsapp-copilot.md`.
- Para receber e enviar mensagens reais pelo WhatsApp, e necessario configurar as variaveis `WHATSAPP_*` e publicar um webhook HTTPS.
