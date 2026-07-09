import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import { db } from "../src/db";
import { guests } from "../src/db/schema";
import type { NewGuest } from "../src/db/schema";

/**
 * Parses an Excel file from disk.
 * Based on the logic in src/lib/excel-parser.ts
 */
function parseExcelFile(filePath: string): NewGuest[] {
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const allGuests: NewGuest[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
      defval: "",
    });

    for (const row of rows) {
      const searchName = (row.SearchName || "").trim();
      if (!searchName) continue;

      const guest: NewGuest = {
        searchName,
        fullName: (row.FullName || searchName).trim(),
        tableName: (row.Table || "").trim(),
        zone: (row.Zone || "").trim(),
        groupName: (row.Group || "").trim(),
        status: "",
        checkInAt: null,
        note: (row.Note || "").trim(),
        sheet: sheetName,
      };

      allGuests.push(guest);
    }
  }

  return allGuests;
}

async function main() {
  console.log("Loading docs/requirement/new.xlsx...");
  const newGuests = parseExcelFile(path.join(__dirname, "../docs/requirement/new.xlsx"));
  
  console.log(`Parsed ${newGuests.length} guests.`);

  console.log("Inserting new guests in batches...");
  const BATCH_SIZE = 50;
  let totalInserted = 0;
  for (let i = 0; i < newGuests.length; i += BATCH_SIZE) {
    const batch = newGuests.slice(i, i + BATCH_SIZE);
    await db.insert(guests).values(batch);
    totalInserted += batch.length;
    console.log(`Inserted ${totalInserted} / ${newGuests.length}`);
  }

  console.log("✅ Successfully imported the new guest list!");
  process.exit(0);
}

main().catch(console.error);
