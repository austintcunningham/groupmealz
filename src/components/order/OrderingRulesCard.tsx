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
    <details className="geaux-info-panel group open:shadow-[var(--geaux-shadow-md)] transition-shadow duration-200">
      <summary className="cursor-pointer list-none px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--geaux-red)]">
            How ordering works
          </h3>
          <span className="text-xs font-medium text-slate-500 transition-transform duration-200 group-open:rotate-180">
            ▾
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 group-open:hidden">
          Tap to see order windows, fees, and payment details
        </p>
      </summary>
      <ul className="space-y-2.5 border-t border-amber-100/80 px-5 pb-5 pt-3 text-sm leading-relaxed text-slate-700">
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
    </details>
  );
}
