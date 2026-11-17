#!/usr/bin/env node
/**
 * Seed a clearly labeled DEMO catering catalog on Firehouse Subs Gonzales (fhs-g).
 * Does NOT enable live catering orders. Prices are illustrative placeholders only.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const text = readFileSync(resolve(root, ".env.local"), "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SLUG = "fhs-g";

/** Illustrative demo prices only — not authorized live selling prices. */
const CATALOG = [
  {
    category: "Boxed Lunches",
    items: [
      {
        name: "Standard Lieutenant Box Lunch",
        description: "Demo boxed lunch with a medium sub, chips, and a cookie. Placeholder catalog item.",
        price_cents: 1499,
        serves: 1,
        packaging: "Individual box",
      },
      {
        name: "Deluxe Lieutenant Box Lunch",
        description: "Demo deluxe boxed lunch with a medium sub, chips, cookie, and side. Placeholder catalog item.",
        price_cents: 1699,
        serves: 1,
        packaging: "Individual box",
      },
      {
        name: "Standard Rookie Box Lunch",
        description: "Demo smaller boxed lunch option. Placeholder catalog item.",
        price_cents: 1299,
        serves: 1,
        packaging: "Individual box",
      },
      {
        name: "Veggie Box Lunch",
        description: "Demo vegetarian boxed lunch. Placeholder catalog item.",
        price_cents: 1499,
        serves: 1,
        packaging: "Individual box",
      },
    ],
  },
  {
    category: "Sandwich Platters",
    items: [
      {
        name: "Standard Platter",
        description: "Demo sandwich platter for group catering. Placeholder catalog item.",
        price_cents: 8499,
        serves: 10,
        packaging: "Platter",
      },
      {
        name: "Deluxe Platter",
        description: "Demo deluxe sandwich platter. Placeholder catalog item.",
        price_cents: 8999,
        serves: 10,
        packaging: "Platter",
      },
      {
        name: "Build-Your-Own Platter",
        description: "Demo BYO platter — customize selections with the restaurant. Placeholder catalog item.",
        price_cents: 9499,
        serves: 10,
        packaging: "Platter",
      },
      {
        name: "Standard Platter Pack",
        description: "Demo platter pack with sides. Placeholder catalog item.",
        price_cents: 12999,
        serves: 10,
        packaging: "Pack",
      },
    ],
  },
  {
    category: "Salads",
    items: [
      {
        name: "Catering Salad Bowl",
        description: "Demo large salad for catering. Placeholder catalog item.",
        price_cents: 4499,
        serves: 8,
        packaging: "Bowl",
      },
      {
        name: "Individual Catering Salad",
        description: "Demo individual salad. Placeholder catalog item.",
        price_cents: 999,
        serves: 1,
        packaging: "Individual",
      },
    ],
  },
  {
    category: "Sides & Soups",
    items: [
      {
        name: "Chips Bundle",
        description: "Demo chip bundle for groups. Placeholder catalog item.",
        price_cents: 2499,
        serves: 10,
        packaging: "Bundle",
      },
      {
        name: "Soup Gallon",
        description: "Demo soup by the gallon. Placeholder catalog item.",
        price_cents: 3299,
        serves: 8,
        packaging: "Gallon",
      },
    ],
  },
  {
    category: "Desserts",
    items: [
      {
        name: "Cookie Platter",
        description: "Demo cookie platter. Placeholder catalog item.",
        price_cents: 3699,
        serves: 24,
        packaging: "Platter",
      },
      {
        name: "Brownie Platter",
        description: "Demo brownie platter. Placeholder catalog item.",
        price_cents: 3899,
        serves: 24,
        packaging: "Platter",
      },
    ],
  },
  {
    category: "Beverages",
    items: [
      {
        name: "Gallon Iced Tea",
        description: "Demo beverage gallon. Placeholder catalog item.",
        price_cents: 899,
        serves: 8,
        packaging: "Gallon",
      },
      {
        name: "Gallon Lemonade",
        description: "Demo beverage gallon. Placeholder catalog item.",
        price_cents: 999,
        serves: 8,
        packaging: "Gallon",
      },
    ],
  },
];

async function main() {
  const { data: restaurant, error: rErr } = await sb
    .from("restaurants")
    .select("*")
    .eq("slug", SLUG)
    .single();
  if (rErr || !restaurant) {
    console.error("Restaurant not found:", SLUG, rErr?.message);
    process.exit(1);
  }

  const { error: updErr } = await sb
    .from("restaurants")
    .update({
      supports_catering: true,
      catering_live_orders: false,
      catering_min_order_cents: 7500,
      catering_lead_hours: 24,
      catering_delivery_fee_cents: 0,
      catering_description:
        "Demo catering menu for GroupMeals UI development. Not authorized for live customer orders. Prices are illustrative placeholders.",
      catering_service_area: "Greater Baton Rouge (demo)",
      catering_cuisine: "Sandwiches & Subs",
    })
    .eq("id", restaurant.id);
  if (updErr) {
    console.error("Restaurant update failed:", updErr.message);
    process.exit(1);
  }

  // Remove prior demo catering-only categories/items for idempotent re-seed
  const { data: oldCats } = await sb
    .from("menu_categories")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .eq("catering_only", true);
  const oldCatIds = (oldCats ?? []).map((c) => c.id);
  if (oldCatIds.length) {
    await sb.from("menu_items").delete().in("category_id", oldCatIds);
    await sb.from("menu_categories").delete().in("id", oldCatIds);
  }

  let order = 100;
  for (const block of CATALOG) {
    const { data: cat, error: cErr } = await sb
      .from("menu_categories")
      .insert({
        restaurant_id: restaurant.id,
        name: block.category,
        display_order: order++,
        active: true,
        catering_only: true,
      })
      .select("id")
      .single();
    if (cErr || !cat) {
      console.error("Category insert failed:", block.category, cErr?.message);
      process.exit(1);
    }

    let itemOrder = 0;
    for (const item of block.items) {
      const { error: iErr } = await sb.from("menu_items").insert({
        restaurant_id: restaurant.id,
        category_id: cat.id,
        name: item.name,
        description: item.description,
        price_cents: item.price_cents,
        active: true,
        available: false,
        available_for_catering: true,
        catering_serves_count: item.serves,
        catering_packaging: item.packaging,
        display_order: itemOrder++,
        counts_as_entree: false,
      });
      if (iErr) {
        console.error("Item insert failed:", item.name, iErr.message);
        process.exit(1);
      }
    }
  }

  console.log(`Seeded DEMO catering catalog on ${restaurant.name} (${SLUG}). live_orders=false`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
