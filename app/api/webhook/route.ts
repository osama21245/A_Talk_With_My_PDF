import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    return new Response("Missing Stripe Signature", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SIGNING_SECRET) {
    return new Response("Missing Stripe Webhook Secret", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET
    );
  } catch {
    return new Response("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.subscription) {
    return new Response("Missing subscription data", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session.metadata?.userId) {
      return new Response("Missing userId in metadata", { status: 400 });
    }

    await db.insert(userSubscriptions).values({
      userId: session.metadata.userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0]?.price?.id ?? "",
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await db
      .update(userSubscriptions)
      .set({
        stripePriceId: subscription.items.data[0]?.price?.id ?? "",
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
  }

  return new Response(null, { status: 200 });
}
