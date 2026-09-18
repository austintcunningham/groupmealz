#!/usr/bin/env node
/**
 * Apply a SQL file to Supabase Postgres.
 * Requires SUPABASE_DB_URL in .env.local (Database → Connection string → URI).
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

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

const dbUrl = process.env.SUPABASE_DB_URL;
const sqlPath = process.argv[2];

if (!dbUrl) {
  console.error(`
Missing SUPABASE_DB_URL in .env.local

Supabase Dashboard → Project Settings → Database → Connection string → URI
(use "Session pooler" or "Direct connection", replace [YOUR-PASSWORD])

Example:
SUPABASE_DB_URL=postgresql://postgres.jxgtmzziyyrqealatlxu:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
`);
  process.exit(1);
}

if (!sqlPath) {
  console.error("Usage: node scripts/apply-sql-file.mjs <path-to.sql>");
  process.exit(1);
}

const sql = readFileSync(resolve(root, sqlPath), "utf8");
const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log(`Applied: ${sqlPath}`);
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
