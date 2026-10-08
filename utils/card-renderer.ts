/**
 * Ambros Studio — Universal Server-Side Card HTML Renderer
 * 
 * Renders all 16 canonical designs from ONE authoritative customer payload.
 * High performance 0ms initial server paint. Zero hardcoded customer leaks.
 */

import { CARD_DESIGNS, CardDesignDefinition, resolveCardDesign } from "./card-designs";

export interface ResolvedCustomerCard {
  fullName: string;
  designation?: string;
  company?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  socialInstagram?: string;
  socialLinkedIn?: string;
  cardDesign?: string;
  profileSlug: string;
  avatarUrl?: string;
  customSettings?: {
    appearance?: {
      primaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      fontFamily?: string;
    };
    links?: Array<{
      id: string;
      type: string;
      label: string;
      value: string;
      enabled: boolean;
      order: number;
    }>;
    industry?: {
      type: string;
      data: Record<string, any>;
    };
  } | null;
  is_active?: boolean;
}

function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInitials(name?: string | null): string {
  if (!name) return "AS";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return String(name).slice(0, 2).toUpperCase();
}

function cleanDigits(val?: string | null): string {
  if (!val) return "";
  return String(val).replace(/\D/g, "");
}

function cleanPhone(val?: string | null): string {
  if (!val) return "";
  return String(val).replace(/[^0-9+]/g, "");
}

function formatLinkDestination(type: string, rawValue?: string | null): string | null {
  if (!rawValue || typeof rawValue !== "string") return null;
  const val = rawValue.trim();
  if (!val) return null;

  const lower = val.toLowerCase().replace(/[\x00-\x20]/g, "");
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("blob:")
  ) {
    return null;
  }

  switch (type) {
    case "whatsapp": {
      if (val.startsWith("https://wa.me/") || val.startsWith("http://wa.me/")) {
        return val.replace("http://", "https://");
      }
      const digits = val.replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : null;
    }
    case "phone": {
      const cleaned = val.replace(/[^0-9+]/g, "");
      return cleaned ? `tel:${cleaned}` : null;
    }
    case "email": {
      const email = val.replace(/^mailto:/i, "").trim();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : null;
    }
    case "maps": {
      if (val.startsWith("https://maps.google.com") || val.startsWith("https://goo.gl/maps") || val.startsWith("https://www.google.com/maps")) {
        return val;
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}`;
    }
    case "website":
    case "instagram":
    case "facebook":
    case "linkedin":
    case "youtube":
    case "twitter":
    case "telegram":
    case "custom":
    default: {
      let target = val;
      if (!/^https?:\/\//i.test(target)) {
        if (type === "instagram" && !val.includes("/")) target = `https://instagram.com/${val.replace(/^@/, "")}`;
        else if (type === "twitter" && !val.includes("/")) target = `https://twitter.com/${val.replace(/^@/, "")}`;
        else if (type === "telegram" && !val.includes("/")) target = `https://t.me/${val.replace(/^@/, "")}`;
        else target = `https://${val}`;
      }
      try {
        const parsed = new URL(target);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          return target;
        }
      } catch (_) {
        return null;
      }
      return null;
    }
  }
}

function getDefaultLabel(type: string): string {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp",
    phone: "Call",
    email: "Email",
    website: "Website",
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    twitter: "X / Twitter",
    telegram: "Telegram",
    maps: "Directions / Maps",
    custom: "Link"
  };
  return map[type] || "Link";
}

function getDisplayValue(type: string, rawVal: string, label: string): string {
  if (!rawVal) return label || "";
  const val = rawVal.trim();
  if (type === "phone" || type === "whatsapp") return val;
  if (type === "email") return val.replace(/^mailto:/i, "");
  if (type === "website" || type === "custom") return val.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (type === "instagram") {
    const match = val.match(/instagram\.com\/([^/?#]+)/i);
    return match ? `@${match[1]}` : (val.startsWith("@") ? val : `@${val}`);
  }
  if (type === "twitter") {
    const match = val.match(/(?:twitter|x)\.com\/([^/?#]+)/i);
    return match ? `@${match[1]}` : (val.startsWith("@") ? val : `@${val}`);
  }
  if (type === "telegram") {
    const match = val.match(/t\.me\/([^/?#]+)/i);
    const identifier = match ? match[1] : val;
    return identifier.replace(/^@/, "");
  }
  if (type === "linkedin") {
    const match = val.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/i);
    return match ? match[1] : val.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
  if (type === "youtube") {
    const match = val.match(/youtube\.com\/(@[^/?#]+)/i);
    return match ? match[1] : "YouTube Channel";
  }
  if (type === "maps") {
    return val.startsWith("http") ? "View on Google Maps" : val;
  }
  return val.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function getLinkIconSvg(type: string, size = 18): string {
  switch (type) {
    case "phone":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
    case "whatsapp":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
    case "email":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`;
    case "website":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    case "instagram":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
    case "facebook":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`;
    case "linkedin":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
    case "youtube":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`;
    case "twitter":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`;
    case "telegram":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    case "maps":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    case "directions":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`;
    case "calendar":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    case "share":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
    case "qr":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
    case "contact":
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>`;
  }
}

const SOCIAL_TYPES = new Set(["instagram", "facebook", "linkedin", "youtube", "twitter"]);

export function resolveCustomerLinks(card: ResolvedCustomerCard) {
  const custom = card.customSettings;
  if (custom && Array.isArray(custom.links) && custom.links.length > 0) {
    return custom.links
      .filter(l => l && l.enabled !== false)
      .map((l, idx) => ({
        type: (l.type || "").toLowerCase(),
        label: l.label || getDefaultLabel((l.type || "").toLowerCase()),
        value: l.value || "",
        order: typeof l.order === "number" ? l.order : idx,
      }))
      .filter(l => formatLinkDestination(l.type, l.value) !== null)
      .sort((a, b) => a.order - b.order);
  }

  const list: Array<{ type: string; label: string; value: string; order: number }> = [];
  if (card.phone) {
    list.push({ type: "phone", label: "Call", value: card.phone, order: 0 });
  }
  if (card.whatsapp) {
    list.push({ type: "whatsapp", label: "WhatsApp", value: card.whatsapp, order: 1 });
  }
  if (card.email) {
    list.push({ type: "email", label: "Email", value: card.email, order: 2 });
  }
  if (card.website) {
    list.push({ type: "website", label: "Website", value: card.website, order: 3 });
  }
  if (card.socialInstagram) {
    list.push({ type: "instagram", label: "Instagram", value: card.socialInstagram, order: 4 });
  }
  if (card.socialLinkedIn) {
    list.push({ type: "linkedin", label: "LinkedIn", value: card.socialLinkedIn, order: 5 });
  }
  if (card.address) {
    list.push({ type: "maps", label: "Directions", value: card.address, order: 6 });
  }

  return list;
}

export function renderCardHtml(card: ResolvedCustomerCard, options: { isPreview?: boolean } = {}): string {
  const design: CardDesignDefinition = resolveCardDesign(card.cardDesign);
  const name = card.fullName || "Ambros Studio Member";
  const role = card.designation || "";
  const company = card.company || "";
  const bio = card.description || "";
  const phone = card.phone || "";
  const whatsapp = card.whatsapp || "";
  const address = card.address || "";
  const avatarUrl = card.avatarUrl || "";

  const custom = card.customSettings || {};
  const industryData = (custom.industry && custom.industry.data) ? custom.industry.data : {};

  const links = resolveCustomerLinks(card);
  const contactLinks = links.filter(l => !SOCIAL_TYPES.has(l.type));
  const socialLinks = links.filter(l => SOCIAL_TYPES.has(l.type));

  const initials = getInitials(name);
  const avatarHtml = avatarUrl
    ? `<div class="profile-avatar-circle" aria-label="${escapeHtml(name)}">
         <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name)}" class="profile-avatar-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
         <span class="profile-avatar-initials" style="display: none;">${escapeHtml(initials)}</span>
       </div>`
    : `<div class="profile-avatar-circle" aria-label="${escapeHtml(name)}">
         <span class="profile-avatar-initials">${escapeHtml(initials)}</span>
       </div>`;

  let inner = "";

  // 1. Header
  if (design.id === "atelier") {
    inner += `
      <header style="text-align: center; margin-bottom: 20px;">
        ${avatarHtml}
        <p style="font-size: 13px; font-family: sans-serif; opacity: 0.7; margin-bottom: 4px; margin-top: 12px;">Hello, I'm</p>
        <h1 class="profile-name">${escapeHtml(name)}</h1>
        <div style="text-align: center; margin: 10px 0;">
          <span class="fashion-tag">${escapeHtml(role || "Fashion designer & stylist")}</span>
        </div>
        ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ""}
      </header>
    `;
  } else if (design.category === "business") {
    inner += `
      <header style="text-align: center; margin-bottom: 20px;">
        ${avatarHtml}
        <h1 class="profile-name">${escapeHtml(company || name)}</h1>
        ${company && name ? `<p class="profile-designation">${escapeHtml(name)}${role ? ' · ' + escapeHtml(role) : ''}</p>` : (role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : "")}
        ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ""}
        <div style="text-align: center;">
          <span class="status-pill">
            <span class="status-dot"></span>
            <span>Open now</span>
          </span>
        </div>
      </header>
    `;
  } else {
    inner += `
      <header style="text-align: center; margin-bottom: 18px;">
        ${avatarHtml}
        <h1 class="profile-name">${escapeHtml(name)}</h1>
        ${role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : ""}
        ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ""}
        ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ""}
      </header>
    `;
  }

  // 2. Industry Specials Optional Modules
  if (design.id === "skyline") {
    const stats = industryData.stats || (industryData.homesSold ? [
      { num: industryData.homesSold, label: "Homes sold" },
      { num: industryData.dealsClosed, label: "Deals closed" },
      { num: industryData.experience, label: "Experience" }
    ] : null);

    if (stats && Array.isArray(stats) && stats.length > 0) {
      inner += `<div class="stats-row">`;
      stats.slice(0, 3).forEach((s: any) => {
        inner += `<div><div class="stat-num">${escapeHtml(s.num || s.value || "")}</div><div class="stat-label">${escapeHtml(s.label || "")}</div></div>`;
      });
      inner += `</div>`;
    }

    const listings = Array.isArray(industryData.listings) ? industryData.listings : [];
    if (listings.length > 0) {
      inner += `<h2 class="section-title">Featured Listings</h2>`;
      listings.forEach((item: any) => {
        inner += `
          <div class="listing-card" style="padding: 12px 14px;">
            ${item.tag ? `<span class="listing-tag">${escapeHtml(item.tag)}</span>` : ""}
            <div style="font-size: 15px; font-weight: 700; color: #38bdf8; margin-bottom: 2px;">${escapeHtml(item.price || "")}</div>
            <div style="font-size: 13px; font-weight: 600;">${escapeHtml(item.title || item.type || "")}</div>
            <div style="font-size: 11.5px; opacity: 0.7;">${escapeHtml(item.location || "")}</div>
          </div>
        `;
      });
    }

    inner += `
      <button type="button" class="cta-btn cta-btn-primary cta-btn-full" id="btnIndustryCta">
        ${getLinkIconSvg("calendar", 16)}
        <span>Book a site visit</span>
      </button>
    `;
  }

  if (design.id === "atelier") {
    const services = Array.isArray(industryData.services) ? industryData.services : [];
    if (services.length > 0) {
      inner += `<div class="fashion-services">`;
      services.forEach((s: any) => {
        inner += `
          <div class="fashion-service-row">
            <span style="font-weight: 600;">${escapeHtml(s.name || s.title || "")}</span>
            <span style="opacity: 0.7;">${escapeHtml(s.subtitle || s.price || "")}</span>
          </div>
        `;
      });
      inner += `</div>`;
    }

    inner += `
      <button type="button" class="cta-btn cta-btn-primary cta-btn-full" id="btnIndustryCta">
        <span>Book a fitting</span>
      </button>
    `;
  }

  if (design.id === "care-plus") {
    if (industryData.nextSlot) {
      inner += `
        <div class="slot-card">
          ${getLinkIconSvg("calendar", 22)}
          <div>
            <div class="slot-title">Next Available</div>
            <div class="slot-val">${escapeHtml(industryData.nextSlot)}</div>
          </div>
        </div>
      `;
    }

    const treatments = Array.isArray(industryData.treatments) ? industryData.treatments : [];
    if (treatments.length > 0) {
      inner += `<h2 class="section-title">Specialties</h2><div class="tags-cloud">`;
      treatments.forEach((t: string) => {
        inner += `<span class="tag-chip">${escapeHtml(t)}</span>`;
      });
      inner += `</div>`;
    }

    if (industryData.timings) {
      inner += `
        <div class="timings-card">
          <div style="font-weight: 700; margin-bottom: 6px;">Clinic Timings</div>
          <div>${escapeHtml(industryData.timings)}</div>
        </div>
      `;
    }

    inner += `
      <button type="button" class="cta-btn cta-btn-primary cta-btn-full" id="btnIndustryCta">
        ${getLinkIconSvg("calendar", 16)}
        <span>Book appointment</span>
      </button>
    `;
  }

  if (design.id === "roast-and-co") {
    inner += `
      <div class="cafe-badges">
        <span class="cafe-badge">• Open · till 10pm</span>
        <span class="cafe-badge">★ 4.7</span>
        <span class="cafe-badge">Free Wi-Fi</span>
      </div>
    `;

    const menu = Array.isArray(industryData.menu) ? industryData.menu : [];
    if (menu.length > 0) {
      inner += `<div class="menu-card"><h2 class="section-title" style="margin-bottom: 8px;">Menu</h2>`;
      menu.forEach((item: any) => {
        inner += `
          <div class="menu-item">
            <div>
              <span style="font-weight: 600;">${escapeHtml(item.name || "")}</span>
              ${item.popular ? `<span style="font-size: 10px; background: #d4a373; color: #1b140e; padding: 2px 6px; border-radius: 999px; font-weight: 700; margin-left: 6px;">Popular</span>` : ""}
            </div>
            <span style="font-weight: 700;">${escapeHtml(item.price || "")}</span>
          </div>
        `;
      });
      inner += `</div>`;
    }

    if (industryData.loyalty) {
      inner += `
        <div class="loyalty-box">
          <div style="font-size: 12px; font-weight: 700; color: #d4a373; text-transform: uppercase;">Loyalty Card</div>
          <div style="font-size: 13.5px; font-weight: 600; margin-top: 4px;">${escapeHtml(industryData.loyalty)}</div>
        </div>
      `;
    }
  }

  // 3. CTA Action Buttons
  if (design.category === "business") {
    const waDest = whatsapp ? `https://wa.me/${cleanDigits(whatsapp)}` : "";
    const phoneDest = phone ? `tel:${cleanPhone(phone)}` : "";
    const mapsDest = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : "";

    inner += `
      <div class="cta-actions-trio">
        ${phoneDest ? `
          <a href="${phoneDest}" class="cta-btn cta-btn-primary" aria-label="Call business">
            ${getLinkIconSvg("phone", 15)}
            <span>Call</span>
          </a>` : `
          <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn" aria-label="Save contact">
            ${getLinkIconSvg("contact", 15)}
            <span>Save</span>
          </button>`
        }
        ${waDest ? `
          <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Chat on WhatsApp">
            ${getLinkIconSvg("whatsapp", 15)}
            <span>WhatsApp</span>
          </a>` : `
          <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" aria-label="Share card">
            ${getLinkIconSvg("share", 15)}
            <span>Share</span>
          </button>`
        }
        ${mapsDest ? `
          <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Get directions">
            ${getLinkIconSvg("directions", 15)}
            <span>Directions</span>
          </a>` : `
          <button type="button" class="cta-btn cta-btn-secondary" id="showQrBtn" aria-label="Show QR code">
            ${getLinkIconSvg("qr", 15)}
            <span>QR Code</span>
          </button>`
        }
      </div>
    `;
  } else {
    inner += `
      <div class="cta-actions-row">
        <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn" aria-label="Save contact to phone">
          ${getLinkIconSvg("contact", 16)}
          <span>${escapeHtml(design.ctaStyle.primaryText || "Save Contact")}</span>
        </button>
        ${whatsapp ? `
          <a href="https://wa.me/${cleanDigits(whatsapp)}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Chat on WhatsApp">
            ${getLinkIconSvg("whatsapp", 16)}
            <span>WhatsApp</span>
          </a>` : `
          <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" aria-label="Share card">
            ${getLinkIconSvg("share", 16)}
            <span>Share</span>
          </button>`
        }
      </div>
    `;
  }

  // 4. Bento Grid (Design 10 only)
  if (design.id === "bento-grid") {
    inner += `
      <div class="bento-tile-row">
        ${phone ? `
          <a href="tel:${cleanPhone(phone)}" class="bento-tile bento-tile-coral">
            <span class="bento-tile-title">Call us</span>
            <span class="bento-tile-main">${escapeHtml(phone)}</span>
          </a>` : ""}
        ${whatsapp ? `
          <a href="https://wa.me/${cleanDigits(whatsapp)}" target="_blank" rel="noopener noreferrer" class="bento-tile bento-tile-sun">
            <span class="bento-tile-title">WhatsApp</span>
            <span class="bento-tile-main">Instant Reply</span>
          </a>` : ""}
      </div>
    `;
  }

  // 5. Contact List
  if (contactLinks.length > 0) {
    inner += `<h2 class="section-title">Get in touch</h2><div class="contact-list">`;
    contactLinks.forEach(link => {
      const dest = formatLinkDestination(link.type, link.value);
      if (!dest) return;
      const isExternal = link.type !== "phone" && link.type !== "email";
      const displayVal = getDisplayValue(link.type, link.value, link.label);

      inner += `
        <a href="${dest}" class="contact-row" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""} aria-label="${escapeHtml(link.label)}">
          <div class="contact-row-left">
            <div class="contact-row-icon" aria-hidden="true">
              ${getLinkIconSvg(link.type, 18)}
            </div>
            <div class="contact-meta">
              <span class="contact-sub">${escapeHtml(link.label)}</span>
              <span class="contact-main">${escapeHtml(displayVal)}</span>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity: 0.5;">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      `;
    });
    inner += `</div>`;
  }

  // 6. Social Grid
  if (socialLinks.length > 0) {
    inner += `<h2 class="section-title">Connect</h2><div class="social-grid">`;
    socialLinks.forEach(link => {
      const dest = formatLinkDestination(link.type, link.value);
      if (!dest) return;
      inner += `
        <a href="${dest}" target="_blank" rel="noopener noreferrer" class="social-item" aria-label="${escapeHtml(link.label)}">
          ${getLinkIconSvg(link.type, 20)}
          <span>${escapeHtml(link.label)}</span>
        </a>
      `;
    });
    inner += `</div>`;
  }

  // 7. Secondary Actions (Show QR / Share)
  inner += `
    <div style="display: flex; justify-content: center; gap: 12px; margin-top: 10px;">
      <button type="button" class="cta-btn cta-btn-secondary" id="showQrBtn" style="min-width: 130px; font-size: 12px;" aria-label="Show scannable QR Code">
        ${getLinkIconSvg("qr", 15)}
        <span>Show QR</span>
      </button>
      <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" style="min-width: 130px; font-size: 12px;" aria-label="Share digital card">
        ${getLinkIconSvg("share", 15)}
        <span>Share Card</span>
      </button>
    </div>
  `;

  // 8. Footer
  inner += `
    <footer class="card-footer">
      <a href="https://www.ambrosstudio.space" target="_blank" rel="noopener noreferrer">
        Ambros Studio &bull; Digital Identity
      </a>
    </footer>
  `;

  const metaTitle = `${name} — ${role ? role + ' | ' : ''}${company || 'Ambros Studio'}`;
  const metaDesc = bio || `Digital business card for ${name}.`;

  const appearance = custom.appearance || {};
  const primaryColor = appearance.primaryColor || design.theme.primaryColor;
  const bgColor = appearance.backgroundColor || design.theme.backgroundColor;
  const textColor = appearance.textColor || design.theme.textColor;
  const fontFamily = appearance.fontFamily || design.theme.fontFamily;

  const fontQuery = design.theme.fontUrl ? `<link rel="stylesheet" href="${design.theme.fontUrl}">` : "";

  return `<!DOCTYPE html>
<html lang="en" class="theme-${design.id}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(metaTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <link rel="canonical" href="https://www.ambrosstudio.space/c/${encodeURIComponent(card.profileSlug)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontQuery}
  <link rel="stylesheet" href="/cards/card-themes.css">
  <style id="__THEME_OVERRIDES__">
    :root {
      ${primaryColor ? `--card-primary: ${primaryColor};` : ''}
      ${bgColor ? `--card-background: ${bgColor};` : ''}
      ${textColor ? `--card-text: ${textColor};` : ''}
      ${fontFamily ? `--card-font: '${fontFamily}', system-ui, sans-serif;` : ''}
    }
  </style>
  <script src="/cards/qrcode.js"></script>
  <script src="/cards/design-registry.js"></script>
  <script src="/cards/card-renderer.js"></script>
  <script id="__INITIAL_CARD_DATA__">
    window.__INITIAL_CARD__ = ${JSON.stringify(card)};
  </script>
</head>
<body class="theme-${design.id}">
  <main class="viewport-wrapper" id="cardViewport">
    ${options.isPreview ? `
      <div style="background: #0f172a; color: #f8fafc; font-size: 11.5px; font-weight: 700; text-align: center; padding: 8px 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #334155;">
        ADMIN PREVIEW &bull; ${escapeHtml(design.name)} (${card.is_active !== false ? '<span style="color: #34d399;">Active</span>' : '<span style="color: #fbbf24;">Inactive</span>'})
      </div>
    ` : ""}
    ${inner}
  </main>

  <!-- Reusable Shared QR Modal -->
  <div id="qrModalBackdrop" class="qr-modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true">
    <div class="qr-modal-card">
      <button type="button" id="qrModalCloseBtn" class="qr-modal-close-btn" aria-label="Close QR Modal">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <h3 id="qrModalTitle" style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${escapeHtml(name)}</h3>
      <p style="font-size: 12px; opacity: 0.7; margin-bottom: 12px;">Scan with phone camera to open profile</p>
      <div id="qrModalCanvasContainer" class="qr-canvas-wrap"></div>
      <div style="font-size: 11px; opacity: 0.6; word-break: break-all; margin-bottom: 16px;" id="qrModalUrlText"></div>
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
        <button type="button" class="cta-btn cta-btn-secondary" id="qrCopyLinkBtn" style="font-size: 12px; padding: 8px 12px;">
          <span>Copy Link</span>
        </button>
        <button type="button" class="cta-btn cta-btn-secondary" id="qrDownloadPngBtn" style="font-size: 12px; padding: 8px 12px;">
          <span>Download PNG</span>
        </button>
        <button type="button" class="cta-btn cta-btn-secondary" id="qrDownloadSvgBtn" style="font-size: 12px; padding: 8px 12px;">
          <span>Vector SVG</span>
        </button>
      </div>
    </div>
  </div>

  <div id="cardToast" class="card-toast">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span id="cardToastMessage"></span>
  </div>

  <script src="/cards/card-loader.js"></script>
</body>
</html>`;
}
