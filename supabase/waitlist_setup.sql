-- byeBills waitlist. Run once in the Supabase SQL editor.
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text,
  source     text default 'landing',
  created_at timestamptz not null default now()
);

-- RLS on; only the server (service role) writes to it. No public read/write.
alter table public.waitlist enable row level security;
