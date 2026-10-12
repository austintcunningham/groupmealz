#!/usr/bin/env node
/**
 * Import Firehouse Subs menu (subs only) for Gonzales store #1283 into Supabase.
 * Usage: node scripts/import-firehouse-subs-gonzales.mjs [--apply]
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const APPLY = process.argv.includes("--apply");
const STORE_NUMBER = "1283";
const RESTAURANT_ID = "3ad0615d-5a24-492a-91a3-5a3327471907";
const APPSYNC = "https://233wccrwpvakjmigotovucjjfa.appsync-api.us-east-1.amazonaws.com/graphql";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")])
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const sbHeaders = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const SECTION_CONFIG = {
  "Featured Flavors": {
    category: "Featured Subs",
    filter: (it) => {
      if (it.slug === "pecan-pie" || it.slug === "cookie-and-creme-cookie") return false;
      return /sub|melt|turkey/i.test(it.slug);
    },
  },
  "Hot Specialty Subs": { category: "Speciality Subs", filter: () => true },
  "Build Your Own Sub": { category: "Build Your Own Sub", filter: () => true },
  "Cold Subs": { category: "Cold Subs", filter: () => true },
};

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/firehouse\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function itemImageUri(itemOrPicker) {
  const uri =
    itemOrPicker?.image?.asset?.uri ??
    itemOrPicker?.image?.asset?.url ??
    null;
  if (!uri) return null;
  const base = uri.split("?")[0];
  return `${base}?w=800&fm=png`;
}

function parsePriceCents(description, fallback) {
  const m = description?.match(/\$(\d+)\.(\d{2})/);
  if (!m) return fallback;
  return Number(m[1]) * 100 + Number(m[2]);
}

function extractComesWithIngredients(item) {
  const ingredients = [];
  for (const dg of item?.customizations?.displayGroups ?? []) {
    if (dg.displayGroup?.displayName !== "Comes With") continue;
    for (const opt of dg.options ?? []) {
      if (opt.displayType === "CHECKBOX") {
        const regular = opt.options?.find(
          (o) => o.prefix === "Regular" || o.isDefault
        );
        if (regular?.displayName) {
          ingredients.push(
            regular.displayName.replace(/^Regular\s+/i, "").trim()
          );
        }
      } else if (opt.displayType === "STEPPER" && opt.displayName) {
        ingredients.push(
          opt.displayName.replace(/\s+/g, " ").replace(/^Regular\s+/i, "").trim()
        );
      }
    }
  }
  return ingredients;
}

async function captureFhsGraphql() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    geolocation: { latitude: 30.2149, longitude: -90.9201 },
    permissions: ["geolocation"],
  });
  const page = await context.newPage();

  let apiKey = null;
  let sectionsQuery = null;
  let pickerQuery = null;

  page.on("request", (req) => {
    if (!req.url().includes("appsync-api")) return;
    apiKey = req.headers()["x-api-key"] ?? apiKey;
    const post = req.postDataJSON?.();
    if (!post?.query) return;
    if (post.query.includes("getMenuSectionsForRestaurant")) {
      sectionsQuery = post.query;
    }
    if (post.query.includes("getMenuPickerForRestaurant")) {
      pickerQuery = post.query;
    }
  });

  await page.goto(
    `https://www.firehousesubs.com/menu?service-mode=TAKEOUT&store-number=${STORE_NUMBER}`,
    { waitUntil: "domcontentloaded", timeout: 120000 }
  );
  await page.waitForSelector('a[href*="/v2/menu/"]', { timeout: 90000 });
  await page.waitForTimeout(3000);

  if (!pickerQuery) {
    await page.goto(
      `https://www.firehousesubs.com/v2/menu/hook-and-ladder?service-mode=TAKEOUT&store-number=${STORE_NUMBER}`,
      { waitUntil: "domcontentloaded", timeout: 120000 }
    );
    await page.waitForTimeout(5000);
  }

  await browser.close();

  if (!apiKey || !sectionsQuery || !pickerQuery) {
    throw new Error("Failed to capture Firehouse GraphQL config from site");
  }

  return { apiKey, sectionsQuery, pickerQuery };
}

async function fhsGraphql(apiKey, query, variables) {
  const res = await fetch(APPSYNC, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

async function fetchMenuSections(apiKey, sectionsQuery) {
  const data = await fhsGraphql(apiKey, sectionsQuery, {
    region: "us",
    restaurantId: STORE_NUMBER,
    serviceMode: "pickup",
  });
  return data.getMenuSectionsForRestaurant.sections;
}

async function fetchPicker(apiKey, pickerQuery, slug) {
  const data = await fhsGraphql(apiKey, pickerQuery, {
    slug,
    version: "12.7.0",
    restaurantId: STORE_NUMBER,
    region: "us",
    serviceMode: "pickup",
  });
  return data.getMenuPickerForRestaurant;
}

async function sbGet(path) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, { headers: sbHeaders });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbPost(table, body) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: sbHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const j = await res.json();
  return Array.isArray(j) ? j[0] : j;
}

async function sbPatch(table, filter, body) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: sbHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function sbDelete(table, filter) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: sbHeaders,
  });
  if (!res.ok) throw new Error(await res.text());
}

async function uploadMenuImage(menuItemId, sourceUrl) {
  const imgRes = await fetch(sourceUrl);
  if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status}: ${sourceUrl}`);
  const contentType = imgRes.headers.get("content-type") || "image/png";
  const ext = contentType.includes("jpeg") ? "jpg" : "png";
  const path = `${RESTAURANT_ID}/${menuItemId}/${Date.now()}.${ext}`;
  const buf = Buffer.from(await imgRes.arrayBuffer());

  const up = await fetch(`${supabaseUrl}/storage/v1/object/menu-images/${path}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buf,
  });
  if (!up.ok) throw new Error(`Storage upload: ${await up.text()}`);
  return `${supabaseUrl}/storage/v1/object/public/menu-images/${path}`;
}

async function ensureCategory(name, displayOrder) {
  const existing = await sbGet(
    `menu_categories?restaurant_id=eq.${RESTAURANT_ID}&name=eq.${encodeURIComponent(name)}&select=id,name,display_order`
  );
  if (existing.length) return existing[0];

  if (!APPLY) {
    console.log(`[dry-run] would create category "${name}" order ${displayOrder}`);
    return { id: `dry-${name}`, name };
  }

  return sbPost("menu_categories", {
    restaurant_id: RESTAURANT_ID,
    name,
    display_order: displayOrder,
    active: true,
  });
}

function matchExistingItem(existingItems, fhsName) {
  const n = normalizeName(fhsName);
  for (const ex of existingItems) {
    const en = normalizeName(ex.name);
    if (en === n) return ex;
    // Legacy "Meatball Sub" ↔ site "Firehouse Meatball"
    if (
      (en === "meatball sub" && n === "meatball") ||
      (n === "meatball sub" && en === "meatball")
    ) {
      return ex;
    }
  }
  return null;
}

async function replaceSizesAndIngredients(menuItemId, sizes, ingredients) {
  await sbDelete("menu_item_sizes", `menu_item_id=eq.${menuItemId}`);
  await sbDelete("menu_item_ingredients", `menu_item_id=eq.${menuItemId}`);

  if (sizes.length) {
    await sbPost(
      "menu_item_sizes",
      sizes.map((s, i) => ({
        menu_item_id: menuItemId,
        name: s.name,
        price_cents: s.price_cents,
        display_order: i,
        is_default: s.is_default,
      }))
    );
  }

  if (ingredients.length) {
    await sbPost(
      "menu_item_ingredients",
      ingredients.map((name, i) => ({
        menu_item_id: menuItemId,
        name,
        display_order: i,
      }))
    );
  }
}

console.log(APPLY ? "Applying import…" : "Dry run (pass --apply to write to Supabase)");

const { apiKey, sectionsQuery, pickerQuery } = await captureFhsGraphql();
const sections = await fetchMenuSections(apiKey, sectionsQuery);

const categoryOrder = [
  "Featured Subs",
  "Speciality Subs",
  "Build Your Own Sub",
  "Cold Subs",
];
const categoryIds = {};
for (let i = 0; i < categoryOrder.length; i++) {
  const cat = await ensureCategory(categoryOrder[i], i);
  categoryIds[categoryOrder[i]] = cat.id;
}

const existingItems = await sbGet(
  `menu_items?restaurant_id=eq.${RESTAURANT_ID}&select=id,name,price_cents,promo_label,promo_price_cents,promo_ends_at,category_id`
);

const importRows = [];
for (const section of sections) {
  const cfg = SECTION_CONFIG[section.displayName];
  if (!cfg) continue;
  const items = section.items.filter(cfg.filter);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    importRows.push({
      section: section.displayName,
      categoryName: cfg.category,
      display_order: i,
      slug: it.slug,
      name: it.displayName.replace(/[®™]/g, "").trim(),
      descriptionShort: it.descriptionShort,
      listPriceCents: it.priceCents,
      imageUrl: itemImageUri(it),
    });
  }
}

console.log(`Found ${importRows.length} subs to import from store ${STORE_NUMBER}`);

const importedNames = new Set(importRows.map((r) => normalizeName(r.name)));

for (const row of importRows) {
  let picker = null;
  try {
    picker = await fetchPicker(apiKey, pickerQuery, row.slug);
    await new Promise((r) => setTimeout(r, 120));
  } catch (e) {
    console.warn(`  picker failed ${row.slug}:`, e.message);
  }

  const description =
    picker?.description?.trim() || row.descriptionShort?.trim() || null;

  const sizes = [];
  const aspect = picker?.pickerAspect;
  if (aspect?.options?.length) {
    for (const opt of aspect.options) {
      const price = parsePriceCents(
        opt.description,
        opt.item?.basePriceCents ?? row.listPriceCents
      );
      sizes.push({
        name: opt.displayName,
        price_cents: price,
        is_default:
          opt.key === aspect.defaultOptionKey ||
          opt.isDefault ||
          opt.displayName === "Medium",
      });
    }
  }

  const defaultSize =
    sizes.find((s) => s.is_default) ??
    sizes.find((s) => s.name === "Medium") ??
    sizes[0];
  const price_cents = defaultSize?.price_cents ?? row.listPriceCents;

  const mediumItem =
    aspect?.options?.find((o) => o.displayName === "Medium")?.item ??
    aspect?.options?.[0]?.item;
  const ingredients = mediumItem ? extractComesWithIngredients(mediumItem) : [];

  const imageUrl = itemImageUri(picker) ?? row.imageUrl;
  const existing = matchExistingItem(existingItems, row.name);

  const payload = {
    restaurant_id: RESTAURANT_ID,
    category_id: categoryIds[row.categoryName],
    name: row.name,
    description,
    price_cents,
    active: true,
    available: true,
    display_order: row.display_order,
    counts_as_entree: true,
  };

  console.log(
    `\n• ${row.name} (${row.categoryName}) — $${(price_cents / 100).toFixed(2)}` +
      (sizes.length ? ` [${sizes.map((s) => `${s.name} $${(s.price_cents / 100).toFixed(2)}`).join(", ")}]` : "") +
      (existing ? " [update]" : " [new]")
  );

  if (!APPLY) continue;

  let menuItemId;
  if (existing) {
    menuItemId = existing.id;
    const patch = { ...payload };
    if (existing.promo_label) {
      patch.promo_label = existing.promo_label;
      patch.promo_price_cents = existing.promo_price_cents;
      patch.promo_ends_at = existing.promo_ends_at;
    }
    await sbPatch("menu_items", `id=eq.${menuItemId}`, patch);
  } else {
    const created = await sbPost("menu_items", payload);
    menuItemId = created.id;
    existingItems.push({ id: menuItemId, name: row.name });
  }

  if (imageUrl) {
    try {
      const publicUrl = await uploadMenuImage(menuItemId, imageUrl);
      await sbPatch("menu_items", `id=eq.${menuItemId}`, { image_url: publicUrl });
    } catch (e) {
      console.warn(`  image upload failed:`, e.message);
      if (row.imageUrl) {
        await sbPatch("menu_items", `id=eq.${menuItemId}`, { image_url: row.imageUrl });
      }
    }
  }

  if (sizes.length) {
    await replaceSizesAndIngredients(menuItemId, sizes, ingredients);
  } else if (ingredients.length) {
    await replaceSizesAndIngredients(menuItemId, [], ingredients);
  }
}

if (APPLY) {
  const subCategoryIds = categoryOrder
    .map((n) => categoryIds[n])
    .filter((id) => id && !String(id).startsWith("dry-"));
  const legacySubs = await sbGet(
    `menu_items?restaurant_id=eq.${RESTAURANT_ID}&category_id=in.(${subCategoryIds.join(",")})&select=id,name,category_id`
  );

  for (const leg of legacySubs) {
    const legNorm = normalizeName(leg.name);
    if (importedNames.has(legNorm)) continue;
    if (legNorm === "meatball sub" && importedNames.has("meatball")) continue;
    console.log(`\nDeactivate removed sub: ${leg.name}`);
    await sbPatch("menu_items", `id=eq.${leg.id}`, {
      active: false,
      available: false,
    });
  }
}

console.log("\nDone.");
