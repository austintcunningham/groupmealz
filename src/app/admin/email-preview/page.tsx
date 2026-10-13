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

const previews = ["customer", "restaurant", "office", "ops"] as const;
type PreviewKind = (typeof previews)[number];

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
          { name: "Firehouse Hero Sub", qty: 1, lineCents: 30, sizeLabel: "Medium" },
        ],
        subtotalCents: 1399,
        taxCents: 147,
        totalCents: 1546,
      },
    ],
  };
}

function htmlForKind(kind: PreviewKind): string {
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
  searchParams: Promise<{ type?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const kind: PreviewKind = previews.includes(params.type as PreviewKind)
    ? (params.type as PreviewKind)
    : "customer";

  const html = htmlForKind(kind);

  const labels: Record<PreviewKind, string> = {
    customer: "Customer confirmation (after payment)",
    restaurant: "Restaurant kitchen sheet (9:30 AM)",
    office: "Office admin delivery summary (9:30 AM)",
    ops: "Group Meals ops rollup (9:30 AM)",
  };

  return (
    <DashboardShell role={profile.role} title="Email preview">
      <div className="mb-4 flex flex-wrap gap-2">
        {previews.map((p) => (
          <Link
            key={p}
            href={`/admin/email-preview?type=${p}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              kind === p ? "bg-red-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {labels[p]}
          </Link>
        ))}
      </div>
      <p className="mb-4 text-sm text-slate-600">{labels[kind]} — printable, low-ink layout for fulfillment emails.</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
        <iframe title="Email preview" srcDoc={html} className="h-[900px] w-full border-0 bg-white" sandbox="" />
      </div>
    </DashboardShell>
  );
}
