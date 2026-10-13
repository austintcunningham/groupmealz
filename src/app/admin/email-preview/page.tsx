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
import { sampleRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";
import { sampleOfficeWeeklySummaryHtml } from "@/lib/email/weekly-office-html";
import { sampleOpsWeeklySummaryHtml } from "@/lib/email/weekly-ops-html";

const dailyPreviews = ["customer", "restaurant", "office", "ops"] as const;
const weeklyPreviews = ["weekly-restaurant", "weekly-office", "weekly-ops"] as const;

type DailyKind = (typeof dailyPreviews)[number];
type WeeklyKind = (typeof weeklyPreviews)[number];

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

function htmlForDaily(kind: DailyKind): string {
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

function htmlForWeekly(kind: WeeklyKind): string {
  switch (kind) {
    case "weekly-restaurant":
      return sampleRestaurantWeeklyPayoutHtml();
    case "weekly-office":
      return sampleOfficeWeeklySummaryHtml();
    case "weekly-ops":
      return sampleOpsWeeklySummaryHtml();
  }
}

export default async function AdminEmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ cadence?: string; type?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const cadence = params.cadence === "weekly" ? "weekly" : "daily";

  const dailyKind: DailyKind = dailyPreviews.includes(params.type as DailyKind)
    ? (params.type as DailyKind)
    : "customer";
  const weeklyKind: WeeklyKind = weeklyPreviews.includes(params.type as WeeklyKind)
    ? (params.type as WeeklyKind)
    : "weekly-restaurant";

  const html = cadence === "weekly" ? htmlForWeekly(weeklyKind) : htmlForDaily(dailyKind);

  const dailyLabels: Record<DailyKind, string> = {
    customer: "Customer confirmation",
    restaurant: "Restaurant kitchen (daily 9:30 AM)",
    office: "Office admin delivery (daily 9:30 AM)",
    ops: "Ops daily fulfillment",
  };

  const weeklyLabels: Record<WeeklyKind, string> = {
    "weekly-restaurant": "Restaurant weekly payout (check stub)",
    "weekly-office": "Office admin weekly meals (no pricing)",
    "weekly-ops": "Group Meals weekly ops report",
  };

  return (
    <DashboardShell role={profile.role} title="Email preview">
      <p className="mb-3 text-sm font-medium text-slate-700">Daily</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {dailyPreviews.map((p) => (
          <Link
            key={p}
            href={`/admin/email-preview?cadence=daily&type=${p}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              cadence === "daily" && dailyKind === p
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {dailyLabels[p]}
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
              cadence === "weekly" && weeklyKind === p
                ? "bg-red-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {weeklyLabels[p]}
          </Link>
        ))}
      </div>

      <p className="mb-4 text-sm text-slate-600">
        {cadence === "weekly" ? weeklyLabels[weeklyKind] : dailyLabels[dailyKind]}
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
        <iframe title="Email preview" srcDoc={html} className="h-[900px] w-full border-0 bg-white" sandbox="" />
      </div>
    </DashboardShell>
  );
}
