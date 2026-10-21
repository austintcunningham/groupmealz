import { BRAND } from "@/lib/brand";

const steps = [
  {
    title: "Order & delivery",
    body: "Employees order ahead; restaurants prepare from the morning order list; lunch arrives on schedule.",
  },
  {
    title: "Review invitation",
    body: "After delivery, each customer gets one email with a link to rate that specific meal.",
  },
  {
    title: "Verified feedback",
    body: "One review per paid order — tied to restaurant, office, and date (not anonymous spam).",
  },
  {
    title: "Action & reporting",
    body: `${BRAND.name} monitors trends, shares highlights with partners, and surfaces issues before they become habits.`,
  },
];

export function SatisfactionFlowCard({ variant }: { variant: "restaurant" | "office" }) {
  const headline =
    variant === "restaurant"
      ? "We turn lunch into a feedback loop — so quality (and repeat orders) go up"
      : "We measure satisfaction so your team feels heard — not ignored";

  const sub =
    variant === "restaurant"
      ? "Happy offices reorder. Unhappy ones churn. Our review system gives you signal while orders are still recurring."
      : "You're not buying a faceless meal ticket. You're partnering with a local operator who tracks how lunch actually landed.";

  return (
    <section className="sales-kit-section break-inside-avoid rounded-2xl border-2 border-[var(--geaux-yellow)] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">{headline}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{sub}</p>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3 rounded-xl bg-[var(--geaux-cream)] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--geaux-red)] text-sm font-bold text-white">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-slate-800">{s.title}</p>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Static mock of the customer review screen for print/PDF packets */
export function ReviewScreenMock() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-inner">
      <p className="text-center text-xs font-medium uppercase tracking-wide text-slate-500">
        Sample review screen (same as customer link)
      </p>
      <p className="mt-3 text-center text-sm font-semibold text-slate-800">
        Firehouse Subs Gonzales
      </p>
      <p className="text-center text-xs text-slate-500">Monday lunch · Iberville Building</p>
      <div className="mt-4 flex justify-center gap-1 text-3xl text-[var(--geaux-yellow)]">
        ★★★★★
      </div>
      <p className="mt-3 text-sm text-slate-600 italic text-center">
        “Hot, on time, and they got my ‘no tomato’ right. Best office lunch this month.”
      </p>
      <p className="mt-4 text-center text-xs text-slate-500">
        Aggregated in admin · shared with restaurant partners · informs weekly ops reports
      </p>
    </div>
  );
}
