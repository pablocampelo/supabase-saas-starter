import "server-only";
import Stripe from "stripe";
import { getServerEnv } from "@/lib/env/server";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (stripeClient) return stripeClient;

  const secretKey = getServerEnv().STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required for Stripe Billing");

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}
