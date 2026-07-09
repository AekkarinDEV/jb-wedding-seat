# JB Wedding Seat

## 📖 Overview
This is a Next.js 16 (App Router) web application built to help wedding guests easily search for their assigned seating. It provides a beautiful, guest-facing search interface and an admin dashboard for managing guest records, tracking check-ins, and bulk importing data from Excel.

## 🛠 Tech Stack
- **Framework:** Next.js 16.2.10 (React 19)
- **Styling:** Vanilla CSS (no Tailwind currently detected, uses `.css` files like `globals.css`)
- **Database:** SQLite managed via `drizzle-orm` and `@libsql/client` (Turso).
- **Icons:** `lucide-react`
- **Utilities:** `fuse.js` for fuzzy searching guests, `xlsx` for parsing Excel file uploads.

## 🏗 Architecture & Core Components

### 1. Database Schema (`src/db/schema.ts`)
The primary entity is the `guests` table which includes:
- `searchName`: Simplified name for matching in search.
- `fullName`: Full display name shown on cards.
- `tableName` & `zone`: Seating placement information.
- `groupName`: e.g., "ญาติเจ้าบ่าว", "VVIP".
- `status`: Check-in status (empty string or "checked-in").
- `sheet`: Source Excel sheet name for reference.

### 2. Frontend Features
- **Guest Search Page (`src/app/page.tsx`):** The landing page featuring a full-screen background image (`bg.jpg`), a hero banner, and a `SearchBar`. It acts as a digital directory for attendees.
- **Admin Dashboard (`src/app/admin/admin-dashboard.tsx`):**
  - **Stats:** Overviews total guests, check-in counts, and zone-specific percentages.
  - **Excel Import:** Drag-and-drop or select `.xlsx` files to bulk upload/update the guest list.
  - **CRUD Operations:** Manually add, edit, or delete guest records.
  - **Search & Filter:** Allows admins to filter by name, group, or status.

## 🔄 Execution Workflow & State
- **Server Actions:** All data mutations (CRUD for guests, importing files, fetching stats) are driven through Next.js Server Actions (e.g., `actions.ts` in `/admin`).
- **Deployment:** The project is configured for Vercel (indicated by `vercel.json` and Next.js).

## 📝 Next Steps / Working Notes
- Keep components highly reusable.
- Preserve inline comments for context on server actions and complex queries.
- Refer to this document before attempting major data model or layout changes.
