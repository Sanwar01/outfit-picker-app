-- Phase 1 entitlements: plan column + usage counters + atomic consume RPC

alter table public.profiles
  add column if not exists plan text not null default 'free';

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('free', 'pro', 'family'));

create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meter text not null,
  period_key text not null,
  count int not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, meter, period_key)
);

create index if not exists usage_counters_user_meter_idx
  on public.usage_counters (user_id, meter);

alter table public.usage_counters enable row level security;

drop policy if exists "usage_counters_select_own" on public.usage_counters;
create policy "usage_counters_select_own"
  on public.usage_counters
  for select
  using (auth.uid() = user_id);

-- Atomic consume: increments if under limit; returns { ok, count }
create or replace function public.try_consume_usage(
  p_user_id uuid,
  p_meter text,
  p_period_key text,
  p_limit int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
  current_count int;
begin
  if p_limit is null or p_limit < 0 then
    return jsonb_build_object('ok', false, 'count', 0);
  end if;

  -- Unlimited sentinel from app: very large limit
  insert into public.usage_counters (user_id, meter, period_key, count, updated_at)
  values (p_user_id, p_meter, p_period_key, 1, now())
  on conflict (user_id, meter, period_key)
  do update set
    count = usage_counters.count + 1,
    updated_at = now()
  where usage_counters.count < p_limit
  returning usage_counters.count into new_count;

  if new_count is not null then
    return jsonb_build_object('ok', true, 'count', new_count);
  end if;

  select uc.count into current_count
  from public.usage_counters uc
  where uc.user_id = p_user_id
    and uc.meter = p_meter
    and uc.period_key = p_period_key;

  return jsonb_build_object(
    'ok', false,
    'count', coalesce(current_count, p_limit)
  );
end;
$$;

revoke all on function public.try_consume_usage(uuid, text, text, int) from public;
grant execute on function public.try_consume_usage(uuid, text, text, int) to service_role;
