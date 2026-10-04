import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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
const targetUserId = readUserArg(args);
const dryRun = args.includes("--dry-run");
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

validatePrice(monthlyPrice, {
  id: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  interval: "month",
  currency: monthlyPrice.currency,
});
validatePrice(annualPrice, {
  id: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  interval: "year",
  currency: monthlyPrice.currency,
});

const supported = {
  currency: monthlyPrice.currency,
};

let attemptsQuery = admin
  .from("billing_checkout_attempts")
  .select("id,user_id,stripe_checkout_session_id,stripe_customer_id,stripe_subscription_id,stripe_price_id,billing_interval,status")
  .in("status", ["created", "completed"])
  .order("created_at", { ascending: true });

if (targetUserId) attemptsQuery = attemptsQuery.eq("user_id", targetUserId);

const { data: attempts, error: attemptsError } = await attemptsQuery;
if (attemptsError) throw new Error("BILLING_RECONCILE_ATTEMPTS_READ_FAILED");

let reconciled = 0;
let skipped = 0;
const failures = [];

for (const attempt of attempts ?? []) {
  try {
    const resolved = await resolveAttemptSubscription(attempt);
    if (!resolved) {
      skipped += 1;
      continue;
    }

    const subscription = await stripe.subscriptions.retrieve(resolved.subscriptionId);
    const fact = validateSubscription(subscription, attempt, supported, resolved.customerId);
    const reconciliationTime = new Date().toISOString();

    if (!dryRun) {
      const { error: stateError } = await admin.rpc("apply_billing_subscription_state", {
        p_user_id: attempt.user_id,
        p_customer_id: fact.customerId,
        p_subscription_id: subscription.id,
        p_price_id: fact.priceId,
        p_billing_interval: fact.interval,
        p_subscription_status: subscription.status,
        p_cancel_at_period_end: Boolean(subscription.cancel_at_period_end || subscription.cancel_at),
        p_event_id: `reconcile:${subscription.id}`,
        p_event_created_at: reconciliationTime,
      });
      if (stateError) throw new Error("BILLING_RECONCILE_SUBSCRIPTION_WRITE_FAILED");
    }

    const paidFact = await findLatestPositivePaidPeriod(subscription, fact);
    if (paidFact && !dryRun) {
      const { error: paidError } = await admin.rpc("apply_paid_invoice_fact", {
        p_user_id: attempt.user_id,
        p_invoice_id: paidFact.invoiceId,
        p_period_start: new Date(paidFact.periodStart * 1000).toISOString(),
        p_period_end: new Date(paidFact.periodEnd * 1000).toISOString(),
        p_event_id: `reconcile:${paidFact.invoiceId}`,
        p_event_created_at: new Date(paidFact.eventCreatedAt * 1000).toISOString(),
      });
      if (paidError) throw new Error("BILLING_RECONCILE_PAID_PERIOD_WRITE_FAILED");
    }

    reconciled += 1;
  } catch (error) {
    failures.push({
      attemptId: attempt.id,
      message: error instanceof Error ? error.message : "BILLING_RECONCILE_UNKNOWN_FAILURE",
    });
  }
}

console.log(`Billing reconciliation complete: mode=${dryRun ? "dry-run" : "write"} reconciled=${reconciled} skipped=${skipped} failed=${failures.length}`);
for (const failure of failures) {
  console.error(`- attempt ${failure.attemptId}: ${failure.message}`);
}

if (failures.length > 0) process.exitCode = 1;

async function resolveAttemptSubscription(attempt) {
  if (attempt.stripe_checkout_session_id) {
    const session = await stripe.checkout.sessions.retrieve(attempt.stripe_checkout_session_id);
    if (session.status === "open") return null;
    if (session.status === "expired") return null;
    if (session.status !== "complete" || session.mode !== "subscription") {
      throw new Error("BILLING_RECONCILE_CHECKOUT_STATE_UNSUPPORTED");
    }

    if (
      session.metadata?.dnw_checkout_attempt_id !== attempt.id
      || session.metadata?.dnw_user_id !== attempt.user_id
      || session.client_reference_id !== attempt.user_id
    ) {
      throw new Error("BILLING_RECONCILE_CHECKOUT_IDENTITY_MISMATCH");
    }

    const customerId = idOf(session.customer);
    const subscriptionId = idOf(session.subscription);
    if (!customerId || !subscriptionId) {
      throw new Error("BILLING_RECONCILE_CHECKOUT_REFERENCES_MISSING");
    }

    if (!dryRun) {
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

    return { subscriptionId, customerId };
  }

  if (attempt.status === "completed" && attempt.stripe_subscription_id) {
    return {
      subscriptionId: attempt.stripe_subscription_id,
      customerId: attempt.stripe_customer_id,
    };
  }

  return null;
}

function validateSubscription(subscription, attempt, options, expectedCustomerId) {
  if (
    subscription.metadata?.dnw_checkout_attempt_id !== attempt.id
    || subscription.metadata?.dnw_user_id !== attempt.user_id
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
  validatePrice(price, {
    id: attempt.stripe_price_id,
    interval,
    currency: options.currency,
  });

  return {
    customerId,
    priceId: price.id,
    interval,
  };
}

async function findLatestPositivePaidPeriod(subscription, fact) {
  const invoices = await stripe.invoices.list({
    subscription: subscription.id,
    status: "paid",
    limit: 100,
  });

  const candidates = [];
  for (const invoice of invoices.data) {
    if (
      invoice.status !== "paid"
      || invoice.currency !== supported[fact.interval].currency
      || !Number.isSafeInteger(invoice.amount_paid)
      || invoice.amount_paid <= 0
    ) {
      continue;
    }
    if (invoice.lines.has_more) {
      throw new Error("BILLING_RECONCILE_INVOICE_LINES_PAGINATION_UNSUPPORTED");
    }

    for (const line of invoice.lines.data) {
      if (linePriceId(line) !== fact.priceId) continue;
      const lineSubscription = lineSubscriptionId(line);
      if (lineSubscription && lineSubscription !== subscription.id) continue;
      if (!Number.isSafeInteger(line.amount) || line.amount <= 0) continue;

      const start = line.period?.start;
      const end = line.period?.end;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end <= start) continue;

      candidates.push({
        invoiceId: invoice.id,
        periodStart: start,
        periodEnd: end,
        proration: line.parent?.subscription_item_details?.proration === true,
        eventCreatedAt: invoice.status_transitions?.paid_at ?? invoice.created,
      });
    }
  }

  candidates.sort((a, b) => {
    const prorationOrder = Number(a.proration) - Number(b.proration);
    if (prorationOrder !== 0) return prorationOrder;
    return b.periodEnd - a.periodEnd;
  });

  return candidates[0] ?? null;
}

function validatePrice(price, expected) {
  if (price.id !== expected.id) throw new Error("BILLING_RECONCILE_PRICE_ID_MISMATCH");
  if (!price.active) throw new Error("BILLING_RECONCILE_PRICE_INACTIVE");
  if (price.currency !== expected.currency) throw new Error("BILLING_RECONCILE_PRICE_CURRENCY_MISMATCH");
  if (!Number.isSafeInteger(price.unit_amount) || price.unit_amount <= 0) {
    throw new Error("BILLING_RECONCILE_PRICE_AMOUNT_UNSUPPORTED");
  }
  if (
    price.recurring?.interval !== expected.interval
    || price.recurring?.interval_count !== 1
  ) {
    throw new Error("BILLING_RECONCILE_PRICE_RECURRENCE_MISMATCH");
  }
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

function readUserArg(args) {
  const index = args.indexOf("--user");
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error("--user requires a Supabase user UUID");
  }
  return value;
}
