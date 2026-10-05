begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'free@example.test', now(), now()),
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'pro@example.test', now(), now()),
  ('33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'revoked@example.test', now(), now());

insert into public.billing_projection (
  user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id,
  billing_interval, subscription_status, paid_through,
  last_paid_invoice_id, last_paid_period_start, last_paid_period_end, projection_version
)
values
  ('22222222-2222-4222-8222-222222222222','cus_test_pro','sub_test_pro','price_test_pro_month','month','active',now() + interval '1 day','in_test_pro',now() - interval '29 days',now() + interval '1 day',2),
  ('33333333-3333-4333-8333-333333333333','cus_test_revoked','sub_test_revoked','price_test_pro_month','month','canceled',now() - interval '1 minute','in_test_revoked',now() - interval '30 days',now() - interval '1 minute',3);

insert into public.projects (user_id, title, content, status)
values
  ('11111111-1111-4111-8111-111111111111', 'Free retained', 'free retained content', 'draft'),
  ('22222222-2222-4222-8222-222222222222', 'Pro owned', 'pro content', 'active'),
  ('33333333-3333-4333-8333-333333333333', 'Revoked retained', 'revoked retained content', 'draft');

select ok((select relrowsecurity from pg_class where oid = 'public.projects'::regclass), 'projects has RLS enabled');
select ok(not has_table_privilege('anon', 'public.projects', 'SELECT'), 'anonymous has no Projects read grant');
select ok(not has_table_privilege('authenticated', 'public.billing_projection', 'SELECT'), 'authenticated users cannot read financial projection');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
select is(public.has_pro(), false, 'Free user has no Pro entitlement');
select is((select count(*) from public.projects), 1::bigint, 'Free user sees only own project');
select is((select status from public.projects limit 1), 'draft', 'adapted status field is readable');
select throws_ok(
  $$insert into public.projects (title, content, status) values ('Denied free create', 'nope', 'draft')$$,
  '42501',
  'new row violates row-level security policy for table "projects"',
  'Free cannot create projects'
);
select results_eq(
  $$delete from public.projects where title = 'Free retained' returning 1$$,
  $$values (1)$$,
  'Free can delete retained own projects'
);
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
select is(public.has_pro(), true, 'Paid-through user has Pro entitlement');
select results_eq(
  $$insert into public.projects (title, content, status) values ('Pro created', 'created by Pro', 'draft') returning user_id$$,
  $$values ('22222222-2222-4222-8222-222222222222'::uuid)$$,
  'Pro can create projects'
);
select results_eq(
  $$update public.projects set status = 'active' where title = 'Pro created' returning status$$,
  $$values ('active'::text)$$,
  'Pro can edit adapted status field'
);
select throws_ok(
  $$update public.projects set user_id = '11111111-1111-4111-8111-111111111111' where title = 'Pro created'$$,
  '42501',
  'project owner is immutable',
  'Project owner remains immutable'
);
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
select is(public.has_pro(), false, 'Expired paid-through revokes Pro');
select is((select count(*) from public.projects), 1::bigint, 'Revoked user retains own read');
select results_eq(
  $$update public.projects set status = 'active' where title = 'Revoked retained' returning 1$$,
  $$select 1 where false$$,
  'Revoked Pro cannot edit'
);
select results_eq(
  $$delete from public.projects where title = 'Revoked retained' returning 1$$,
  $$values (1)$$,
  'Revoked Pro can delete retained own project'
);
reset role;

select * from finish();
rollback;
