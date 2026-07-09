"use client";

import type { Guest } from "@/db/schema";
import CheckInButton from "./check-in-button";

/**
 * GuestCard — Displays a guest's seating information in a styled card.
 * Shows full name, table number (large), zone, and group.
 * Matches the reference design with gold border and centered layout.
 */
interface GuestCardProps {
  guest: Guest;
}

export default function GuestCard({ guest }: GuestCardProps) {
  // Dynamically adjust font size for long table names (like "25-29,31,32,39A")
  const getTableFontSize = (text: string) => {
    const len = text.length;
    if (len <= 5) return "3.8rem";
    if (len <= 9) return "3.2rem";
    if (len <= 12) return "2.8rem";
    return "2.4rem"; // Very long text like "25-29,31,32,39A"
  };

  const isVeryLong = guest.tableName.length > 12;

  return (
    <div className="guest-card" id={`guest-card-${guest.id}`}>
      <p className="guest-card__name">{guest.fullName}</p>

      <p className="guest-card__table-label">โต๊ะ</p>
      <p 
        className="guest-card__table-number"
        style={{ 
          fontSize: getTableFontSize(guest.tableName),
          letterSpacing: isVeryLong ? "-0.04em" : "normal",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}
      >
        {guest.tableName}
      </p>

      <div className="guest-card__divider" />

      <p className="guest-card__zone">โซน {guest.zone}</p>
      {guest.groupName && (
        <p className="guest-card__zone" style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--color-brown-light)" }}>กลุ่ม: {guest.groupName}</p>
      )}

      <CheckInButton
        guestId={guest.id}
        initialStatus={guest.status}
      />
    </div>
  );
}
