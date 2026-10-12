#!/usr/bin/env node
/**
 * Add Lettuce, Tomato, Mayo to FHS subs when menu photos show them (visual audit Oct 2025).
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .map((l) => l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")])
);

const h = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

/** Visual audit: which of Lettuce / Tomato / Mayo appear in official product photos */
const VISUAL = {
  "dbc4ec73-8b9c-4496-be96-8dbd2c6b9884": { lettuce: false, tomato: false, mayo: false }, // Steak & Cheese Melt
  "21675c48-1762-46e3-b8a9-b8d56cd540e0": { lettuce: false, tomato: false, mayo: true }, // Thanksgiving
  "124f0a3b-25b0-4f7e-9185-6ee6214e2c7f": { lettuce: true, tomato: true, mayo: true },
  "24a56665-880c-4ac7-b2bc-da0bd938adff": { lettuce: true, tomato: true, mayo: true },
  "d6e54a29-5b7f-4ce8-bac5-349edda6ff29": { lettuce: true, tomato: true, mayo: true },
  "31b00c78-a923-4572-b4a6-e89177fb3962": { lettuce: false, tomato: false, mayo: false }, // Smokin Honey Chicken Melt
  "d40757cd-efe6-4131-b424-484f89d850d2": { lettuce: true, tomato: true, mayo: true },
  "4fdc0d38-a214-41ae-b2a7-dc24fc60d39b": { lettuce: true, tomato: true, mayo: true },
  "a2b9ee87-2be9-46b2-bb32-acd5c21ab01d": { lettuce: true, tomato: true, mayo: true },
  "4889c6a7-1283-4610-af12-29bf10b4a722": { lettuce: false, tomato: false, mayo: false }, // Smokin Honey Steak Melt
  "829dc63b-e58d-470e-9906-6407e7d83563": { lettuce: true, tomato: true, mayo: true },
  "89eb1e61-9492-4e35-8698-f9ad431cdb49": { lettuce: true, tomato: true, mayo: true },
  "f2ff8b1d-f56d-4f9a-a425-b6a562f2b84e": { lettuce: true, tomato: true, mayo: true },
  "7a7f3d5f-ba35-4c06-8bef-3e495b2f0133": { lettuce: true, tomato: true, mayo: true },
  "1b9c8199-2610-4b64-b297-f452029b33cf": { lettuce: true, tomato: true, mayo: true },
  "36239fdd-9a24-42a8-9fd2-a4260adfd5bc": { lettuce: false, tomato: false, mayo: false },
  "2873f3ab-2cca-42c0-93c8-3fd5fc3e384b": { lettuce: true, tomato: true, mayo: true },
  "5413158b-2ff1-44a6-81ed-ac802aea1f58": { lettuce: true, tomato: true, mayo: true },
  "13b51a21-299e-4ced-8677-9607e4f0aed6": { lettuce: false, tomato: false, mayo: false },
  "ce4e61db-65dc-426c-92d6-9b5d3c89e698": { lettuce: false, tomato: false, mayo: false },
  "0896b624-4d8e-4d84-bf05-c4d9cefffa8c": { lettuce: false, tomato: false, mayo: true },
  "49f992b3-b431-42e8-ad08-3d79f3ea0bfc": { lettuce: false, tomato: false, mayo: true },
  "3fddb87e-7080-41f9-9e05-a8739880fe5c": { lettuce: true, tomato: true, mayo: true },
  "ce917967-ff05-461d-b843-1ae06eae0ad8": { lettuce: true, tomato: true, mayo: true },
  "bb3c7d3e-bd13-491b-90bd-9ee8ec0478a8": { lettuce: true, tomato: true, mayo: true },
  "014c81fb-d405-4e39-9095-5a3f32ca7d08": { lettuce: true, tomato: false, mayo: true }, // Spicy Cajun — no tomato in photo
  "ddd77b12-b7b3-4114-8a54-7518d18fc7d7": { lettuce: true, tomato: true, mayo: true },
};

const LABEL = {
  lettuce: "Lettuce",
  tomato: "Tomato",
  mayo: "Mayo",
};

function hasEquivalent(names, kind) {
  const joined = names.join(" ").toLowerCase();
  if (kind === "lettuce") return /lettuce/.test(joined);
  if (kind === "tomato") return /tomato/.test(joined);
  if (kind === "mayo") return /\bmayo/.test(joined) || /mayonnaise/.test(joined);
  return false;
}

const items = JSON.parse(readFileSync("/tmp/fhs-items.json", "utf8"));

for (const item of items) {
  const vis = VISUAL[item.id];
  if (!vis) {
    console.warn("skip unknown", item.name);
    continue;
  }

  const existing = item.ingredients ?? [];
  const toAdd = [];
  for (const kind of ["lettuce", "tomato", "mayo"]) {
    if (!vis[kind]) continue;
    if (hasEquivalent(existing, kind)) continue;
    toAdd.push(LABEL[kind]);
  }

  if (!toAdd.length) {
    console.log(`ok ${item.name}`);
    continue;
  }

  let order = existing.length;
  const rows = toAdd.map((name) => ({
    menu_item_id: item.id,
    name,
    display_order: order++,
  }));

  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/menu_item_ingredients`, {
    method: "POST",
    headers: h,
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    console.error(item.name, await res.text());
    continue;
  }
  console.log(`+ ${item.name}: ${toAdd.join(", ")}`);
}

for (const item of items) {
  const vis = VISUAL[item.id];
  if (!vis) continue;

  const ings = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/menu_item_ingredients?menu_item_id=eq.${item.id}&select=id,name,display_order&order=display_order`,
    { headers: h }
  ).then((r) => r.json());

  for (const ing of ings) {
    if (vis.lettuce && /^shredded lettuce$/i.test(ing.name)) {
      await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/menu_item_ingredients?id=eq.${ing.id}`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ name: "Lettuce" }),
      });
    }
    if (vis.tomato && /^sliced tomatoes?\s*$/i.test(ing.name)) {
      await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/menu_item_ingredients?id=eq.${ing.id}`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ name: "Tomato" }),
      });
    }
    if (vis.mayo && /^mayonnaise$/i.test(ing.name)) {
      await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/menu_item_ingredients?id=eq.${ing.id}`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ name: "Mayo" }),
      });
    }
  }
}

console.log("Renamed Shredded Lettuce / Sliced Tomatoes / Mayonnaise where applicable.");
