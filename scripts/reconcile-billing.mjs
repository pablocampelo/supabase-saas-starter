import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  assertPositivePaidInvoiceEvidence,
  assertSupportedPaidSubscriptionState,
  hasScheduledCancellation,
  selectSupportedPaidPeriod,
  validateStripePriceFacts,
} from "../lib/billing/policy.js";

const requiredNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PRO_MONTHLY_PRICE_ID",
  "STRIPE_PRO_ANNUAL_PRICE_ID",
];

for (const name of requiredNames) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const args = process.argv.slice(2);
if (args.includes("--apply") && args.includes("--dry-run")) {
  throw new Error("Choose either --apply or --dry-run, not both");
}

const targetUserId = readUserArg(args);
const applyMode = args.includes("--apply");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  },
);

const [monthlyPrice, annualPrice] = await Promise.all([
  stripe.prices.retrieve(process.env.STRIPE_PRO_MONTHLY_PRICE_ID),
  stripe.prices.retrieve(process.env.STRIPE_PRO_ANNUAL_PRICE_ID),
]);

const currency = monthlyPrice.currency;
validateStripePriceFacts(
  { priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID, interval: "month" },
  toPriceFact(monthlyPrice),
  currency,
  { requireActive: true },
);
validateStripePriceFacts(
  { priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID, interval: "year" },
  toPriceFact(annualPrice),
  currency,
  { requireActive: true },
);

let attemptsQuery = admin
  .from("billing_checkout_attempts")
  .select("id,user_id,stripe_checkout_session_id,stripe_customer_id,stripe_subscription_id,stripe_price_id,billing_interval,status,created_at")
  .in("status", ["created", "completed"])
  .order("created_at", { ascending: true });

if (targetUserId) attemptsQuery = attemptsQuery.eq("user_id", targetUserId);

const { data: attempts, error: attemptsError } = await attemptsQuery;
if (attemptsError) throw new Error("BILLING_RECONCILE_ATTEMPTS_READ_FAILED");

const byUser = new Map();
const failures = [];
let skippedAttempts = 0;
let repairedAttempts = 0;

for (const attempt of attempts ?? []) {
  try {
    const resolved = await resolveAttemptSubscription(attempt);
    if (!resolved) {
      skippedAttempts += 1;
      continue;
    }
    if (resolved.attemptRepaired) repairedAttempts += 1;

    const subscription = await stripe.subscriptions.retrieve(resolved.subscriptionId);
    const fact = validateSubscription(subscription, attempt, resolved.customerId);
    const paidFact = await findLatestPositivePaidPeriod(subscription, fact);

    const candidate = {
      attemptCreatedAt: attempt.created_at,
      subscription,
      fact,
      paidFact,
    };
    const existing = byUser.get(attempt.user_id) ?? [];
    existing.push(candidate);
    byUser.set(attempt.user_id, existing);
  } catch (error) {
    failures.push({
      attemptId: attempt.id,
      message: error instanceof Error ? error.message : "BILLING_RECONCILE_UNKNOWN_FAILURE",
    });
  }
}

let accountIndex = 0;
let driftedAccounts = 0;
let appliedAccounts = 0;

for (const [userId, rawCandidates] of byUser) {
  accountIndex += 1;
  try {
    const candidates = dedupeSubscriptions(rawCandidates);
    const currentish = candidates.filter(
      ({ subscription }) => !["canceled", "incomplete_expired"].includes(subscription.status),
    );
    if (currentish.length > 1) {
      throw new Error("BILLING_RECONCILE_MULTIPLE_CURRENT_SUBSCRIPTIONS");
    }

    const current = currentish[0] ?? latestCandidate(candidates);
    if (!current) continue;

    const paid = latestPaidFact(candidates);
    const projection = await loadProjection(userId);
    const drift = compareProjection(projection, current, paid);

    if (drift.length === 0) {
      console.log(`account ${accountIndex}: in-sync`);
      continue;
    }

    driftedAccounts += 1;
    console.log(`account ${accountIndex}: drift=${drift.join(",")}`);

    if (!applyMode) continue;

    const needsStateWrite =
      !projection
      || drift.some((field) => field !== "paid_through");

    if (needsStateWrite) {
      const { error } = await admin.rpc("apply_billing_subscription_state", {
        p_user_id: userId,
        p_customer_id: current.fact.customerId,
        p_subscription_id: current.subscription.id,
        p_price_id: current.fact.priceId,
        p_billing_interval: current.fact.interval,
        p_subscription_status: current.subscription.status,
        p_cancel_at_period_end: hasScheduledCancellation(
          current.subscription.cancel_at_period_end,
          current.subscription.cancel_at,
        ),
        p_event_id: `reconcile:${current.subscription.id}`,
        p_event_created_at: new Date().toISOString(),
      });
      if (error) throw new Error("BILLING_RECONCILE_SUBSCRIPTION_WRITE_FAILED");
    }

    if (paid && drift.includes("paid_through")) {
      const { error } = await admin.rpc("apply_paid_invoice_fact", {
        p_user_id: userId,
        p_invoice_id: paid.invoiceId,
        p_period_start: new Date(paid.periodStart * 1000).toISOString(),
        p_period_end: new Date(paid.periodEnd * 1000).toISOString(),
        p_event_id: `reconcile:${paid.invoiceId}`,
        p_event_created_at: new Date(paid.eventCreatedAt * 1000).toISOString(),
      });
      if (error) throw new Error("BILLING_RECONCILE_PAID_PERIOD_WRITE_FAILED");
    }

    appliedAccounts += 1;
  } catch (error) {
    failures.push({
      attemptId: "account",
      message: error instanceof Error ? error.message : "BILLING_RECONCILE_UNKNOWN_FAILURE",
    });
  }
}

console.log(
  `Billing reconciliation complete: mode=${applyMode ? "apply" : "dry-run"} accounts=${byUser.size} drifted=${driftedAccounts} applied=${appliedAccounts} attempt_repairs=${repairedAttempts} skipped_attempts=${skippedAttempts} failed=${failures.length}`,
);

for (const failure of failures) {
  console.error(`- ${failure.attemptId === "account" ? "account" : `attempt ${failure.attemptId}`}: ${failure.message}`);
}

if (failures.length > 0) process.exitCode = 1;

async function resolveAttemptSubscription(attempt) {
  if (!attempt.stripe_checkout_session_id) {
    if (
      attempt.status === "created"
      && Date.now() - new Date(attempt.created_at).getTime() >= 120_000
    ) {
      if (applyMode) {
        const { error } = await admin
          .from("billing_checkout_attempts")
          .update({ status: "expired" })
          .eq("id", attempt.id)
          .eq("status", "created");
        if (error) throw new Error("BILLING_RECONCILE_ATTEMPT_EXPIRE_FAILED");
      }
      return null;
    }

    if (attempt.status === "completed" && attempt.stripe_subscription_id) {
      return {
        subscriptionId: attempt.stripe_subscription_id,
        customerId: attempt.stripe_customer_id,
        attemptRepaired: false,
      };
    }

    return null;
  }

  const session = await stripe.checkout.sessions.retrieve(attempt.stripe_checkout_session_id);

  if (session.status === "open") return null;

  if (session.status === "expired") {
    if (applyMode && attempt.status === "created") {
      const { error } = await admin
        .from("billing_checkout_attempts")
        .update({ status: "expired" })
        .eq("id", attempt.id)
        .eq("status", "created");
      if (error) throw new Error("BILLING_RECONCILE_ATTEMPT_EXPIRE_FAILED");
    }
    return null;
  }

  if (session.status !== "complete" || session.mode !== "subscription") {
    throw new Error("BILLING_RECONCILE_CHECKOUT_STATE_UNSUPPORTED");
  }

  if (
    session.metadata?.saas_checkout_attempt_id !== attempt.id
    || session.metadata?.saas_user_id !== attempt.user_id
    || session.client_reference_id !== attempt.user_id
  ) {
    throw new Error("BILLING_RECONCILE_CHECKOUT_IDENTITY_MISMATCH");
  }

  const customerId = idOf(session.customer);
  const subscriptionId = idOf(session.subscription);
  if (!customerId || !subscriptionId) {
    throw new Error("BILLING_RECONCILE_CHECKOUT_REFERENCES_MISSING");
  }

  const attemptRepaired =
    attempt.status !== "completed"
    || attempt.stripe_customer_id !== customerId
    || attempt.stripe_subscription_id !== subscriptionId;

  if (applyMode && attemptRepaired) {
    const { error } = await admin
      .from("billing_checkout_attempts")
      .update({
        status: "completed",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        completed_at: new Date().toISOString(),
      })
      .eq("id", attempt.id)
      .eq("user_id", attempt.user_id);
    if (error) throw new Error("BILLING_RECONCILE_ATTEMPT_WRITE_FAILED");
  }

  return { subscriptionId, customerId, attemptRepaired };
}

function validateSubscription(subscription, attempt, expectedCustomerId) {
  if (
    subscription.metadata?.saas_checkout_attempt_id !== attempt.id
    || subscription.metadata?.saas_user_id !== attempt.user_id
  ) {
    throw new Error("BILLING_RECONCILE_SUBSCRIPTION_IDENTITY_MISMATCH");
  }

  const customerId = idOf(subscription.customer);
  if (!customerId) throw new Error("BILLING_RECONCILE_CUSTOMER_MISSING");
  if (expectedCustomerId && customerId !== expectedCustomerId) {
    throw new Error("BILLING_RECONCILE_CUSTOMER_MISMATCH");
  }
  if (subscription.items.data.length !== 1) {
    throw new Error("BILLING_RECONCILE_SUBSCRIPTION_ITEMS_UNSUPPORTED");
  }

  const interval = attempt.billing_interval;
  if (interval !== "month" && interval !== "year") {
    throw new Error("BILLING_RECONCILE_INTERVAL_UNSUPPORTED");
  }

  const price = subscription.items.data[0]?.price;
  if (!price || price.id !== attempt.stripe_price_id) {
    throw new Error("BILLING_RECONCILE_PRICE_UNSUPPORTED");
  }

  validateStripePriceFacts(
    { priceId: attempt.stripe_price_id, interval },
    toPriceFact(price),
    currency,
    { requireActive: false },
  );

  return {
    customerId,
    priceId: price.id,
    interval,
  };
}

async function findLatestPositivePaidPeriod(subscription, fact) {
  const candidates = [];

  for await (const invoice of stripe.invoices.list({
    subscription: subscription.id,
    status: "paid",
    limit: 100,
  })) {
    assertPositivePaidInvoiceEvidence(invoice.status, invoice.amount_paid);
    if (invoice.currency !== currency) {
      throw new Error("BILLING_RECONCILE_INVOICE_CURRENCY_MISMATCH");
    }
    if (invoice.lines.has_more) {
      throw new Error("BILLING_RECONCILE_INVOICE_LINES_PAGINATION_UNSUPPORTED");
    }

    let period;
    try {
      period = selectSupportedPaidPeriod(
        invoice.lines.data.map((line) => ({
          priceId: linePriceId(line),
          subscriptionId: lineSubscriptionId(line),
          amount: line.amount,
          periodStart: line.period?.start,
          periodEnd: line.period?.end,
          proration: line.parent?.subscription_item_details?.proration === true,
        })),
        fact.priceId,
        subscription.id,
      );
    } catch (error) {
      if (error instanceof Error && error.message === "BILLING_SUPPORTED_INVOICE_LINE_MISSING") {
        continue;
      }
      throw error;
    }

    candidates.push({
      invoiceId: invoice.id,
      periodStart: period.start,
      periodEnd: period.end,
      eventCreatedAt: invoice.status_transitions?.paid_at ?? invoice.created,
    });
  }

  if (candidates.length === 0) return null;
  assertSupportedPaidSubscriptionState(subscription.status);
  candidates.sort((a, b) => b.periodEnd - a.periodEnd);
  return candidates[0];
}

async function loadProjection(userId) {
  const { data, error } = await admin
    .from("billing_projection")
    .select("stripe_customer_id,stripe_subscription_id,stripe_price_id,billing_interval,subscription_status,cancel_at_period_end,paid_through")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("BILLING_RECONCILE_PROJECTION_READ_FAILED");
  return data;
}

function compareProjection(projection, current, paid) {
  if (!projection) {
    return paid ? ["projection_missing", "paid_through"] : ["projection_missing"];
  }

  const drift = [];
  if (projection.stripe_customer_id !== current.fact.customerId) drift.push("stripe_customer_id");
  if (projection.stripe_subscription_id !== current.subscription.id) drift.push("stripe_subscription_id");
  if (projection.stripe_price_id !== current.fact.priceId) drift.push("stripe_price_id");
  if (projection.billing_interval !== current.fact.interval) drift.push("billing_interval");
  if (projection.subscription_status !== current.subscription.status) drift.push("subscription_status");

  const cancelAtPeriodEnd = hasScheduledCancellation(
    current.subscription.cancel_at_period_end,
    current.subscription.cancel_at,
  );
  if (projection.cancel_at_period_end !== cancelAtPeriodEnd) drift.push("cancel_at_period_end");

  if (paid) {
    const localPaidThrough = projection.paid_through
      ? new Date(projection.paid_through).getTime()
      : Number.NEGATIVE_INFINITY;
    const providerPaidThrough = paid.periodEnd * 1000;
    if (providerPaidThrough > localPaidThrough) drift.push("paid_through");
  }

  return drift;
}

function dedupeSubscriptions(candidates) {
  const bySubscription = new Map();
  for (const candidate of candidates) {
    const previous = bySubscription.get(candidate.subscription.id);
    if (
      !previous
      || new Date(candidate.attemptCreatedAt).getTime() >= new Date(previous.attemptCreatedAt).getTime()
    ) {
      bySubscription.set(candidate.subscription.id, candidate);
    }
  }
  return [...bySubscription.values()];
}

function latestCandidate(candidates) {
  return [...candidates].sort(
    (a, b) => new Date(b.attemptCreatedAt).getTime() - new Date(a.attemptCreatedAt).getTime(),
  )[0] ?? null;
}

function latestPaidFact(candidates) {
  const paid = candidates
    .map((candidate) => candidate.paidFact)
    .filter(Boolean)
    .sort((a, b) => b.periodEnd - a.periodEnd);
  return paid[0] ?? null;
}

function toPriceFact(price) {
  const interval = price.recurring?.interval;
  return {
    id: price.id,
    active: price.active,
    currency: price.currency,
    unitAmount: price.unit_amount,
    recurringInterval: interval === "month" || interval === "year" ? interval : null,
    recurringIntervalCount: price.recurring?.interval_count ?? null,
  };
}

function linePriceId(line) {
  return idOf(line.pricing?.price_details?.price) ?? idOf(line.price);
}

function lineSubscriptionId(line) {
  return idOf(line.parent?.subscription_item_details?.subscription);
}

function idOf(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.id === "string") return value.id;
  return null;
}

function readUserArg(argv) {
  const index = argv.indexOf("--user");
  if (index === -1) return null;
  const value = argv[index + 1];
  if (!value || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error("--user requires a Supabase user UUID");
  }
  return value;
}
