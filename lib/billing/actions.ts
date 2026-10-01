"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSiteConfig } from "@/config/site";
import { getValidatedBillingCatalog } from "@/lib/billing/stripe-catalog";
import { getStripe } from "@/lib/billing/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const intervalSchema = z.enum(["month", "year"]);

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) redirect("/login");
  return user;
}

export async function createCheckoutAction(formData: FormData) {
  const parsed = intervalSchema.safeParse(String(formData.get("interval") ?? ""));
  if (!parsed.success) redirect("/app/billing?billing=invalid-interval");

  const user = await requireUser();
  const [catalog, site] = await Promise.all([getValidatedBillingCatalog(), Promise.resolve(getSiteConfig())]);
  const option = parsed.data === "month" ? catalog.monthly : catalog.annual;
  const admin = createSupabaseAdminClient();

  const { data: projection, error: projectionError } = await admin
    .from("billing_projection")
    .select("stripe_customer_id,stripe_subscription_id,subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (projectionError) throw new Error("BILLING_PROJECTION_READ_FAILED");

  const currentStatus = projection?.subscription_status ?? null;
  const hasCurrentSubscription = Boolean(
    projection?.stripe_subscription_id && currentStatus !== "canceled" && currentStatus !== "incomplete_expired",
  );
  if (hasCurrentSubscription) redirect("/app/billing?billing=already-subscribed");

  const { data: attempt, error: attemptError } = await admin
    .from("billing_checkout_attempts")
    .insert({
      user_id: user.id,
      stripe_price_id: option.priceId,
      billing_interval: option.interval,
    })
    .select("id")
    .single();
  if (attemptError || !attempt) throw new Error("BILLING_CHECKOUT_ATTEMPT_CREATE_FAILED");

  const metadata = {
    dnw_user_id: user.id,
    dnw_checkout_attempt_id: attempt.id,
  };
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      line_items: [{ price: option.priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata,
      subscription_data: { metadata },
      success_url: new URL("/app/billing?checkout=returned", site.url).toString(),
      cancel_url: new URL("/app/billing?checkout=cancelled", site.url).toString(),
      ...(projection?.stripe_customer_id
        ? { customer: projection.stripe_customer_id }
        : { customer_email: user.email }),
    },
    { idempotencyKey: `dnw_checkout_${attempt.id}` },
  );

  if (!session.url) throw new Error("BILLING_CHECKOUT_URL_MISSING");

  const { error: linkError } = await admin
    .from("billing_checkout_attempts")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", attempt.id)
    .eq("user_id", user.id);
  if (linkError) throw new Error("BILLING_CHECKOUT_ATTEMPT_LINK_FAILED");

  redirect(session.url);
}

export async function createPortalAction() {
  const user = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: projection, error } = await admin
    .from("billing_projection")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("BILLING_PROJECTION_READ_FAILED");
  if (!projection?.stripe_customer_id) redirect("/app/billing?portal=unavailable");

  const stripe = getStripe();
  const site = getSiteConfig();
  const session = await stripe.billingPortal.sessions.create({
    customer: projection.stripe_customer_id,
    return_url: new URL("/app/billing", site.url).toString(),
  });

  redirect(session.url);
}
