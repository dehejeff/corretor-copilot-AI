alter table public.leads
add column if not exists analysis_returned_at timestamptz,
add column if not exists analysis_eligibility text,
add column if not exists approved_financing_amount numeric,
add column if not exists analysis_notes text;
