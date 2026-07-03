import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminDashboard from "./admin-dashboard";

/**
 * Admin Dashboard Page — Protected by password authentication.
 * Redirects to /admin/login if not authenticated.
 * Server Component that checks auth, then renders the client dashboard.
 */
export default async function AdminPage() {
  const isAdmin = await isAdminAuthenticated();

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
