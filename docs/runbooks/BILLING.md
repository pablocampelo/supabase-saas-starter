# Billing runbook

This runbook covers the supported operational path for DaysNotWeeks Stripe Billing. Stripe remains the financial source of truth; the local database contains a minimal reconstructible projection used for authorization.

## Safety boundary

Before any billing operation, verify that the Stripe key, webhook secret, Price IDs and Supabase project all belong to the same intended environment.

Never mix:

- Stripe test/sandbox with live credentials;
- local Supabase with an unrelated hosted Stripe environment;
- production Supabase with test repair commands;
- browser-provided customer, subscription, Price or entitlement identifiers.

Do not paste secret keys, service-role keys or webhook signing secrets into tickets, logs or chat transcripts.

## Normal billing path

The supported lifecycle is:

```text
authenticated user
→ server-selected monthly/annual Price
→ Stripe Checkout
→ signed Stripe webhook
→ server-side Stripe fact validation
→ billing projection
→ paid_through
→ has_pro()
```

Checkout success and the browser return URL do not grant Pro.

A supported `invoice.paid` can establish or extend access only when the invoice contains positive payment evidence for the mapped subscription/Price and a valid financial period.

An archived Price can remain valid for an already-mapped historical subscription. Price `active` is required for new purchases, not for retaining a legitimate historical subscription mapping.

## Local webhook debugging

Run Next.js and the Stripe listener in separate terminals.

```powershell
stripe listen `
  --events "checkout.session.completed,checkout.session.expired,invoice.paid,invoice.payment_failed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,charge.refunded,charge.dispute.created,charge.dispute.updated,charge.dispute.closed" `
  --forward-to "http://127.0.0.1:3000/api/stripe/webhook"
```

Use the signing secret printed by the current listener as `STRIPE_WEBHOOK_SECRET`, then restart Next.js. A successful delivery should show a `2xx` response from `/api/stripe/webhook`.

If Checkout returned successfully but Billing remains confirming, first verify whether `invoice.paid` reached the webhook. Do not grant Pro manually from the browser redirect.

## Event processing failures

`billing_event_receipts` is the idempotency ledger.

Terminal states:

- `processed`;
- `ignored`;
- `failed`.

A currently processing event is treated as busy. A processing lease older than five minutes is reclaimable, which allows Stripe retry or an operator resend to recover from a worker crash after a partial durable write.

Projection writes are monotonic/idempotent where financial access is concerned:

- older subscription-state events cannot overwrite a newer state marker;
- paid-through never moves backwards;
- replaying a paid invoice cannot create a second paid period.

If a webhook returns `500`, inspect the application log for the safe billing error code and let Stripe retry. Do not edit the projection directly as the first response.

## Reconciliation

Reconciliation reads provider facts and compares them with the local projection. It is dry-run by default.

All accounts:

```sh
pnpm billing:reconcile
```

One account:

```sh
pnpm billing:reconcile -- --user <supabase-user-uuid>
```

The output reports drift by field and does not print provider secrets.

Apply only after reviewing the dry-run and confirming the environment:

```sh
pnpm billing:reconcile -- --apply
```

or:

```sh
pnpm billing:reconcile -- --user <supabase-user-uuid> --apply
```

Reconciliation can repair:

- a completed Checkout Session whose local attempt remained `created`;
- current subscription/customer/Price/interval/status projection drift;
- a missing or stale paid-through when Stripe contains a later supported positive paid period;
- an expired stale Checkout attempt.

It fails closed instead of granting access when it finds unsupported recurrence/currency/amount, inconsistent identity, unsupported paid-access state or multiple current subscriptions.

There is no default reconciliation cron or automatic recovery SLA. If Stripe exhausts webhook retries, operator intervention may be required.

## Cancellation and payment failure

Cancellation at period end:

- keeps already-confirmed Pro through `paid_through`;
- projects the cancellation state;
- does not create a new paid period.

A failed renewal:

- does not extend `paid_through`;
- may project `past_due` or `unpaid`;
- preserves only access already confirmed by an earlier paid period.

Immediate/terminal cancellation does not itself grant access. Any retained access still comes only from a previously confirmed paid period.

## Refunds and disputes

Refunds and disputes do not create new access. Their selected Stripe webhook events are retained in the event receipt ledger as reviewed/ignored financial events; they do not extend or automatically shorten `paid_through`.

The starter does not impose a universal automatic revocation policy for every refund/dispute case. If the business policy requires revocation:

```text
adjust/cancel the corresponding state in Stripe
→ run reconciliation dry-run
→ review drift
→ apply reconciliation
```

Do not directly shorten `paid_through` as an ad hoc operational shortcut unless the product's financial policy has been intentionally changed.

## Checkout concurrency

Only one open local Checkout attempt is allowed per user. Concurrent creation races are resolved by the database uniqueness boundary and the server action reuses, waits for or expires the existing attempt.

If an attempt was created but no Stripe Session was linked because the process crashed, a later Checkout request can expire the stale attempt after the preparation window. Reconciliation also diagnoses/clears stale attempts when applied.

## Release verification

Before a release candidate is promoted, verify in the intended hosted test/staging environment:

- monthly Checkout;
- annual Checkout;
- browser return without treating the redirect as payment proof;
- positive paid invoice → Pro;
- renewal failure without access extension;
- cancellation at period end with retained paid access;
- Customer Portal;
- duplicate/reordered webhook delivery;
- reconciliation dry-run and apply;
- test/live credential isolation.

Release evidence must correspond to the candidate SHA.
