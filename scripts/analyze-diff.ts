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

function normalize(guest: NewGuest) {
  return {
    searchName: guest.searchName.toLowerCase(),
    fullName: guest.fullName,
    tableName: guest.tableName,
    zone: guest.zone,
    groupName: guest.groupName,
    note: guest.note,
  };
}

// Compare two lists based on `searchName`.
// A guest is identified by `searchName.toLowerCase()`.
function diffLists(listA: NewGuest[], listB: NewGuest[]) {
  const mapA = new Map<string, NewGuest>();
  for (const g of listA) mapA.set(g.searchName.toLowerCase(), g);

  const mapB = new Map<string, NewGuest>();
  for (const g of listB) mapB.set(g.searchName.toLowerCase(), g);

  const added: NewGuest[] = [];
  const removed: NewGuest[] = [];
  const modified: { old: NewGuest; new: NewGuest; diff: string[] }[] = [];

  for (const [key, b] of mapB.entries()) {
    if (!mapA.has(key)) {
      added.push(b);
    } else {
      const a = mapA.get(key)!;
      const diff: string[] = [];
      if (a.fullName !== b.fullName) diff.push(`fullName: '${a.fullName}' -> '${b.fullName}'`);
      if (a.tableName !== b.tableName) diff.push(`tableName: '${a.tableName}' -> '${b.tableName}'`);
      if (a.zone !== b.zone) diff.push(`zone: '${a.zone}' -> '${b.zone}'`);
      if (a.groupName !== b.groupName) diff.push(`groupName: '${a.groupName}' -> '${b.groupName}'`);
      
      if (diff.length > 0) {
        modified.push({ old: a, new: b, diff });
      }
    }
  }

  for (const [key, a] of mapA.entries()) {
    if (!mapB.has(key)) {
      removed.push(a);
    }
  }

  return { added, removed, modified };
}

async function main() {
  console.log("Loading old.xlsx...");
  const oldGuests = parseExcelFile(path.join(__dirname, "../docs/requirement/old.xlsx"));
  
  console.log("Loading new.xlsx...");
  const newGuests = parseExcelFile(path.join(__dirname, "../docs/requirement/new.xlsx"));
  
  console.log("Fetching DB guests...");
  const dbGuests = await db.select().from(guests);

  console.log("\n--- old.xlsx vs new.xlsx ---");
  const oldVsNew = diffLists(oldGuests, newGuests);
  console.log(`Added: ${oldVsNew.added.length}`);
  console.log(`Removed: ${oldVsNew.removed.length}`);
  console.log(`Modified: ${oldVsNew.modified.length}`);

  console.log("\n--- DB vs new.xlsx ---");
  const dbVsNew = diffLists(dbGuests, newGuests);
  console.log(`Added (missing in DB): ${dbVsNew.added.length}`);
  console.log(`Removed (extra in DB): ${dbVsNew.removed.length}`);
  console.log(`Modified (different in DB): ${dbVsNew.modified.length}`);

  const report = {
    counts: {
      old: oldGuests.length,
      new: newGuests.length,
      db: dbGuests.length,
    },
    oldVsNew: {
      added: oldVsNew.added.slice(0, 5), // just samples
      removed: oldVsNew.removed.slice(0, 5),
      modified: oldVsNew.modified.slice(0, 5),
      addedCount: oldVsNew.added.length,
      removedCount: oldVsNew.removed.length,
      modifiedCount: oldVsNew.modified.length,
    },
    dbVsNew: {
      addedCount: dbVsNew.added.length,
      removedCount: dbVsNew.removed.length,
      modifiedCount: dbVsNew.modified.length,
      added: dbVsNew.added, // we want full list if small enough
      removed: dbVsNew.removed,
      modified: dbVsNew.modified,
    }
  };

  fs.writeFileSync(path.join(__dirname, "diff-report.json"), JSON.stringify(report, null, 2));
  console.log("\nReport saved to scripts/diff-report.json");
  process.exit(0);
}

main().catch(console.error);
