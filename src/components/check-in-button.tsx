"use client";

import { useState, useCallback } from "react";
import { CheckCircle, Loader2, CircleCheck } from "lucide-react";

/**
 * CheckInButton — Allows guests to mark themselves as checked in.
 * Sends a POST request to /api/check-in and updates the UI state.
 */
interface CheckInButtonProps {
  guestId: number;
  initialStatus: string;
}

export default function CheckInButton({
  guestId,
  initialStatus,
}: CheckInButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const isCheckedIn = status === "checked-in";

  const handleCheckIn = useCallback(async () => {
    if (isCheckedIn || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("checked-in");
      }
    } catch (error) {
      console.error("Check-in failed:", error);
    } finally {
      setLoading(false);
    }
  }, [guestId, isCheckedIn, loading]);

  return (
    <div className="checkin-wrapper">
      <button
        id={`checkin-button-${guestId}`}
        className={`checkin-button ${isCheckedIn ? "checkin-button--checked" : ""}`}
        onClick={handleCheckIn}
        disabled={isCheckedIn || loading}
      >
        <span
          className={`checkin-button__icon ${isCheckedIn ? "checkin-button__icon--animated" : ""}`}
        >
          {loading ? (
            <Loader2 size={20} className="spin" />
          ) : isCheckedIn ? (
            <CheckCircle size={20} />
          ) : (
            <CircleCheck size={20} />
          )}
        </span>
        {loading ? "กำลังเช็คอิน..." : isCheckedIn ? "เช็คอินแล้ว" : "Check-in"}
      </button>
    </div>
  );
}
