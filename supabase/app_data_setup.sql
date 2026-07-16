-- ============================================================================
-- byeBills — mobile app data (transactions + hustles + receipt images)
-- Run once in Supabase (SQL editor). Safe to re-run (idempotent).
--
-- These are the MOBILE app's tables (simple shape matching the RN app), separate
-- from the v1 web app's richer `transactions`/`businesses` tables.
--
-- Ownership: users CRUD only their own rows (RLS on auth.uid() = user_id).
-- Receipt photos live in a private Storage bucket, one folder per user, and the
-- transaction row stores the object PATH (not a device-local file path), so the
-- image travels across devices via short-lived signed URLs.
-- ============================================================================

create table if not exists public.app_hustles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,
  name       text not null,
  color      text not null default '#15A95E',
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.app_transactions (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,
  title      text not null default '',
  meta       text not null default '',
  amount     numeric not null default 0,
  status     text not null default 'pending',
  hustle_id  text not null default 'free',
  date       date not null,
  image_path text,                        -- storage object path: <user_id>/<txid>.jpg
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists app_transactions_user_date_idx
  on public.app_transactions (user_id, date desc);

alter table public.app_hustles      enable row level security;
alter table public.app_transactions enable row level security;

drop policy if exists "own hustles" on public.app_hustles;
create policy "own hustles" on public.app_hustles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own transactions" on public.app_transactions;
create policy "own transactions" on public.app_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- Receipt image storage -------------------------------------------------
-- Private bucket; files stored at "<user_id>/<transaction_id>.jpg".
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Users may only touch objects inside their own folder (first path segment).
drop policy if exists "receipts read own"   on storage.objects;
drop policy if exists "receipts insert own" on storage.objects;
drop policy if exists "receipts update own" on storage.objects;
drop policy if exists "receipts delete own" on storage.objects;

create policy "receipts read own" on storage.objects
  for select using (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "receipts insert own" on storage.objects
  for insert with check (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "receipts update own" on storage.objects
  for update using (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "receipts delete own" on storage.objects
  for delete using (
    bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text
  );
