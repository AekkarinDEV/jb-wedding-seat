import { NextResponse } from "next/server";
import { verifyPassword, setAdminCookie } from "@/lib/admin-auth";

/**
 * POST /api/admin/login — Authenticates admin with password.
 * On success, sets a signed HTTP-only session cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "กรุณาใส่รหัสผ่าน" },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { success: false, error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    await setAdminCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json(
      { success: false, error: "เข้าสู่ระบบไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
