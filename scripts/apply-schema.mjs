// Apply Prisma-generated DDL to Neon.
// Normally you'd run `prisma migrate deploy`; this is an escape hatch for
// networks where direct Postgres (5432) and the Neon WebSocket are blocked.
//
// Tries the WebSocket pool first (supports multi-statement), then falls back to
// the Neon HTTP/fetch driver over 443, executing one statement at a time.
//
// Usage: node scripts/apply-schema.mjs [path-to-migration.sql]

import { readFileSync } from "node:fs";
import { Pool, neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sqlPath = process.argv[2] ?? "prisma/migrations/0001_init/migration.sql";
const ddl = readFileSync(sqlPath, "utf8");

// Split into individual statements. The generated DDL has no semicolons inside
// statements, so splitting on ";" at end-of-line is safe here.
function splitStatements(sql) {
  return sql
    .split(/;\s*$/m)
    .map((s) =>
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((s) => s.length > 0);
}

async function applyViaWebSocket() {
  const pool = new Pool({ connectionString });
  try {
    await pool.query(ddl);
    return await listTables(pool.query.bind(pool));
  } finally {
    await pool.end();
  }
}

async function applyViaHttp() {
  const sql = neon(connectionString);
  // The HTTP client is a tagged-template function; pass a single-element strings
  // array to execute a raw statement with no interpolation.
  const exec = (text) => sql([text]);
  const statements = splitStatements(ddl);
  for (const statement of statements) {
    await exec(statement);
  }
  return listTables(exec);
}

async function listTables(run) {
  const res = await run(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
  );
  return (res.rows ?? res).map((r) => r.table_name);
}

try {
  console.log(`Applying ${sqlPath} to Neon…`);
  let tables;
  try {
    tables = await applyViaWebSocket();
    console.log("Applied via WebSocket pool.");
  } catch (wsErr) {
    console.warn(`WebSocket failed (${wsErr.message}); falling back to HTTP driver…`);
    tables = await applyViaHttp();
    console.log("Applied via HTTP driver.");
  }
  console.log("Done. Public tables now:");
  for (const t of tables) console.log("  -", t);
} catch (err) {
  console.error("Failed to apply schema:", err.message);
  process.exitCode = 1;
}
