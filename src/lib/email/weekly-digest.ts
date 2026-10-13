import { createAdminClient } from "@/lib/supabase/admin";
import { BRAND } from "@/lib/brand";
import { htmlToPlainText } from "@/lib/email/html-utils";
import { getOpsDigestRecipients } from "@/lib/email/ops-recipients";
import { buildRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";
import { buildOfficeWeeklySummaryHtml } from "@/lib/email/weekly-office-html";
import { buildOpsWeeklySummaryHtml } from "@/lib/email/weekly-ops-html";
import { getResendClient, sendViaResend } from "@/lib/email/resend-client";
import { lastCompletedWeekPeriod } from "@/lib/scheduling/chicago";
import type { SettlementPeriod } from "@/lib/accounting/restaurant-settlement";
import {
  buildOpsWeekSummary,
  buildRestaurantWeeklyStub,
  loadPaidOrdersForWeek,
  loadReviewsForWeek,
  summarizeOfficeWeek,
} from "@/lib/weekly-reports/load-week";

async function getOfficeAdminEmails(officeId: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data: links } = await supabase
    .from("office_users")
    .select("user_id")
    .eq("office_id", officeId)
    .eq("role", "office_admin");

  const userIds = (links ?? []).map((l) => l.user_id);
  if (!userIds.length) return [];

  const { data: profiles } = await supabase.from("profiles").select("email").in("id", userIds);

  return (profiles ?? [])
    .map((p) => p.email?.trim().toLowerCase())
    .filter(Boolean) as string[];
}

async function sendHtml(
  to: string,
  subject: string,
  html: string,
  tag: string
): Promise<{ ok: boolean; error?: string }> {
  if (!getResendClient()) return { ok: false, error: "RESEND_API_KEY missing" };
  const result = await sendViaResend({
    to,
    subject,
    html,
    text: htmlToPlainText(html),
    tags: [{ name: "type", value: tag }],
  });
  if (!result.sent) return { ok: false, error: result.error };
  return { ok: true };
}

export type WeeklyDigestResult = {
  period: SettlementPeriod;
  restaurantsSent: number;
  officesSent: number;
  opsSent: boolean;
  skippedWeek: boolean;
  errors: string[];
};

export async function runWeeklyDigest(opts?: {
  force?: boolean;
  period?: SettlementPeriod;
}): Promise<WeeklyDigestResult> {
  const period = opts?.period ?? lastCompletedWeekPeriod();
  const out: WeeklyDigestResult = {
    period,
    restaurantsSent: 0,
    officesSent: 0,
    opsSent: false,
    skippedWeek: false,
    errors: [],
  };

  const supabase = createAdminClient();

  if (!opts?.force) {
    const { data: existing } = await supabase
      .from("weekly_digest_runs")
      .select("week_start")
      .eq("week_start", period.weekStart)
      .maybeSingle();
    if (existing) {
      out.skippedWeek = true;
      return out;
    }
  }

  const ordersResult = await loadPaidOrdersForWeek(period);
  if (!Array.isArray(ordersResult)) {
    out.errors.push(ordersResult.error);
    return out;
  }
  const orders = ordersResult;

  const { reviews, error: reviewErr } = await loadReviewsForWeek(period);
  if (reviewErr) out.errors.push(reviewErr);

  const { data: restaurants } = await supabase.from("restaurants").select("id, name, active").eq("active", true);

  for (const r of restaurants ?? []) {
    const built = await buildRestaurantWeeklyStub(r.id, period);
    if ("error" in built) {
      out.errors.push(`${r.name}: ${built.error}`);
      continue;
    }
    if (!built.email) {
      out.errors.push(`${r.name}: no restaurant email on file (Admin → Restaurants)`);
      continue;
    }
    if (built.stub.orderCount === 0) continue;

    const html = buildRestaurantWeeklyPayoutHtml(built.stub);
    const subject = `${BRAND.name} — weekly payout estimate — ${built.stub.period.label}`;
    const sent = await sendHtml(built.email, subject, html, "weekly-restaurant-payout");
    if (sent.ok) out.restaurantsSent += 1;
    else out.errors.push(`${r.name}: ${sent.error}`);
  }

  const officeSummaries = summarizeOfficeWeek(orders);
  for (const summary of officeSummaries) {
    if (summary.totalMeals === 0) continue;
    const emails = await getOfficeAdminEmails(summary.officeId);
    if (!emails.length) {
      out.errors.push(`${summary.officeName}: no office admin emails`);
      continue;
    }
    const html = buildOfficeWeeklySummaryHtml(summary, period);
    const subject = `${BRAND.name} — weekly meals — ${summary.officeName} — ${period.label}`;
    for (const to of emails) {
      const sent = await sendHtml(to, subject, html, "weekly-office-summary");
      if (sent.ok) out.officesSent += 1;
      else out.errors.push(`${summary.officeName} (${to}): ${sent.error}`);
    }
  }

  const opsSummary = buildOpsWeekSummary(period, orders, reviews);
  const opsHtml = buildOpsWeeklySummaryHtml(opsSummary);
  const opsSubject = `${BRAND.name} — weekly report — ${period.label}`;
  for (const to of getOpsDigestRecipients()) {
    const sent = await sendHtml(to, opsSubject, opsHtml, "weekly-ops-report");
    if (sent.ok) out.opsSent = true;
    else out.errors.push(`Ops ${to}: ${sent.error}`);
  }

  if (out.restaurantsSent > 0 || out.officesSent > 0 || out.opsSent) {
    await supabase.from("weekly_digest_runs").upsert({ week_start: period.weekStart });
  }

  return out;
}
