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
        designation: row.designation ?? AUTHORITATIVE_RAFTCON_CUSTOMER.designation,
        company: row.company_name ?? AUTHORITATIVE_RAFTCON_CUSTOMER.company,
        description: row.description ?? AUTHORITATIVE_RAFTCON_CUSTOMER.description,
        phone: row.mobile_number ?? AUTHORITATIVE_RAFTCON_CUSTOMER.phone,
        whatsapp: row.whatsapp_number ?? AUTHORITATIVE_RAFTCON_CUSTOMER.whatsapp,
        email: row.email ?? AUTHORITATIVE_RAFTCON_CUSTOMER.email,
        website: row.website ?? AUTHORITATIVE_RAFTCON_CUSTOMER.website,
        address: row.business_address ?? AUTHORITATIVE_RAFTCON_CUSTOMER.address,
        socialInstagram: row.instagram_url ?? "",
        socialLinkedIn: row.linkedin_url ?? "",
        cardDesign: activeDesign,
        profileSlug: row.profile_slug || "tabrezqureshi",
        avatarUrl: row.avatar_url || AUTHORITATIVE_RAFTCON_CUSTOMER.avatarUrl,
        customSettings: row.custom_settings || AUTHORITATIVE_RAFTCON_CUSTOMER.customSettings,
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

