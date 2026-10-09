import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function sanitizeText(val: any, maxLength = 255): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const ALLOWED_FONTS = new Set([
  "",
  "Inter",
  "Plus Jakarta Sans",
  "Poppins",
  "Montserrat",
  "DM Sans",
  "Playfair Display",
]);

const ALLOWED_LINK_TYPES = new Set([
  "whatsapp",
  "phone",
  "email",
  "website",
  "instagram",
  "facebook",
  "linkedin",
  "youtube",
  "twitter",
  "telegram",
  "maps",
  "custom",
]);

function sanitizeColor(val: any): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  return HEX_COLOR_REGEX.test(trimmed) ? trimmed : "";
}

function sanitizeFont(val: any): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  return ALLOWED_FONTS.has(trimmed) ? trimmed : "";
}

import { resolveCardDesign } from "@/utils/card-designs";

function sanitizeImageRef(val: any): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (!trimmed || trimmed.length > 2000) return "";
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("data:") || lower.startsWith("javascript:") || lower.startsWith("blob:")) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }
  return "";
}

function sanitizeCustomSettings(val: any) {
  if (!val || typeof val !== "object") return null;

  const appearance = val.appearance && typeof val.appearance === "object" ? val.appearance : {};
  const cleanAppearance = {
    primaryColor: sanitizeColor(appearance.primaryColor || appearance.primary_color),
    backgroundColor: sanitizeColor(appearance.backgroundColor || appearance.background_color),
    textColor: sanitizeColor(appearance.textColor || appearance.text_color),
    fontFamily: sanitizeFont(appearance.fontFamily || appearance.font_family),
  };

  const rawLinks = Array.isArray(val.links) ? val.links : [];
  const cleanLinks: any[] = [];

  for (let idx = 0; idx < Math.min(rawLinks.length, 50); idx++) {
    const item = rawLinks[idx];
    if (!item || typeof item !== "object") continue;

    const rawType = typeof item.type === "string" ? item.type.trim().toLowerCase() : "";
    if (!ALLOWED_LINK_TYPES.has(rawType)) {
      continue;
    }

    cleanLinks.push({
      id: sanitizeText(item.id, 50) || `link_${Date.now()}_${idx}`,
      type: rawType,
      label: sanitizeText(item.label, 80),
      value: sanitizeText(item.value || item.url, 500),
      enabled: item.enabled !== false,
      order: typeof item.order === "number" ? item.order : idx,
    });
  }

  const result: Record<string, any> = {
    appearance: cleanAppearance,
    links: cleanLinks,
  };

  if (val.industry && typeof val.industry === "object") {
    result.industry = {
      type: sanitizeText(val.industry.type, 50),
      data: (val.industry.data && typeof val.industry.data === "object") ? val.industry.data : {},
    };
  }

  const rawImages = val.cardImages && typeof val.cardImages === "object" ? val.cardImages : {};
  const frontUrl = sanitizeImageRef(rawImages.frontUrl || rawImages.front_url);
  const backUrl = sanitizeImageRef(rawImages.backUrl || rawImages.back_url);
  result.cardImages = {
    frontUrl: frontUrl || "",
    backUrl: backUrl || "",
  };

  return result;
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
    const cardDesign = resolveCardDesign(body.design || body.card_design).name;

    // Format profile slug cleanly from profileSlug, profile_slug, or profileLink
    let rawProfile = sanitizeText(body.profileSlug || body.profile_slug || body.profileLink, 100);
    if (rawProfile.includes("/c/")) {
      rawProfile = rawProfile.split("/c/").pop() || "";
    }
    let profileSlug = rawProfile
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/^ambros\.studio\/?/i, "")
      .replace(/^ambrosstudio\.space\/?/i, "")
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

    const customSettings = sanitizeCustomSettings(body.custom_settings || body.customSettings);
    if (customSettings) {
      newRecord.custom_settings = customSettings;
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

    // If custom_settings or avatar_url columns do not yet exist in the DB schema, safely fallback
    if (insertRes.error && (insertRes.error.message.includes("custom_settings") || insertRes.error.message.includes("avatar_url"))) {
      if (insertRes.error.message.includes("custom_settings")) {
        delete newRecord.custom_settings;
      }
      if (insertRes.error.message.includes("avatar_url")) {
        delete newRecord.avatar_url;
      }
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
