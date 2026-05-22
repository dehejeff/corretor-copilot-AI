alter table public.leads
add column if not exists documentation_checklist jsonb not null default '[]'::jsonb;
