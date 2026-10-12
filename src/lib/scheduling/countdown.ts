/** Milliseconds until order cutoff while the window is open; otherwise null. */
export function msUntilOrderCutoff(
  schedule: {
    status: string;
    order_opens_at: string;
    order_cutoff_at: string;
  },
  now: Date = new Date()
): number | null {
  if (schedule.status !== "open") return null;
  const t = now.getTime();
  const opens = new Date(schedule.order_opens_at).getTime();
  const cutoff = new Date(schedule.order_cutoff_at).getTime();
  if (t < opens || t >= cutoff) return null;
  return cutoff - t;
}

export function formatCountdownMs(ms: number): string {
  if (ms <= 0) return "Closed";
  const totalMinutes = Math.ceil(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes} min left`;
}
