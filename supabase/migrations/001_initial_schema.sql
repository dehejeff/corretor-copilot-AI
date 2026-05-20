create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text not null unique,
  phone text,
  company_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  source text not null default 'Manual',
  neighborhood text,
  property_type text,
  price_range text,
  down_payment numeric,
  income_range text,
  financing_interest boolean not null default false,
  credit_approved boolean not null default false,
  fgts boolean not null default false,
  purchase_timeline text,
  requested_visit boolean not null default false,
  researching_only boolean not null default false,
  contact_attempts integer not null default 0,
  notes text,
  score integer not null default 0,
  temperature text not null default 'Frio',
  status text not null default 'Novo lead',
  incomplete_data boolean not null default false,
  last_contact_at timestamptz,
  last_inbound_at timestamptz,
  next_followup_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  channel text not null default 'whatsapp',
  message text not null,
  status text not null default 'gerada',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  task_type text not null,
  due_date timestamptz not null,
  status text not null default 'open',
  suggested_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete cascade,
  automation_type text not null,
  result text not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_temperature_idx on public.leads (temperature);
create index if not exists tasks_user_id_status_idx on public.tasks (user_id, status);
create index if not exists interactions_lead_id_idx on public.interactions (lead_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.interactions enable row level security;
alter table public.tasks enable row level security;
alter table public.automation_logs enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "leads_own_all" on public.leads
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "interactions_own_all" on public.interactions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tasks_own_all" on public.tasks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "automation_logs_own_all" on public.automation_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
