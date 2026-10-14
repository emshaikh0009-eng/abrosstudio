import { createAnonymousClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Requirement 4: Canonical reset redirect URL
const CANONICAL_RESET_URL = "https://ambrosstudio.com/admin/reset-password";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "A valid administrator email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address format." },
        { status: 400 }
      );
    }

    // Determine redirect URL:
    // Default to canonical domain https://ambrosstudio.com/admin/reset-password
    let redirectTo = CANONICAL_RESET_URL;
    
    // In local development environment, if request originates from localhost, use local redirect
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    if (isLocalhost && process.env.NODE_ENV === "development") {
      const port = host.split(":")[1] || "3000";
      redirectTo = `http://localhost:${port}/admin/reset-password`;
    }

    const supabase = createAnonymousClient();

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      console.warn("Supabase resetPasswordForEmail notice:", error.message);
      // Supabase rate limiting or security throttle
      if (
        error.status === 429 ||
        error.message.toLowerCase().includes("rate limit") ||
        error.message.toLowerCase().includes("security purposes")
      ) {
        return NextResponse.json(
          { error: "Too many password reset requests. Please wait a few moments before trying again." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: error.message || "Failed to send password reset email." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an administrator account exists with this email, a password reset link has been sent.",
    });
  } catch (err: any) {
    console.error("Forgot password route error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
