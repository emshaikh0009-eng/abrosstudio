import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Check explicit admin status in admin_users
    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("id", data.user.id)
      .eq("is_active", true)
      .maybeSingle();

    // Explicit verification of admin_users membership (fail closed)
    const isAdmin = Boolean(!adminError && adminRecord && adminRecord.is_active);

    if (!isAdmin || !adminRecord) {
      return NextResponse.json(
        {
          error: "Forbidden: Account is not an authorized Ambros Studio administrator.",
          isAdmin: false,
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      isAdmin: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: adminRecord.role,
      },
      session: {
        access_token: data.session.access_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
