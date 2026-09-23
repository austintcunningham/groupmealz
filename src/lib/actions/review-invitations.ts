"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendReviewRequestEmail } from "@/lib/email/review-request";
import { getReviewOpensAt, isReviewOpen } from "@/lib/reviews/eligibility";
import { getRelationName } from "@/lib/supabase/relation";

function formatLunchDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Send post-lunch review emails for orders past delivery + buffer. */
export async function sendDueReviewInvitationEmails(): Promise<{
  sent: number;
  errors: string[];
  checked: number;
}> {
  const admin = createAdminClient();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.groupmeals.net").replace(/\/$/, "");
  const now = new Date();

  const { data: orders, error } = await admin
    .from("orders")
    .select(
      "id, customer_name, customer_email, status, review_invitation_sent_at, daily_lunch_schedules(lunch_date, delivery_at), restaurants(name)"
    )
    .eq("status", "paid")
    .is("review_invitation_sent_at", null);

  if (error) {
    return { sent: 0, errors: [error.message], checked: 0 };
  }

  let sent = 0;
  const errors: string[] = [];

  for (const order of orders ?? []) {
    const schedule = order.daily_lunch_schedules as
      | { lunch_date: string; delivery_at: string }
      | { lunch_date: string; delivery_at: string }[]
      | null;
    const row = Array.isArray(schedule) ? schedule[0] : schedule;
    if (!row?.lunch_date) continue;

    const opensAt = getReviewOpensAt(row.lunch_date, row.delivery_at);
    if (!isReviewOpen(opensAt, now)) continue;

    const { data: existingReview } = await admin
      .from("restaurant_reviews")
      .select("id")
      .eq("order_id", order.id)
      .maybeSingle();
    if (existingReview) {
      await admin
        .from("orders")
        .update({ review_invitation_sent_at: now.toISOString() })
        .eq("id", order.id);
      continue;
    }

    const emailResult = await sendReviewRequestEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      restaurantName: getRelationName(order.restaurants) ?? "Restaurant",
      lunchDateLabel: formatLunchDate(row.lunch_date),
      reviewUrl: `${appUrl}/review/${order.id}`,
    });

    if (emailResult.error) {
      errors.push(`Order ${order.id}: ${emailResult.error}`);
      continue;
    }

    await admin
      .from("orders")
      .update({ review_invitation_sent_at: now.toISOString() })
      .eq("id", order.id);
    sent += 1;
  }

  return { sent, errors, checked: orders?.length ?? 0 };
}
