import type { DailyLunchSchedule, PlatformSettings } from "@/types/database";

export function isOrderingWindowOpen(
  schedule: Pick<
    DailyLunchSchedule,
    "status" | "order_opens_at" | "order_cutoff_at"
  >,
  now: Date = new Date()
): boolean {
  if (schedule.status !== "open") return false;
  const t = now.getTime();
  return (
    t >= new Date(schedule.order_opens_at).getTime() &&
    t < new Date(schedule.order_cutoff_at).getTime()
  );
}

export function computeOrderOpensAt(
  lunchDate: string,
  cutoffAt: Date,
  advanceHours: number
): Date {
  const lunch = new Date(`${lunchDate}T12:00:00`);
  const opens = new Date(lunch.getTime() - advanceHours * 60 * 60 * 1000);
  // Never open after cutoff
  return opens < cutoffAt ? opens : new Date(cutoffAt.getTime() - advanceHours * 60 * 60 * 1000);
}

export function formatOrderingWindow(
  schedule: Pick<DailyLunchSchedule, "order_opens_at" | "order_cutoff_at">
): string {
  const opens = new Date(schedule.order_opens_at).toLocaleString();
  const closes = new Date(schedule.order_cutoff_at).toLocaleString();
  return `${opens} – ${closes}`;
}

export function getDayName(dayOfWeek: number): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    dayOfWeek
  ] ?? "Unknown";
}

export async function getAdvanceOrderHours(
  settings?: Pick<PlatformSettings, "advance_order_hours"> | null
): Promise<number> {
  return settings?.advance_order_hours ?? 48;
}
