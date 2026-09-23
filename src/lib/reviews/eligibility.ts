/** Minutes after scheduled delivery before we allow (and prompt for) a review. */
export const REVIEW_MINUTES_AFTER_DELIVERY = 45;

export function getReviewOpensAt(
  lunchDate: string,
  deliveryAtIso: string | null | undefined
): Date {
  if (deliveryAtIso) {
    return new Date(new Date(deliveryAtIso).getTime() + REVIEW_MINUTES_AFTER_DELIVERY * 60 * 1000);
  }
  // Fallback: afternoon on lunch day (local noon anchor + 3h)
  return new Date(`${lunchDate}T15:00:00`);
}

export function isReviewOpen(opensAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= opensAt.getTime();
}

export function formatReviewOpensAt(opensAt: Date): string {
  return opensAt.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
