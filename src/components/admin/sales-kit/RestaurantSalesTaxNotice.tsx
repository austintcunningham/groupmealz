export function RestaurantSalesTaxNotice({ compact }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      {!compact ? (
        <h3 className="text-lg font-bold text-[var(--geaux-charcoal)]">Sales tax</h3>
      ) : null}
      <p className={compact ? "" : "mt-2 text-sm leading-relaxed text-slate-600"}>
        <strong>Sales tax is collected on customer orders</strong> at checkout and{" "}
        <strong>included in the amounts paid to your restaurant</strong> on settlement (see the Tax
        line on weekly payout summaries).{" "}
        <strong>Your restaurant is responsible for remitting sales tax</strong> to the appropriate
        state and local authorities — {compact ? "same as your in-store sales." : "the same way you handle tax on in-store sales."}
      </p>
    </div>
  );
}
