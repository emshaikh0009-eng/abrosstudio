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

function getSubdomainRedirectUrl(request: NextRequest, targetSubdomain: string, targetPath: string): URL {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host;

  const search = request.nextUrl.search || "";

  if (host && host.includes("localhost")) {
    const port = host.split(":")[1];
    const portSuffix = port ? `:${port}` : ":3000";
    return new URL(`http://${targetSubdomain}.localhost${portSuffix}${targetPath}${search}`);
  }

  return new URL(`https://${targetSubdomain}.ambrosstudio.com${targetPath}${search}`);
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

  // 2. Customer Subdomain Routing (e.g. raftconconstruction.ambrosstudio.com or aamirshaikh.ambrosstudio.com)
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

    // 2b. Allow direct /c/ routes on subdomain (e.g. /c/raftcon/brochure or /c/[slug])
    if (pathname.startsWith("/c/")) {
      return NextResponse.next();
    }

    // 2c. Allow public card API requests on subdomain: /api/cards/[slug]
    if (pathname.startsWith("/api/cards")) {
      return NextResponse.next();
    }

    // 2d. Brochure viewer on subdomain:
    // /brochure or /brochure/ or /tabrezqureshi/brochure
    if (pathname === "/brochure" || pathname === "/brochure/") {
      const brochureSlug = (subdomain === "raftconconstruction" || subdomain === "raftcon") ? "raftcon" : subdomain;
      return NextResponse.rewrite(
        new URL(`/c/${brochureSlug}/brochure${request.nextUrl.search}`, request.url)
      );
    }

    if (pathname.endsWith("/brochure") || pathname.endsWith("/brochure/")) {
      const parts = pathname.split("/").filter(Boolean);
      const rawSlug = parts[0] === "c" ? (parts[1] || subdomain) : (parts[0] || subdomain);
      const canonicalBrochureSlug = (rawSlug === "tabrezqureshi" || rawSlug === "raftconconstruction" || rawSlug === "raftcon") ? "raftcon" : rawSlug;
      return NextResponse.rewrite(
        new URL(`/c/${canonicalBrochureSlug}/brochure${request.nextUrl.search}`, request.url)
      );
    }

    // 2e. Business Subdomain root ("/") or slug paths:
    // For Raftcon Construction:
    if (subdomain === "raftconconstruction" || subdomain === "raftcon") {
      // If root "/", redirect cleanly to /tabrezqureshi
      if (pathname === "/" || pathname === "") {
        return NextResponse.redirect(
          new URL(`/tabrezqureshi${request.nextUrl.search}`, request.url),
          307
        );
      }
      // If /tabrezqureshi or /tabrezqureshi/
      if (pathname === "/tabrezqureshi" || pathname === "/tabrezqureshi/") {
        return NextResponse.rewrite(
          new URL(`/c/tabrezqureshi${request.nextUrl.search}`, request.url)
        );
      }
    }

    // Generic business or personal subdomain handling:
    // If root "/", rewrite to /c/[subdomain] (e.g. aamirshaikh.ambrosstudio.com/ -> /c/aamirshaikh)
    if (pathname === "/" || pathname === "") {
      return NextResponse.rewrite(
        new URL(`/c/${subdomain}${request.nextUrl.search}`, request.url)
      );
    }

    // If a specific profile slug was requested on the business subdomain:
    // e.g. https://[business].ambrosstudio.com/[slug] -> rewrite to /c/[slug]
    const cleanPathSlug = pathname.replace(/^\/+|\/+$/g, "");
    if (cleanPathSlug && !cleanPathSlug.includes("/")) {
      return NextResponse.rewrite(
        new URL(`/c/${cleanPathSlug}${request.nextUrl.search}`, request.url)
      );
    }

    return NextResponse.rewrite(
      new URL(`/c/${subdomain}${request.nextUrl.search}`, request.url)
    );
  }

  // 3. Apex / Canonical Domain Routing (ambrosstudio.com, www.ambrosstudio.com, localhost)
  // 3a. CRITICAL: Permanent Redirect (308) for Raftcon Construction / Tabrez Qureshi
  // Any visit to the old URL (or aliases) on apex domain MUST redirect to the new subdomain URL:
  // https://raftconconstruction.ambrosstudio.com/tabrezqureshi
  if (
    pathname === "/tabrezqureshi" ||
    pathname === "/tabrezqureshi/" ||
    pathname === "/c/raftcon" ||
    pathname === "/c/raftcon/" ||
    pathname === "/c/raftcon-construction" ||
    pathname === "/c/raftcon-construction/" ||
    pathname === "/c/raftconconstruction" ||
    pathname === "/c/raftconconstruction/" ||
    pathname === "/c/tabrezqureshi" ||
    pathname === "/c/tabrezqureshi/"
  ) {
    return NextResponse.redirect(
      getSubdomainRedirectUrl(request, "raftconconstruction", "/tabrezqureshi"),
      308
    );
  }

  // Brochure redirects on apex domain to subdomain brochure viewer
  if (
    pathname === "/c/raftcon/brochure" ||
    pathname === "/c/raftcon/brochure/" ||
    pathname === "/tabrezqureshi/brochure" ||
    pathname === "/tabrezqureshi/brochure/"
  ) {
    return NextResponse.redirect(
      getSubdomainRedirectUrl(request, "raftconconstruction", "/brochure"),
      308
    );
  }

  // 3b. Pass through admin, cards, assets, public cards, and other customer endpoints on apex
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cards") ||
    pathname.startsWith("/c/") ||
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
