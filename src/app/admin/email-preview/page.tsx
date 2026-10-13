import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { requireAdmin } from "@/lib/auth/guards";
import { sampleOrderConfirmationHtml } from "@/lib/email/order-confirmation-html";
import {
  buildAdminFulfillmentHtml,
  buildOfficeFulfillmentHtml,
  sampleRestaurantFulfillmentHtml,
  type DigestOfficeBlock,
} from "@/lib/email/printable-order-digest";
import { sampleReviewRequestHtml } from "@/lib/email/review-request";
import { sampleRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";
import { sampleOfficeWeeklySummaryHtml } from "@/lib/email/weekly-office-html";
import { sampleOpsWeeklySummaryHtml } from "@/lib/email/weekly-ops-html";

const dailyPreviews = ["customer", "restaurant", "office", "ops"] as const;
const afterLunchPreviews = ["review-invite"] as const;
const weeklyPreviews = ["weekly-restaurant", "weekly-office", "weekly-ops"] as const;

type DailyKind = (typeof dailyPreviews)[number];
type AfterLunchKind = (typeof afterLunchPreviews)[number];
type WeeklyKind = (typeof weeklyPreviews)[number];
type PreviewKind = DailyKind | AfterLunchKind | WeeklyKind;

function sampleOfficeBlock(): DigestOfficeBlock {
  return {
    officeName: "Iberville Building",
    streetAddress: "627 N. 4th St.",
    cityStateZip: "Baton Rouge, LA 70802",
    deliveryInstructions: "Individually labeled bags; check in at front desk.",
    contactName: "Office admin",
    contactPhone: "(225) 555-0100",
    restaurantName: "Firehouse Subs Gonzales",
    lunchDate: "Monday, October 12, 2026",
    deliveryAt: "12:00 PM",
    orders: [
      {
        orderId: "2879739a-0000-4000-8000-000000000001",
        placedAt: "10/12/2026 7:16:07 AM",
        customerName: "Paige Campbell",
        customerEmail: "paige.campbell.dcfs@la.gov",
        lines: [
          {
            name: "Sub, Chips, & Drink — Combo",
            qty: 1,
            lineCents: 1369,
            specialInstructions: "no lettuce or tomato, please",
          },
        ],
        subtotalCents: 1399,
        taxCents: 147,
        totalCents: 1546,
      },
    ],
  };
}

function htmlForKind(cadence: string, type: string): string {
  if (cadence === "weekly") {
    const kind = weeklyPreviews.includes(type as WeeklyKind) ? (type as WeeklyKind) : "weekly-restaurant";
    switch (kind) {
      case "weekly-restaurant":
        return sampleRestaurantWeeklyPayoutHtml();
      case "weekly-office":
        return sampleOfficeWeeklySummaryHtml();
      case "weekly-ops":
        return sampleOpsWeeklySummaryHtml();
    }
  }
  if (cadence === "after-lunch" || type === "review-invite") {
    return sampleReviewRequestHtml();
  }
  const kind = dailyPreviews.includes(type as DailyKind) ? (type as DailyKind) : "customer";
  const block = sampleOfficeBlock();
  switch (kind) {
    case "customer":
      return sampleOrderConfirmationHtml();
    case "restaurant":
      return sampleRestaurantFulfillmentHtml();
    case "office":
      return buildOfficeFulfillmentHtml(block);
    case "ops":
      return buildAdminFulfillmentHtml(block.lunchDate, [
        { restaurantName: block.restaurantName, blocks: [block] },
      ]);
  }
}

export default async function AdminEmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ cadence?: string; type?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const cadence = params.cadence ?? "daily";
  const type = params.type ?? "customer";

  const html = htmlForKind(cadence, type);

  const dailyLabels: Record<DailyKind, string> = {
    customer: "Customer confirmation",
    restaurant: "Restaurant kitchen (daily 9:30 AM)",
    office: "Office admin delivery (daily 9:30 AM)",
    ops: "Ops daily fulfillment",
  };

  const afterLunchLabels: Record<AfterLunchKind, string> = {
    "review-invite": "Customer review invitation",
  };

  const weeklyLabels: Record<WeeklyKind, string> = {
    "weekly-restaurant": "Restaurant weekly payout (check stub)",
    "weekly-office": "Office admin weekly meals (no pricing)",
    "weekly-ops": "Group Meals weekly ops report",
  };

  let description = "";
  if (cadence === "after-lunch" || type === "review-invite") {
    description =
      "Sent to the customer’s checkout email (orders.customer_email) for each paid order, one time only, after scheduled delivery + 45 minutes. Hourly cron; subject: “How was [Restaurant]? Rate your Group Meals lunch”. Button links to /review/[orderId].";
  } else if (cadence === "weekly") {
    description = weeklyLabels[weeklyPreviews.includes(type as WeeklyKind) ? (type as WeeklyKind) : "weekly-restaurant"];
  } else {
    description = dailyLabels[dailyPreviews.includes(type as DailyKind) ? (type as DailyKind) : "customer"];
  }

  return (
    <DashboardShell role={profile.role} title="Email preview">
      <p className="mb-3 text-sm font-medium text-slate-700">Daily</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {dailyPreviews.map((p) => (
          <Link
            key={p}
            href={`/admin/email-preview?cadence=daily&type=${p}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              cadence === "daily" && type === p
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {dailyLabels[p]}
          </Link>
        ))}
      </div>

      <p className="mb-3 text-sm font-medium text-slate-700">After lunch</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {afterLunchPreviews.map((p) => (
          <Link
            key={p}
            href={`/admin/email-preview?cadence=after-lunch&type=${p}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              (cadence === "after-lunch" || type === p) && type === p
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {afterLunchLabels[p]}
          </Link>
        ))}
      </div>

      <p className="mb-3 text-sm font-medium text-slate-700">Weekly (Friday 4 PM Central, Mon–Fri)</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {weeklyPreviews.map((p) => (
          <Link
            key={p}
            href={`/admin/email-preview?cadence=weekly&type=${p}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              cadence === "weekly" && type === p
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {weeklyLabels[p]}
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm text-slate-600">{description}</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
        <iframe title="Email preview" srcDoc={html} className="h-[900px] w-full border-0 bg-white" sandbox="" />
      </div>
    </DashboardShell>
  );
}
