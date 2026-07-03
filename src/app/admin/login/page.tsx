"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin Login Page — Simple password authentication.
 * Password is verified server-side against ADMIN_PASSWORD env var.
 */
export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.error || "รหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="login-card__title">Admin Login</h1>
        <p className="login-card__subtitle">กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบ</p>

        <input
          id="admin-password-input"
          type="password"
          className="login-card__input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />

        <button
          id="admin-login-button"
          type="submit"
          className="login-card__button"
          disabled={loading || !password}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        {error && <p className="login-card__error">{error}</p>}
      </form>
    </div>
  );
}
