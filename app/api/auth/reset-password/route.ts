import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function POST(request: Request) {
  try {
    const { password, accessToken } = await request.json();

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json(
        { error: "A valid recovery access token is required." },
        { status: 401 }
      );
    }

    // Initialize Supabase client authenticated with the user's recovery access token
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Update password using the authenticated recovery session
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to update password." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (err: any) {
    console.error("Reset password server error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
