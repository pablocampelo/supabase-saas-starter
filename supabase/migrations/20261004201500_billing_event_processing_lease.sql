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

  update public.billing_event_receipts
  set
    status = 'processing',
    failure_code = null,
    processed_at = null,
    received_at = now()
  where stripe_event_id = p_event_id
    and (
      status = 'failed'
      or (
        status = 'processing'
        and received_at < now() - interval '5 minutes'
      )
    );

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

  return 'busy';
end;
$$;

revoke all on function public.claim_billing_event(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_billing_event(text, text, timestamptz) to service_role;

comment on function public.claim_billing_event(text, text, timestamptz) is
  'Claims a Stripe event idempotently. Failed deliveries and processing leases older than five minutes are reclaimable for crash recovery.';
