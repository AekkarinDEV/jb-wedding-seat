/** Re-export database types for convenient importing */
export type { Guest, NewGuest } from "@/db/schema";

/** API response wrapper for consistent error handling */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Check-in request body */
export interface CheckInRequest {
  guestId: number;
}

/** Import statistics returned after admin Excel upload */
export interface ImportStats {
  totalImported: number;
  sheetsProcessed: string[];
  errors: string[];
}

/** Dashboard statistics for admin page */
export interface DashboardStats {
  totalGuests: number;
  checkedIn: number;
  notCheckedIn: number;
  byZone: { zone: string; total: number; checkedIn: number }[];
  byGroup: { group: string; total: number; checkedIn: number }[];
}
