import { renderCardHtml, ResolvedCustomerCard } from "@/utils/card-renderer";
import { AUTHORITATIVE_RAFTCON_CUSTOMER, resolveCardDesign } from "@/utils/card-designs";
import { createAnonymousClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const designParam = requestUrl.searchParams.get("design");

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

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

