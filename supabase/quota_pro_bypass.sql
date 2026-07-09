-- ============================================================================
-- byeBills — Pro bypass for the extraction quota
-- Run AFTER quota_setup.sql. Safe to re-run (idempotent).
--
-- Pro users (plan = 'pro' with a non-expired entitlement) get UNLIMITED scans:
-- consume_extraction() still records usage (useful for analytics) but never
-- blocks. Free users keep the 5/month hard cap from quota_setup.sql.
--
-- RevenueCat should upsert public.user_entitlements on purchase/renewal/cancel
-- (via webhook): plan = 'pro' | 'free', valid_until = current period end.
-- ============================================================================

create or replace function public.consume_extraction()
returns table (allowed boolean, used int, quota int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_period   text := to_char((now() at time zone 'utc'), 'YYYY-MM');
  v_quota    int;
  v_used     int;
  v_plan     text;
  v_valid    timestamptz;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select e.plan, coalesce(e.monthly_quota, 5), e.valid_until
    into v_plan, v_quota, v_valid
  from public.user_entitlements e
  where e.user_id = v_user;
  if v_quota is null then v_quota := 5; end if;

  -- Ensure a usage row exists for this period.
  insert into public.extraction_usage (user_id, period, used)
  values (v_user, v_period, 0)
  on conflict (user_id, period) do nothing;

  -- Pro + not expired -> unlimited: count usage but always allow.
  if v_plan = 'pro' and (v_valid is null or v_valid > now()) then
    update public.extraction_usage
       set used = used + 1
     where user_id = v_user and period = v_period
    returning used into v_used;
    return query select true, coalesce(v_used, 0), 2147483647;
    return;
  end if;

  -- Free tier: atomic check-and-increment against the cap.
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
