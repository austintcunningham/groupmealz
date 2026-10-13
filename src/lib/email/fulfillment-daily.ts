import { createAdminClient } from "@/lib/supabase/admin";
import { BRAND } from "@/lib/brand";
import {
  buildAdminFulfillmentHtml,
  buildOfficeFulfillmentHtml,
  buildRestaurantFulfillmentHtml,
  type DigestOfficeBlock,
  type DigestOrder,
  type DigestOrderLine,
} from "@/lib/email/printable-order-digest";
import { getEmailFromAddress, getResendClient } from "@/lib/email/resend-client";

const CHICAGO_TZ = "America/Chicago";

export function getChicagoDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CHICAGO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatChicagoLunchDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("en-US", {
    timeZone: CHICAGO_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatPlacedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: CHICAGO_TZ,
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDeliveryAt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: CHICAGO_TZ,
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type OrderItemRow = {
  item_name_snapshot: string;
  quantity: number;
  base_price_cents: number;
  line_total_cents: number | null;
  special_instructions: string | null;
  size_label_snapshot: string | null;
  removed_ingredients: string[] | null;
};

type OrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_note: string | null;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  order_items: OrderItemRow[];
};

function mapOrder(o: OrderRow): DigestOrder {
  const lines: DigestOrderLine[] = (o.order_items ?? []).map((i) => ({
    name: i.item_name_snapshot,
    qty: i.quantity,
    lineCents: i.line_total_cents ?? i.base_price_cents * i.quantity,
    sizeLabel: i.size_label_snapshot,
    removedIngredients: Array.isArray(i.removed_ingredients) ? i.removed_ingredients : [],
    specialInstructions: i.special_instructions,
  }));

  return {
    orderId: o.id,
    placedAt: formatPlacedAt(o.created_at),
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: null,
    customerNote: o.customer_note,
    lines,
    subtotalCents: o.subtotal_cents,
    taxCents: o.tax_cents,
    totalCents: o.total_cents,
  };
}

export async function buildDigestBlockForSchedule(
  scheduleId: string
): Promise<{ block: DigestOfficeBlock; restaurantEmail: string | null } | { error: string }> {
  const supabase = createAdminClient();

  const { data: schedule, error: schedErr } = await supabase
    .from("daily_lunch_schedules")
    .select(
      "id, lunch_date, delivery_at, offices(name, street_address, city, state, zip, delivery_instructions, contact_name, contact_phone), restaurants(name, email)"
    )
    .eq("id", scheduleId)
    .single();

  if (schedErr || !schedule) return { error: schedErr?.message ?? "Schedule not found" };

  const { data: orders, error: ordErr } = await supabase
    .from("orders")
    .select(
      "id, created_at, customer_name, customer_email, customer_note, subtotal_cents, tax_cents, total_cents, order_items(*)"
    )
    .eq("schedule_id", scheduleId)
    .in("status", ["paid", "authorized"])
    .order("created_at", { ascending: true });

  if (ordErr) return { error: ordErr.message };

  type OfficeRow = {
    name: string;
    street_address: string;
    city: string;
    state: string;
    zip: string;
    delivery_instructions: string | null;
    contact_name: string | null;
    contact_phone: string | null;
  };
  type RestaurantRow = { name: string; email: string | null };

  const officeRaw = schedule.offices as OfficeRow | OfficeRow[] | null;
  const office = Array.isArray(officeRaw) ? officeRaw[0] : officeRaw;

  const restaurantRaw = schedule.restaurants as RestaurantRow | RestaurantRow[] | null;
  const restaurant = Array.isArray(restaurantRaw) ? restaurantRaw[0] : restaurantRaw;

  const block: DigestOfficeBlock = {
    officeName: office?.name ?? "Office",
    streetAddress: office?.street_address ?? "",
    cityStateZip: [office?.city, office?.state, office?.zip].filter(Boolean).join(", "),
    deliveryInstructions: office?.delivery_instructions ?? null,
    contactName: office?.contact_name ?? null,
    contactPhone: office?.contact_phone ?? null,
    restaurantName: restaurant?.name ?? "Restaurant",
    lunchDate: formatChicagoLunchDate(schedule.lunch_date),
    deliveryAt: formatDeliveryAt(schedule.delivery_at),
    orders: ((orders ?? []) as OrderRow[]).map(mapOrder),
  };

  return { block, restaurantEmail: restaurant?.email ?? null };
}

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

async function getPlatformOpsEmails(): Promise<string[]> {
  const fromEnv = process.env.OPS_DIGEST_EMAILS?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv?.length) return fromEnv;

  const supabase = createAdminClient();
  const { data: profiles } = await supabase.from("profiles").select("email").eq("role", "admin");

  return (profiles ?? [])
    .map((p) => p.email?.trim().toLowerCase())
    .filter(Boolean) as string[];
}

async function sendHtmlEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResendClient();
  const from = getEmailFromAddress();
  if (!resend) {
    console.log(`[${BRAND.name}] RESEND missing — would send to ${to}: ${subject}`);
    console.log(html.slice(0, 500));
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type FulfillmentSendResult = {
  scheduleId: string;
  restaurantSent: boolean;
  officeSent: number;
  opsSent: number;
  errors: string[];
};

/** Send restaurant, office admin, and ops digest emails for one schedule. */
export async function sendFulfillmentDigestsForSchedule(
  scheduleId: string,
  opts?: { force?: boolean }
): Promise<FulfillmentSendResult> {
  const supabase = createAdminClient();
  const { data: schedule } = await supabase
    .from("daily_lunch_schedules")
    .select("id, lunch_date, office_id, restaurant_id, fulfillment_digest_sent_at")
    .eq("id", scheduleId)
    .single();

  const result: FulfillmentSendResult = {
    scheduleId,
    restaurantSent: false,
    officeSent: 0,
    opsSent: 0,
    errors: [],
  };

  if (!schedule) {
    result.errors.push("Schedule not found");
    return result;
  }

  if (
    !opts?.force &&
    schedule.fulfillment_digest_sent_at &&
    schedule.fulfillment_digest_sent_at.slice(0, 10) === schedule.lunch_date
  ) {
    result.errors.push("Already sent for this lunch date (use force to resend)");
    return result;
  }

  const built = await buildDigestBlockForSchedule(scheduleId);
  if ("error" in built) {
    result.errors.push(built.error);
    return result;
  }

  const { block, restaurantEmail } = built;
  if (!block.orders.length) {
    result.errors.push("No paid orders — skipped send");
    return result;
  }

  const dateLabel = block.lunchDate;
  const subjectBase = `${BRAND.name} — ${block.officeName} — ${dateLabel}`;

  if (restaurantEmail) {
    const html = buildRestaurantFulfillmentHtml(block);
    const r = await sendHtmlEmail(
      restaurantEmail,
      `Kitchen orders — ${subjectBase}`,
      html
    );
    if (r.ok) result.restaurantSent = true;
    else if (r.error) result.errors.push(`Restaurant: ${r.error}`);
  } else {
    result.errors.push("Restaurant email missing");
  }

  const officeEmails = await getOfficeAdminEmails(schedule.office_id);
  const officeHtml = buildOfficeFulfillmentHtml(block);
  for (const to of officeEmails) {
    const r = await sendHtmlEmail(to, `Today's delivery — ${subjectBase}`, officeHtml);
    if (r.ok) result.officeSent += 1;
    else if (r.error) result.errors.push(`Office ${to}: ${r.error}`);
  }

  await supabase
    .from("daily_lunch_schedules")
    .update({ fulfillment_digest_sent_at: new Date().toISOString() })
    .eq("id", scheduleId);

  return result;
}

export type DailyFulfillmentCronResult = {
  lunchDate: string;
  schedulesProcessed: number;
  opsEmailSent: boolean;
  results: FulfillmentSendResult[];
  errors: string[];
};

/** All schedules for lunch_date with paid orders — grouped ops email + per-schedule restaurant/office. */
export async function runDailyFulfillmentCron(
  lunchDate = getChicagoDateString(),
  opts?: { force?: boolean }
): Promise<DailyFulfillmentCronResult> {
  const supabase = createAdminClient();
  const out: DailyFulfillmentCronResult = {
    lunchDate,
    schedulesProcessed: 0,
    opsEmailSent: false,
    results: [],
    errors: [],
  };

  const { data: schedules, error } = await supabase
    .from("daily_lunch_schedules")
    .select("id, restaurant_id, status, fulfillment_digest_sent_at, lunch_date")
    .eq("lunch_date", lunchDate)
    .not("status", "eq", "cancelled");

  if (error) {
    out.errors.push(error.message);
    return out;
  }

  if (!schedules?.length) return out;

  const blocks: { restaurantId: string; restaurantName: string; block: DigestOfficeBlock }[] = [];

  for (const sched of schedules) {
    const built = await buildDigestBlockForSchedule(sched.id);
    if ("error" in built) {
      out.errors.push(`${sched.id}: ${built.error}`);
      continue;
    }
    if (!built.block.orders.length) continue;

    blocks.push({
      restaurantId: sched.restaurant_id,
      restaurantName: built.block.restaurantName,
      block: built.block,
    });

    const per = await sendFulfillmentDigestsForSchedule(sched.id, { force: opts?.force });
    out.results.push(per);
    out.schedulesProcessed += 1;
  }

  if (blocks.length) {
    const byRestaurantMap = new Map<
      string,
      { restaurantName: string; blocks: DigestOfficeBlock[] }
    >();
    for (const row of blocks) {
      const existing = byRestaurantMap.get(row.restaurantId) ?? {
        restaurantName: row.restaurantName,
        blocks: [],
      };
      existing.blocks.push(row.block);
      byRestaurantMap.set(row.restaurantId, existing);
    }

    const byRestaurant = Array.from(byRestaurantMap.values()).sort((a, b) =>
      a.restaurantName.localeCompare(b.restaurantName)
    );

    const opsHtml = buildAdminFulfillmentHtml(formatChicagoLunchDate(lunchDate), byRestaurant);
    const opsEmails = await getPlatformOpsEmails();
    for (const to of opsEmails) {
      const r = await sendHtmlEmail(
        to,
        `${BRAND.name} — daily fulfillment — ${formatChicagoLunchDate(lunchDate)}`,
        opsHtml
      );
      if (r.ok) out.opsEmailSent = true;
      else if (r.error) out.errors.push(`Ops ${to}: ${r.error}`);
    }
  }

  return out;
}

export function isChicagoFulfillmentWindow(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CHICAGO_TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? -1);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? -1);
  return hour === 9 && minute >= 30 && minute < 45;
}
