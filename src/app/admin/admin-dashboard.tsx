"use client";

import { useState, useEffect, useRef } from "react";
import {
  importGuests,
  getStats,
  getAllGuests,
  logout,
  addGuest,
  updateGuest,
  deleteGuest,
} from "./actions";
import type { DashboardStats, ImportStats, Guest } from "@/types/guest";
import type { NewGuest } from "@/db/schema";
import {
  ClipboardList,
  FolderUp,
  BarChart3,
  Users,
  Search,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  LogOut,
  Edit,
  Trash2,
  UserPlus,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportStats | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [guestFilter, setGuestFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<Guest>>({});
  const [saving, setSaving] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [guestFilter]);

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
        await loadGuests();
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

  // --- CRUD Operations ---
  function openAddModal() {
    setModalMode("add");
    setFormData({
      searchName: "",
      fullName: "",
      tableName: "",
      zone: "",
      groupName: "",
      status: "",
      note: "",
      sheet: "Manual",
    });
    setIsModalOpen(true);
  }

  function openEditModal(guest: Guest) {
    setModalMode("edit");
    setFormData({ ...guest });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleSaveGuest(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === "add") {
        await addGuest(formData as Omit<NewGuest, "id">);
      } else if (modalMode === "edit" && formData.id) {
        await updateGuest(formData.id, formData);
      }
      closeModal();
      await loadGuests();
      await loadStats();
    } catch (error) {
      console.error("Failed to save guest:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteGuest() {
    if (!guestToDelete) return;
    setSaving(true);
    try {
      await deleteGuest(guestToDelete.id);
      await loadGuests();
      await loadStats();
      setGuestToDelete(null);
    } catch (error) {
      console.error("Failed to delete guest:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  // --- Filtering & Pagination Logic ---
  const uniqueGroups = Array.from(
    new Set(guestList.map((g) => g.groupName).filter(Boolean)),
  ).sort();
  
  const uniqueZones = Array.from(
    new Set(guestList.map((g) => g.zone).filter(Boolean)),
  ).sort();

  const filteredGuests = guestList.filter((g) => {
    // Check group filter first
    if (groupFilter !== "all" && g.groupName !== groupFilter) {
      return false;
    }

    // Then check search query
    if (!guestFilter.trim()) return true;
    const q = guestFilter.toLowerCase();
    return (
      g.searchName.toLowerCase().includes(q) ||
      g.fullName.toLowerCase().includes(q) ||
      g.tableName.toLowerCase().includes(q) ||
      g.zone.toLowerCase().includes(q) ||
      g.groupName.toLowerCase().includes(q)
    );
  }).sort((a, b) => a.searchName.localeCompare(b.searchName, "th"));

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGuests.length / itemsPerPage),
  );
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <h1 className="admin-header__title">
          <ClipboardList size={28} /> Admin Dashboard
        </h1>
        <form action={logout}>
          <button type="submit" className="admin-header__logout">
            <LogOut size={16} /> ออกจากระบบ
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
        <div 
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
          onClick={() => setIsImportOpen(!isImportOpen)}
        >
          <h2 className="upload-section__title" style={{ margin: 0 }}>
            <FolderUp size={20} /> นำเข้าข้อมูลจาก Excel
          </h2>
          {isImportOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>

        {isImportOpen && (
          <div style={{ marginTop: "var(--space-6)" }}>

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
          <div className="upload-dropzone__icon">
            <FileSpreadsheet size={40} />
          </div>
          {selectedFile ? (
            <p className="upload-dropzone__text">
              <CheckCircle
                size={16}
                style={{ display: "inline", color: "var(--color-green)" }}
              />{" "}
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          ) : (
            <>
              <p className="upload-dropzone__text">
                ลากไฟล์ Excel มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
              </p>
              <p className="upload-dropzone__hint">
                รองรับไฟล์ .xlsx เท่านั้น (เมื่อนำเข้า
                ข้อมูลเก่าทั้งหมดจะถูกแทนที่)
              </p>
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
            className="btn-primary"
            style={{
              marginTop: "var(--space-4)",
              width: "100%",
              padding: "var(--space-3)",
            }}
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
                  <XCircle size={16} style={{ display: "inline" }} />{" "}
                  เกิดข้อผิดพลาด:
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
                  <CheckCircle size={16} style={{ display: "inline" }} />{" "}
                  นำเข้าสำเร็จ!
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  นำเข้า {importResult.totalImported} รายการ จาก{" "}
                  {importResult.sheetsProcessed.join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
          </div>
        )}
      </section>

      {/* Zone Stats */}
      {stats && stats.byZone.length > 0 && (
        <section style={{ marginBottom: "var(--space-8)" }}>
          <h2 className="upload-section__title">
            <BarChart3 size={20} /> สถิติตามโซน
          </h2>
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
      <section>
        <div
          className="admin-table-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--space-4)",
          }}
        >
          <h2 className="upload-section__title" style={{ margin: 0 }}>
            <Users size={20} /> รายชื่อแขกทั้งหมด ({guestList.length} คน)
          </h2>
          <button
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={openAddModal}
          >
            <UserPlus size={16} /> เพิ่มรายชื่อแขก
          </button>
        </div>

        <div
          className="admin-table-toolbar"
          style={{
            display: "flex",
            gap: "var(--space-4)",
            marginBottom: "var(--space-4)",
          }}
        >
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <span className="search-input-wrapper__icon" aria-hidden="true">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="ค้นหาชื่อ, โต๊ะ, โซน, กลุ่ม..."
              value={guestFilter}
              onChange={(e) => setGuestFilter(e.target.value)}
            />
          </div>

          {/* <select 
            className="search-input"
            style={{ width: "200px", paddingLeft: "var(--space-4)" }}
            value={groupFilter}
            onChange={(e) => {
              setGroupFilter(e.target.value);
              setCurrentPage(1); // reset page on filter change
            }}
          >
            <option value="all">ทุกกลุ่ม</option>
            {uniqueGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select> */}
        </div>

        <div className="data-table-wrapper" style={{ marginBottom: 0 }}>
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
                <th style={{ textAlign: "right" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGuests.map((guest, i) => (
                <tr key={guest.id} onClick={() => openEditModal(guest)}>
                  <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td>{guest.searchName}</td>
                  <td>{guest.fullName}</td>
                  <td style={{ fontWeight: 600 }}>{guest.tableName}</td>
                  <td>{guest.zone}</td>
                  <td>{guest.groupName}</td>
                  <td>
                    {guest.status === "checked-in" ? (
                      <span
                        style={{
                          color: "var(--color-green)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <CheckCircle size={16} /> เช็คอินแล้ว
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-gray-500)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      className="action-btn"
                      title="แก้ไข"
                      onClick={(e) => { e.stopPropagation(); openEditModal(guest); }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      title="ลบ"
                      onClick={(e) => { e.stopPropagation(); setGuestToDelete(guest); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedGuests.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "var(--space-8)" }}
                  >
                    ไม่พบข้อมูลแขก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <div
              style={{ fontSize: "0.875rem", color: "var(--color-gray-600)" }}
            >
              แสดง {(currentPage - 1) * itemsPerPage + 1} ถึง{" "}
              {Math.min(currentPage * itemsPerPage, filteredGuests.length)}{" "}
              จากทั้งหมด {filteredGuests.length} รายการ
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ก่อนหน้า
              </button>
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === "add" ? "เพิ่มรายชื่อแขก" : "แก้ไขข้อมูลแขก"}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveGuest}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label className="modal-label">
                    ชื่อเต็ม (ที่แสดงบนการ์ด)
                  </label>
                  <input
                    type="text"
                    className="modal-input"
                    required
                    value={formData.fullName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">
                    ชื่อที่ใช้ค้นหา (ชื่อเล่น/ชื่อจริง)
                  </label>
                  <input
                    type="text"
                    className="modal-input"
                    required
                    value={formData.searchName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, searchName: e.target.value })
                    }
                  />
                </div>
                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                  <div className="modal-form-group" style={{ flex: 1 }}>
                    <label className="modal-label">โต๊ะ (Table)</label>
                    <input
                      type="text"
                      className="modal-input"
                      required
                      value={formData.tableName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, tableName: e.target.value })
                      }
                    />
                  </div>
                  <div className="modal-form-group" style={{ flex: 1 }}>
                    <label className="modal-label">โซน (Zone)</label>
                    <select
                      className="modal-select"
                      value={formData.zone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, zone: e.target.value })
                      }
                    >
                      <option value="">- เลือกโซน -</option>
                      {uniqueZones.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">กลุ่ม (Group)</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={formData.groupName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, groupName: e.target.value })
                    }
                  />
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">สถานะเช็คอิน</label>
                  <select
                    className="modal-select"
                    value={formData.status || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="">ยังไม่เช็คอิน</option>
                    <option value="checked-in">เช็คอินแล้ว</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">หมายเหตุ (Note)</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={formData.note || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {modalMode === "edit" ? (
                  <button
                    type="button"
                    className="action-btn action-btn--delete"
                    style={{ background: "rgba(255,59,48,0.1)", padding: "var(--space-2) var(--space-4)", borderRadius: "var(--radius-md)" }}
                    onClick={() => {
                      setGuestToDelete(formData as Guest);
                      closeModal();
                    }}
                  >
                    <Trash2 size={16} style={{ display: "inline", marginRight: "4px" }} /> ลบข้อมูล
                  </button>
                ) : (
                  <div />
                )}
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {guestToDelete && (
        <div className="modal-overlay" onClick={() => setGuestToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <h3 className="modal-title" style={{ color: "var(--color-red)" }}>ยืนยันการลบข้อมูล</h3>
              <button className="modal-close" onClick={() => setGuestToDelete(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>คุณแน่ใจหรือไม่ว่าต้องการลบรายชื่อ <strong>{guestToDelete.searchName}</strong>?</p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-gray-500)", marginTop: "var(--space-2)" }}>การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            </div>
            <div className="modal-footer" style={{ borderTop: "none", background: "transparent" }}>
              <button type="button" className="btn-secondary" onClick={() => setGuestToDelete(null)} disabled={saving}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "var(--color-red)" }}
                onClick={confirmDeleteGuest}
                disabled={saving}
              >
                {saving ? "กำลังลบ..." : "ลบข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
