import * as XLSX from "xlsx";
import type { NewGuest } from "@/db/schema";

/** Column mapping from Excel headers to our schema fields */
const COLUMN_MAP = {
  SearchName: "searchName",
  FullName: "fullName",
  Table: "tableName",
  Zone: "zone",
  Group: "groupName",
  Status: "status",
  CheckInTime: "checkInAt",
  Note: "note",
} as const;

/**
 * Parses an Excel buffer into an array of guest objects.
 * Handles multiple sheets (Guest1, Guest2, etc.) and skips empty rows.
 *
 * @param buffer - Excel file as ArrayBuffer
 * @returns Array of guest objects ready for database insertion
 */
export function parseExcel(buffer: ArrayBuffer): NewGuest[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const allGuests: NewGuest[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
      defval: "",
    });

    for (const row of rows) {
      // Skip rows without a search name (empty rows)
      const searchName = (row.SearchName || "").trim();
      if (!searchName) continue;

      const guest: NewGuest = {
        searchName,
        fullName: (row.FullName || searchName).trim(),
        tableName: (row.Table || "").trim(),
        zone: (row.Zone || "").trim(),
        groupName: (row.Group || "").trim(),
        status: "", // Reset status on import
        checkInAt: null,
        note: (row.Note || "").trim(),
        sheet: sheetName,
      };

      allGuests.push(guest);
    }
  }

  return allGuests;
}

/**
 * Validates that the parsed guest data has the expected structure.
 * Returns an array of error messages (empty if valid).
 */
export function validateGuestData(guests: NewGuest[]): string[] {
  const errors: string[] = [];

  if (guests.length === 0) {
    errors.push("ไม่พบข้อมูลแขกในไฟล์ Excel");
    return errors;
  }

  // Check for guests without table assignments
  const noTable = guests.filter((g) => !g.tableName);
  if (noTable.length > 0) {
    errors.push(`พบแขก ${noTable.length} คนที่ไม่มีหมายเลขโต๊ะ`);
  }

  // Check for guests without zone assignments
  const noZone = guests.filter((g) => !g.zone);
  if (noZone.length > 0) {
    errors.push(`พบแขก ${noZone.length} คนที่ไม่มีโซน`);
  }

  return errors;
}
