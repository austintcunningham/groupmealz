import { formatOrderingWindow } from "@/lib/scheduling/window";
import type { DailyLunchSchedule } from "@/types/database";

export function OrderingRulesCard({
  schedule,
  advanceOrderHours,
}: {
  schedule: Pick<DailyLunchSchedule, "order_opens_at" | "order_cutoff_at" | "delivery_at" | "status">;
  advanceOrderHours: number;
}) {
  const cutoffLocal = new Date(schedule.order_cutoff_at).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const deliveryLocal = new Date(schedule.delivery_at).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-[var(--geaux-yellow)] bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--geaux-red)]">
        How ordering works
      </h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        <li>
          <strong>When you can order:</strong> Only while this day shows{" "}
          <span className="font-semibold text-green-700">Open</span> on the calendar{" "}
          <em>and</em> the current time is inside the order window (
          {formatOrderingWindow(schedule)}).
        </li>
        <li>
          <strong>Advance ordering:</strong> Windows typically open up to{" "}
          <strong>{advanceOrderHours} hours</strong> before lunch day (set by your office admin).
        </li>
        <li>
          <strong>Order cutoff:</strong> {cutoffLocal} — no new orders after this time.
        </li>
        <li>
          <strong>Delivery target:</strong> {deliveryLocal}.
        </li>
        <li>
          <strong>Service fee:</strong> $2.50 per <strong>entrée</strong> quantity in your cart. Sides,
          drinks, and add-ons marked as non-entrées do not incur this fee.
        </li>
        <li>
          <strong>Gratuity:</strong> Optional — add a tip at checkout if you like.
        </li>
        <li>
          <strong>Payment:</strong> Card required at checkout; your order is confirmed when payment
          succeeds.
        </li>
        <li>
          <strong>No account needed:</strong> Use your name and email for this order only.
        </li>
      </ul>
    </div>
  );
}
