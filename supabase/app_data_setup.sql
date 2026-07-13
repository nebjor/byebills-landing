-- ============================================================================
-- byeBills — mobile app data (transactions + hustles) in Supabase
-- Run once in Supabase (SQL editor). Safe to re-run (idempotent).
--
-- These are the MOBILE app's tables (simple shape matching the RN app). They are
-- separate from the v1 web app's richer `transactions`/`businesses` tables.
--
-- Ownership model: the user owns their own rows and may CRUD them directly.
-- RLS restricts every operation to auth.uid() = user_id, so the client can read
-- and write only its own data. Rows are keyed by (user_id, client_id) where
-- client_id is the id the app already generates.
-- ============================================================================

create table if not exists public.app_hustles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,               -- client id ("free", or a timestamp)
  name       text not null,
  color      text not null default '#15A95E',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.app_transactions (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,               -- client id (String(Date.now()))
  title      text not null default '',
  meta       text not null default '',
  amount     numeric not null default 0,  -- + income, - expense
  status     text not null default 'pending',
  hustle_id  text not null default 'free',
  date       date not null,
  image_uri  text,                        -- device-local path for now (see note)
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists app_transactions_user_date_idx
  on public.app_transactions (user_id, date desc);

alter table public.app_hustles      enable row level security;
alter table public.app_transactions enable row level security;

-- Owner can do everything to their own rows; nothing to anyone else's.
drop policy if exists "own hustles" on public.app_hustles;
create policy "own hustles" on public.app_hustles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own transactions" on public.app_transactions;
create policy "own transactions" on public.app_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- NOTE: image_uri is a device-local file path today, so receipt photos don't yet
-- travel across devices. Cross-device images need Supabase Storage upload — a
-- follow-up: upload the file on save, store the storage path here, download on pull.
