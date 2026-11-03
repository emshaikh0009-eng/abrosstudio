import { renderCardHtml, ResolvedCustomerCard } from "@/utils/card-renderer";
import { AUTHORITATIVE_AMBROS_CUSTOMER, resolveCardDesign } from "@/utils/card-designs";
import { createAnonymousClient } from "@/utils/supabase/server";
import { getCachedProfileHtml, setCachedProfileHtml } from "@/utils/card-cache";

const PUBLIC_PROFILE_CACHE_CONTROL = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const designParam = requestUrl.searchParams.get("design");

  // 0. High-speed in-memory cache lookup
  const cachedHtml = getCachedProfileHtml("ambros-studio", designParam);
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
    ...AUTHORITATIVE_AMBROS_CUSTOMER,
    profileSlug: "ambros-studio",
    cardDesign: designParam ? resolveCardDesign(designParam).id : "ambros-flagship",
  };

  try {
    const supabase = createAnonymousClient();
    const { data, error } = await supabase.rpc("get_public_card", {
      p_slug: "ambros-studio",
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      const row = data[0];
      const activeDesign = designParam
        ? resolveCardDesign(designParam).id
        : resolveCardDesign(row.card_design).id;

      cardData = {
        fullName: row.full_name || AUTHORITATIVE_AMBROS_CUSTOMER.fullName,
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
        profileSlug: row.profile_slug || "ambros-studio",
        avatarUrl: row.avatar_url || row.profile_image_url || "",
        customSettings: row.custom_settings || null,
        is_active: true,
      };
    }
  } catch (err) {
    console.error("Error fetching live Ambros Studio customer:", err);
  }

  const html = renderCardHtml(cardData);
  setCachedProfileHtml("ambros-studio", designParam, html, cardData.cardDesign || "ambros-flagship");

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": PUBLIC_PROFILE_CACHE_CONTROL,
      "X-Ambros-Cache": "MISS",
    },
  });
}

