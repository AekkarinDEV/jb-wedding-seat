import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Guests table schema.
 * Each row represents a wedding guest with their seating assignment.
 * Data is imported from Excel sheets (Guest1, Guest2, etc.)
 */
export const guests = sqliteTable("guests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Simplified name used for search matching */
  searchName: text("search_name").notNull(),
  /** Full display name (may include spouse, title, etc.) */
  fullName: text("full_name").notNull(),
  /** Table assignment (e.g. "1B", "VIP1", "VVIP 1") */
  tableName: text("table_name").notNull(),
  /** Seating zone (e.g. "ฝั่งซ้ายของเวที", "ฝั่งขวาของเวที") */
  zone: text("zone").notNull(),
  /** Guest group/category (e.g. "ญาติเจ้าบ่าว", "VVIP") */
  groupName: text("group_name").notNull().default(""),
  /** Check-in status: "" (not checked in) or "checked-in" */
  status: text("status").notNull().default(""),
  /** ISO timestamp of when guest checked in */
  checkInAt: text("check_in_at"),
  /** Additional notes */
  note: text("note").notNull().default(""),
  /** Source Excel sheet name (e.g. "Guest1", "Guest2") */
  sheet: text("sheet").notNull().default("Guest1"),
});

/** TypeScript type inferred from the schema for selecting guests */
export type Guest = typeof guests.$inferSelect;

/** TypeScript type inferred from the schema for inserting guests */
export type NewGuest = typeof guests.$inferInsert;
