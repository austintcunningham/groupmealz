#!/usr/bin/env node
/** Live checklist against your Supabase project + local env */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  try {
    const text = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    console.log("❌ .env.local missing — copy from .env.example");
    process.exit(1);
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TIMEOUT = 8000;

async function get(path) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), TIMEOUT);
  const r = await fetch(`${url}${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: ctrl.signal,
  });
  return { ok: r.ok, status: r.status, text: await r.text() };
}

const checks = [];

function line(ok, label, detail = "") {
  checks.push({ ok, label, detail });
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
}

console.log("\nGeaux Eats setup check\n");

line(!!url, "Supabase URL configured");
line(!!key, "Service role key configured");
line(!!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, "Stripe publishable key");
line(!!process.env.STRIPE_SECRET_KEY, "Stripe secret key");
line(!!process.env.STRIPE_WEBHOOK_SECRET, "Stripe webhook secret");

if (!url || !key) {
  console.log("\nFix env vars first.\n");
  process.exit(1);
}

try {
  const profiles = await get("/rest/v1/profiles?select=id&limit=1");
  line(profiles.ok, "Migration 001 (profiles table)", profiles.ok ? "ok" : profiles.text.slice(0, 80));

  const m002 = await get("/rest/v1/platform_settings?select=advance_order_hours&limit=1");
  const m002ok = m002.ok && !m002.text.includes("does not exist");
  line(m002ok, "Migration 002 (advance_order_hours)", m002ok ? "ok" : "not applied");

  const templates = await get("/rest/v1/weekly_schedule_templates?select=id&limit=1");
  line(templates.ok, "Migration 002 (weekly_schedule_templates)", templates.ok ? "ok" : "missing");

  const m003 = await get("/rest/v1/offices?select=slug&limit=1");
  const m003ok = m003.ok && !m003.text.includes("does not exist");
  line(m003ok, "Migration 003 (office slug + guest orders)", m003ok ? "ok" : "not applied");

  const admins = await get("/rest/v1/profiles?select=email&role=eq.admin&limit=3");
  const adminList = admins.ok ? JSON.parse(admins.text) : [];
  line(adminList.length > 0, "Admin user exists", adminList.map((a) => a.email).join(", ") || "none");

  const restaurants = await get("/rest/v1/restaurants?select=id&limit=1");
  line(restaurants.ok && restaurants.text !== "[]", "At least one restaurant", restaurants.text === "[]" ? "none" : "ok");

  const offices = await get("/rest/v1/offices?select=id&limit=1");
  line(offices.ok && offices.text !== "[]", "At least one office", offices.text === "[]" ? "none" : "ok");

  const items = await get("/rest/v1/menu_items?select=id&active=eq.true&limit=1");
  line(items.ok && items.text !== "[]", "Active menu item", items.text === "[]" ? "none" : "ok");

  const openSched = await get(
    "/rest/v1/daily_lunch_schedules?select=id,status,lunch_date&status=eq.open&limit=1"
  );
  line(openSched.ok && openSched.text !== "[]", "Open lunch schedule", openSched.text === "[]" ? "none" : "ok");
} catch (e) {
  line(false, "Supabase reachable", e.message);
}

const failed = checks.filter((c) => !c.ok);
console.log(failed.length ? `\n${failed.length} item(s) still needed.\n` : "\nCore setup looks complete.\n");
process.exit(failed.length ? 1 : 0);
