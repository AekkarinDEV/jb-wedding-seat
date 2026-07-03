"use server";

import { db } from "@/db";
import { guests } from "@/db/schema";
import { isAdminAuthenticated, clearAdminCookie } from "@/lib/admin-auth";
import { parseExcel, validateGuestData } from "@/lib/excel-parser";
import { redirect } from "next/navigation";
import type { ImportStats, DashboardStats } from "@/types/guest";

/**
 * Verifies admin authentication. Redirects to login if not authenticated.
 * Must be called at the beginning of every server action.
 */
async function requireAdmin() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    redirect("/admin/login");
  }
}

/**
 * Imports guest data from an uploaded Excel file into the database.
 * Deletes all existing guests first, then batch inserts new data.
 */
export async function importGuests(formData: FormData): Promise<ImportStats> {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file) {
    return { totalImported: 0, sheetsProcessed: [], errors: ["ไม่พบไฟล์"] };
  }

  const buffer = await file.arrayBuffer();
  const parsed = parseExcel(buffer);
  const errors = validateGuestData(parsed);

  if (errors.length > 0) {
    return { totalImported: 0, sheetsProcessed: [], errors };
  }

  // Delete existing guests and insert new batch
  await db.delete(guests);

  // Insert in batches of 50 to avoid query size limits
  const BATCH_SIZE = 50;
  for (let i = 0; i < parsed.length; i += BATCH_SIZE) {
    const batch = parsed.slice(i, i + BATCH_SIZE);
    await db.insert(guests).values(batch);
  }

  const sheets = [...new Set(parsed.map((g) => g.sheet || "Unknown"))];

  return {
    totalImported: parsed.length,
    sheetsProcessed: sheets,
    errors: [],
  };
}

/**
 * Fetches dashboard statistics: total guests, check-in counts by zone and group.
 */
export async function getStats(): Promise<DashboardStats> {
  await requireAdmin();

  const allGuests = await db.select().from(guests);

  const totalGuests = allGuests.length;
  const checkedIn = allGuests.filter((g) => g.status === "checked-in").length;
  const notCheckedIn = totalGuests - checkedIn;

  // Group by zone
  const zoneMap = new Map<string, { total: number; checkedIn: number }>();
  for (const g of allGuests) {
    const zone = g.zone || "ไม่ระบุ";
    const entry = zoneMap.get(zone) || { total: 0, checkedIn: 0 };
    entry.total++;
    if (g.status === "checked-in") entry.checkedIn++;
    zoneMap.set(zone, entry);
  }

  // Group by group name
  const groupMap = new Map<string, { total: number; checkedIn: number }>();
  for (const g of allGuests) {
    const group = g.groupName || "ไม่ระบุ";
    const entry = groupMap.get(group) || { total: 0, checkedIn: 0 };
    entry.total++;
    if (g.status === "checked-in") entry.checkedIn++;
    groupMap.set(group, entry);
  }

  return {
    totalGuests,
    checkedIn,
    notCheckedIn,
    byZone: Array.from(zoneMap.entries()).map(([zone, data]) => ({
      zone,
      ...data,
    })),
    byGroup: Array.from(groupMap.entries())
      .map(([group, data]) => ({ group, ...data }))
      .sort((a, b) => b.total - a.total),
  };
}

/**
 * Fetches all guests for display in the admin guest list table.
 */
export async function getAllGuests() {
  await requireAdmin();
  const allGuests = await db.select().from(guests);
  return allGuests;
}

/**
 * Admin logout — clears the session cookie.
 */
export async function logout() {
  await clearAdminCookie();
  redirect("/admin/login");
}
