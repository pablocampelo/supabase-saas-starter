import "server-only";
import type Stripe from "stripe";
import { getPurchasableCatalog } from "@/config/catalog";
import { validateHistoricalStripePrice } from "@/lib/billing/catalog";
import {
  assertPositivePaidInvoiceEvidence,
  assertStripeEventMode,
  assertSupportedPaidSubscriptionState,
  selectSupportedPaidPeriod,
} from "@/lib/billing/evidence";
import { productConfig } from "@/config/product";
import { getServerEnv } from "@/lib/env/server";
import { hasScheduledCancellation } from "@/lib/billing/projection";
import { getStripe } from "@/lib/billing/stripe";
import { toStripePriceFact } from "@/lib/billing/stripe-catalog";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;
type BillingInterval = "month" | "year";

type Attempt = {
  id: string;
  user_id: string;
  stripe_checkout_session_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string;
  billing_interval: string;
};

type SupportedSubscription = {
  userId: string;
  customerId: string;
  subscriptionId: string;
  priceId: string;
  interval: BillingInterval;
  status: string;
  cancelAtPeriodEnd: boolean;
};

type InvoiceLineShape = {
  amount?: number;
  period?: { start?: number; end?: number };
  price?: { id?: string } | null;
  pricing?: { price_details?: { price?: string } | null } | null;
  parent?: {
    subscription_item_details?: {
      proration?: boolean;
      subscription?: unknown;
    } | null;
  } | null;
};

function idOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

function metadataValue(metadata: Stripe.Metadata | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value ? value : null;
}

function eventTime(event: Stripe.Event) {
  return new Date(event.created * 1000).toISOString();
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  const shape = invoice as unknown as {
    subscription?: unknown;
    parent?: { subscription_details?: { subscription?: unknown } | null } | null;
  };
  return idOf(shape.parent?.subscription_details?.subscription) ?? idOf(shape.subscription);
}

function linePriceId(line: Stripe.InvoiceLineItem) {
  const shape = line as unknown as InvoiceLineShape;
  return shape.pricing?.price_details?.price ?? shape.price?.id ?? null;
}

function lineSubscriptionId(line: Stripe.InvoiceLineItem) {
  const shape = line as unknown as InvoiceLineShape;
  return idOf(shape.parent?.subscription_item_details?.subscription);
}

async function loadAttempt(admin: AdminClient, attemptId: string) {
  const { data, error } = await admin
    .from("billing_checkout_attempts")
    .select("id,user_id,stripe_checkout_session_id,stripe_customer_id,stripe_subscription_id,stripe_price_id,billing_interval")
    .eq("id", attemptId)
    .maybeSingle();
  if (error) throw new Error("BILLING_ATTEMPT_READ_FAILED");
  if (!data) throw new Error("BILLING_ATTEMPT_NOT_FOUND");
  return data as Attempt;
}

async function loadProjectionForSubscription(admin: AdminClient, userId: string, subscriptionId: string) {
  const { data, error } = await admin
    .from("billing_projection")
    .select("stripe_subscription_id,stripe_price_id,billing_interval")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("BILLING_PROJECTION_READ_FAILED");
  return data && data.stripe_subscription_id === subscriptionId ? data : null;
}

async function resolveSupportedSubscription(
  admin: AdminClient,
  subscription: Stripe.Subscription,
): Promise<SupportedSubscription> {
  const attemptId = metadataValue(subscription.metadata, "dnw_checkout_attempt_id");
  const metadataUserId = metadataValue(subscription.metadata, "dnw_user_id");
  if (!attemptId || !metadataUserId) throw new Error("BILLING_SUBSCRIPTION_METADATA_MISSING");

  const attempt = await loadAttempt(admin, attemptId);
  if (attempt.user_id !== metadataUserId) throw new Error("BILLING_SUBSCRIPTION_OWNER_MISMATCH");

  const customerId = idOf(subscription.customer);
  if (!customerId) throw new Error("BILLING_CUSTOMER_MISSING");
  if (subscription.items.data.length !== 1) throw new Error("BILLING_SUBSCRIPTION_ITEMS_UNSUPPORTED");

  const price = subscription.items.data[0]?.price;
  if (!price) throw new Error("BILLING_SUBSCRIPTION_PRICE_MISSING");
  const priceId = price.id;
  const configured = getPurchasableCatalog();
  const projection = await loadProjectionForSubscription(admin, attempt.user_id, subscription.id);

  let interval: BillingInterval | null = null;
  if (priceId === configured.monthly.priceId) interval = "month";
  if (priceId === configured.annual.priceId) interval = "year";
  if (!interval && priceId === attempt.stripe_price_id && (attempt.billing_interval === "month" || attempt.billing_interval === "year")) {
    interval = attempt.billing_interval;
  }
  if (!interval && projection?.stripe_price_id === priceId && (projection.billing_interval === "month" || projection.billing_interval === "year")) {
    interval = projection.billing_interval;
  }
  if (!interval) throw new Error("BILLING_SUBSCRIPTION_PRICE_UNSUPPORTED");

  validateHistoricalStripePrice(
    { priceId, interval },
    toStripePriceFact(price),
    productConfig.billing.currency,
  );

  return {
    userId: attempt.user_id,
    customerId,
    subscriptionId: subscription.id,
    priceId,
    interval,
    status: subscription.status,
    cancelAtPeriodEnd: hasScheduledCancellation(subscription.cancel_at_period_end, subscription.cancel_at),
  };
}

async function applySubscriptionState(admin: AdminClient, fact: SupportedSubscription, event: Stripe.Event) {
  const { error } = await admin.rpc("apply_billing_subscription_state", {
    p_user_id: fact.userId,
    p_customer_id: fact.customerId,
    p_subscription_id: fact.subscriptionId,
    p_price_id: fact.priceId,
    p_billing_interval: fact.interval,
    p_subscription_status: fact.status,
    p_cancel_at_period_end: fact.cancelAtPeriodEnd,
    p_event_id: event.id,
    p_event_created_at: eventTime(event),
  });
  if (error) throw new Error("BILLING_SUBSCRIPTION_STATE_WRITE_FAILED");
}

async function syncSubscription(admin: AdminClient, subscription: Stripe.Subscription, event: Stripe.Event) {
  const fact = await resolveSupportedSubscription(admin, subscription);
  await applySubscriptionState(admin, fact, event);
  return fact;
}

async function retrieveAndSyncSubscription(admin: AdminClient, subscriptionId: string, event: Stripe.Event) {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  return syncSubscription(admin, subscription, event);
}

async function handleCheckoutCompleted(admin: AdminClient, session: Stripe.Checkout.Session, event: Stripe.Event) {
  if (session.mode !== "subscription") return "ignored" as const;

  const attemptId = metadataValue(session.metadata, "dnw_checkout_attempt_id");
  const metadataUserId = metadataValue(session.metadata, "dnw_user_id");
  if (!attemptId || !metadataUserId) throw new Error("BILLING_CHECKOUT_METADATA_MISSING");

  const attempt = await loadAttempt(admin, attemptId);
  if (attempt.user_id !== metadataUserId || session.client_reference_id !== attempt.user_id) {
    throw new Error("BILLING_CHECKOUT_OWNER_MISMATCH");
  }
  if (attempt.stripe_checkout_session_id && attempt.stripe_checkout_session_id !== session.id) {
    throw new Error("BILLING_CHECKOUT_SESSION_MISMATCH");
  }

  const customerId = idOf(session.customer);
  const subscriptionId = idOf(session.subscription);
  if (!customerId || !subscriptionId) throw new Error("BILLING_CHECKOUT_REFERENCES_MISSING");

  await retrieveAndSyncSubscription(admin, subscriptionId, event);

  const { error } = await admin
    .from("billing_checkout_attempts")
    .update({
      status: "completed",
      stripe_checkout_session_id: session.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attempt.id)
    .eq("user_id", attempt.user_id);
  if (error) throw new Error("BILLING_CHECKOUT_ATTEMPT_COMPLETE_FAILED");

  return "processed" as const;
}

async function handleCheckoutExpired(admin: AdminClient, session: Stripe.Checkout.Session) {
  const attemptId = metadataValue(session.metadata, "dnw_checkout_attempt_id");
  if (!attemptId) return "ignored" as const;

  const attempt = await loadAttempt(admin, attemptId);
  if (attempt.stripe_checkout_session_id && attempt.stripe_checkout_session_id !== session.id) {
    throw new Error("BILLING_CHECKOUT_SESSION_MISMATCH");
  }

  const { error } = await admin
    .from("billing_checkout_attempts")
    .update({ status: "expired", stripe_checkout_session_id: session.id })
    .eq("id", attempt.id);
  if (error) throw new Error("BILLING_CHECKOUT_ATTEMPT_EXPIRE_FAILED");
  return "processed" as const;
}

async function handleInvoicePaid(admin: AdminClient, invoice: Stripe.Invoice, event: Stripe.Event) {
  assertPositivePaidInvoiceEvidence(invoice.status, invoice.amount_paid);
  if (invoice.currency !== productConfig.billing.currency) throw new Error("BILLING_INVOICE_CURRENCY_MISMATCH");
  if (invoice.lines.has_more) throw new Error("BILLING_INVOICE_LINES_PAGINATION_UNSUPPORTED");

  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return "ignored" as const;
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const fact = await syncSubscription(admin, subscription, event);
  assertSupportedPaidSubscriptionState(fact.status);

  const invoiceCustomerId = idOf(invoice.customer);
  if (!invoiceCustomerId || invoiceCustomerId !== fact.customerId) throw new Error("BILLING_INVOICE_CUSTOMER_MISMATCH");

  const period = selectSupportedPaidPeriod(
    invoice.lines.data.map((line) => {
      const shape = line as unknown as InvoiceLineShape;
      return {
        priceId: linePriceId(line),
        subscriptionId: lineSubscriptionId(line),
        amount: shape.amount,
        periodStart: shape.period?.start,
        periodEnd: shape.period?.end,
        proration: shape.parent?.subscription_item_details?.proration === true,
      };
    }),
    fact.priceId,
    fact.subscriptionId,
  );

  const { error } = await admin.rpc("apply_paid_invoice_fact", {
    p_user_id: fact.userId,
    p_invoice_id: invoice.id,
    p_period_start: new Date(period.start * 1000).toISOString(),
    p_period_end: new Date(period.end * 1000).toISOString(),
    p_event_id: event.id,
    p_event_created_at: eventTime(event),
  });
  if (error) throw new Error("BILLING_PAID_INVOICE_WRITE_FAILED");

  return "processed" as const;
}

async function handleInvoiceStateChange(admin: AdminClient, invoice: Stripe.Invoice, event: Stripe.Event) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return "ignored" as const;
  await retrieveAndSyncSubscription(admin, subscriptionId, event);
  return "processed" as const;
}

async function dispatchEvent(admin: AdminClient, event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(admin, event.data.object, event);
    case "checkout.session.expired":
      return handleCheckoutExpired(admin, event.data.object);
    case "invoice.paid":
      return handleInvoicePaid(admin, event.data.object, event);
    case "invoice.payment_failed":
      return handleInvoiceStateChange(admin, event.data.object, event);
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await retrieveAndSyncSubscription(admin, event.data.object.id, event);
      return "processed" as const;
    case "charge.refunded":
    case "charge.dispute.created":
    case "charge.dispute.updated":
    case "charge.dispute.closed":
      return "ignored" as const;
    default:
      return "ignored" as const;
  }
}

export async function processStripeEvent(event: Stripe.Event) {
  const stripeSecretKey = getServerEnv().STRIPE_SECRET_KEY;
  if (!stripeSecretKey) throw new Error("BILLING_STRIPE_NOT_CONFIGURED");
  assertStripeEventMode(event.livemode, stripeSecretKey);

  const admin = createSupabaseAdminClient();
  const { data: claim, error: claimError } = await admin.rpc("claim_billing_event", {
    p_event_id: event.id,
    p_event_type: event.type,
    p_event_created_at: eventTime(event),
  });
  if (claimError) throw new Error("BILLING_EVENT_CLAIM_FAILED");
  if (claim === "duplicate") return "duplicate" as const;
  if (claim !== "claimed") throw new Error("BILLING_EVENT_BUSY");

  try {
    const result = await dispatchEvent(admin, event);
    const { error: finishError } = await admin.rpc("finish_billing_event", {
      p_event_id: event.id,
      p_status: result === "ignored" ? "ignored" : "processed",
    });
    if (finishError) throw new Error("BILLING_EVENT_FINISH_FAILED");
    return result;
  } catch (error) {
    await admin.rpc("finish_billing_event", {
      p_event_id: event.id,
      p_status: "failed",
      p_failure_code: "BILLING_WEBHOOK_PROCESSING_FAILED",
    });
    throw error;
  }
}
