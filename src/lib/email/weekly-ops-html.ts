import { formatCents } from "@/lib/money/format";
import { BRAND } from "@/lib/brand";
import { escapeHtml } from "@/lib/email/html-utils";
import type { OpsWeekSummary } from "@/lib/weekly-reports/load-week";
import { stubRow, wrapPrintableEmail } from "@/lib/email/weekly-printable";

function fmtRating(n: number | null): string {
  if (n == null) return "—";
  return n.toFixed(1);
}

export function buildOpsWeeklySummaryHtml(summary: OpsWeekSummary): string {
  const satisfaction =
    summary.reviewCount === 0
      ? `<p class="muted">No verified reviews submitted this week yet. Review surveys will populate this section.</p>`
      : `${stubRow("Average rating", `${fmtRating(summary.averageRating)} / 5`, true)}
         ${stubRow("Review count", String(summary.reviewCount))}
         <table class="simple">
           <thead><tr><th>Restaurant</th><th class="num">Avg</th><th class="num">Reviews</th></tr></thead>
           <tbody>${summary.byRestaurantRating
             .map(
               (r) =>
                 `<tr><td>${escapeHtml(r.restaurantName)}</td><td class="num">${r.avg.toFixed(1)}</td><td class="num">${r.count}</td></tr>`
             )
             .join("")}</tbody>
         </table>`;

  const officeRows = summary.officeSummaries
    .map((o) => {
      const detail = o.byRestaurant.map((r) => `${r.restaurantName} (${r.meals})`).join(", ");
      return `<tr><td>${escapeHtml(o.officeName)}</td><td class="num">${o.totalMeals}</td><td>${escapeHtml(detail || "—")}</td></tr>`;
    })
    .join("");

  const restaurantMealRows = summary.mealsByRestaurant
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.restaurantName)}</td><td class="num">${r.meals}</td></tr>`
    )
    .join("");

  const body = `
    <h1>${escapeHtml(BRAND.name)} — weekly report</h1>
    <p class="muted">Week of ${escapeHtml(summary.period.label)} (Central Time)</p>

    <div class="bar">Customer satisfaction</div>
    ${satisfaction}

    <div class="bar">Meals by office</div>
    <table class="simple">
      <thead><tr><th>Office</th><th class="num">Meals</th><th>Restaurants (count)</th></tr></thead>
      <tbody>${officeRows || `<tr><td colspan="3">No orders</td></tr>`}</tbody>
    </table>

    <div class="bar">Meals by restaurant</div>
    <table class="simple">
      <thead><tr><th>Restaurant</th><th class="num">Meals</th></tr></thead>
      <tbody>${restaurantMealRows || `<tr><td colspan="2">No orders</td></tr>`}</tbody>
    </table>

    <div class="bar">Revenue (paid orders, lunch dates in period)</div>
    ${stubRow("Orders", String(summary.revenue.orderCount))}
    ${stubRow("Gross sales (subtotal + tax + tip)", formatCents(summary.revenue.grossSalesCents))}
    ${stubRow("Sales tax collected", formatCents(summary.revenue.taxCents))}
    ${stubRow("Platform / service fees", formatCents(summary.revenue.platformFeeCents), true)}
    ${stubRow("Restaurant payouts due", formatCents(summary.revenue.restaurantPayoutCents), true)}`;

  return wrapPrintableEmail(body);
}

export function sampleOpsWeeklySummaryHtml(): string {
  return buildOpsWeeklySummaryHtml({
    period: { weekStart: "2026-10-06", weekEnd: "2026-10-12", label: "10/06/2026 – 10/12/2026" },
    reviewCount: 23,
    averageRating: 4.6,
    byRestaurantRating: [
      { restaurantName: "Firehouse Subs Gonzales", avg: 4.8, count: 15 },
      { restaurantName: "Panera Bread", avg: 4.2, count: 8 },
    ],
    officeSummaries: [
      {
        officeId: "1",
        officeName: "Iberville Building",
        totalMeals: 54,
        byRestaurant: [
          { restaurantName: "Firehouse Subs Gonzales", meals: 42 },
          { restaurantName: "Panera Bread", meals: 12 },
        ],
      },
    ],
    mealsByRestaurant: [
      { restaurantName: "Firehouse Subs Gonzales", meals: 42 },
      { restaurantName: "Panera Bread", meals: 12 },
    ],
    revenue: {
      orderCount: 54,
      grossSalesCents: 85000,
      platformFeeCents: 13500,
      taxCents: 7200,
      restaurantPayoutCents: 64300,
      platformNetCents: 13500,
    },
  });
}
