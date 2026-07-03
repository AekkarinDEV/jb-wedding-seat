import { NextResponse } from "next/server";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { asc } from "drizzle-orm";

/** Force dynamic rendering — this route queries the database at runtime */
export const dynamic = "force-dynamic";

/**
 * GET /api/guests — Returns all guests for client-side search.
 * Uses Cache-Control to reduce redundant fetches.
 * ~700 guests ≈ 50 KB JSON — small enough to send all at once.
 */
export async function GET() {
  try {
    const allGuests = await db
      .select()
      .from(guests)
      .orderBy(asc(guests.tableName));

    return NextResponse.json(
      { success: true, data: allGuests },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch guests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}
