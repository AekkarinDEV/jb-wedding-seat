import { NextResponse } from "next/server";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Force dynamic rendering — this route writes to the database at runtime */
export const dynamic = "force-dynamic";

/**
 * POST /api/check-in — Marks a guest as checked in.
 * Updates the status and checkInAt fields in the database.
 * No auth required — guests check themselves in.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId } = body;

    if (!guestId || typeof guestId !== "number") {
      return NextResponse.json(
        { success: false, error: "guestId is required and must be a number" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    await db
      .update(guests)
      .set({
        status: "checked-in",
        checkInAt: now,
      })
      .where(eq(guests.id, guestId));

    return NextResponse.json({
      success: true,
      data: { guestId, status: "checked-in", checkInAt: now },
    });
  } catch (error) {
    console.error("Check-in failed:", error);
    return NextResponse.json(
      { success: false, error: "Check-in failed" },
      { status: 500 }
    );
  }
}
