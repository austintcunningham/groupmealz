import { formatCents } from "@/lib/money/format";
import { escapeHtml } from "@/lib/email/html-utils";
import { BRAND } from "@/lib/brand";

export type DigestOrderLine = {
  name: string;
  qty: number;
  lineCents: number;
  sizeLabel?: string | null;
  removedIngredients?: string[];
  specialInstructions?: string | null;
};

export type DigestOrder = {
  orderId: string;
  placedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerNote?: string | null;
  lines: DigestOrderLine[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

export type DigestOfficeBlock = {
  officeName: string;
  streetAddress: string;
  cityStateZip: string;
  deliveryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  restaurantName: string;
  lunchDate: string;
  deliveryAt: string;
  orders: DigestOrder[];
};

const CSS = `
  body { margin:0; padding:16px; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#111; background:#fff; }
  .wrap { max-width:640px; margin:0 auto; }
  h1 { font-size:16px; margin:0 0 8px; }
  .muted { color:#444; font-size:12px; line-height:1.45; }
  .rule { border:0; border-top:1px solid #bbb; margin:16px 0; }
  .bar { background:#ddd; padding:6px 10px; font-weight:bold; font-size:12px; margin:12px 0 8px; }
  table.meta { width:100%; border-collapse:collapse; margin:8px 0; }
  table.meta td { padding:2px 0; vertical-align:top; }
  table.meta td:first-child { width:110px; font-weight:bold; }
  .order-block { margin:18px 0; padding-bottom:12px; border-bottom:1px solid #ccc; }
  .item-row { display:flex; justify-content:space-between; gap:12px; margin:4px 0; }
  .item-name { flex:1; }
  .item-price { white-space:nowrap; }
  .sub { margin-left:14px; font-size:12px; color:#333; }
  .note { font-style:italic; margin:4px 0 4px 14px; }
  .totals { margin-top:8px; }
  .totals div { display:flex; justify-content:space-between; margin:2px 0; }
  .totals .grand { font-weight:bold; margin-top:6px; padding-top:6px; border-top:1px solid #999; }
  .paid { margin-top:10px; font-size:11px; font-weight:bold; letter-spacing:0.02em; }
  .office-note { margin:12px 0; padding:8px 10px; border:1px solid #999; background:#f5f5f5; }
`;

function formatItemLabel(line: DigestOrderLine): string {
  let label = `${line.name}${line.qty > 1 ? ` (${line.qty})` : ""}`;
  if (line.sizeLabel) label += ` — ${line.sizeLabel}`;
  return label;
}

function renderOrder(order: DigestOrder, showPrices: boolean): string {
  const linesHtml = order.lines
    .map((line) => {
      const mods: string[] = [];
      if (line.removedIngredients?.length) {
        mods.push(`No: ${line.removedIngredients.join(", ")}`);
      }
      const modLines = mods
        .map((m) => `<div class="sub">- ${escapeHtml(m)}</div>`)
        .join("");
      const instr = line.specialInstructions
        ? `<div class="note">${escapeHtml(line.specialInstructions)}</div>`
        : "";
      return `
        <div class="item-row">
          <div class="item-name">${escapeHtml(formatItemLabel(line))}</div>
          ${showPrices ? `<div class="item-price">${formatCents(line.lineCents)}</div>` : ""}
        </div>
        ${modLines}
        ${instr}`;
    })
    .join("");

  return `
    <div class="order-block">
      <p class="muted"><strong>${escapeHtml(BRAND.name)}</strong> Order #${escapeHtml(order.orderId.slice(0, 8).toUpperCase())} (placed ${escapeHtml(order.placedAt)})</p>
      <table class="meta">
        <tr><td>Name:</td><td>${escapeHtml(order.customerName)}</td></tr>
        <tr><td>Phone:</td><td>${escapeHtml(order.customerPhone?.trim() || "—")}</td></tr>
        <tr><td>Email:</td><td>${escapeHtml(order.customerEmail)}</td></tr>
      </table>
      ${order.customerNote ? `<div class="office-note"><strong>Customer note:</strong> ${escapeHtml(order.customerNote)}</div>` : ""}
      <div class="bar">Order Details</div>
      ${linesHtml}
      ${
        showPrices
          ? `<div class="totals">
        <div><span>Items subtotal</span><span>${formatCents(order.subtotalCents)}</span></div>
        ${order.taxCents > 0 ? `<div><span>Sales tax</span><span>${formatCents(order.taxCents)}</span></div>` : ""}
        <div class="grand"><span>Total charge</span><span>${formatCents(order.totalCents)}</span></div>
      </div>
      <p class="paid">PAID IN FULL BY CREDIT CARD. ZERO BALANCE REMAINING.</p>`
          : ""
      }
    </div>`;
}

function renderOfficeHeader(block: DigestOfficeBlock, intro: string): string {
  const addr = [block.streetAddress, block.cityStateZip].filter(Boolean).join(", ");
  const note = block.deliveryInstructions
    ? `<div class="office-note"><strong>Office delivery notes:</strong> ${escapeHtml(block.deliveryInstructions)}</div>`
    : "";
  return `
    <div class="digest-shipment-header">
      <h1>${escapeHtml(intro)}</h1>
      <p class="muted">Deliver individually labeled orders to <strong>${escapeHtml(block.officeName)}</strong><br/>${escapeHtml(addr)}</p>
      ${note}
      <table class="meta">
        <tr><td>Restaurant:</td><td>${escapeHtml(block.restaurantName)}</td></tr>
        <tr><td>Lunch date:</td><td>${escapeHtml(block.lunchDate)}</td></tr>
        <tr><td>Delivery:</td><td>${escapeHtml(block.deliveryAt)}</td></tr>
        ${
          block.contactName
            ? `<tr><td>Contact:</td><td>${escapeHtml(block.contactName)}${block.contactPhone ? ` · ${escapeHtml(block.contactPhone)}` : ""}</td></tr>`
            : ""
        }
      </table>
      <hr class="rule" />
    </div>`;
}

/** Restaurant kitchen — full detail, printable, minimal color. */
export function buildRestaurantFulfillmentHtml(
  block: DigestOfficeBlock,
  options?: { sheetTitle?: string }
): string {
  const orders = block.orders.map((o) => renderOrder(o, true)).join("");
  const title =
    options?.sheetTitle ?? `Kitchen order sheet — ${block.restaurantName}`;
  const body = renderOfficeHeader(block, title);
  return wrapPrintableEmail(`${body}${orders}`);
}

/** Office admin — what to expect delivered today. */
export function buildOfficeFulfillmentHtml(block: DigestOfficeBlock): string {
  const orders = block.orders.map((o) => renderOrder(o, false)).join("");
  const body = renderOfficeHeader(
    block,
    `Today's lunch delivery — ${block.officeName}`
  );
  const summary = `<p class="muted">${block.orders.length} customer order${block.orders.length === 1 ? "" : "s"} from <strong>${escapeHtml(block.restaurantName)}</strong> expected around ${escapeHtml(block.deliveryAt)}.</p>`;
  return wrapPrintableEmail(`${body}${summary}${orders}`);
}

/** Platform admin — multiple office blocks grouped under one restaurant. */
export function buildAdminFulfillmentHtml(
  lunchDate: string,
  byRestaurant: { restaurantName: string; blocks: DigestOfficeBlock[] }[]
): string {
  let body = `<h1>${escapeHtml(BRAND.name)} — daily fulfillment (${escapeHtml(lunchDate)})</h1>`;
  for (const group of byRestaurant) {
    body += `<hr class="rule" /><h1 style="font-size:15px;">${escapeHtml(group.restaurantName)}</h1>`;
    for (const block of group.blocks) {
      body += renderOfficeHeader(block, block.officeName);
      body += block.orders.map((o) => renderOrder(o, true)).join("");
    }
  }
  return wrapPrintableEmail(body);
}

function wrapPrintableEmail(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light only" />
  <style>${CSS}</style>
</head>
<body>
  <div class="wrap">${bodyHtml}</div>
</body>
</html>`;
}

const FALLBACK_FULFILLMENT_MEALS: { name: string; lineCents: number; specialInstructions?: string }[] =
  [
    {
      name: "Hook & Ladder — Medium",
      lineCents: 1099,
      specialInstructions: "no lettuce or tomato, please",
    },
    { name: "Italian — Medium", lineCents: 1099 },
    { name: "Sub, Chips, & Drink — Combo", lineCents: 1369 },
    { name: "Engineer — Large", lineCents: 1299, specialInstructions: "extra mayo" },
    { name: "Meatball — Medium", lineCents: 1099 },
  ];

const SAMPLE_FULFILLMENT_CUSTOMERS = [
  ["Paige", "Campbell"],
  ["Marcus", "Chen"],
  ["Jordan", "Ellis"],
  ["Sam", "Nguyen"],
  ["Taylor", "Brooks"],
  ["Riley", "Martinez"],
  ["Casey", "Dupont"],
  ["Morgan", "Lee"],
  ["Avery", "Johnson"],
  ["Quinn", "Washington"],
  ["Jamie", "Patel"],
  ["Drew", "Garcia"],
  ["Alex", "Thompson"],
  ["Blake", "Robinson"],
  ["Cameron", "Wilson"],
  ["Dakota", "Brown"],
  ["Emery", "Davis"],
  ["Finley", "Miller"],
] as const;

export function sampleRestaurantFulfillmentHtml(options?: {
  inflatedVolume?: boolean;
  meals?: { name: string; lineCents: number; specialInstructions?: string }[];
  restaurantName?: string;
}): string {
  const meals =
    options?.meals && options.meals.length > 0 ? options.meals : FALLBACK_FULFILLMENT_MEALS;
  const restaurantName = options?.restaurantName ?? "Firehouse Subs Gonzales";
  const firstMeal = meals[0]!;

  if (!options?.inflatedVolume) {
    const subtotalCents = firstMeal.lineCents;
    const taxCents = Math.round(subtotalCents * 0.105);
    return buildRestaurantFulfillmentHtml({
      officeName: "Iberville Building",
      streetAddress: "627 N. 4th St.",
      cityStateZip: "Baton Rouge, LA 70802",
      deliveryInstructions: "Leave at front desk; call contact on arrival.",
      contactName: "Paige Campbell",
      contactPhone: null,
      restaurantName,
      lunchDate: "Monday, October 12, 2026",
      deliveryAt: "12:00 PM",
      orders: [
        {
          orderId: "2879739a-0000-4000-8000-000000000001",
          placedAt: "10/12/2026 7:16:07 AM",
          customerName: "Paige Campbell",
          customerEmail: "paige.campbell.dcfs@la.gov",
          lines: [
            {
              name: firstMeal.name,
              qty: 1,
              lineCents: firstMeal.lineCents,
              ...(firstMeal.specialInstructions
                ? { specialInstructions: firstMeal.specialInstructions }
                : {}),
            },
          ],
          subtotalCents,
          taxCents,
          totalCents: subtotalCents + taxCents,
        },
      ],
    });
  }

  const orders: DigestOrder[] = SAMPLE_FULFILLMENT_CUSTOMERS.map(([first, last], i) => {
    const meal = meals[i % meals.length]!;
    const subtotalCents = meal.lineCents;
    const taxCents = Math.round(subtotalCents * 0.105);
    return {
      orderId: `2879739a-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      placedAt: `10/12/2026 ${7 + (i % 3)}:${String(10 + (i % 50)).padStart(2, "0")}:00 AM`,
      customerName: `${first} ${last}`,
      customerEmail: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      lines: [
        {
          name: meal.name,
          qty: 1,
          lineCents: meal.lineCents,
          ...(meal.specialInstructions ? { specialInstructions: meal.specialInstructions } : {}),
        },
      ],
      subtotalCents,
      taxCents,
      totalCents: subtotalCents + taxCents,
    };
  });

  return buildRestaurantFulfillmentHtml({
    officeName: "Iberville Building",
    streetAddress: "627 N. 4th St.",
    cityStateZip: "Baton Rouge, LA 70802",
    deliveryInstructions: "Leave at front desk; call contact on arrival.",
    contactName: "Paige Campbell",
    contactPhone: null,
    restaurantName,
    lunchDate: "Monday, October 12, 2026",
    deliveryAt: "12:00 PM",
    orders,
  });
}
