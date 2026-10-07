import { createAnonymousClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sanitizedSlug = typeof slug === "string" ? slug.trim().toLowerCase().slice(0, 100) : "";

    if (!sanitizedSlug) {
      return NextResponse.json(
        { error: "Valid profile slug is required." },
        { status: 400 }
      );
    }

    // Pure anonymous client: does not depend on admin session or client cookies
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

    if (error) {
      console.error("GET /api/cards/[slug] RPC error:", error.message);
      return NextResponse.json(
        { error: "Failed to retrieve digital business card." },
        { status: 500 }
      );
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Card not found or currently unavailable." },
        { status: 404 }
      );
    }

    const card = data[0];

    return NextResponse.json({
      success: true,
      card: {
        fullName: card.full_name,
        designation: card.designation || "",
        company: card.company_name || "",
        description: card.description || "",
        phone: card.mobile_number || "",
        whatsapp: card.whatsapp_number || "",
        email: card.email || "",
        website: card.website || "",
        address: card.business_address || "",
        socialInstagram: card.instagram_url || "",
        socialLinkedIn: card.linkedin_url || "",
        cardDesign: card.card_design === "Evergreen" ? "Evergreen" : "Mint Haven",
        profileSlug: card.profile_slug,
        avatarUrl: card.avatar_url || card.profile_image_url || "",
      },
    });
  } catch (err: any) {
    console.error("GET /api/cards/[slug] unexpected error:", err?.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

