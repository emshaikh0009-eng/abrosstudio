import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "app",
  "mail",
  "email",
  "smtp",
  "ftp",
  "cpanel",
  "webmail",
  "ns1",
  "ns2",
  "autodiscover",
  "cdn",
  "assets",
  "static",
  "preview",
  "dev",
  "stage",
  "staging",
  "test",
]);

function isReservedSubdomain(sub: string): boolean {
  return RESERVED_SUBDOMAINS.has(sub.toLowerCase());
}

function extractCustomerSubdomain(hostname: string | null): string | null {
  if (!hostname) return null;
  const host = hostname.split(":")[0].toLowerCase().trim();

  // Exclude raw IP addresses and standalone localhost
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  // Handle local development with subdomains: e.g. "tabrezqureshi.localhost:3000"
  if (host.endsWith(".localhost")) {
    const parts = host.split(".");
    if (parts.length >= 2) {
      const sub = parts[0];
      if (sub && !isReservedSubdomain(sub)) return sub;
    }
    return null;
  }

  // Primary authoritative domains
  const knownRoots = ["ambrosstudio.com", "ambrosstudio.space"];
  for (const root of knownRoots) {
    if (host === root || host === `www.${root}`) {
      return null;
    }
    if (host.endsWith(`.${root}`)) {
      const sub = host.slice(0, -(root.length + 1));
      const subPart = sub.split(".")[0];
      if (subPart && !isReservedSubdomain(subPart)) {
        return subPart;
      }
      return null;
    }
  }

  // Vercel deployment preview domains: e.g. "tabrezqureshi.<project>.vercel.app"
  if (host.endsWith(".vercel.app")) {
    const parts = host.split(".");
    if (parts.length >= 4) {
      const sub = parts[0];
      if (sub && !isReservedSubdomain(sub)) return sub;
    }
    return null;
  }

  // Generic fallback for any other multi-part domain: sub.domain.tld
  const parts = host.split(".");
  if (parts.length >= 3) {
    const sub = parts[0];
    if (sub && !isReservedSubdomain(sub)) {
      return sub;
    }
  }

  return null;
}

function getCanonicalRootUrl(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host;

  if (host && host.includes("localhost")) {
    const port = host.split(":")[1];
    return port ? `http://localhost:${port}` : "http://localhost:3000";
  }

  return "https://ambrosstudio.com";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host;
  const subdomain = extractCustomerSubdomain(host);

  // 1. Static files and internal Next.js assets: always pass through untouched
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/cards") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Customer Subdomain Routing (e.g. tabrezqureshi.ambrosstudio.com)
  if (subdomain) {
    // 2a. Guard Admin & Auth: prevent arbitrary subdomains from exposing admin pages or private data
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const canonicalAdminUrl = new URL(pathname, getCanonicalRootUrl(request));
      return NextResponse.redirect(canonicalAdminUrl, 307);
    }

    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Forbidden: Admin endpoints are restricted to the canonical domain." },
        { status: 403 }
      );
    }

    if (pathname.startsWith("/api/auth")) {
      return NextResponse.json(
        { error: "Forbidden: Authentication endpoints are restricted to the canonical domain." },
        { status: 403 }
      );
    }

    // 2b. Brochure viewer on subdomain: /brochure -> /c/[subdomain]/brochure
    if (pathname === "/brochure" || pathname === "/brochure/") {
      return NextResponse.rewrite(
        new URL(`/c/${subdomain}/brochure${request.nextUrl.search}`, request.url)
      );
    }

    // 2c. Allow direct /c/ routes on subdomain (e.g. /c/raftcon/brochure or /c/[slug])
    if (pathname.startsWith("/c/")) {
      return NextResponse.next();
    }

    // 2d. Allow public card API requests on subdomain: /api/cards/[slug]
    if (pathname.startsWith("/api/cards")) {
      return NextResponse.next();
    }

    // 2e. Customer Profile Subdomain root and slug paths:
    // Route "/" or "/[subdomain]" or other profile subpaths to /c/[subdomain]
    return NextResponse.rewrite(
      new URL(`/c/${subdomain}${request.nextUrl.search}`, request.url)
    );
  }

  // 3. Apex / Canonical Domain Routing (ambrosstudio.com, www.ambrosstudio.com, localhost)
  // 3a. Never intercept public customer endpoints, cards, or tabrezqureshi on apex
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cards") ||
    pathname.startsWith("/c/") ||
    pathname.startsWith("/tabrezqureshi") ||
    pathname.startsWith("/api/cards") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // 3b. Admin API authentication verification (Fail Closed)
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

  // 3c. Regular apex page requests (Homepage /, About, Contact, Services, Work)
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|cards|assets|.*\\.(?:html|css|js|map|json|png|jpg|jpeg|gif|webp|svg|ico|pdf)).*)",
  ],
};
