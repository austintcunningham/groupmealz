import { BRAND } from "@/lib/brand";
import { escapeHtml } from "@/lib/email/html-utils";
import type { OfficeWeekSummary } from "@/lib/weekly-reports/load-week";
import type { SettlementPeriod } from "@/lib/accounting/restaurant-settlement";
import { wrapPrintableEmail, stubRow } from "@/lib/email/weekly-printable";

export function buildOfficeWeeklySummaryHtml(
  summary: OfficeWeekSummary,
  period: SettlementPeriod
): string {
  const lines = summary.byRestaurant
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.restaurantName)}</td><td class="num">${r.meals}</td></tr>`
    )
    .join("");

  const body = `
    <h1>Weekly lunch summary — ${escapeHtml(summary.officeName)}</h1>
    <p class="muted">Week of ${escapeHtml(period.label)} (Central Time).</p>
    <div class="bar">Meals by restaurant</div>
    <table class="simple">
      <thead><tr><th>Restaurant</th><th class="num">Meals</th></tr></thead>
      <tbody>${lines || `<tr><td colspan="2">No orders this week</td></tr>`}</tbody>
    </table>
    <hr class="rule" />
    ${stubRow("Total meals", String(summary.totalMeals), true)}
    <p class="muted">${escapeHtml(BRAND.name)} — office admin weekly update</p>`;

  return wrapPrintableEmail(body);
}

export function sampleOfficeWeeklySummaryHtml(): string {
  return buildOfficeWeeklySummaryHtml(
    {
      officeId: "sample",
      officeName: "Iberville Building",
      totalMeals: 54,
      byRestaurant: [
        { restaurantName: "Firehouse Subs Gonzales", meals: 42 },
        { restaurantName: "Panera Bread", meals: 12 },
      ],
    },
    {
      weekStart: "2026-10-06",
      weekEnd: "2026-10-10",
      label: "10/06/2026 – 10/10/2026 (Mon–Fri)",
    }
  );
}
