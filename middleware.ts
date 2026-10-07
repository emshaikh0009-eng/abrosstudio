import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept static files, admin panel, cards, assets, or public customer card endpoints
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cards") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/api/cards") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If requesting protected admin API routes, verify authentication
  if (pathname.startsWith("/api/admin")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    let supabaseResponse = NextResponse.next({ request });
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Explicit verification of admin_users membership (fail closed)
    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("id, is_active")
      .eq("id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError || !adminRecord) {
      return NextResponse.json(
        { error: "Forbidden: Account is not an authorized Ambros Studio administrator." },
        { status: 403 }
      );
    }

    return supabaseResponse;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|admin|cards|assets|.*\\.(?:html|css|js|map|json|png|jpg|jpeg|gif|webp|svg|ico)).*)",
  ],
};
