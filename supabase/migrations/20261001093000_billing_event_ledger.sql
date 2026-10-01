alter table public.billing_projection
  add column last_stripe_event_created_at timestamptz,
  add column last_stripe_event_id text;

create table public.billing_checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text not null,
  billing_interval text not null check (billing_interval in ('month', 'year')),
  status text not null default 'created' check (status in ('created', 'completed', 'expired')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index billing_checkout_attempts_user_created_idx
  on public.billing_checkout_attempts (user_id, created_at desc);

alter table public.billing_checkout_attempts enable row level security;
revoke all on table public.billing_checkout_attempts from anon, authenticated;
grant select, insert, update, delete on table public.billing_checkout_attempts to service_role;

create trigger billing_checkout_attempts_set_updated_at
before update on public.billing_checkout_attempts
for each row execute function private.set_updated_at();

create table public.billing_event_receipts (
  stripe_event_id text primary key,
  stripe_event_type text not null,
  stripe_created_at timestamptz not null,
  status text not null default 'processing' check (status in ('processing', 'processed', 'ignored', 'failed')),
  failure_code text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index billing_event_receipts_created_idx
  on public.billing_event_receipts (stripe_created_at desc);

alter table public.billing_event_receipts enable row level security;
revoke all on table public.billing_event_receipts from anon, authenticated;
grant select, insert, update, delete on table public.billing_event_receipts to service_role;

comment on table public.billing_checkout_attempts is
  'Server-owned checkout-attempt ledger used to correlate authenticated purchase intent with Stripe Checkout sessions.';

comment on table public.billing_event_receipts is
  'Server-owned Stripe webhook receipt ledger. stripe_event_id is the idempotency boundary for event processing.';

comment on column public.billing_projection.last_stripe_event_created_at is
  'Creation time of the latest Stripe event accepted into this projection; older events must not overwrite newer state.';
