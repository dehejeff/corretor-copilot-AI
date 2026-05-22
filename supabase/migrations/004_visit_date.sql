alter table public.leads
add column if not exists visit_date timestamptz;
