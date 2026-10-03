import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized access to admin resource" },
        { status: 401 }
      );
    }

    // Explicit verification of admin_users membership (fail closed)
    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("id, role, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError || !adminRecord) {
      return NextResponse.json(
        { error: "Forbidden: Account is not an authorized Ambros Studio administrator." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authorized admin action",
      user: {
        id: user.id,
        email: user.email,
        role: adminRecord.role,
        isAdmin: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
