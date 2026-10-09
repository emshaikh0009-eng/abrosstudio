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



// PATCH /api/admin/customers/[id] — update customer fields or status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate that id is a valid positive integer string (matching bigint)
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid customer ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.name !== undefined || body.full_name !== undefined) {
      const val = sanitizeText(body.name || body.full_name, 120);
      if (!val) {
        return NextResponse.json(
          { error: "Full name cannot be empty." },
          { status: 400 }
        );
      }
      updates.full_name = val;
    }

    if (body.role !== undefined || body.designation !== undefined) {
      updates.designation = sanitizeText(body.role || body.designation, 120) || null;
    }

    if (body.company !== undefined || body.company_name !== undefined) {
      updates.company_name = sanitizeText(body.company || body.company_name, 120) || null;
    }

    if (body.description !== undefined) {
      updates.description = sanitizeText(body.description, 500) || null;
    }

    if (body.phone !== undefined || body.mobile_number !== undefined) {
      updates.mobile_number = sanitizeText(body.phone || body.mobile_number, 30) || null;
    }

    if (body.whatsapp !== undefined || body.whatsapp_number !== undefined) {
      updates.whatsapp_number = sanitizeText(body.whatsapp || body.whatsapp_number, 30) || null;
    }

    if (body.email !== undefined) {
      updates.email = sanitizeText(body.email, 120) || null;
    }

    if (body.website !== undefined) {
      updates.website = sanitizeText(body.website, 120) || null;
    }

    if (body.address !== undefined || body.business_address !== undefined) {
      updates.business_address = sanitizeText(body.address || body.business_address, 255) || null;
    }

    if (body.socialInstagram !== undefined || body.instagram_url !== undefined) {
      updates.instagram_url = sanitizeText(body.socialInstagram || body.instagram_url, 150) || null;
    }

    if (body.socialLinkedIn !== undefined || body.linkedin_url !== undefined) {
      updates.linkedin_url = sanitizeText(body.socialLinkedIn || body.linkedin_url, 150) || null;
    }

    if (body.design !== undefined || body.card_design !== undefined) {
      const design = body.design || body.card_design;
      updates.card_design = resolveCardDesign(design).name;
    }


    if (body.profileSlug !== undefined || body.profile_slug !== undefined || body.profileLink !== undefined) {
      let rawProfile = sanitizeText(body.profileSlug || body.profile_slug || body.profileLink, 100);
      if (rawProfile.includes("/c/")) {
        rawProfile = rawProfile.split("/c/").pop() || "";
      }
      const slug = rawProfile
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(/^ambros\.studio\/?/i, "")
        .replace(/^ambrosstudio\.space\/?/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (slug) {
        updates.profile_slug = slug;
      }
    }

    if (body.avatar_url !== undefined || body.avatarUrl !== undefined || body.profile_image_url !== undefined || body.photo !== undefined) {
      const imgVal = body.avatar_url || body.avatarUrl || body.profile_image_url || body.photo;
      updates.avatar_url = typeof imgVal === 'string' && imgVal.trim() ? imgVal.trim() : null;
    }

    if (body.custom_settings !== undefined || body.customSettings !== undefined) {
      const customSettings = sanitizeCustomSettings(body.custom_settings || body.customSettings);
      updates.custom_settings = customSettings;
    }

    if (body.is_active !== undefined) {
      updates.is_active = Boolean(body.is_active);
    } else if (body.status !== undefined) {
      updates.is_active = body.status === "active";
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Slug collision pre-check if profile_slug is being modified
    if (updates.profile_slug) {
      const { data: existingSlug } = await supabase
        .from("customers")
        .select("id")
        .eq("profile_slug", updates.profile_slug)
        .neq("id", id)
        .maybeSingle();

      if (existingSlug) {
        return NextResponse.json(
          { error: `A customer with profile slug "${updates.profile_slug}" already exists.` },
          { status: 409 }
        );
      }
    }

    updates.updated_at = new Date().toISOString();

    let updateRes = await supabase
      .from("customers")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    // If custom_settings or avatar_url columns do not yet exist in the DB schema, safely fallback
    if (updateRes.error && (updateRes.error.message.includes("custom_settings") || updateRes.error.message.includes("avatar_url"))) {
      if (updateRes.error.message.includes("custom_settings")) {
        delete updates.custom_settings;
      }
      if (updateRes.error.message.includes("avatar_url")) {
        delete updates.avatar_url;
      }
      updateRes = await supabase
        .from("customers")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();
    }

    if (updateRes.error) {
      console.error("PATCH /api/admin/customers/[id] error:", updateRes.error.message);
      return NextResponse.json(
        { error: "Failed to update customer record." },
        { status: 500 }
      );
    }

    const data = updateRes.data;

    if (!data) {
      return NextResponse.json(
        { error: "Customer record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: data,
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/customers/[id] unexpected error:", err?.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// GET /api/admin/customers/[id] — fetch single customer record for admin preview/edit (protected by RLS)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trimmedId = typeof id === "string" ? id.trim() : "";

    if (!trimmedId) {
      return NextResponse.json(
        { error: "Customer identifier is required." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let query = supabase.from("customers").select("*");

    if (/^\d+$/.test(trimmedId)) {
      query = query.eq("id", trimmedId);
    } else {
      query = query.eq("profile_slug", trimmedId.toLowerCase());
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("GET /api/admin/customers/[id] error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch customer record." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Customer record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: {
        ...data,
        fullName: data.full_name,
        name: data.full_name,
        role: data.designation || "",
        company: data.company_name || "",
        phone: data.mobile_number || "",
        whatsapp: data.whatsapp_number || "",
        address: data.business_address || "",
        socialInstagram: data.instagram_url || "",
        socialLinkedIn: data.linkedin_url || "",
        cardDesign: resolveCardDesign(data.card_design).id,
        profileSlug: data.profile_slug,
        avatarUrl: data.avatar_url || data.profile_image_url || "",
        customSettings: data.custom_settings || null,
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/customers/[id] unexpected error:", err?.message);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
