# WhatsApp Copilot

Documento interno para a evolucao do `Corretor Copilot AI` rumo a uma inbox real de WhatsApp com contexto de conversa e sugestoes de resposta por IA.

## Objetivo

Transformar o sistema em um copilot de atendimento para o corretor, permitindo:

- receber mensagens reais do lead via WhatsApp Cloud API
- exibir a conversa completa dentro do lead
- sugerir respostas com IA com base no contexto acumulado
- permitir que o corretor envie a sugestao como esta ou adapte antes de responder
- identificar sinais comerciais automaticamente, como pedido de visita, objecao de preco ou interesse em financiamento

## Visao do produto

Fluxo desejado:

1. O lead envia mensagem para o numero oficial conectado ao WhatsApp Cloud API.
2. A Meta envia um webhook para o backend do sistema.
3. O sistema salva a mensagem no banco e associa ao lead correto.
4. A tela do lead mostra a linha do tempo completa da conversa.
5. A IA le o historico recente e sugere a proxima melhor resposta.
6. O corretor revisa, adapta se quiser e envia.
7. O sistema registra envio, entrega, leitura e atualiza score, temperatura e tarefas quando fizer sentido.

## Regra importante de historico

O historico confiavel da conversa deve ser construido a partir da ativacao da integracao.

Em outras palavras:

- mensagens recebidas e enviadas apos a integracao podem ser registradas normalmente
- conversas antigas que aconteceram fora do sistema nao devem ser consideradas historico garantido do CRM

Por isso, a inbox do CRM deve virar o ponto central de acompanhamento para que o copilot funcione bem.

## Status atual

Ja implementado no projeto:

- schema de `conversations`, `conversation_messages` e `conversation_ai_suggestions`
- endpoint `GET/POST /api/whatsapp/webhook`
- endpoint `POST /api/whatsapp/send`
- endpoint `POST /api/ai/conversation-suggestion`
- aba `Conversa` no detalhe do lead
- timeline de mensagens recebidas e enviadas
- sugestao de resposta por IA baseada no historico
- estrutura para mensagens de audio recebidas

Ainda depende de configuracao externa:

- variaveis `WHATSAPP_*`
- webhook publicado em HTTPS
- numero e app do WhatsApp Cloud API configurados na Meta

## Fase 1 recomendada

Primeira entrega funcional:

- receber mensagens de entrada por webhook
- salvar mensagens enviadas e recebidas
- criar aba `Conversa` no detalhe do lead
- mostrar linha do tempo da conversa
- sugerir resposta com IA com base no historico
- permitir edicao manual antes do envio
- registrar status de envio, entrega e leitura

## Fase 2 recomendada

Segunda entrega:

- resumir automaticamente a conversa
- detectar intencao comercial
- sugerir proximo passo
- criar tarefas automaticas a partir da conversa
- gerar alerta de lead quente ou risco de abandono
- classificar tags como `quer visitar`, `quer financiamento`, `objecao preco`, `sem resposta`

## Arquitetura proposta

### 1. Entrada de mensagens

Criar webhook oficial:

- `GET /api/whatsapp/webhook`
  - validacao do webhook da Meta
- `POST /api/whatsapp/webhook`
  - recebimento de mensagens
  - recebimento de status de mensagens
  - persistencia em banco

### 2. Saida de mensagens

Criar endpoint interno para envio:

- `POST /api/whatsapp/send`

Responsabilidades:

- validar se o lead pertence ao usuario logado
- montar payload para a Cloud API
- enviar mensagem
- registrar no banco com status inicial
- salvar o id da mensagem no provider para reconciliar entrega e leitura

### 3. Camada de IA

Criar endpoint:

- `POST /api/ai/conversation-suggestion`

Entrada:

- `leadId`
- `conversationWindow`
- `goal`
- `draftInstruction`

Saida:

- `suggestedReply`
- `reasoningSummary`
- `detectedSignals`

Uso:

- responder com base no contexto recente
- manter tom consultivo e humano
- adaptar ao perfil do corretor e do lead

## Banco de dados proposto

Adicionar estrutura dedicada para conversas.

### conversations

- `id`
- `user_id`
- `lead_id`
- `channel`
- `provider`
- `provider_chat_id`
- `last_message_at`
- `last_inbound_at`
- `last_outbound_at`
- `unread_count`
- `created_at`
- `updated_at`

### conversation_messages

- `id`
- `conversation_id`
- `lead_id`
- `user_id`
- `direction`
- `channel`
- `provider_message_id`
- `provider_status`
- `message_type`
- `text_content`
- `media_url`
- `metadata_json`
- `sent_at`
- `delivered_at`
- `read_at`
- `created_at`

### conversation_ai_suggestions

- `id`
- `conversation_id`
- `lead_id`
- `user_id`
- `goal`
- `input_context`
- `suggested_message`
- `edited_message`
- `was_sent`
- `created_at`

## Relacao com tabelas atuais

As tabelas atuais continuam uteis:

- `leads`
  - continua sendo a entidade central comercial
- `interactions`
  - pode continuar registrando eventos resumidos de alto nivel
- `tasks`
  - continua sendo usada para follow-up e proximas acoes

Regra sugerida:

- `conversation_messages` guarda a mensagem bruta e detalhada
- `interactions` guarda eventos resumidos importantes

Exemplos:

- mensagem recebida de objecao relevante
- resposta enviada via IA
- convite para visita enviado
- pedido de simulacao identificado

## Regras de negocio

Quando uma nova mensagem chegar:

- localizar o lead pelo telefone normalizado
- se nao existir lead, opcionalmente criar lead com origem `WhatsApp`
- atualizar `last_inbound_at`
- atualizar `last_contact_at`
- adicionar mensagem em `conversation_messages`
- registrar evento relevante em `interactions` quando necessario
- recalcular score se a mensagem trouxer novos sinais
- atualizar `temperature`
- criar tarefa se a IA identificar proxima acao clara

Quando o corretor enviar uma mensagem:

- salvar mensagem como `outbound`
- enviar pela Cloud API
- registrar `provider_message_id`
- acompanhar `sent`, `delivered`, `read`

## IA no contexto da conversa

A IA deve ler:

- ultimas mensagens da conversa
- score e temperatura do lead
- status do pipeline
- dados cadastrais do lead
- historico resumido relevante

Com isso, ela pode sugerir:

- primeira resposta
- follow-up contextual
- resposta a objecao
- convite para visita
- pedido de simulacao
- retomada de conversa

## UX proposta

Nova aba no detalhe do lead:

- `Conversa`

Elementos:

- timeline de mensagens
- composer para responder
- botao `Sugerir resposta com IA`
- variacoes de resposta
- botao `Usar sugestao`
- botao `Editar antes de enviar`
- status `enviado`, `entregue`, `lido`
- resumo da conversa
- sinais detectados pela IA

## Seguranca

Garantir:

- validacao de assinatura do webhook da Meta
- usuario acessa apenas conversas dos proprios leads
- tokens do WhatsApp ficam apenas no backend
- logs mascaram dados sensiveis quando necessario
- tratamento de duplicidade de webhook por `provider_message_id`

## Variaveis de ambiente futuras

Adicionar quando essa fase comecar:

```env
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
```

## Ordem recomendada de implementacao

1. Criar schema de conversas e mensagens.
2. Criar webhook de entrada e persistencia.
3. Criar envio de mensagem via backend.
4. Criar aba `Conversa` no detalhe do lead.
5. Criar endpoint de sugestao de resposta com IA.
6. Atualizar score, temperatura e tarefas com base nas conversas.
7. Adicionar indicadores de entrega, leitura e mensagens nao respondidas.

## Resultado esperado

Quando essa evolucao estiver pronta, o corretor podera:

- abrir um lead
- ver a conversa completa
- entender o contexto rapidamente
- pedir uma sugestao de resposta para a IA
- editar se quiser
- responder dali mesmo
- acompanhar andamento da conversa
- transformar o CRM em uma central real de atendimento comercial
