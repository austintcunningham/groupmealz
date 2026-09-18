#!/usr/bin/env node
/** One-time: set slug on offices missing it (run after migration 003) */
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

function slugify(n) {
  return (
    n
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "office"
  );
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const h = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const offices = await fetch(`${url}/rest/v1/offices?select=id,name,slug`, { headers: h }).then((r) =>
  r.json()
);

for (const o of offices) {
  if (o.slug) {
    console.log(`ok ${o.name} → ${o.slug}`);
    continue;
  }
  const base = slugify(o.name);
  let slug = base;
  for (let n = 0; n < 20; n++) {
    const candidate = n === 0 ? slug : `${base}-${n + 1}`;
    const clash = await fetch(`${url}/rest/v1/offices?select=id&slug=eq.${encodeURIComponent(candidate)}`, {
      headers: h,
    }).then((r) => r.json());
    if (!clash.length || clash[0].id === o.id) {
      slug = candidate;
      break;
    }
  }
  const res = await fetch(`${url}/rest/v1/offices?id=eq.${o.id}`, {
    method: "PATCH",
    headers: h,
    body: JSON.stringify({ slug }),
  });
  console.log(`${o.name} → ${slug} (${res.status})`);
}
