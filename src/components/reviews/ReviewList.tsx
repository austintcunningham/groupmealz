import type { RestaurantReview } from "@/types/database";

function StarsReadonly({ rating }: { rating: number }) {
  return (
    <span className="text-[var(--geaux-yellow)]" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-slate-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewList({
  reviews,
  showOffice = false,
}: {
  reviews: (RestaurantReview & { offices?: { name: string } | null })[];
  showOffice?: boolean;
}) {
  if (!reviews.length) {
    return <p className="text-sm text-slate-500">No customer reviews yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {reviews.map((r) => (
        <li key={r.id} className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StarsReadonly rating={r.rating} />
            <time className="text-xs text-slate-400">
              {new Date(r.created_at).toLocaleDateString()}
            </time>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-900">{r.reviewer_name}</p>
          {showOffice && r.offices?.name ? (
            <p className="text-xs text-slate-500">{r.offices.name}</p>
          ) : null}
          {r.comment ? (
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{r.comment}</p>
          ) : (
            <p className="mt-2 text-sm italic text-slate-400">No written comment.</p>
          )}
        </li>
      ))}
    </ul>
  );
}
