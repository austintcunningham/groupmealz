import type { RestaurantNotice } from "@/types/database";

/** High-visibility kitchen updates shown before customers browse the menu. */
export function RestaurantKitchenNotices({
  restaurantName,
  notices,
}: {
  restaurantName: string;
  notices: Pick<RestaurantNotice, "id" | "message">[];
}) {
  if (!notices.length) return null;

  return (
    <aside
      className="geaux-kitchen-notice animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label={`Kitchen updates from ${restaurantName}`}
    >
      <div className="geaux-kitchen-notice-accent" aria-hidden />
      <div className="flex gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--geaux-yellow)] text-[var(--geaux-charcoal)] shadow-[var(--geaux-shadow-sm)]"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.25">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--geaux-red)]">
            Kitchen update
            <span className="font-semibold normal-case tracking-normal text-slate-500">
              {" "}
              · {restaurantName}
            </span>
          </p>
          <ul className="mt-1.5 space-y-1">
            {notices.map((n) => (
              <li key={n.id} className="text-sm font-semibold leading-snug text-[var(--geaux-charcoal)] sm:text-[0.95rem]">
                {n.message}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            These items may be unavailable — choose something else if your order depends on them.
          </p>
        </div>
      </div>
    </aside>
  );
}
