import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function sanitizeText(val: any, maxLength = 255): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}

// GET /api/admin/customers — fetch customer records using authenticated session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/admin/customers error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch customer records." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customers: data || [],
    });
  } catch (err: any) {
    console.error("GET /api/admin/customers unexpected error:", err?.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// POST /api/admin/customers — create a new customer record
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Server-side validation
    const fullName = sanitizeText(body.name || body.full_name, 120);
    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    const designation = sanitizeText(body.role || body.designation, 120);
    const companyName = sanitizeText(body.company || body.company_name, 120);
    const description = sanitizeText(body.description, 500);
    const mobileNumber = sanitizeText(body.phone || body.mobile_number, 30);
    const whatsappNumber = sanitizeText(body.whatsapp || body.whatsapp_number, 30);
    const email = sanitizeText(body.email, 120);
    const website = sanitizeText(body.website, 120);
    const businessAddress = sanitizeText(body.address || body.business_address, 255);
    const instagramUrl = sanitizeText(body.socialInstagram || body.instagram_url, 150);
    const linkedinUrl = sanitizeText(body.socialLinkedIn || body.linkedin_url, 150);
    const cardDesign = (body.design || body.card_design) === "Evergreen" ? "Evergreen" : "Mint Haven";

    // Format profile slug cleanly from profileLink, profileSlug, or profile_slug
    const rawProfile = sanitizeText(body.profileLink || body.profileSlug || body.profile_slug, 100);
    let profileSlug = rawProfile
      .replace(/^https?:\/\//i, "")
      .replace(/^ambros\.studio\//i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!profileSlug) {
      profileSlug = fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const isActive = typeof body.is_active === "boolean"
      ? body.is_active
      : body.status !== "inactive";

    const avatarUrl = typeof body.avatar_url === "string" 
      ? body.avatar_url.trim()
      : typeof body.avatarUrl === "string" 
        ? body.avatarUrl.trim() 
        : typeof body.profile_image_url === "string"
          ? body.profile_image_url.trim()
          : null;

    const newRecord: Record<string, any> = {
      full_name: fullName,
      designation: designation || null,
      company_name: companyName || null,
      description: description || null,
      mobile_number: mobileNumber || null,
      whatsapp_number: whatsappNumber || null,
      email: email || null,
      website: website || null,
      business_address: businessAddress || null,
      instagram_url: instagramUrl || null,
      linkedin_url: linkedinUrl || null,
      card_design: cardDesign,
      profile_slug: profileSlug || null,
      is_active: isActive,
    };

    if (avatarUrl) {
      newRecord.avatar_url = avatarUrl;
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Slug collision pre-check
    if (profileSlug) {
      const { data: existingSlug } = await supabase
        .from("customers")
        .select("id")
        .eq("profile_slug", profileSlug)
        .maybeSingle();

      if (existingSlug) {
        return NextResponse.json(
          { error: `A customer with profile slug "${profileSlug}" already exists.` },
          { status: 409 }
        );
      }
    }

    let insertRes = await supabase
      .from("customers")
      .insert([newRecord])
      .select()
      .single();

    // If avatar_url column does not yet exist in the DB schema, safely fallback without it
    if (insertRes.error && insertRes.error.message.includes("avatar_url")) {
      delete newRecord.avatar_url;
      insertRes = await supabase
        .from("customers")
        .insert([newRecord])
        .select()
        .single();
    }

    if (insertRes.error) {
      console.error("POST /api/admin/customers error:", insertRes.error.message);
      return NextResponse.json(
        { error: "Failed to create customer record." },
        { status: 500 }
      );
    }

    const data = insertRes.data;

    return NextResponse.json(
      {
        success: true,
        customer: data,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/customers unexpected error:", err?.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
