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
  return (
    <div className="guest-card" id={`guest-card-${guest.id}`}>
      <p className="guest-card__name">{guest.fullName}</p>

      <p className="guest-card__table-label">โต๊ะ</p>
      <p className="guest-card__table-number">{guest.tableName}</p>

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
