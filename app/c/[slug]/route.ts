import { createAnonymousClient } from "@/utils/supabase/server";
import { resolveCardDesign, AUTHORITATIVE_AMBROS_CUSTOMER, getDemoProfile } from "@/utils/card-designs";
import { renderCardHtml, ResolvedCustomerCard } from "@/utils/card-renderer";

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
    <a href="https://ambrosstudio.com" class="btn-home">
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

    const requestUrl = new URL(request.url);
    const designParam = requestUrl.searchParams.get("design");

    if (sanitizedSlug === "demo") {
      const demoCard = getDemoProfile(designParam || "mint-haven");
      const html = renderCardHtml(demoCard);
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
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
      if (sanitizedSlug === "ambros" || sanitizedSlug === "ambros-studio") {
        const activeDesignId = designParam
          ? resolveCardDesign(designParam).id
          : resolveCardDesign(AUTHORITATIVE_AMBROS_CUSTOMER.cardDesign).id;
        const html = renderCardHtml({
          ...AUTHORITATIVE_AMBROS_CUSTOMER,
          cardDesign: activeDesignId,
        });
        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=0, must-revalidate",
          },
        });
      }
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
    const resolvedDesign = designParam ? resolveCardDesign(designParam) : resolveCardDesign(rawCard.card_design);

    const cardData: ResolvedCustomerCard = {
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
      cardDesign: resolvedDesign.id,
      profileSlug: rawCard.profile_slug || sanitizedSlug,
      avatarUrl: rawCard.avatar_url || rawCard.profile_image_url || "",
      customSettings: rawCard.custom_settings || null,
      is_active: true,
    };

    // Render HTML dynamically from the single authoritative customer payload
    const html = renderCardHtml(cardData);

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
