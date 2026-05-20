create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  channel text not null default 'whatsapp',
  provider text not null default 'whatsapp_cloud_api',
  provider_chat_id text,
  last_message_at timestamptz,
  last_inbound_at timestamptz,
  last_outbound_at timestamptz,
  unread_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, channel)
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null default 'whatsapp',
  provider_message_id text,
  provider_status text not null default 'received',
  message_type text not null default 'text',
  text_content text,
  media_url text,
  metadata_json jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider_message_id)
);

create table if not exists public.conversation_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  goal text,
  input_context text,
  suggested_message text not null,
  edited_message text,
  was_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists conversations_user_id_idx on public.conversations (user_id);
create index if not exists conversations_lead_id_idx on public.conversations (lead_id);
create index if not exists conversation_messages_conversation_id_idx on public.conversation_messages (conversation_id, created_at desc);
create index if not exists conversation_messages_lead_id_idx on public.conversation_messages (lead_id);
create index if not exists conversation_messages_user_id_idx on public.conversation_messages (user_id);
create index if not exists conversation_ai_suggestions_conversation_id_idx on public.conversation_ai_suggestions (conversation_id, created_at desc);

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.conversation_ai_suggestions enable row level security;

create policy "conversations_own_all" on public.conversations
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "conversation_messages_own_all" on public.conversation_messages
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "conversation_ai_suggestions_own_all" on public.conversation_ai_suggestions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
