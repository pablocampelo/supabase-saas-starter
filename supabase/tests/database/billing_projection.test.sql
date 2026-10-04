begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, created_at, updated_at)
values ('44444444-4444-4444-8444-444444444444', 'authenticated', 'authenticated', 'billing@example.test', now(), now());

select ok(
  (select relrowsecurity from pg_class where oid = 'public.billing_checkout_attempts'::regclass),
  'billing checkout attempts have RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.billing_event_receipts'::regclass),
  'billing event receipts have RLS enabled'
);

select ok(
  not has_table_privilege('authenticated', 'public.billing_checkout_attempts', 'SELECT')
  and not has_table_privilege('authenticated', 'public.billing_event_receipts', 'SELECT'),
  'authenticated users cannot read server-owned billing ledgers'
);

select ok(
  not has_function_privilege('authenticated', 'public.claim_billing_event(text,text,timestamptz)', 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.finish_billing_event(text,text,text)', 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.apply_billing_subscription_state(uuid,text,text,text,text,text,boolean,text,timestamptz)', 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.apply_paid_invoice_fact(uuid,text,timestamptz,timestamptz,text,timestamptz)', 'EXECUTE'),
  'authenticated users cannot execute financial write RPCs'
);

select ok(
  has_function_privilege('authenticated', 'public.current_billing_plan()', 'EXECUTE'),
  'authenticated users can read only their current billing presentation'
);

set local role service_role;

select is(
  public.claim_billing_event('evt_test_billing', 'invoice.paid', now()),
  'claimed',
  'first webhook delivery claims the event'
);

select is(
  public.claim_billing_event('evt_test_billing', 'invoice.paid', now()),
  'busy',
  'concurrent duplicate does not process while the first delivery is active'
);

update public.billing_event_receipts
set received_at = now() - interval '6 minutes'
where stripe_event_id = 'evt_test_billing';

select is(
  public.claim_billing_event('evt_test_billing', 'invoice.paid', now()),
  'claimed',
  'stale processing lease is reclaimable after a worker crash'
);

select public.finish_billing_event('evt_test_billing', 'processed', null);

select is(
  public.claim_billing_event('evt_test_billing', 'invoice.paid', now()),
  'duplicate',
  'processed webhook delivery is idempotent'
);

select is(
  public.claim_billing_event('evt_test_failed', 'invoice.paid', now()),
  'claimed',
  'new event can be claimed before a processing failure'
);

select public.finish_billing_event('evt_test_failed', 'failed', 'TEST_FAILURE');

select is(
  public.claim_billing_event('evt_test_failed', 'invoice.paid', now()),
  'claimed',
  'failed webhook delivery is retryable'
);

select public.finish_billing_event('evt_test_failed', 'ignored', null);

select is(
  public.apply_billing_subscription_state(
    '44444444-4444-4444-8444-444444444444',
    'cus_billing_test',
    'sub_billing_test',
    'price_billing_month',
    'month',
    'active',
    false,
    'evt_state_new',
    now()
  ),
  true,
  'service role can establish trusted subscription state'
);

select is(
  public.apply_billing_subscription_state(
    '44444444-4444-4444-8444-444444444444',
    'cus_billing_test',
    'sub_billing_test',
    'price_billing_month',
    'month',
    'canceled',
    false,
    'evt_state_old',
    now() - interval '1 hour'
  ),
  false,
  'older subscription state cannot overwrite a newer projection'
);

select is(
  (select subscription_status from public.billing_projection where user_id = '44444444-4444-4444-8444-444444444444'),
  'active',
  'stale subscription state leaves the current status intact'
);

select is(
  public.apply_paid_invoice_fact(
    '44444444-4444-4444-8444-444444444444',
    'in_billing_paid',
    now() - interval '1 minute',
    now() + interval '30 days',
    'evt_invoice_paid',
    now()
  ),
  true,
  'paid invoice advances paid-through atomically'
);

select is(
  public.apply_paid_invoice_fact(
    '44444444-4444-4444-8444-444444444444',
    'in_billing_old',
    now() - interval '1 minute',
    now() + interval '10 days',
    'evt_invoice_old',
    now() + interval '1 minute'
  ),
  false,
  'shorter paid period cannot reduce already-confirmed access'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';

select is(public.has_pro(), true, 'confirmed paid-through grants Pro');
select is(
  (select subscription_status from public.current_billing_plan()),
  'active',
  'current billing plan exposes current-user presentation only'
);
select is(
  (select has_current_subscription from public.current_billing_plan()),
  true,
  'current billing plan reports an existing subscription'
);

reset role;

select * from finish();
rollback;
