import { renderCardHtml, ResolvedCustomerCard } from "@/utils/card-renderer";
import { AUTHORITATIVE_RAFTCON_CUSTOMER, resolveCardDesign } from "@/utils/card-designs";
import { createAnonymousClient } from "@/utils/supabase/server";
import { getCachedProfileHtml, setCachedProfileHtml } from "@/utils/card-cache";

const PUBLIC_PROFILE_CACHE_CONTROL = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    requestUrl.host ||
    "";

  // Defense-in-depth: if reached on apex domain, permanently redirect (308) to business subdomain
  const cleanHost = host.split(":")[0].toLowerCase();
  const isApex =
    cleanHost === "ambrosstudio.com" ||
    cleanHost === "www.ambrosstudio.com" ||
    cleanHost === "ambrosstudio.space" ||
    cleanHost === "www.ambrosstudio.space";

  if (isApex) {
    const targetUrl = new URL(
      `/tabrezqureshi${requestUrl.search}`,
      "https://raftconconstruction.ambrosstudio.com"
    );
    return Response.redirect(targetUrl.toString(), 308);
  }

  const designParam = requestUrl.searchParams.get("design");

  // 0. High-speed in-memory cache lookup (<1ms response time)
  const cachedHtml = getCachedProfileHtml("tabrezqureshi", designParam);
  if (cachedHtml) {
    return new Response(cachedHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": PUBLIC_PROFILE_CACHE_CONTROL,
        "X-Ambros-Cache": "HIT",
      },
    });
  }

  let cardData: ResolvedCustomerCard = {
    ...AUTHORITATIVE_RAFTCON_CUSTOMER,
    profileSlug: "tabrezqureshi",
    cardDesign: designParam ? resolveCardDesign(designParam).id : "raftcon-luxury",
  };

  try {
    const supabase = createAnonymousClient();
    const { data, error } = await supabase.rpc("get_public_card", {
      p_slug: "tabrezqureshi",
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      const row = data[0];
      const activeDesign = designParam
        ? resolveCardDesign(designParam).id
        : resolveCardDesign(row.card_design).id;

      cardData = {
        fullName: row.full_name || AUTHORITATIVE_RAFTCON_CUSTOMER.fullName,
        designation: row.designation || "",
        company: row.company_name || "",
        description: row.description || "",
        phone: row.mobile_number || "",
        whatsapp: row.whatsapp_number || "",
        email: row.email || "",
        website: row.website || "",
        address: row.business_address || "",
        socialInstagram: row.instagram_url || "",
        socialLinkedIn: row.linkedin_url || "",
        cardDesign: activeDesign,
        profileSlug: row.profile_slug || "tabrezqureshi",
        avatarUrl: row.avatar_url || row.profile_image_url || "",
        customSettings: row.custom_settings || null,
        is_active: true,
      };
    }
  } catch (err) {
    console.error("Error fetching live Raftcon customer for /tabrezqureshi:", err);
  }

  const html = renderCardHtml(cardData);
  setCachedProfileHtml("tabrezqureshi", designParam, html, cardData.cardDesign || "raftcon-luxury");

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": PUBLIC_PROFILE_CACHE_CONTROL,
      "X-Ambros-Cache": "MISS",
    },
  });
}

