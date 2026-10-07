import { createAnonymousClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";

function renderUnavailableHtml(title = "Card Unavailable", message = "This digital business card is currently inactive or does not exist."): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${title} | Ambros Studio</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
      text-align: center;
    }
    .error-card {
      max-width: 420px;
      width: 100%;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 44px 28px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 12px;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn-home {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #1e293b;
      color: #f8fafc;
      text-decoration: none;
      padding: 12px 22px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s ease;
    }
    .btn-home:hover {
      background: #334155;
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="error-card">
    <div class="icon-wrap">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://www.ambrosstudio.space" class="btn-home">
      &larr; Back to Ambros Studio
    </a>
  </div>
</body>
</html>`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sanitizedSlug = typeof slug === "string" ? slug.trim().toLowerCase().slice(0, 100) : "";

    if (!sanitizedSlug) {
      return new Response(renderUnavailableHtml("Invalid Link", "No profile slug was provided."), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Pure anonymous client with zero session/cookie state
    const supabase = createAnonymousClient();

    // 1. Exact slug match
    let { data, error } = await supabase.rpc("get_public_card", {
      p_slug: sanitizedSlug,
    });

    // 2. Safe alias fallback for Ambros Studio brand card (ambros <-> ambros-studio)
    if ((!data || data.length === 0) && (sanitizedSlug === "ambros" || sanitizedSlug === "ambros-studio")) {
      const aliasSlug = sanitizedSlug === "ambros" ? "ambros-studio" : "ambros";
      const fallbackRes = await supabase.rpc("get_public_card", {
        p_slug: aliasSlug,
      });
      if (fallbackRes.data && fallbackRes.data.length > 0) {
        data = fallbackRes.data;
        error = null;
      }
    }

    if (error || !data || !Array.isArray(data) || data.length === 0) {
      return new Response(
        renderUnavailableHtml("Card Unavailable", "This digital business card is currently inactive or does not exist."),
        {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=10, must-revalidate",
          },
        }
      );
    }

    const rawCard = data[0];
    const isEvergreen = rawCard.card_design === "Evergreen";
    const targetTemplate = isEvergreen ? "design-2" : "design-1";

    const cardData = {
      fullName: rawCard.full_name,
      designation: rawCard.designation || "",
      company: rawCard.company_name || "",
      description: rawCard.description || "",
      phone: rawCard.mobile_number || "",
      whatsapp: rawCard.whatsapp_number || "",
      email: rawCard.email || "",
      website: rawCard.website || "",
      address: rawCard.business_address || "",
      socialInstagram: rawCard.instagram_url || "",
      socialLinkedIn: rawCard.linkedin_url || "",
      cardDesign: isEvergreen ? "Evergreen" : "Mint Haven",
      profileSlug: rawCard.profile_slug || sanitizedSlug,
      avatarUrl: rawCard.avatar_url || rawCard.profile_image_url || "",
      customSettings: rawCard.custom_settings || null,
      is_active: true,
    };

    // Read the static template HTML directly from public/cards/${targetTemplate}/index.html
    const templatePath = path.join(process.cwd(), "public", "cards", targetTemplate, "index.html");
    let html = fs.readFileSync(templatePath, "utf8");

    // Replace relative paths with absolute public paths so it loads cleanly under /c/[slug]
    html = html.replace(/href=["'](?:\.\/)?style\.css["']/g, `href="/cards/${targetTemplate}/style.css"`);
    html = html.replace(/src=["'](?:\.\.\/|\.\/)?qrcode\.js["']/g, `src="/cards/qrcode.js"`);
    html = html.replace(/src=["'](?:\.\.\/|\.\/)?card-loader\.js["']/g, `src="/cards/card-loader.js"`);

    // Dynamic Title & Meta
    const metaTitle = `${cardData.fullName} — ${cardData.designation ? cardData.designation + ' | ' : ''}${cardData.company || 'Ambros Studio'}`;
    const metaDesc = cardData.description || `Digital business card for ${cardData.fullName}.`;

    html = html.replace(/<title>.*?<\/title>/i, `<title>${metaTitle}</title>`);
    html = html.replace(/<meta name="description" content=".*?">/i, `<meta name="description" content="${metaDesc.replace(/"/g, '&quot;')}">`);

    // Injected Canonical URL pointing to permanent public /c/{slug} link
    const canonicalTag = `<link rel="canonical" href="https://www.ambrosstudio.space/c/${encodeURIComponent(cardData.profileSlug)}">`;

    // Server-rendered theme styles & font link for 0ms paint
    let customThemeTags = "";
    const appearance = cardData.customSettings?.appearance;
    if (appearance && typeof appearance === "object") {
      const vars: string[] = [];
      const HEX_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
      if (appearance.primaryColor && HEX_REGEX.test(appearance.primaryColor.trim())) {
        vars.push(`--card-primary: ${appearance.primaryColor.trim()};`);
      }
      if (appearance.backgroundColor && HEX_REGEX.test(appearance.backgroundColor.trim())) {
        vars.push(`--card-background: ${appearance.backgroundColor.trim()};`);
      }
      if (appearance.textColor && HEX_REGEX.test(appearance.textColor.trim())) {
        vars.push(`--card-text: ${appearance.textColor.trim()};`);
      }

      const FONT_MAP: Record<string, string> = {
        "Inter": "family=Inter:wght@400;500;600;700",
        "Plus Jakarta Sans": "family=Plus+Jakarta+Sans:wght@400;500;600;700;800",
        "Poppins": "family=Poppins:wght@400;500;600;700",
        "Montserrat": "family=Montserrat:wght@400;500;600;700",
        "DM Sans": "family=DM+Sans:wght@400;500;700",
        "Playfair Display": "family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600",
      };

      const font = typeof appearance.fontFamily === "string" ? appearance.fontFamily.trim() : "";
      let fontLink = "";
      if (font && FONT_MAP[font]) {
        vars.push(`--card-font: '${font}', system-ui, sans-serif;`);
        fontLink = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${FONT_MAP[font]}&display=swap">`;
      }

      if (vars.length > 0) {
        customThemeTags = `\n  ${fontLink}\n  <style id="__CUSTOM_CARD_THEME__">:root { ${vars.join(" ")} }</style>`;
      }
    }

    // Embed pre-hydrated card data directly into the head so hydration is instantaneous with 0ms delay
    const initialDataScript = `
  ${canonicalTag}${customThemeTags}
  <script id="__INITIAL_CARD_DATA__">
    window.__INITIAL_CARD__ = ${JSON.stringify(cardData)};
  </script>
</head>`;
    html = html.replace(/<\/head>/i, initialDataScript);

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("GET /c/[slug] error:", err?.message);
    return new Response(renderUnavailableHtml("Server Error", "An unexpected error occurred while loading this digital business card."), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
