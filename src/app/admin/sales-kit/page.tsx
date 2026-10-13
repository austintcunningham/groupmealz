import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";
import { BRAND } from "@/lib/brand";

export default async function AdminSalesKitPage() {
  const profile = await requireAdmin();

  return (
    <DashboardShell role={profile.role} title="Sales kit">
      <SalesKitToolbar audience="hub" />
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-slate-600">
        Print-ready packets for pitching partners. Each includes real email samples, satisfaction
        tracking, and {BRAND.name} positioning — use <strong>Print / Save PDF</strong> in the browser
        to hand off or email as an attachment.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Restaurant partner packet">
          <p className="mb-4 text-sm text-slate-600">
            Revenue growth, predictable batch orders, daily kitchen digests, weekly payout
            summaries, and verified review feedback.
          </p>
          <Link
            href="/admin/sales-kit/restaurants"
            className="inline-flex rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--geaux-red-dark)]"
          >
            Open restaurant packet →
          </Link>
        </Card>
        <Card title="Office customer packet">
          <p className="mb-4 text-sm text-slate-600">
            Local-restaurant story, employee confirmations, admin fulfillment emails, post-lunch
            surveys, and weekly planning summaries.
          </p>
          <Link
            href="/admin/sales-kit/offices"
            className="inline-flex rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--geaux-red-dark)]"
          >
            Open office packet →
          </Link>
        </Card>
      </div>
      <p className="mt-8 text-xs text-slate-500">
        Tip: pair these with a live demo from{" "}
        <Link href="/admin/simulate-order" className="text-[var(--geaux-red)] hover:underline">
          order simulation
        </Link>{" "}
        or{" "}
        <Link href="/review/demo" className="text-[var(--geaux-red)] hover:underline">
          review demo
        </Link>
        .
      </p>
    </DashboardShell>
  );
}
