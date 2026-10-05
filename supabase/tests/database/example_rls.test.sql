begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'free@example.test', now(), now()),
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'pro@example.test', now(), now()),
  ('33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'revoked@example.test', now(), now());

insert into public.billing_projection (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_price_id,
  billing_interval,
  subscription_status,
  paid_through,
  last_paid_invoice_id,
  last_paid_period_start,
  last_paid_period_end,
  projection_version
)
values
  (
    '22222222-2222-4222-8222-222222222222',
    'cus_test_pro',
    'sub_test_pro',
    'price_test_pro_month',
    'month',
    'active',
    now() + interval '1 day',
    'in_test_pro',
    now() - interval '29 days',
    now() + interval '1 day',
    2
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'cus_test_revoked',
    'sub_test_revoked',
    'price_test_pro_month',
    'month',
    'canceled',
    now() - interval '1 minute',
    'in_test_revoked',
    now() - interval '30 days',
    now() - interval '1 minute',
    3
  );

insert into public.example_resources (user_id, title, content)
values
  ('11111111-1111-4111-8111-111111111111', 'Free retained', 'free retained content'),
  ('22222222-2222-4222-8222-222222222222', 'Pro owned', 'pro content'),
  ('33333333-3333-4333-8333-333333333333', 'Revoked retained', 'revoked retained content');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.example_resources'::regclass),
  'example_resources has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.billing_projection'::regclass),
  'billing_projection has RLS enabled'
);

select ok(
  not has_table_privilege('anon', 'public.example_resources', 'SELECT'),
  'anonymous has no Example read grant'
);

select ok(
  not has_table_privilege('anon', 'public.example_resources', 'INSERT'),
  'anonymous has no Example write grant'
);

select ok(
  not has_table_privilege('authenticated', 'public.billing_projection', 'SELECT'),
  'authenticated users cannot read the financial projection directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.billing_projection', 'INSERT')
  and not has_table_privilege('authenticated', 'public.billing_projection', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.billing_projection', 'DELETE'),
  'authenticated users cannot write financial state'
);

select ok(
  not has_function_privilege('anon', 'public.has_pro()', 'EXECUTE'),
  'anonymous cannot call the entitlement API'
);

select ok(
  has_function_privilege('authenticated', 'public.has_pro()', 'EXECUTE'),
  'authenticated users can call the current-user entitlement API'
);

-- Free user A: retained own data is readable/deletable, premium writes are denied.
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select is(public.has_pro(), false, 'Free user has no Pro entitlement');
select is((select count(*) from public.example_resources), 1::bigint, 'A can only read A resources');
select is((select title from public.example_resources limit 1), 'Free retained', 'A sees the retained own resource');

select throws_ok(
  $$insert into public.example_resources (title, content) values ('Denied free create', 'nope')$$,
  '42501',
  'new row violates row-level security policy for table "example_resources"',
  'Free cannot create Example resources'
);

select results_eq(
  $$update public.example_resources set title = 'Denied free update' where title = 'Free retained' returning 1$$,
  $$select 1 where false$$,
  'Free cannot edit retained resources'
);

select results_eq(
  $$delete from public.example_resources where title = 'Free retained' returning 1$$,
  $$values (1)$$,
  'Free can delete retained own resources'
);

reset role;

-- Pro user B: full CRUD on own data, no access to another owner, and owner cannot be transferred.
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select is(public.has_pro(), true, 'Paid-through user has Pro entitlement');
select is((select count(*) from public.example_resources), 1::bigint, 'B can only read B resources before creating');

select results_eq(
  $$insert into public.example_resources (title, content) values ('Pro created', 'created by Pro') returning user_id$$,
  $$values ('22222222-2222-4222-8222-222222222222'::uuid)$$,
  'Pro can create and owner defaults to the authenticated identity'
);

select results_eq(
  $$update public.example_resources set title = 'Pro updated' where title = 'Pro created' returning 1$$,
  $$values (1)$$,
  'Pro can edit own resources'
);

select throws_ok(
  $$update public.example_resources set user_id = '11111111-1111-4111-8111-111111111111' where title = 'Pro updated'$$,
  '42501',
  'example resource owner is immutable',
  'Authenticated client cannot transfer Example ownership'
);

select results_eq(
  $$delete from public.example_resources where title = 'Pro updated' returning 1$$,
  $$values (1)$$,
  'Pro can delete own resources'
);

reset role;

-- Revoked Pro user C: paid-through has expired; retained own data remains readable/deletable.
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

select is(public.has_pro(), false, 'Expired paid-through revokes Pro entitlement');
select is((select count(*) from public.example_resources), 1::bigint, 'Revoked user can still read retained own data');
select is((select title from public.example_resources limit 1), 'Revoked retained', 'Revoked user sees retained own resource');

select throws_ok(
  $$insert into public.example_resources (title, content) values ('Denied revoked create', 'nope')$$,
  '42501',
  'new row violates row-level security policy for table "example_resources"',
  'Revoked Pro cannot create Example resources'
);

select results_eq(
  $$update public.example_resources set title = 'Denied revoked update' where title = 'Revoked retained' returning 1$$,
  $$select 1 where false$$,
  'Revoked Pro cannot edit retained resources'
);

select results_eq(
  $$delete from public.example_resources where title = 'Revoked retained' returning 1$$,
  $$values (1)$$,
  'Revoked Pro can delete retained own resources'
);

reset role;

select * from finish();
rollback;
