/**
 * Local demo catering catalog for Firehouse Subs Gonzales (fhs-g).
 * Used when DB catering columns are not yet migrated, or when no catering
 * menu rows exist yet. Always demo-only (live_orders = false).
 * Prices are illustrative placeholders — not authorized live selling prices.
 */
import type { MenuCategory, MenuItem, Restaurant } from "@/types/database";

export const DEMO_CATERING_SLUG = "fhs-g";

export const DEMO_CATERING_META = {
  supports_catering: true,
  catering_live_orders: false,
  catering_min_order_cents: 7500,
  catering_lead_hours: 24,
  catering_delivery_fee_cents: 0,
  catering_description:
    "Demo catering menu for GroupMeals UI development. Not authorized for live customer orders. Prices are illustrative placeholders. Location: Firehouse Subs Gonzales (authorized office-lunch partner) — Siegen Ln ezCater listing was used only as a UX reference.",
  catering_service_area: "Greater Baton Rouge (demo)",
  catering_cuisine: "Sandwiches & Subs",
} as const;

type DemoItem = {
  name: string;
  description: string;
  price_cents: number;
  serves: number;
  packaging: string;
};

const DEMO_BLOCKS: { category: string; items: DemoItem[] }[] = [
  {
    category: "Boxed Lunches",
    items: [
      {
        name: "Standard Lieutenant Box Lunch",
        description: "Demo boxed lunch with a medium sub, chips, and a cookie.",
        price_cents: 1499,
        serves: 1,
        packaging: "Individual box",
      },
      {
        name: "Deluxe Lieutenant Box Lunch",
        description: "Demo deluxe boxed lunch with a medium sub, chips, cookie, and side.",
        price_cents: 1699,
        serves: 1,
        packaging: "Individual box",
      },
      {
        name: "Standard Rookie Box Lunch",
        description: "Demo smaller boxed lunch option.",
        price_cents: 1299,
        serves: 1,
        packaging: "Individual box",
      },
      {
        name: "Veggie Box Lunch",
        description: "Demo vegetarian boxed lunch.",
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
        description: "Demo sandwich platter for group catering.",
        price_cents: 8499,
        serves: 10,
        packaging: "Platter",
      },
      {
        name: "Deluxe Platter",
        description: "Demo deluxe sandwich platter.",
        price_cents: 8999,
        serves: 10,
        packaging: "Platter",
      },
      {
        name: "Build-Your-Own Platter",
        description: "Demo BYO platter — customize with the restaurant.",
        price_cents: 9499,
        serves: 10,
        packaging: "Platter",
      },
      {
        name: "Standard Platter Pack",
        description: "Demo platter pack with sides.",
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
        description: "Demo large salad for catering.",
        price_cents: 4499,
        serves: 8,
        packaging: "Bowl",
      },
      {
        name: "Individual Catering Salad",
        description: "Demo individual salad.",
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
        description: "Demo chip bundle for groups.",
        price_cents: 2499,
        serves: 10,
        packaging: "Bundle",
      },
      {
        name: "Soup Gallon",
        description: "Demo soup by the gallon.",
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
        description: "Demo cookie platter.",
        price_cents: 3699,
        serves: 24,
        packaging: "Platter",
      },
      {
        name: "Brownie Platter",
        description: "Demo brownie platter.",
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
        description: "Demo beverage gallon.",
        price_cents: 899,
        serves: 8,
        packaging: "Gallon",
      },
      {
        name: "Gallon Lemonade",
        description: "Demo beverage gallon.",
        price_cents: 999,
        serves: 8,
        packaging: "Gallon",
      },
    ],
  },
];

export function overlayDemoCateringRestaurant(base: Restaurant): Restaurant {
  return {
    ...base,
    ...DEMO_CATERING_META,
  };
}

export function buildDemoCateringMenu(restaurantId: string): {
  categories: MenuCategory[];
  items: MenuItem[];
} {
  const now = new Date().toISOString();
  const categories: MenuCategory[] = [];
  const items: MenuItem[] = [];
  let catOrder = 0;
  for (const block of DEMO_BLOCKS) {
    const catId = `demo-cat-${catOrder}`;
    categories.push({
      id: catId,
      restaurant_id: restaurantId,
      name: block.category,
      display_order: catOrder,
      active: true,
      catering_only: true,
    });
    let itemOrder = 0;
    for (const item of block.items) {
      items.push({
        id: `demo-item-${catOrder}-${itemOrder}`,
        restaurant_id: restaurantId,
        category_id: catId,
        name: item.name,
        description: item.description,
        price_cents: item.price_cents,
        active: true,
        available: false,
        available_for_catering: true,
        catering_serves_count: item.serves,
        catering_packaging: item.packaging,
        display_order: itemOrder,
        created_at: now,
        updated_at: now,
      });
      itemOrder += 1;
    }
    catOrder += 1;
  }
  return { categories, items };
}
