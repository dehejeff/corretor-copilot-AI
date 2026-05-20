create table if not exists public.call_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  call_started_at timestamptz,
  call_ended_at timestamptz,
  call_result text not null,
  summary text,
  objections text[] not null default '{}',
  next_action text,
  next_followup_at timestamptz,
  lead_temperature_after_call text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists call_notes_user_id_idx on public.call_notes (user_id);
create index if not exists call_notes_lead_id_idx on public.call_notes (lead_id);

alter table public.call_notes enable row level security;

create policy "call_notes_own_all" on public.call_notes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
