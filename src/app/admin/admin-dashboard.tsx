"use client";

import { useState, useEffect, useRef } from "react";
import { importGuests, getStats, getAllGuests, logout } from "./actions";
import type { DashboardStats, ImportStats, Guest } from "@/types/guest";

/**
 * AdminDashboard — Client component for the admin dashboard.
 * Handles Excel upload, import, statistics display, and logout.
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportStats | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [guestFilter, setGuestFilter] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load stats on mount
  useEffect(() => {
    loadStats();
    loadGuests();
  }, []);

  async function loadStats() {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }

  async function loadGuests() {
    try {
      const data = await getAllGuests();
      setGuestList(data);
    } catch (error) {
      console.error("Failed to load guests:", error);
    }
  }

  async function handleImport() {
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const result = await importGuests(formData);
      setImportResult(result);
      setSelectedFile(null);

      // Refresh stats after import
      if (result.errors.length === 0) {
        await loadStats();
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({
        totalImported: 0,
        sheetsProcessed: [],
        errors: ["การนำเข้าข้อมูลล้มเหลว"],
      });
    } finally {
      setImporting(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      setSelectedFile(file);
    }
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <h1 className="admin-header__title">📋 Admin Dashboard</h1>
        <form action={logout}>
          <button type="submit" className="admin-header__logout">
            ออกจากระบบ
          </button>
        </form>
      </header>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__value">{stats.totalGuests}</div>
            <div className="stat-card__label">แขกทั้งหมด</div>
          </div>
          <div className="stat-card stat-card--success">
            <div className="stat-card__value">{stats.checkedIn}</div>
            <div className="stat-card__label">เช็คอินแล้ว</div>
          </div>
          <div className="stat-card stat-card--warning">
            <div className="stat-card__value">{stats.notCheckedIn}</div>
            <div className="stat-card__label">ยังไม่เช็คอิน</div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <section className="upload-section">
        <h2 className="upload-section__title">📁 นำเข้าข้อมูลจาก Excel</h2>

        <div
          className={`upload-dropzone ${dragActive ? "upload-dropzone--active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-dropzone__icon">📄</div>
          {selectedFile ? (
            <p className="upload-dropzone__text">
              ✅ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          ) : (
            <>
              <p className="upload-dropzone__text">
                ลากไฟล์ Excel มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="upload-dropzone__hint">รองรับไฟล์ .xlsx เท่านั้น</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
          }}
        />

        {selectedFile && (
          <button
            className="search-button"
            style={{ marginTop: "var(--space-4)" }}
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? "กำลังนำเข้า..." : `นำเข้า ${selectedFile.name}`}
          </button>
        )}

        {/* Import Result */}
        {importResult && (
          <div
            style={{
              marginTop: "var(--space-4)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-md)",
              background:
                importResult.errors.length > 0
                  ? "var(--color-red-light)"
                  : "var(--color-green-light)",
            }}
          >
            {importResult.errors.length > 0 ? (
              <div>
                <p style={{ fontWeight: 600, color: "var(--color-red)" }}>
                  ❌ เกิดข้อผิดพลาด:
                </p>
                {importResult.errors.map((err, i) => (
                  <p key={i} style={{ fontSize: "0.875rem" }}>
                    {err}
                  </p>
                ))}
              </div>
            ) : (
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    color: "var(--color-green-dark)",
                  }}
                >
                  ✅ นำเข้าสำเร็จ!
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  นำเข้า {importResult.totalImported} รายการ จาก{" "}
                  {importResult.sheetsProcessed.join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Zone Stats */}
      {stats && stats.byZone.length > 0 && (
        <section>
          <h2 className="upload-section__title">📊 สถิติตามโซน</h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>โซน</th>
                  <th>ทั้งหมด</th>
                  <th>เช็คอิน</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {stats.byZone.map((zone) => (
                  <tr key={zone.zone}>
                    <td>{zone.zone}</td>
                    <td>{zone.total}</td>
                    <td>{zone.checkedIn}</td>
                    <td>
                      {zone.total > 0
                        ? Math.round((zone.checkedIn / zone.total) * 100)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Guest List */}
      <section style={{ marginTop: "var(--space-8)" }}>
        <h2 className="upload-section__title">👥 รายชื่อแขกทั้งหมด ({guestList.length} คน)</h2>

        <div className="search-input-wrapper" style={{ marginBottom: "var(--space-4)" }}>
          <span className="search-input-wrapper__icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาชื่อ, โต๊ะ, โซน, กลุ่ม..."
            value={guestFilter}
            onChange={(e) => setGuestFilter(e.target.value)}
          />
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ชื่อค้นหา</th>
                <th>ชื่อเต็ม</th>
                <th>โต๊ะ</th>
                <th>โซน</th>
                <th>กลุ่ม</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {guestList
                .filter((g) => {
                  if (!guestFilter.trim()) return true;
                  const q = guestFilter.toLowerCase();
                  return (
                    g.searchName.toLowerCase().includes(q) ||
                    g.fullName.toLowerCase().includes(q) ||
                    g.tableName.toLowerCase().includes(q) ||
                    g.zone.toLowerCase().includes(q) ||
                    g.groupName.toLowerCase().includes(q)
                  );
                })
                .map((guest, i) => (
                  <tr key={guest.id}>
                    <td>{i + 1}</td>
                    <td>{guest.searchName}</td>
                    <td>{guest.fullName}</td>
                    <td style={{ fontWeight: 600 }}>{guest.tableName}</td>
                    <td>{guest.zone}</td>
                    <td>{guest.groupName}</td>
                    <td>
                      {guest.status === "checked-in" ? (
                        <span style={{ color: "var(--color-green)" }}>✅</span>
                      ) : (
                        <span style={{ color: "var(--color-gray-500)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
