alter table public.billing_projection
  add column cancel_at_period_end boolean not null default false;

create or replace function public.claim_billing_event(
  p_event_id text,
  p_event_type text,
  p_event_created_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status text;
begin
  insert into public.billing_event_receipts (
    stripe_event_id,
    stripe_event_type,
    stripe_created_at,
    status
  ) values (
    p_event_id,
    p_event_type,
    p_event_created_at,
    'processing'
  )
  on conflict (stripe_event_id) do nothing;

  if found then
    return 'claimed';
  end if;

  select status
  into current_status
  from public.billing_event_receipts
  where stripe_event_id = p_event_id;

  if current_status in ('processed', 'ignored') then
    return 'duplicate';
  end if;

  if current_status = 'failed' then
    update public.billing_event_receipts
    set
      status = 'processing',
      failure_code = null,
      processed_at = null,
      received_at = now()
    where stripe_event_id = p_event_id;

    return 'claimed';
  end if;

  return 'busy';
end;
$$;

revoke all on function public.claim_billing_event(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_billing_event(text, text, timestamptz) to service_role;

create or replace function public.finish_billing_event(
  p_event_id text,
  p_status text,
  p_failure_code text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('processed', 'ignored', 'failed') then
    raise exception 'invalid billing event terminal status';
  end if;

  update public.billing_event_receipts
  set
    status = p_status,
    failure_code = p_failure_code,
    processed_at = now()
  where stripe_event_id = p_event_id
    and status = 'processing';

  if not found then
    raise exception 'billing event is not in processing state';
  end if;
end;
$$;

revoke all on function public.finish_billing_event(text, text, text) from public, anon, authenticated;
grant execute on function public.finish_billing_event(text, text, text) to service_role;

create or replace function public.apply_billing_subscription_state(
  p_user_id uuid,
  p_customer_id text,
  p_subscription_id text,
  p_price_id text,
  p_billing_interval text,
  p_subscription_status text,
  p_cancel_at_period_end boolean,
  p_event_id text,
  p_event_created_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_billing_interval is not null and p_billing_interval not in ('month', 'year') then
    raise exception 'unsupported billing interval';
  end if;

  insert into public.billing_projection (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    billing_interval,
    subscription_status,
    cancel_at_period_end,
    last_stripe_event_id,
    last_stripe_event_created_at,
    projection_version,
    synced_at
  ) values (
    p_user_id,
    p_customer_id,
    p_subscription_id,
    p_price_id,
    p_billing_interval,
    p_subscription_status,
    coalesce(p_cancel_at_period_end, false),
    p_event_id,
    p_event_created_at,
    1,
    now()
  )
  on conflict (user_id) do update
  set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    stripe_price_id = excluded.stripe_price_id,
    billing_interval = excluded.billing_interval,
    subscription_status = excluded.subscription_status,
    cancel_at_period_end = excluded.cancel_at_period_end,
    last_stripe_event_id = excluded.last_stripe_event_id,
    last_stripe_event_created_at = excluded.last_stripe_event_created_at,
    projection_version = public.billing_projection.projection_version + 1,
    synced_at = now()
  where public.billing_projection.last_stripe_event_created_at is null
     or excluded.last_stripe_event_created_at >= public.billing_projection.last_stripe_event_created_at;

  return found;
end;
$$;

revoke all on function public.apply_billing_subscription_state(uuid, text, text, text, text, text, boolean, text, timestamptz) from public, anon, authenticated;
grant execute on function public.apply_billing_subscription_state(uuid, text, text, text, text, text, boolean, text, timestamptz) to service_role;

create or replace function public.apply_paid_invoice_fact(
  p_user_id uuid,
  p_invoice_id text,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_event_id text,
  p_event_created_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_period_end <= p_period_start then
    raise exception 'invalid paid invoice period';
  end if;

  update public.billing_projection
  set
    paid_through = p_period_end,
    last_paid_invoice_id = p_invoice_id,
    last_paid_period_start = p_period_start,
    last_paid_period_end = p_period_end,
    last_stripe_event_id = case
      when last_stripe_event_created_at is null or p_event_created_at >= last_stripe_event_created_at
        then p_event_id
      else last_stripe_event_id
    end,
    last_stripe_event_created_at = case
      when last_stripe_event_created_at is null or p_event_created_at >= last_stripe_event_created_at
        then p_event_created_at
      else last_stripe_event_created_at
    end,
    projection_version = projection_version + 1,
    synced_at = now()
  where user_id = p_user_id
    and (paid_through is null or p_period_end > paid_through);

  return found;
end;
$$;

revoke all on function public.apply_paid_invoice_fact(uuid, text, timestamptz, timestamptz, text, timestamptz) from public, anon, authenticated;
grant execute on function public.apply_paid_invoice_fact(uuid, text, timestamptz, timestamptz, text, timestamptz) to service_role;

create or replace function public.current_billing_plan()
returns table (
  billing_interval text,
  subscription_status text,
  paid_through timestamptz,
  cancel_at_period_end boolean,
  has_current_subscription boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    projection.billing_interval,
    projection.subscription_status,
    projection.paid_through,
    projection.cancel_at_period_end,
    projection.stripe_subscription_id is not null
      and coalesce(projection.subscription_status, '') not in ('canceled', 'incomplete_expired')
  from public.billing_projection as projection
  where projection.user_id = (select auth.uid());
$$;

revoke all on function public.current_billing_plan() from public, anon;
grant execute on function public.current_billing_plan() to authenticated, service_role;

comment on function public.current_billing_plan() is
  'Read-only current-user billing projection for app presentation. Financial writes remain service-role only.';
