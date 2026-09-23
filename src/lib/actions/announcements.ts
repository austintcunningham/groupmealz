"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireProfileRole, type ActionResult } from "@/lib/actions/utils";
import { htmlToPlainText } from "@/lib/email/html-utils";
import {
  buildRestaurantOfTheDayHtml,
  defaultRotdEmailSubject,
} from "@/lib/email/restaurant-of-the-day";
import { getEmailFromAddress, getReplyToAddress, getResendClient } from "@/lib/email/resend-client";
import { officeOrderPath } from "@/lib/offices/slug";
import { formatOrderingWindow } from "@/lib/scheduling/window";

const announcementSchema = z.object({
  officeId: z.string().uuid(),
  scheduleId: z.string().uuid(),
  subject: z.string().optional(),
  /** ISO 8601 UTC from the browser (preferred). */
  sendAtIso: z.string().min(1),
  sendImmediately: z.boolean().optional(),
});

export async function scheduleLunchAnnouncement(
  input: z.infer<typeof announcementSchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = announcementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const built = await buildAnnouncementFromSchedule(parsed.data.scheduleId);
  if ("error" in built) return { success: false, error: built.error };

  const subject =
    parsed.data.subject?.trim() ||
    defaultRotdEmailSubject(built.restaurantName, built.lunchDate);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lunch_announcements")
    .insert({
      office_id: parsed.data.officeId,
      schedule_id: parsed.data.scheduleId,
      subject,
      headline: null,
      body_html: built.html,
      send_at: parsed.data.sendImmediately
        ? new Date().toISOString()
        : parsed.data.sendAtIso,
      status: "scheduled",
      created_by: auth.profile.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/announcements");
  return { success: true, data: { id: data.id } };
}

/** Create announcement and send immediately (best for testing). */
export async function scheduleAndSendLunchAnnouncement(
  input: Omit<z.infer<typeof announcementSchema>, "sendAtIso" | "sendImmediately">
): Promise<ActionResult<{ sent: number; recipients: string[]; from: string }>> {
  const scheduled = await scheduleLunchAnnouncement({
    ...input,
    sendAtIso: new Date().toISOString(),
    sendImmediately: true,
  });
  if (!scheduled.success) {
    return { success: false, error: scheduled.error };
  }
  return sendLunchAnnouncementNow(scheduled.data.id);
}

async function buildAnnouncementFromSchedule(
  scheduleId: string
): Promise<
  | { html: string; restaurantName: string; lunchDate: string }
  | { error: string }
> {
  const supabase = createAdminClient();
  const { data: schedule } = await supabase
    .from("daily_lunch_schedules")
    .select("*, offices(name, slug), restaurants(name, description, logo_url, banner_url, branding_status)")
    .eq("id", scheduleId)
    .single();

  if (!schedule) return { error: "Schedule not found" };

  const office = schedule.offices as { name: string; slug: string | null } | null;
  const restaurant = schedule.restaurants as {
    name: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    branding_status: string;
  } | null;

  if (!office?.slug) return { error: "Office needs an order link slug first." };

  const restaurantName = restaurant?.name ?? "Restaurant of the Day";
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.groupmeals.net").replace(/\/$/, "");
  const orderLink = `${appUrl}${officeOrderPath(office.slug)}?date=${schedule.lunch_date}`;

  const approved = restaurant?.branding_status === "approved";
  const html = buildRestaurantOfTheDayHtml({
    officeName: office.name,
    lunchDate: schedule.lunch_date,
    restaurantName,
    restaurantDescription: restaurant?.description,
    logoUrl: approved ? restaurant?.logo_url : null,
    bannerUrl: approved ? restaurant?.banner_url : null,
    orderLink,
    cutoffLabel: formatOrderingWindow(schedule),
    deliveryLabel: new Date(schedule.delivery_at).toLocaleString(),
  });

  return { html, restaurantName, lunchDate: schedule.lunch_date };
}

function sendBrandedEmail(
  resend: NonNullable<ReturnType<typeof getResendClient>>,
  params: { from: string; to: string; subject: string; html: string }
) {
  return resend.emails.send({
    from: params.from,
    to: params.to,
    replyTo: getReplyToAddress(),
    subject: params.subject,
    html: params.html,
    text: htmlToPlainText(params.html),
  });
}

export async function sendDueLunchAnnouncements(): Promise<{
  sent: number;
  errors: string[];
  dueCount: number;
  now: string;
}> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: due, error: dueError } = await supabase
    .from("lunch_announcements")
    .select("id, subject, body_html, office_id, schedule_id")
    .eq("status", "scheduled")
    .lte("send_at", now);

  if (dueError) {
    return { sent: 0, errors: [dueError.message], dueCount: 0, now };
  }

  const resend = getResendClient();
  const from = getEmailFromAddress();
  let sent = 0;
  const errors: string[] = [];

  for (const row of due ?? []) {
    const emails = await getRotdRecipientEmails(supabase, row.office_id);

    if (!emails.length) {
      errors.push(`Announcement ${row.id}: no opted-in office admins`);
      continue;
    }

    if (!resend) {
      errors.push("RESEND_API_KEY missing");
      break;
    }

    let html = row.body_html;
    let subject = row.subject;
    if (row.schedule_id) {
      const built = await buildAnnouncementFromSchedule(row.schedule_id);
      if (!("error" in built)) {
        html = built.html;
        if (!subject?.trim()) {
          subject = defaultRotdEmailSubject(built.restaurantName, built.lunchDate);
        }
      }
    }

    for (const to of emails) {
      const { error } = await sendBrandedEmail(resend, {
        from,
        to,
        subject,
        html,
      });
      if (error) {
        errors.push(error.message);
      } else {
        sent += 1;
      }
    }

    await supabase
      .from("lunch_announcements")
      .update({ status: "sent", sent_at: now, body_html: html, subject })
      .eq("id", row.id);
  }

  return { sent, errors, dueCount: due?.length ?? 0, now };
}

/** Admin: send one scheduled announcement immediately (ignores send_at). */
async function getRotdRecipientEmails(
  supabase: ReturnType<typeof createAdminClient>,
  officeId: string
): Promise<string[]> {
  const { data: links } = await supabase
    .from("office_users")
    .select("user_id")
    .eq("office_id", officeId)
    .eq("rotd_email_opt_in", true)
    .eq("role", "office_admin");

  const userIds = (links ?? []).map((l) => l.user_id);
  if (!userIds.length) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("email")
    .in("id", userIds);

  return (profiles ?? [])
    .map((p) => p.email?.trim().toLowerCase())
    .filter(Boolean) as string[];
}

export async function sendLunchAnnouncementNow(
  announcementId: string
): Promise<ActionResult<{ sent: number; recipients: string[]; from: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("lunch_announcements")
    .select("id, subject, body_html, office_id, status, schedule_id")
    .eq("id", announcementId)
    .single();

  if (!row) return { success: false, error: "Announcement not found" };
  if (row.status === "sent") return { success: false, error: "Already sent" };

  let html = row.body_html;
  let subject = row.subject;

  if (row.schedule_id) {
    const built = await buildAnnouncementFromSchedule(row.schedule_id);
    if (!("error" in built)) {
      html = built.html;
      if (!subject?.trim()) {
        subject = defaultRotdEmailSubject(built.restaurantName, built.lunchDate);
      }
    }
  }

  const resend = getResendClient();
  if (!resend) return { success: false, error: "RESEND_API_KEY missing on server" };

  const emails = await getRotdRecipientEmails(supabase, row.office_id);

  if (!emails.length) {
    return {
      success: false,
      error: "No opted-in office admins for this office. Check /office email toggle.",
    };
  }

  const from = getEmailFromAddress();
  let sent = 0;
  for (const to of emails) {
    const { error } = await sendBrandedEmail(resend, {
      from,
      to,
      subject,
      html,
    });
    if (error) {
      return {
        success: false,
        error: `Resend: ${error.message}. Fix RESEND_API_KEY and EMAIL_FROM on Vercel, then redeploy.`,
      };
    }
    sent += 1;
  }

  await supabase
    .from("lunch_announcements")
    .update({ status: "sent", sent_at: new Date().toISOString(), body_html: html, subject })
    .eq("id", row.id);

  revalidatePath("/admin/announcements");
  return { success: true, data: { sent, recipients: emails, from } };
}

export async function setOfficeRotdEmailOptIn(
  officeId: string,
  optIn: boolean
): Promise<ActionResult> {
  const auth = await requireProfileRole(["office_admin", "admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  let db;
  try {
    db = createAdminClient();
  } catch {
    return { success: false, error: "Server missing SUPABASE_SERVICE_ROLE_KEY." };
  }

  if (auth.profile.role === "office_admin") {
    const { data: link } = await db
      .from("office_users")
      .select("id")
      .eq("office_id", officeId)
      .eq("user_id", auth.profile.id)
      .eq("role", "office_admin")
      .maybeSingle();
    if (!link) return { success: false, error: "Unauthorized" };
  }

  const { data: existing } = await db
    .from("office_users")
    .select("id, role")
    .eq("office_id", officeId)
    .eq("user_id", auth.profile.id)
    .maybeSingle();

  if (!existing) {
    return {
      success: false,
      error:
        "You are not linked to this office yet. An admin must assign you under Admin → Offices (staff logins).",
    };
  }

  const { error } = await db
    .from("office_users")
    .update({ rotd_email_opt_in: optIn })
    .eq("office_id", officeId)
    .eq("user_id", auth.profile.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/office");
  return { success: true, data: undefined };
}
