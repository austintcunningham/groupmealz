import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getOrCreateStripeCustomer(
  profile: Pick<Profile, "id" | "email" | "full_name" | "stripe_customer_id">
): Promise<string> {
  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: profile.email,
    name: profile.full_name || undefined,
    metadata: { profile_id: profile.id },
  });

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", profile.id);

  return customer.id;
}

export async function savePaymentMethodRecord(
  userId: string,
  paymentMethodId: string
): Promise<void> {
  const stripe = getStripe();
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.type !== "card" || !pm.card) return;

  const supabase = createAdminClient();
  const { count } = await supabase
    .from("saved_payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  await supabase.from("saved_payment_methods").upsert(
    {
      user_id: userId,
      stripe_payment_method_id: paymentMethodId,
      card_brand: pm.card.brand,
      card_last4: pm.card.last4,
      exp_month: pm.card.exp_month,
      exp_year: pm.card.exp_year,
      is_default: (count ?? 0) === 0,
    },
    { onConflict: "user_id,stripe_payment_method_id" }
  );
}
