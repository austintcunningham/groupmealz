import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OrderFlowClient } from "@/components/employee/OrderFlowClient";
import { Card } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { getSessionProfile } from "@/lib/auth/guards";
import { getOfficeBySlug, loadOfficeOrderContext } from "@/lib/order/office-order-page";

export default async function OfficeOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { slug } = await params;
  const { date: dateParam } = await searchParams;
  const office = await getOfficeBySlug(slug);
  if (!office) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today;
  const profile = await getSessionProfile();
  const ctx = await loadOfficeOrderContext(office, selectedDate);

  const header = (
    <header className="geaux-header-gradient text-white">
      <div className="geaux-accent-bar" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <span className="text-xl font-black text-[var(--geaux-yellow)]">{BRAND.name}</span>
          <p className="text-sm text-white/80">{office.name}</p>
        </div>
        <Link href="/login" className="text-sm text-white/90 hover:text-[var(--geaux-yellow)]">
          Staff login
        </Link>
      </div>
    </header>
  );

  if (!ctx.schedule) {
    return (
      <div className="min-h-screen bg-[var(--geaux-cream)]">
        {header}
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Card title="No lunches scheduled">
            <p className="text-slate-600">Check back soon — your office hasn&apos;t posted this week&apos;s menu yet.</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--geaux-cream)]">
      {header}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading menu…</p>}>
          <OrderFlowClient
            office={office}
            schedule={ctx.schedule}
            weekDays={ctx.weekDays}
            categories={ctx.categories}
            menuItems={ctx.menuItems}
            guestMode
            isLoggedIn={!!profile}
            userEmail={profile?.email}
            userName={profile?.full_name}
            advanceOrderHours={ctx.advanceOrderHours}
            feeSettings={ctx.feeSettings}
          />
        </Suspense>
      </main>
    </div>
  );
}
