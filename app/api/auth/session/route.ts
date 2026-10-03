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
      return NextResponse.json({ authenticated: false, isAdmin: false, user: null });
    }

    // Check explicit admin status in admin_users
    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    // Fail closed: isAdmin is strictly true only when verified in admin_users without errors
    const isAdmin = Boolean(!adminError && adminRecord && adminRecord.is_active);

    return NextResponse.json({
      authenticated: true,
      isAdmin,
      adminRole: isAdmin && adminRecord ? adminRecord.role : null,
      user: {
        id: user.id,
        email: user.email,
        role: isAdmin && adminRecord ? adminRecord.role : (user.role || "user"),
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, isAdmin: false, user: null });
  }
}
