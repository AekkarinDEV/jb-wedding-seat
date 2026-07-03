/**
 * Seed Script — Imports guest data from Excel into Turso database.
 * 
 * Usage:
 *   npx tsx scripts/seed.ts
 * 
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { guests, type NewGuest } from "../src/db/schema";

// Load env from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

const EXCEL_PATH = path.join(
  __dirname,
  "../docs/requirement/จัดโต๊ะ 4 sheet.xlsx"
);

async function seed() {
  console.log("🌱 Starting seed...");

  // Connect to Turso
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client);

  // Create table if not exists
  await client.execute(`
    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      search_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      table_name TEXT NOT NULL,
      zone TEXT NOT NULL,
      group_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT '',
      check_in_at TEXT,
      note TEXT NOT NULL DEFAULT '',
      sheet TEXT NOT NULL DEFAULT 'Guest1'
    )
  `);

  console.log("✅ Table created/verified");

  // Read Excel file
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error("❌ Excel file not found:", EXCEL_PATH);
    process.exit(1);
  }

  const workbook = XLSX.readFile(EXCEL_PATH);
  console.log("📊 Sheets found:", workbook.SheetNames.join(", "));

  const allGuests: NewGuest[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
      defval: "",
    });

    let sheetCount = 0;
    for (const row of rows) {
      const searchName = (row.SearchName || "").trim();
      if (!searchName) continue;

      allGuests.push({
        searchName,
        fullName: (row.FullName || searchName).trim(),
        tableName: (row.Table || "").trim(),
        zone: (row.Zone || "").trim(),
        groupName: (row.Group || "").trim(),
        status: "",
        checkInAt: null,
        note: (row.Note || "").trim(),
        sheet: sheetName,
      });
      sheetCount++;
    }

    console.log(`  📄 ${sheetName}: ${sheetCount} guests`);
  }

  console.log(`\\n📝 Total guests to import: ${allGuests.length}`);

  // Clear existing data
  await db.delete(guests);
  console.log("🗑️  Cleared existing data");

  // Batch insert
  const BATCH_SIZE = 50;
  for (let i = 0; i < allGuests.length; i += BATCH_SIZE) {
    const batch = allGuests.slice(i, i + BATCH_SIZE);
    await db.insert(guests).values(batch);
    console.log(
      `  📥 Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allGuests.length / BATCH_SIZE)}`
    );
  }

  console.log(`\\n✅ Seed complete! Imported ${allGuests.length} guests.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
