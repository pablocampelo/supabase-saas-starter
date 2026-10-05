create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create table public.billing_projection (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  billing_interval text check (billing_interval is null or billing_interval in ('month', 'year')),
  subscription_status text,
  paid_through timestamptz,
  last_paid_invoice_id text,
  last_paid_period_start timestamptz,
  last_paid_period_end timestamptz,
  projection_version bigint not null default 0 check (projection_version >= 0),
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_paid_period_order check (
    last_paid_period_start is null
    or last_paid_period_end is null
    or last_paid_period_start < last_paid_period_end
  )
);

comment on table public.billing_projection is
  'Server-owned, reconstructible Stripe billing projection. paid_through is the authorization input; Stripe remains financial truth.';

alter table public.billing_projection enable row level security;

revoke all on table public.billing_projection from anon, authenticated;
grant select, insert, update, delete on table public.billing_projection to service_role;

create or replace function private.has_pro()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.billing_projection as projection
    where projection.user_id = (select auth.uid())
      and projection.paid_through is not null
      and projection.paid_through > now()
  );
$$;

revoke all on function private.has_pro() from public, anon;
grant execute on function private.has_pro() to authenticated, service_role;

comment on function private.has_pro() is
  'Canonical Pro entitlement boundary for the current authenticated identity. It intentionally accepts no user_id argument.';

create table public.example_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint example_resources_title_length check (
    char_length(btrim(title)) between 1 and 200
  ),
  constraint example_resources_content_length check (
    char_length(content) <= 20000
  )
);

comment on table public.example_resources is
  'Replaceable private example domain used to prove Auth -> ownership -> RLS -> entitlement -> CRUD.';

create index example_resources_user_updated_idx
  on public.example_resources (user_id, updated_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger billing_projection_set_updated_at
before update on public.billing_projection
for each row execute function private.set_updated_at();

create trigger example_resources_set_updated_at
before update on public.example_resources
for each row execute function private.set_updated_at();

create or replace function private.prevent_example_owner_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'example resource owner is immutable' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_example_owner_change() from public, anon, authenticated;

create trigger example_resources_owner_immutable
before update of user_id on public.example_resources
for each row execute function private.prevent_example_owner_change();

alter table public.example_resources enable row level security;

revoke all on table public.example_resources from anon;
grant select, insert, update, delete on table public.example_resources to authenticated;
grant select, insert, update, delete on table public.example_resources to service_role;

create policy "example_select_own"
on public.example_resources
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "example_insert_own_pro"
on public.example_resources
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (select private.has_pro())
);

create policy "example_update_own_pro"
on public.example_resources
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and (select private.has_pro())
)
with check (
  (select auth.uid()) = user_id
  and (select private.has_pro())
);

create policy "example_delete_own"
on public.example_resources
for delete
to authenticated
using ((select auth.uid()) = user_id);
