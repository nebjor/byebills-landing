-- ============================================================================
-- byeBills — extraction quota setup
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run (idempotent).
-- ============================================================================

-- Monthly usage counter, one row per user per UTC month ('YYYY-MM').
create table if not exists public.extraction_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  period  text not null,
  used    int  not null default 0,
  primary key (user_id, period)
);

alter table public.extraction_usage enable row level security;

-- Users may READ their own usage (to show "scans left"). They may never write
-- it directly — only the SECURITY DEFINER functions below mutate it.
drop policy if exists "read own usage" on public.extraction_usage;
create policy "read own usage" on public.extraction_usage
  for select using (auth.uid() = user_id);

-- Optional per-user plan / quota. Defaults to the free tier (5 / month).
create table if not exists public.user_entitlements (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  plan          text not null default 'free',
  monthly_quota int  not null default 5,
  valid_until   timestamptz
);

alter table public.user_entitlements enable row level security;

drop policy if exists "read own entitlement" on public.user_entitlements;
create policy "read own entitlement" on public.user_entitlements
  for select using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- consume_extraction(): atomically reserve ONE scan for the calling user.
-- Returns allowed/used/quota. The UPDATE ... WHERE used < quota guard makes the
-- check-and-increment atomic, so concurrent requests can't exceed the cap.
-- Identity comes from auth.uid() (the verified JWT) — a client cannot consume
-- on behalf of another user.
-- ----------------------------------------------------------------------------
create or replace function public.consume_extraction()
returns table (allowed boolean, used int, quota int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid := auth.uid();
  v_period text := to_char((now() at time zone 'utc'), 'YYYY-MM');
  v_quota  int;
  v_used   int;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select coalesce(e.monthly_quota, 5) into v_quota
  from public.user_entitlements e
  where e.user_id = v_user;
  if v_quota is null then v_quota := 5; end if;

  insert into public.extraction_usage (user_id, period, used)
  values (v_user, v_period, 0)
  on conflict (user_id, period) do nothing;

  update public.extraction_usage
     set used = used + 1
   where user_id = v_user and period = v_period and used < v_quota
  returning used into v_used;

  if v_used is null then
    select eu.used into v_used
    from public.extraction_usage eu
    where eu.user_id = v_user and eu.period = v_period;
    return query select false, coalesce(v_used, v_quota), v_quota;
  else
    return query select true, v_used, v_quota;
  end if;
end;
$$;

-- Refund one unit if the LLM call fails after we reserved it.
create or replace function public.refund_extraction()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user   uuid := auth.uid();
  v_period text := to_char((now() at time zone 'utc'), 'YYYY-MM');
begin
  if v_user is null then return; end if;
  update public.extraction_usage
     set used = greatest(0, used - 1)
   where user_id = v_user and period = v_period;
end;
$$;
