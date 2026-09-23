import Link from "next/link";
import { shiftWeekAnchor } from "@/lib/accounting/restaurant-settlement";

export function ReportsWeekNav({
  weekAnchor,
  periodLabel,
  restaurantId,
}: {
  weekAnchor: string;
  periodLabel: string;
  restaurantId: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const prevWeek = shiftWeekAnchor(weekAnchor, -1);
  const nextWeek = shiftWeekAnchor(weekAnchor, 1);

  function href(week: string) {
    const params = new URLSearchParams({ restaurant: restaurantId, week });
    return `/restaurant/reports?${params.toString()}`;
  }

  const linkClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50";

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-900">Week of {periodLabel}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={href(prevWeek)} className={linkClass} aria-label="Previous week">
          ← Previous
        </Link>
        <Link
          href={href(today)}
          className={`${linkClass} ${weekAnchor === today ? "border-[var(--geaux-red)] text-[var(--geaux-red)]" : ""}`}
        >
          This week
        </Link>
        <Link href={href(nextWeek)} className={linkClass} aria-label="Next week">
          Next →
        </Link>
      </div>
    </div>
  );
}
