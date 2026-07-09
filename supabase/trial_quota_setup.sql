-- ============================================================================
-- byeBills — server-owned trial + hard daily scan cap
-- Run once in Supabase (SQL editor). Safe to re-run (idempotent).
-- SUPERSEDES quota_setup.sql and quota_pro_bypass.sql (pre-launch: we drop and
-- recreate the usage table since the period changed from monthly to daily).
--
-- Security model:
--   * Trial + usage live ONLY in Supabase, keyed to auth.uid() (the verified JWT).
--   * Clients get READ-ONLY access via RLS. They cannot INSERT/UPDATE/DELETE.
--   * All mutation happens inside SECURITY DEFINER functions, which run as the
--     table owner and bypass RLS. The client cannot pass a user_id or dates —
--     identity comes from auth.uid(). So the trial cannot be faked or reset.
--   * A signup trigger starts the 7-day trial at account creation.
--
-- Caps (hard limits — protect the Gemini bill):
--   TRIAL: 7 days, max 30 scans / day
--   PRO:   max 200 scans / day (safety ceiling; ~$0.40/day worst case)
--   EXPIRED (trial over, not pro): 0 scans
-- ============================================================================

-- ---- clean up the old monthly model (pre-launch only) ----------------------
drop function if exists public.consume_extraction();
drop function if exists public.refund_extraction();
drop table if exists public.extraction_usage cascade;

-- ---- entitlement (plan + trial clock), one row per user --------------------
create table if not exists public.user_entitlements (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  plan             text not null default 'trial',   -- 'trial' | 'pro'
  trial_started_at timestamptz not null default now(),
  valid_until      timestamptz,                      -- pro period end (from RevenueCat webhook)
  daily_cap        int,                              -- optional per-user override; null => plan default
  created_at       timestamptz not null default now()
);
alter table public.user_entitlements enable row level security;

drop policy if exists "read own entitlement" on public.user_entitlements;
create policy "read own entitlement" on public.user_entitlements
  for select using (auth.uid() = user_id);
-- (no insert/update/delete policies => clients can never write it)

-- ---- daily usage counter, one row per user per UTC day ---------------------
create table if not exists public.extraction_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  used    int  not null default 0,
  primary key (user_id, day)
);
alter table public.extraction_usage enable row level security;

drop policy if exists "read own usage" on public.extraction_usage;
create policy "read own usage" on public.extraction_usage
  for select using (auth.uid() = user_id);

-- ---- start the trial at signup (server-side, immutable by client) ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_entitlements (user_id, plan, trial_started_at)
  values (new.id, 'trial', now())
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- consume_extraction(): atomically reserve ONE scan for the calling user.
-- Returns allowed / used-today / cap / reason.
--   reason when blocked: 'daily_cap' | 'trial_ended'
--   reason when allowed: the status ('trial' | 'pro')
-- The UPDATE ... WHERE used < cap guard makes check-and-increment atomic, so
-- concurrent requests can never exceed the cap.
-- ----------------------------------------------------------------------------
create or replace function public.consume_extraction()
returns table (allowed boolean, used int, cap int, reason text)
language plpgsql security definer set search_path = public as $$
declare
  v_user        uuid := auth.uid();
  v_today       date := (now() at time zone 'utc')::date;
  v_plan        text;
  v_trial_start timestamptz;
  v_valid       timestamptz;
  v_override    int;
  v_status      text;
  v_cap         int;
  v_used        int;
  TRIAL_DAYS  constant int := 7;
  TRIAL_DAILY constant int := 30;
  PRO_DAILY   constant int := 200;
begin
  if v_user is null then raise exception 'not authenticated'; end if;

  -- Ensure a row exists (covers users created before the trigger existed).
  insert into public.user_entitlements (user_id, plan, trial_started_at)
  values (v_user, 'trial', now())
  on conflict (user_id) do nothing;

  select plan, trial_started_at, valid_until, daily_cap
    into v_plan, v_trial_start, v_valid, v_override
  from public.user_entitlements where user_id = v_user;

  if v_plan = 'pro' and (v_valid is null or v_valid > now()) then
    v_status := 'pro';
    v_cap := coalesce(v_override, PRO_DAILY);
  elsif v_trial_start is not null
        and now() < v_trial_start + (TRIAL_DAYS || ' days')::interval then
    v_status := 'trial';
    v_cap := coalesce(v_override, TRIAL_DAILY);
  else
    v_status := 'expired';
    v_cap := 0;
  end if;

  if v_cap <= 0 then
    select coalesce(used, 0) into v_used
    from public.extraction_usage where user_id = v_user and day = v_today;
    return query select false, coalesce(v_used, 0), 0, 'trial_ended';
    return;
  end if;

  insert into public.extraction_usage (user_id, day, used)
  values (v_user, v_today, 0)
  on conflict (user_id, day) do nothing;

  update public.extraction_usage
     set used = used + 1
   where user_id = v_user and day = v_today and used < v_cap
  returning used into v_used;

  if v_used is null then
    select used into v_used
    from public.extraction_usage where user_id = v_user and day = v_today;
    return query select false, coalesce(v_used, v_cap), v_cap, 'daily_cap';
  else
    return query select true, v_used, v_cap, v_status;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- extraction_status(): READ-ONLY. "Am I on trial? How many left today?"
-- The client uses this for UI; it never mutates anything.
-- ----------------------------------------------------------------------------
create or replace function public.extraction_status()
returns table (status text, trial_days_left int, used_today int, daily_cap int, remaining_today int)
language plpgsql security definer set search_path = public as $$
declare
  v_user        uuid := auth.uid();
  v_today       date := (now() at time zone 'utc')::date;
  v_plan        text;
  v_trial_start timestamptz;
  v_valid       timestamptz;
  v_override    int;
  v_status      text;
  v_cap         int;
  v_used        int;
  v_left        int;
  TRIAL_DAYS  constant int := 7;
  TRIAL_DAILY constant int := 30;
  PRO_DAILY   constant int := 200;
begin
  if v_user is null then raise exception 'not authenticated'; end if;

  select plan, trial_started_at, valid_until, daily_cap
    into v_plan, v_trial_start, v_valid, v_override
  from public.user_entitlements where user_id = v_user;

  if v_plan is null then
    -- No row yet (trigger not run): treat as a fresh trial.
    return query select 'trial'::text, TRIAL_DAYS, 0, TRIAL_DAILY, TRIAL_DAILY;
    return;
  end if;

  if v_plan = 'pro' and (v_valid is null or v_valid > now()) then
    v_status := 'pro'; v_cap := coalesce(v_override, PRO_DAILY); v_left := 0;
  elsif v_trial_start is not null
        and now() < v_trial_start + (TRIAL_DAYS || ' days')::interval then
    v_status := 'trial'; v_cap := coalesce(v_override, TRIAL_DAILY);
    v_left := greatest(0, ceil(
      extract(epoch from (v_trial_start + (TRIAL_DAYS || ' days')::interval - now())) / 86400.0
    )::int);
  else
    v_status := 'expired'; v_cap := 0; v_left := 0;
  end if;

  select coalesce(used, 0) into v_used
  from public.extraction_usage where user_id = v_user and day = v_today;
  v_used := coalesce(v_used, 0);

  return query select v_status, v_left, v_used, v_cap, greatest(0, v_cap - v_used);
end;
$$;

-- ---- refund one unit if the LLM call fails after we reserved it -------------
create or replace function public.refund_extraction()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_user  uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
begin
  if v_user is null then return; end if;
  update public.extraction_usage
     set used = greatest(0, used - 1)
   where user_id = v_user and day = v_today;
end;
$$;

-- ---- only authenticated users may call the functions -----------------------
grant execute on function public.consume_extraction() to authenticated;
grant execute on function public.extraction_status()  to authenticated;
grant execute on function public.refund_extraction()  to authenticated;
