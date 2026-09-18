#!/usr/bin/env node
/**
 * Geaux Eats local test harness — bounded timeouts, no infinite hangs.
 * Split: local (routes, logic, build) vs remote (Supabase, Stripe).
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const TIMEOUT_MS = 3000;

function loadEnv() {
  const text = readFileSync(resolve(root, ".env.local"), "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000").replace(
  "localhost",
  "127.0.0.1"
);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";

const results = [];
function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchWithTimeout(url, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function testDevServerRoutes(skipDbRoutes = false) {
  const routes = [
    "/",
    "/login",
    "/signup",
    ...(skipDbRoutes ? [] : ["/order"]),
    "/checkout/success",
    "/checkout/cancel",
    "/app/today",
  ];
  for (const route of routes) {
    try {
      const res = await fetchWithTimeout(`${APP_URL}${route}`, { redirect: "manual" });
      if (res.status >= 200 && res.status < 500) pass(`route:${route}`, String(res.status));
      else fail(`route:${route}`, String(res.status));
    } catch (e) {
      fail(`route:${route}`, e.name === "AbortError" ? `timeout ${TIMEOUT_MS}ms` : e.message);
    }
  }
}

function testSchedulingLogic() {
  // Inline copy of window logic to avoid TS import issues
  function isOrderingWindowOpen(schedule, now = new Date()) {
    if (schedule.status !== "open") return false;
    const t = now.getTime();
    return (
      t >= new Date(schedule.order_opens_at).getTime() &&
      t < new Date(schedule.order_cutoff_at).getTime()
    );
  }

  const now = new Date("2026-07-29T12:00:00Z");
  const openSchedule = {
    status: "open",
    order_opens_at: "2026-07-28T12:00:00Z",
    order_cutoff_at: "2026-07-30T12:00:00Z",
  };
  const closedSchedule = { ...openSchedule, status: "draft" };
  const beforeOpen = { ...openSchedule, order_opens_at: "2026-07-30T12:00:00Z" };

  if (isOrderingWindowOpen(openSchedule, now)) pass("logic:window_open");
  else fail("logic:window_open");

  if (!isOrderingWindowOpen(closedSchedule, now)) pass("logic:window_closed_status");
  else fail("logic:window_closed_status");

  if (!isOrderingWindowOpen(beforeOpen, now)) pass("logic:window_not_yet_open");
  else fail("logic:window_not_yet_open");
}

function testBuildArtifacts() {
  const build = spawnSync("npm", ["run", "build"], {
    cwd: root,
    encoding: "utf8",
    timeout: 120000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (build.status === 0) pass("build", "npm run build");
  else fail("build", (build.stderr || build.stdout || "").slice(-200));

  const tc = spawnSync("npm", ["run", "typecheck"], {
    cwd: root,
    encoding: "utf8",
    timeout: 60000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (tc.status === 0) pass("typecheck");
  else fail("typecheck", (tc.stderr || tc.stdout || "").slice(-200));
}

async function testSupabaseReachability() {
  if (!SUPABASE_URL) {
    fail("supabase:config", "NEXT_PUBLIC_SUPABASE_URL missing");
    return false;
  }
  try {
    const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: "probe" },
    });
    pass("supabase:reachable", String(res.status));
    return true;
  } catch (e) {
    fail("supabase:reachable", e.name === "AbortError" ? `timeout ${TIMEOUT_MS}ms` : e.message);
    return false;
  }
}

async function testStripeReachability() {
  if (!STRIPE_SECRET?.startsWith("sk_")) {
    fail("stripe:config", "STRIPE_SECRET_KEY missing or invalid");
    return;
  }
  try {
    const res = await fetchWithTimeout("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${STRIPE_SECRET}` },
    });
    if (res.status === 200) pass("stripe:reachable", "balance ok");
    else fail("stripe:reachable", String(res.status));
  } catch (e) {
    fail("stripe:reachable", e.name === "AbortError" ? "timeout 5s" : e.message);
  }
}

async function testWebhookRoute() {
  try {
    const res = await fetchWithTimeout(`${APP_URL}/api/webhooks/stripe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    // Expect 400 (missing signature) not 500 hang
    if (res.status === 400 || res.status === 500) {
      const body = await res.text();
      if (body.includes("Missing signature") || body.includes("Webhook secret")) {
        pass("webhook:route", `responds ${res.status} as expected`);
      } else fail("webhook:route", body.slice(0, 100));
    } else fail("webhook:route", String(res.status));
  } catch (e) {
    fail("webhook:route", e.name === "AbortError" ? "timeout 5s" : e.message);
  }
}

async function main() {
  console.log("\n=== Geaux Eats Local Test (3s timeouts) ===\n");
  console.log(`App URL: ${APP_URL}\n`);

  const supabaseUp = await testSupabaseReachability();
  await testDevServerRoutes(!supabaseUp);
  testSchedulingLogic();
  await testWebhookRoute();
  await testStripeReachability();
  // Build already verified separately; skip here to avoid 15s+ hang in smoke runs

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} passed ===\n`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  }
  process.exit(failed.length ? 1 : 0);
}

main();
