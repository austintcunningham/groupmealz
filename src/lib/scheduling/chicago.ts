/** Louisiana offices — order windows and fulfillment use Central Time (CST/CDT). */
export const BUSINESS_TZ = "America/Chicago";

export const DEFAULT_CUTOFF_TIME = "09:30:00";
export const DEFAULT_DELIVERY_TIME = "12:00:00";

export function getChicagoDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Wall-clock time on lunch_date in Central → UTC Date (handles DST). */
export function chicagoWallClockToDate(lunchDate: string, time: string): Date {
  const normalized = time.length >= 8 ? time : `${time}:00`;
  const [yyyy, mm, dd] = lunchDate.split("-").map(Number);
  const [hh, mi, ssRaw] = normalized.split(":");
  const ss = Number(ssRaw ?? 0);
  const hour = Number(hh);
  const minute = Number(mi);

  let utcMs = Date.UTC(yyyy, mm - 1, dd, hour, minute, ss);

  for (let i = 0; i < 5; i++) {
    const d = new Date(utcMs);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: BUSINESS_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(d);

    const part = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    const cy = part("year");
    const cmo = part("month");
    const cd = part("day");
    const ch = part("hour") % 24;
    const cmin = part("minute");
    const cs = part("second");

    if (cy === yyyy && cmo === mm && cd === dd && ch === hour && cmin === minute && cs === ss) {
      break;
    }

    const displayedMs = Date.UTC(cy, cmo - 1, cd, ch, cmin, cs);
    const wantedMs = Date.UTC(yyyy, mm - 1, dd, hour, minute, ss);
    utcMs += wantedMs - displayedMs;
  }

  return new Date(utcMs);
}

/** True during the 9:30 AM Central minute (allows ~2 min cron jitter). */
export function addChicagoDays(dateStr: string, days: number): string {
  const d = chicagoWallClockToDate(dateStr, "12:00:00");
  d.setUTCDate(d.getUTCDate() + days);
  return getChicagoDateString(d);
}

/** Monday–Sunday week containing `dateStr` (Central calendar dates). */
export function weekBoundsChicago(dateStr: string): {
  weekStart: string;
  weekEnd: string;
  label: string;
} {
  const dow = getChicagoDayOfWeek(dateStr);
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const weekStart = addChicagoDays(dateStr, diffToMonday);
  const weekEnd = addChicagoDays(weekStart, 6);

  const fmt = (iso: string) =>
    chicagoWallClockToDate(iso, "12:00:00").toLocaleDateString("en-US", {
      timeZone: BUSINESS_TZ,
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

  return {
    weekStart,
    weekEnd,
    label: `${fmt(weekStart)} – ${fmt(weekEnd)}`,
  };
}

/** Last fully completed Mon–Sun week before the current Central week. */
export function lastCompletedWeekPeriod(asOf?: string) {
  const anchor = asOf ?? getChicagoDateString();
  const current = weekBoundsChicago(anchor);
  const prevMonday = addChicagoDays(current.weekStart, -7);
  return weekBoundsChicago(prevMonday);
}

export function isChicagoWeeklySendWindow(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TZ,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? -1);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? -1);
  return weekday === "Monday" && hour === 8 && minute >= 0 && minute <= 5;
}

export function getChicagoDayOfWeek(lunchDate: string): number {
  const ref = chicagoWallClockToDate(lunchDate, "12:00:00");
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TZ,
    weekday: "long",
  }).format(ref);
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[weekday] ?? 0;
}

export function isChicagoNineThirtySendWindow(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TZ,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? -1);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? -1);
  return hour === 9 && minute >= 30 && minute <= 32;
}
