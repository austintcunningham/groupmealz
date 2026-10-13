#!/usr/bin/env node
/**
 * Remove "Small" size options from Firehouse Subs Gonzales menu items only.
 * Usage: node scripts/delete-fhs-small-sizes.mjs [--apply]
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const APPLY = process.argv.includes("--apply");
const RESTAURANT_ID = "3ad0615d-5a24-492a-91a3-5a3327471907";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")])
);

const base = env.NEXT_PUBLIC_SUPABASE_URL;
const h = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function sbGet(path) {
  const res = await fetch(`${base}/rest/v1/${path}`, { headers: h });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function sbDelete(path) {
  const res = await fetch(`${base}/rest/v1/${path}`, { method: "DELETE", headers: h });
  if (!res.ok) throw new Error(`DELETE ${path}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? [] : res.json();
}

async function sbPatch(path, body) {
  const res = await fetch(`${base}/rest/v1/${path}`, {
    method: "PATCH",
    headers: h,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const items = await sbGet(
  `menu_items?restaurant_id=eq.${RESTAURANT_ID}&select=id,name`
);
const itemIds = items.map((i) => i.id);
if (!itemIds.length) {
  console.log("No menu items for restaurant.");
  process.exit(0);
}

const idList = itemIds.join(",");
const sizes = await sbGet(
  `menu_item_sizes?menu_item_id=in.(${idList})&select=id,menu_item_id,name,is_default,display_order&order=display_order`
);

const smallSizes = sizes.filter((s) => /^small$/i.test(s.name.trim()));
console.log(`Found ${smallSizes.length} Small size row(s) across ${items.length} items.`);

for (const s of smallSizes) {
  const item = items.find((i) => i.id === s.menu_item_id);
  console.log(`  - ${item?.name ?? s.menu_item_id}: "${s.name}"${s.is_default ? " (was default)" : ""}`);
}

if (!smallSizes.length) {
  process.exit(0);
}

if (!APPLY) {
  console.log("\nDry run — pass --apply to delete.");
  process.exit(0);
}

const affectedItemIds = [...new Set(smallSizes.map((s) => s.menu_item_id))];
const smallIds = smallSizes.map((s) => s.id).join(",");

await sbDelete(`menu_item_sizes?id=in.(${smallIds})`);
console.log(`Deleted ${smallSizes.length} Small size option(s).`);

for (const menuItemId of affectedItemIds) {
  const remaining = await sbGet(
    `menu_item_sizes?menu_item_id=eq.${menuItemId}&select=id,name,is_default&order=display_order`
  );
  if (!remaining.length) continue;

  const hasDefault = remaining.some((r) => r.is_default);
  if (hasDefault) continue;

  const medium = remaining.find((r) => /^medium$/i.test(r.name.trim()));
  const pick = medium ?? remaining[0];
  await sbPatch(`menu_item_sizes?id=eq.${pick.id}`, { is_default: true });
  const item = items.find((i) => i.id === menuItemId);
  console.log(`  Default size → ${pick.name} for ${item?.name ?? menuItemId}`);
}

console.log("Done.");
