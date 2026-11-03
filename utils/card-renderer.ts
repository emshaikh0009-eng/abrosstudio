/**
 * Ambros Studio — Universal Server-Side Card HTML Renderer
 * 
 * Renders all 16 canonical designs from ONE authoritative customer payload:
 *   - Personal (6): Mint Haven, Evergreen, Noir Gold, Emerald Ivory, Neon Pulse, Mono Studio
 *   - Business (6): Classic Navy, Fresh Mint, Bold Pop, Bento Grid, Glass Aurora, Luxe Foil
 *   - Industry Specials (4): Skyline, Atelier, Care Plus, Roast & Co.
 * 
 * High performance 0ms initial server paint. Zero cross-customer leaks.
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

function cleanDisplayUrl(val?: string | null): string {
  if (!val) return "";
  return String(val).trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
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
    case "github":
    case "custom":
    default: {
      let target = val.trim();
      if (!/^https?:\/\//i.test(target)) {
        if (type === "instagram") {
          if (/^instagram\.com/i.test(target)) target = `https://${target}`;
          else target = `https://www.instagram.com/${target.replace(/^@/, "").replace(/^\/+/, "")}`;
        } else if (type === "facebook") {
          if (/^(?:facebook|fb)\.com/i.test(target)) target = `https://${target}`;
          else target = `https://www.facebook.com/${target.replace(/^@/, "").replace(/^\/+/, "")}`;
        } else if (type === "linkedin") {
          if (/^linkedin\.com/i.test(target)) target = `https://${target}`;
          else if (/^(?:in|company|school)\//i.test(target)) target = `https://www.linkedin.com/${target}`;
          else target = `https://www.linkedin.com/in/${target.replace(/^@/, "").replace(/^\/+/, "")}`;
        } else if (type === "twitter" || type === "x") {
          if (/^(?:twitter|x)\.com/i.test(target)) target = `https://${target}`;
          else target = `https://x.com/${target.replace(/^@/, "").replace(/^\/+/, "")}`;
        } else if (type === "youtube") {
          if (/^(?:youtube\.com|youtu\.be)/i.test(target)) target = `https://${target}`;
          else if (target.startsWith("@")) target = `https://www.youtube.com/${target}`;
          else target = `https://${target}`;
        } else if (type === "telegram") {
          if (/^(?:t\.me|telegram\.me)/i.test(target)) target = `https://${target}`;
          else target = `https://t.me/${target.replace(/^@/, "").replace(/^\/+/, "")}`;
        } else {
          target = `https://${target}`;
        }
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

export function normalizeDestinationKey(type: string, url: string): string {
  if (!url) return "";
  let clean = url.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//i, "").replace(/^mailto:/i, "").replace(/^tel:/i, "");
  clean = clean.replace(/^www\./i, "");
  clean = clean.replace(/\/+$/, "");
  return `${type}:${clean}`;
}

function getDefaultLabel(type: string): string {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp",
    phone: "Call Directly",
    email: "Email",
    website: "Website",
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    twitter: "X / Twitter",
    telegram: "Telegram",
    github: "GitHub",
    maps: "Directions / Office",
    custom: "Link",
  };
  return map[type] || "Link";
}

function getDisplayValue(type: string, rawVal?: string | null, label?: string | null): string {
  if (!rawVal) return label || "";
  const val = rawVal.trim();
  if (type === "phone" || type === "whatsapp") return val;
  if (type === "email") return val.replace(/^mailto:/i, "");
  if (type === "website" || type === "custom") return val.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  if (type === "instagram") {
    const match = val.match(/instagram\.com\/([^/?#]+)/i);
    return match ? `@${match[1]}` : (val.startsWith("@") ? val : `@${val}`);
  }
  if (type === "facebook") {
    const match = val.match(/(?:facebook|fb)\.com\/([^/?#]+)/i);
    return match ? match[1] : val.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
  if (type === "twitter" || type === "x") {
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
  if (type === "github") {
    const match = val.match(/github\.com\/([^/?#]+)/i);
    return match ? match[1] : val.replace(/^https?:\/\//i, "").replace(/\/$/, "");
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
    case "x":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`;
    case "telegram":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    case "github":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
    case "maps":
    case "directions":
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
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

const SOCIAL_TYPES = new Set([
  "website",
  "instagram",
  "facebook",
  "linkedin",
  "youtube",
  "twitter",
  "x",
  "telegram",
  "github",
  "tiktok",
  "threads",
  "pinterest",
]);

function hasText(val?: string | null): boolean {
  return typeof val === "string" && val.trim().length > 0;
}

export interface ResolvedCustomerLink {
  type: string;
  label: string;
  value: string;
  order: number;
  isCustom?: boolean;
}

/**
 * Universally resolves customer links by aggregating dedicated fields (Phone, WhatsApp,
 * Email, Website, Instagram, LinkedIn, Directions) and custom_settings.links (including
 * Facebook and custom links), safely deduplicating identical destination URLs while
 * strictly preserving genuinely distinct custom links.
 */
export function resolveCustomerLinks(card: ResolvedCustomerCard): ResolvedCustomerLink[] {
  const result: ResolvedCustomerLink[] = [];
  const seenKeys = new Set<string>();

  const addLinkIfValid = (type: string, label: string, rawVal?: string | null, order?: number, isCustom = false) => {
    if (!hasText(rawVal)) return;
    const val = rawVal!.trim();
    const dest = formatLinkDestination(type, val);
    if (!dest) return;
    const key = normalizeDestinationKey(type, dest);
    if (key && seenKeys.has(key)) return;
    if (key) seenKeys.add(key);

    result.push({
      type: type.toLowerCase(),
      label: hasText(label) ? label.trim() : getDefaultLabel(type),
      value: val,
      order: typeof order === "number" ? order : result.length,
      isCustom,
    });
  };

  // 1. Dedicated core contact & social fields (authoritative priority)
  const phoneVal = card.phone || (card as any).mobile_number;
  if (hasText(phoneVal)) {
    addLinkIfValid("phone", "Phone", phoneVal, 0);
  }

  const waVal = card.whatsapp || (card as any).whatsapp_number;
  if (hasText(waVal)) {
    addLinkIfValid("whatsapp", "WhatsApp", waVal, 1);
  }

  if (hasText(card.email)) {
    addLinkIfValid("email", "Email", card.email, 2);
  }

  if (hasText(card.website)) {
    addLinkIfValid("website", "Website", card.website, 3);
  }

  const igVal = card.socialInstagram || (card as any).instagram_url;
  if (hasText(igVal)) {
    addLinkIfValid("instagram", "Instagram", igVal, 4);
  }

  const liVal = card.socialLinkedIn || (card as any).linkedin_url;
  if (hasText(liVal)) {
    addLinkIfValid("linkedin", "LinkedIn", liVal, 5);
  }

  const addrVal = card.address || (card as any).business_address;
  if (hasText(addrVal)) {
    addLinkIfValid("maps", "Directions", addrVal, 6);
  }

  // 2. Custom links from customSettings.links
  // In Ambros Studio, Facebook is saved in custom_settings.links (id: 'link_facebook', type: 'facebook').
  // Any additional links configured in the admin panel are also in custom_settings.links.
  const custom = card.customSettings || (card as any).custom_settings;
  if (custom && Array.isArray(custom.links)) {
    custom.links.forEach((l: any, idx: number) => {
      if (!l || l.enabled === false || !hasText(l.value)) return;
      const type = (l.type || "custom").toLowerCase();
      const defaultOrder = 10 + idx;
      const order = typeof l.order === "number" ? l.order : defaultOrder;
      const label = hasText(l.label) ? l.label : getDefaultLabel(type);
      addLinkIfValid(type, label, l.value, order, true);
    });
  }

  return result.sort((a, b) => a.order - b.order);
}

function renderRaftconLuxuryBody(card: ResolvedCustomerCard): string {
  const custom = card.customSettings || {};
  const ind = (custom.industry && custom.industry.data && typeof custom.industry.data === "object") ? custom.industry.data : {};
  
  const name = hasText(card.fullName) ? card.fullName!.trim() : "";
  const phone = hasText(card.phone) ? card.phone!.trim() : "";
  const whatsapp = hasText(card.whatsapp) ? card.whatsapp!.trim() : "";
  const email = hasText(card.email) ? card.email!.trim() : "";
  const bio = hasText(card.description) ? card.description!.trim() : "";

  // Contacts
  let contacts: any[] = [];
  if (Array.isArray(ind.contacts) && ind.contacts.length > 0) {
    contacts = ind.contacts.filter((c: any) => c && (hasText(c.name) || hasText(c.phone) || hasText(c.phone_display)));
  } else if (name || phone) {
    contacts = [{
      name: name || "Contact",
      phone: phone,
      rawPhone: phone ? cleanPhone(phone) : ""
    }];
  }

  const metrics = Array.isArray(ind.metrics) ? ind.metrics.filter((m: any) => m && hasText(m.value)) : [];
  const heroMetric = (ind.heroMetric && hasText(ind.heroMetric.value)) ? ind.heroMetric : null;
  const services = Array.isArray(ind.services) ? ind.services.filter(hasText) : [];
  const servicesSummary = hasText(ind.servicesSummary) ? ind.servicesSummary.trim() : "";
  const projects = Array.isArray(ind.projects) ? ind.projects.filter((p: any) => p && hasText(p.name)) : [];
  const safetyText = hasText(ind.safety) ? ind.safety.trim() : "";
  const missionText = hasText(ind.mission) ? ind.mission.trim() : "";
  const footerQuote = hasText(ind.footerQuote) ? ind.footerQuote.trim() : "";
  const brochureUrl = hasText(ind.brochureUrl) ? ind.brochureUrl.trim() : "";
  const officePhone = hasText(ind.officePhone) ? ind.officePhone.trim() : phone;
  const rawOfficePhone = officePhone ? cleanPhone(officePhone) : "";
  const waDest = whatsapp ? cleanDigits(whatsapp) : "";

  let html = `
    <!-- Raftcon Approved Brand Header -->
    <header class="raftcon-header raftcon-reveal">
      <img src="${escapeHtml(card.avatarUrl || '/assets/brochures/raftcon-brand-logo.png')}" alt="${escapeHtml(name || 'Raftcon Construction')}" class="raftcon-brand-logo-img" />
    </header>
  `;

  // Contact Section (Only render if there are contacts or actions)
  if (contacts.length > 0 || waDest || email || rawOfficePhone) {
    html += `
      <div class="raftcon-reveal">
        <div class="raftcon-section-eyebrow">C O N T A C T</div>
        <div class="raftcon-contact-list">
    `;

    contacts.forEach((c: any) => {
      const displayPhone = c.phone || c.phone_display || "";
      const rawNum = c.rawPhone || cleanPhone(displayPhone);
      html += `
          <div class="raftcon-contact-card">
            <div class="raftcon-contact-meta">
              <span class="raftcon-contact-name">${escapeHtml(c.name || "")}</span>
              ${displayPhone ? `<span class="raftcon-contact-phone">${escapeHtml(displayPhone)}</span>` : ""}
            </div>
            ${rawNum ? `
              <a href="tel:${rawNum}" class="raftcon-call-circle" aria-label="Call ${escapeHtml(c.name)}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f1e1c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </a>
            ` : ""}
          </div>
      `;
    });

    html += `</div>`;

    // Action buttons duo: WhatsApp + Email
    if (waDest || email) {
      html += `<div class="raftcon-actions-duo">`;
      if (waDest) {
        html += `
          <a href="https://wa.me/${waDest}" target="_blank" rel="noopener noreferrer" class="raftcon-action-btn" aria-label="WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>WhatsApp</span>
          </a>
        `;
      }
      if (email) {
        html += `
          <a href="mailto:${escapeHtml(email)}" class="raftcon-action-btn" aria-label="Email">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Email</span>
          </a>
        `;
      }
      html += `</div>`;
    }

    // Call office button
    if (rawOfficePhone && contacts.length > 1) {
      html += `
        <a href="tel:${rawOfficePhone}" class="raftcon-action-btn raftcon-action-full" aria-label="Call office">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>Call office</span>
        </a>
      `;
    }

    // Primary CTAs: Save Contact + (Optional View Brochure)
    html += `
      <button type="button" class="raftcon-btn-primary" id="saveContactBtn" aria-label="Save Contact">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        <span>Save Contact</span>
      </button>
    `;

    if (brochureUrl) {
      html += `
        <a href="${escapeHtml(brochureUrl)}" class="raftcon-btn-outline" aria-label="View Brochure">
          <span>View Brochure</span>
        </a>
      `;
    }

    html += `</div>`;
  }

  // About Raftcon Section (Only render if bio exists)
  if (bio) {
    const aboutTitle = name ? name.replace(/\s*(?:Construction|Developer|Pvt|Ltd).*$/i, "") || name : "Company";
    html += `
      <div class="raftcon-reveal">
        <h2 class="raftcon-section-title">About ${escapeHtml(aboutTitle)}</h2>
        <p class="raftcon-about-p">${escapeHtml(bio)}</p>
      </div>
    `;
  }

  // Metrics Section (Only render if metrics exist)
  if (metrics.length > 0 || heroMetric) {
    html += `<div class="raftcon-reveal">`;
    if (metrics.length > 0) {
      html += `<div class="raftcon-metrics-grid">`;
      metrics.forEach((m: any) => {
        html += `
          <div class="raftcon-metric-card">
            <div class="raftcon-metric-num">${escapeHtml(m.value)}</div>
            <div class="raftcon-metric-label">${escapeHtml(m.label || "")}</div>
          </div>
        `;
      });
      html += `</div>`;
    }
    if (heroMetric) {
      html += `
        <div class="raftcon-hero-metric-card">
          <div class="raftcon-hero-metric-num">${escapeHtml(heroMetric.value)}</div>
          <div class="raftcon-hero-metric-label">${escapeHtml(heroMetric.label || "")}</div>
        </div>
      `;
    }
    html += `</div>`;
  }

  // Services Section (Only render if services exist)
  if (services.length > 0) {
    html += `
      <div class="raftcon-reveal">
        <div class="raftcon-section-eyebrow">S E R V I C E S</div>
        <div class="raftcon-services-cloud">
    `;
    services.forEach((s: string) => {
      html += `<span class="raftcon-service-chip">${escapeHtml(s)}</span>`;
    });
    html += `</div>`;
    if (servicesSummary) {
      html += `<p class="raftcon-services-footer-desc">${escapeHtml(servicesSummary)}</p>`;
    }
    html += `</div>`;
  }

  // Projects Section (Only render if projects exist)
  if (projects.length > 0) {
    html += `
      <div class="raftcon-reveal">
        <h2 class="raftcon-section-title">Projects</h2>
        <div class="raftcon-projects-list">
    `;
    projects.forEach((p: any) => {
      html += `
        <div class="raftcon-project-item">
          <div class="raftcon-project-icon" aria-hidden="true">
            <svg width="22" height="26" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 10 112 L 10 8 L 52 22 L 52 36" stroke="#ffe0b5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 30 112 L 30 36 L 70 36 C 88 36, 88 84, 70 84 L 46 84 M 58 84 L 84 112" stroke="#ffe0b5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="raftcon-project-info">
            <div class="raftcon-project-name">${escapeHtml(p.name)}</div>
            ${p.meta ? `<div class="raftcon-project-meta">${escapeHtml(p.meta)}</div>` : ""}
          </div>
        </div>
      `;
    });
    html += `</div></div>`;
  }

  // Safety First (Only if safetyText)
  if (safetyText) {
    html += `
      <div class="raftcon-info-box raftcon-reveal">
        <div class="raftcon-info-title">Safety First</div>
        <p class="raftcon-info-text">${escapeHtml(safetyText)}</p>
      </div>
    `;
  }

  // Mission (Only if missionText)
  if (missionText) {
    html += `
      <div class="raftcon-info-box raftcon-reveal">
        <div class="raftcon-info-title">Our Mission</div>
        <p class="raftcon-info-text">${escapeHtml(missionText)}</p>
      </div>
    `;
  }

  // Bottom CTA & Footer
  html += `<div class="raftcon-reveal">`;
  if (brochureUrl) {
    html += `
      <a href="${escapeHtml(brochureUrl)}" class="raftcon-btn-primary" style="margin-top: 14px; text-decoration: none;" aria-label="View Brochure">
        <span>View Brochure</span>
      </a>
    `;
  }
  if (footerQuote) {
    html += `<div class="raftcon-bottom-quote">${escapeHtml(footerQuote)}</div>`;
  }

  // Raftcon Digital Presence & Social Links
  const allRaftconLinks = resolveCustomerLinks(card);
  const raftconSocialLinks = allRaftconLinks.filter((l) => SOCIAL_TYPES.has(l.type) || l.isCustom);
  if (raftconSocialLinks.length > 0) {
    html += `
      <div class="raftcon-reveal" style="margin-top: 20px; text-align: center;">
        <div class="raftcon-section-eyebrow" style="margin-bottom: 12px;">C O N N E C T</div>
        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          ${raftconSocialLinks.map((l) => {
            const dest = formatLinkDestination(l.type, l.value);
            if (!dest) return "";
            return `<a href="${dest}" target="_blank" rel="noopener noreferrer" style="width: 44px; height: 44px; border-radius: 50%; background: #262523; border: 1px solid rgba(255, 224, 181, 0.25); display: inline-flex; align-items: center; justify-content: center; color: #ffe0b5; text-decoration: none; transition: transform 0.2s;" aria-label="${escapeHtml(l.label)}">${getLinkIconSvg(l.type, 18)}</a>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  html += `
      <div style="display: flex; justify-content: center; gap: 10px; margin-top: 24px;">
        <button type="button" class="cta-btn cta-btn-secondary" id="showQrBtn" style="min-width: 130px; font-size: 12.5px; background: #18191e; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1);" aria-label="Show QR Code">
          ${getLinkIconSvg("qr", 15)}
          <span>Show QR</span>
        </button>
        <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" style="min-width: 130px; font-size: 12.5px; background: #18191e; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1);" aria-label="Share profile">
          ${getLinkIconSvg("share", 15)}
          <span>Share Profile</span>
        </button>
      </div>

      <footer class="card-footer" style="margin-top: 24px;">
        <a href="https://ambrosstudio.com" target="_blank" rel="noopener noreferrer">
          Ambros Studio &bull; Digital Identity
        </a>
      </footer>
    </div>
  `;

  return html;
}

function renderAtgStudyAbroadBody(card: ResolvedCustomerCard): string {
  const custom = card.customSettings || {};
  const ind = (custom.industry && custom.industry.data && typeof custom.industry.data === "object") ? custom.industry.data : {};
  const visibility = ind.sectionVisibility || {};

  const isAtgDemo = card.profileSlug === "atgstudyabroad" || card.profileSlug === "aamirshaikh";
  const name = hasText(card.fullName) ? card.fullName!.trim() : (isAtgDemo ? "Aamir Shaikh" : "");
  const role = hasText(card.designation) ? card.designation!.trim() : (isAtgDemo ? "Founder, ATG Study Abroad" : "");
  const tagline = hasText(ind.tagline) ? ind.tagline.trim() : (isAtgDemo ? "On a mission, with a vision" : "");
  const bio = hasText(ind.aboutText) ? ind.aboutText.trim() : (hasText(card.description) ? card.description!.trim() : (isAtgDemo ? "Across The Globe helps students study abroad with admissions and visa support for the UK, Australia, Dubai, Canada and Europe. More than 4,000 students have been guided by the team, from choosing a course to landing the visa." : ""));
  const phone = hasText(card.phone) ? card.phone!.trim() : (isAtgDemo ? "+91 98989 79548" : "");
  const whatsapp = hasText(card.whatsapp) ? card.whatsapp!.trim() : (isAtgDemo ? "919898979548" : "");
  const email = hasText(card.email) ? card.email!.trim() : (isAtgDemo ? "info@atgstudyabroad.com" : "");
  const instagram = hasText(card.socialInstagram) ? card.socialInstagram!.trim() : (isAtgDemo ? "@atgstudyabroad" : "");
  const avatarUrl = hasText(card.avatarUrl) ? card.avatarUrl!.trim() : "";

  const phoneDest = phone ? `tel:${cleanPhone(phone)}` : "";
  const waDigits = whatsapp ? cleanDigits(whatsapp) : (isAtgDemo ? "919898979548" : "");
  const waDest = waDigits ? `https://wa.me/${waDigits}` : "";
  const emailDest = email ? `mailto:${email}` : "";
  const instaDest = instagram ? (instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`) : "";

  // Metrics
  const defaultMetrics = [
    { value: "4,000+", label: "Students guided" },
    { value: "5+", label: "Study destinations" },
    { value: "5+", label: "Test prep courses" }
  ];
  const metrics = (Array.isArray(ind.metrics) && ind.metrics.length > 0) ? ind.metrics : defaultMetrics;

  // CTAs
  const ctaPrimaryText = ind.ctaPrimary?.text || (isAtgDemo ? "Find out which country suits you" : "");
  const ctaPrimaryUrl = ind.ctaPrimary?.url || (waDigits ? `https://wa.me/${waDigits}?text=Hi%2C%20I%20want%20to%20find%20out%20which%20country%20suits%20me%20for%20study%20abroad` : "");
  const ctaWhatsAppText = ind.ctaWhatsApp?.text || (isAtgDemo ? "Chat on WhatsApp for instant guidance" : "");
  const ctaWhatsAppUrl = ind.ctaWhatsApp?.url || waDest;

  // Destinations
  const defaultDestinations = isAtgDemo ? [
    { code: "CA", title: "Study in Canada", sub: "Courses, eligibility and intakes", url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20Canada` },
    { code: "UK", title: "Study in the UK", sub: "Top universities and scholarships", url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20the%20UK` },
    { code: "AU", title: "Study in Australia", sub: "Eligibility, courses and universities", url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20Australia` },
    { code: "EU", title: "Study in Europe", sub: "Low-tuition and English programs", url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20Europe` },
    { code: "AE", title: "Study in Dubai", sub: "Programs and admissions", url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20Dubai` }
  ] : [];
  const destinationsTitle = ind.destinationsTitle || "Popular study destinations";
  const destinations = (Array.isArray(ind.destinations) && ind.destinations.length > 0) ? ind.destinations : defaultDestinations;

  // Test Prep
  const testPrepTitle = ind.testPrepTitle || "Test preparation";
  const coachingHeading = ind.coachingHeading || "Book a coaching class for";
  const coachingCourses = (Array.isArray(ind.coachingCourses) && ind.coachingCourses.length > 0) ? ind.coachingCourses : (isAtgDemo ? ["IELTS", "PTE", "CELPIP", "TOEFL", "GRE"] : []);
  const coachingCtaText = ind.coachingCta?.text || (isAtgDemo ? "Book coaching class" : "");
  const coachingCtaUrl = ind.coachingCta?.url || (waDigits ? `https://wa.me/${waDigits}?text=I%20would%20like%20to%20book%20a%20test%20prep%20coaching%20class` : "");

  const defaultBatches = isAtgDemo ? [
    { title: "Basic English class", sub: "Join the next batch", url: `https://wa.me/${waDigits}?text=Inquiry%20for%20Basic%20English%20class` },
    { title: "Study + Work", sub: "Russia, Singapore, Mauritius, Canada", url: `https://wa.me/${waDigits}?text=Inquiry%20for%20Study%20and%20Work%20programs` }
  ] : [];
  const batches = (Array.isArray(ind.testPrepBatches) && ind.testPrepBatches.length > 0) ? ind.testPrepBatches : defaultBatches;

  // Free Guides
  const defaultGuides = isAtgDemo ? [
    { title: "7 things to get right before you apply abroad", sub: "Free guide", buttonText: "Download", url: `https://wa.me/${waDigits}?text=Please%20send%20me%20the%20Free%20Guide:%207%20things%20to%20get%20right%20before%20you%20apply%20abroad` },
    { title: "CELPIP Writing Masterbook", sub: "Task strategies", buttonText: "Download", url: `https://wa.me/${waDigits}?text=Please%20send%20me%20the%20CELPIP%20Writing%20Masterbook` }
  ] : [];
  const freeGuidesTitle = ind.freeGuidesTitle || "Free guides";
  const freeGuides = (Array.isArray(ind.freeGuides) && ind.freeGuides.length > 0) ? ind.freeGuides : defaultGuides;

  // About Section
  const aboutTitle = ind.aboutTitle || "About ATG Study Abroad";

  // Contact
  const contactTitle = ind.contactTitle || "Get in touch";

  let html = `
    <div class="atg-card-wrapper">
      <!-- Dark Top Banner with Flight Path Curve & Floating Logo -->
      <header class="atg-header">
        <div class="atg-banner-bg" aria-hidden="true">
          <svg class="atg-flight-svg" viewBox="0 0 380 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="190" cy="230" r="150" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
            <circle cx="190" cy="230" r="110" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
            <ellipse cx="190" cy="230" rx="60" ry="150" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
            <path d="M 30 160 C 95 85, 230 45, 335 32" stroke="#82be00" stroke-width="2" stroke-dasharray="4 4" fill="none" opacity="0.95" />
            <g transform="translate(332, 28) rotate(52)">
              <path d="M12 2L15 9L22 10.5L16.5 15.5L18 22L12 18.5L6 22L7.5 15.5L2 10.5L9 9L12 2Z" fill="#82be00" />
            </g>
          </svg>
        </div>

        <div class="atg-avatar-slot">
          <div class="atg-logo-circle">
            ${avatarUrl ? `
              <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name)}" class="atg-logo-img" />
            ` : `
              <div class="atg-emblem">
                <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 65 C 22 35, 52 18, 80 22 C 65 32, 42 46, 32 75 C 27 79, 20 77, 18 65 Z" fill="#82be00" opacity="0.9" />
                  <path d="M38 72 C 62 67, 78 44, 84 28" stroke="#82be00" stroke-width="3.5" stroke-linecap="round" fill="none" />
                  <g transform="translate(76, 14) rotate(45) scale(0.95)">
                    <path d="M10 2 L13 8 L19 9.5 L14.5 14 L16 20 L10 16.5 L4 20 L5.5 14 L1 9.5 L7 8 Z" fill="#82be00" />
                  </g>
                </svg>
                <div class="atg-emblem-text-top">ACROSS</div>
                <div class="atg-emblem-text-mid">THE GLOBE</div>
                <div class="atg-emblem-text-sub">On a mission, with a vision</div>
              </div>
            `}
          </div>
        </div>
      </header>

      <!-- Profile Identity -->
      <section class="atg-identity">
        <h1 class="atg-name">${escapeHtml(name)}</h1>
        ${role ? `<div class="atg-role">${escapeHtml(role)}</div>` : ""}
        ${tagline ? `<div class="atg-tagline">${escapeHtml(tagline)}</div>` : ""}
      </section>

      <!-- Key Metrics Bar -->
      ${visibility.stats !== false && metrics.length > 0 ? `
        <section class="atg-metrics-bar">
          ${metrics.map((m: any, idx: number) => `
            <div class="atg-metric-col ${idx < metrics.length - 1 ? 'has-divider' : ''}">
              <div class="atg-metric-val">${escapeHtml(m.value || "")}</div>
              <div class="atg-metric-lbl">${escapeHtml(m.label || "")}</div>
            </div>
          `).join("")}
        </section>
      ` : ""}

      <!-- Action Buttons -->
      <!-- Action Buttons -->
      <section class="atg-actions">
        ${ctaPrimaryText && ctaPrimaryUrl ? `
          <a href="${escapeHtml(ctaPrimaryUrl)}" target="_blank" rel="noopener noreferrer" class="atg-btn-lime">
            <span>${escapeHtml(ctaPrimaryText)}</span>
          </a>
        ` : ""}
        ${ctaWhatsAppText && ctaWhatsAppUrl ? `
          <a href="${escapeHtml(ctaWhatsAppUrl)}" target="_blank" rel="noopener noreferrer" class="atg-btn-black">
            <span>${escapeHtml(ctaWhatsAppText)}</span>
          </a>
        ` : ""}
        <div class="atg-btn-pair">
          ${phoneDest ? `
            <a href="${phoneDest}" class="atg-btn-white">
              <span>Call</span>
            </a>
          ` : ""}
          <button type="button" class="atg-btn-white" id="saveContactBtn">
            <span>Save contact</span>
          </button>
        </div>
      </section>

      <!-- Popular Study Destinations -->
      ${visibility.destinations !== false && destinations.length > 0 ? `
        <section class="atg-section">
          <div class="atg-accent-bar"></div>
          <h2 class="atg-section-heading">${escapeHtml(destinationsTitle)}</h2>
          <div class="atg-destinations-list">
            ${destinations.map((d: any) => {
              const dUrl = d.url || waDest || '#';
              return `
              <a href="${escapeHtml(dUrl)}" ${dUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="atg-dest-row">
                <div class="atg-dest-badge">${escapeHtml(d.code || "GL")}</div>
                <div class="atg-dest-info">
                  <div class="atg-dest-title">${escapeHtml(d.title || "")}</div>
                  <div class="atg-dest-sub">${escapeHtml(d.sub || "")}</div>
                </div>
                <span class="atg-chevron" aria-hidden="true">&rsaquo;</span>
              </a>
            `;
            }).join("")}
          </div>
        </section>
      ` : ""}

      <!-- Test Preparation -->
      ${visibility.testPrep !== false && (coachingCourses.length > 0 || batches.length > 0) ? `
        <section class="atg-section">
          <div class="atg-accent-bar"></div>
          <h2 class="atg-section-heading">${escapeHtml(testPrepTitle)}</h2>
          
          ${coachingCourses.length > 0 ? `
            <div class="atg-coaching-box">
              <div class="atg-coaching-lbl">${escapeHtml(coachingHeading)}</div>
              <div class="atg-course-tags">
                ${coachingCourses.map((c: string) => `
                  <span class="atg-course-tag">${escapeHtml(c)}</span>
                `).join("")}
              </div>
              ${coachingCtaText && coachingCtaUrl ? `
                <a href="${escapeHtml(coachingCtaUrl)}" target="_blank" rel="noopener noreferrer" class="atg-btn-lime" style="margin-top: 14px;">
                  <span>${escapeHtml(coachingCtaText)}</span>
                </a>
              ` : ""}
            </div>
          ` : ""}

          ${batches.length > 0 ? `
            <div class="atg-batches-list" style="margin-top: 10px;">
              ${batches.map((b: any) => {
                const bUrl = b.url || waDest || '#';
                return `
                <a href="${escapeHtml(bUrl)}" ${bUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="atg-batch-row">
                  <span class="atg-batch-title">${escapeHtml(b.title || "")}</span>
                  <span class="atg-batch-sub">${escapeHtml(b.sub || "")}</span>
                </a>
              `;
              }).join("")}
            </div>
          ` : ""}
        </section>
      ` : ""}

      <!-- Free Guides -->
      ${visibility.guides !== false && freeGuides.length > 0 ? `
        <section class="atg-section">
          <div class="atg-accent-bar"></div>
          <h2 class="atg-section-heading">${escapeHtml(freeGuidesTitle)}</h2>
          <div class="atg-guides-list">
            ${freeGuides.map((g: any) => {
              const gUrl = g.url || waDest || '#';
              return `
              <div class="atg-guide-card">
                <div class="atg-guide-left">
                  <div class="atg-doc-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#658210" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div class="atg-guide-title">${escapeHtml(g.title || "")}</div>
                    <div class="atg-guide-sub">${escapeHtml(g.sub || "Free guide")}</div>
                  </div>
                </div>
                <a href="${escapeHtml(gUrl)}" ${gUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="atg-guide-btn">
                  <span>${escapeHtml(g.buttonText || "Download")}</span>
                </a>
              </div>
            `;
            }).join("")}
          </div>
        </section>
      ` : ""}

      <!-- About ATG Study Abroad -->
      ${visibility.about !== false && bio ? `
        <section class="atg-section">
          <div class="atg-accent-bar"></div>
          <h2 class="atg-section-heading">${escapeHtml(aboutTitle)}</h2>
          <div class="atg-about-box">
            <p>${escapeHtml(bio)}</p>
          </div>
        </section>
      ` : ""}

      <!-- Get in touch -->
      ${visibility.contact !== false ? `
        <section class="atg-section">
          <div class="atg-accent-bar"></div>
          <h2 class="atg-section-heading">${escapeHtml(contactTitle)}</h2>
          <div class="atg-contact-rows">
            ${phone ? `
              <div class="atg-contact-row">
                <div class="atg-contact-left">
                  <div class="atg-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#658210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <div class="atg-contact-label">Call</div>
                    <div class="atg-contact-val">${escapeHtml(phone)}</div>
                  </div>
                </div>
                <a href="${phoneDest}" class="atg-contact-action">Call</a>
              </div>
            ` : ""}

            ${whatsapp ? `
              <div class="atg-contact-row">
                <div class="atg-contact-left">
                  <div class="atg-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#658210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <div>
                    <div class="atg-contact-label">WhatsApp</div>
                    <div class="atg-contact-val">Chat on WhatsApp</div>
                  </div>
                </div>
                <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="atg-contact-action">Chat</a>
              </div>
            ` : ""}

            ${email ? `
              <div class="atg-contact-row">
                <div class="atg-contact-left">
                  <div class="atg-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#658210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  </div>
                  <div>
                    <div class="atg-contact-label">Email</div>
                    <div class="atg-contact-val">${escapeHtml(email)}</div>
                  </div>
                </div>
                <a href="${emailDest}" class="atg-contact-action">Write</a>
              </div>
            ` : ""}

            ${instagram ? `
              <div class="atg-contact-row">
                <div class="atg-contact-left">
                  <div class="atg-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#658210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                  <div>
                    <div class="atg-contact-label">Instagram</div>
                    <div class="atg-contact-val">${escapeHtml(instagram)}</div>
                  </div>
                </div>
                <a href="${instaDest}" target="_blank" rel="noopener noreferrer" class="atg-contact-action">Follow</a>
              </div>
            ` : ""}
          </div>

          <!-- Social & Digital Presence Icon Row -->
          ${(() => {
            const allLinks = resolveCustomerLinks(card);
            const iconLinks = allLinks.filter(l => ["website", "instagram", "facebook", "linkedin", "whatsapp", "email", "youtube", "twitter", "x"].includes(l.type) || l.isCustom);
            if (iconLinks.length === 0) return "";
            return `
              <div class="atg-social-icon-row" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                ${iconLinks.map(l => {
                  const dest = formatLinkDestination(l.type, l.value);
                  if (!dest) return "";
                  const isExt = l.type !== "phone" && l.type !== "email";
                  return `<a href="${dest}" ${isExt ? 'target="_blank" rel="noopener noreferrer"' : ""} class="atg-social-square" aria-label="${escapeHtml(l.label)}">${getLinkIconSvg(l.type, 18)}</a>`;
                }).join("")}
              </div>
            `;
          })()}

          <!-- Bottom Action Pair: Share card + Share QR -->
          <div class="atg-bottom-actions">
            <button type="button" class="atg-btn-white" id="shareCardBtn">Share card</button>
            <button type="button" class="atg-btn-lime" id="showQrBtn">Share QR</button>
          </div>
        </section>
      ` : ""}

      <!-- Brand Watermark Footer -->
      <footer class="atg-footer">
        <a href="https://ambrosstudio.com" target="_blank" rel="noopener noreferrer">
          Ambros Studio &bull; Digital Identity
        </a>
      </footer>
    </div>
  `;

  return html;
}

function renderSpiceRouteBody(card: ResolvedCustomerCard): string {
  const custom = card.customSettings || {};
  const ind = (custom.industry && custom.industry.data && typeof custom.industry.data === "object") ? custom.industry.data : {};
  const visibility = ind.sectionVisibility || {};

  const isSpiceDemo = card.profileSlug === "spiceroute" || card.profileSlug === "spice-route";
  const overline = hasText(ind.overline) ? ind.overline.trim() : (isSpiceDemo ? "— Family restaurant —" : "");
  const restaurantName = hasText(ind.restaurantName) ? ind.restaurantName.trim() : (hasText(card.fullName) ? card.fullName!.trim() : (isSpiceDemo ? "Spice Route" : ""));
  const tagline = hasText(ind.tagline) ? ind.tagline.trim() : (hasText(card.description) ? card.description!.trim() : (isSpiceDemo ? "Slow-cooked Gujarati and North Indian food, made fresh every day." : ""));
  const phone = hasText(card.phone) ? card.phone!.trim() : (isSpiceDemo ? "+91 98765 43210" : "");
  const whatsapp = hasText(card.whatsapp) ? card.whatsapp!.trim() : (isSpiceDemo ? "919876543210" : "");
  const email = hasText(card.email) ? card.email!.trim() : (isSpiceDemo ? "hello@spiceroute.com" : "");
  const instagram = hasText(card.socialInstagram) ? card.socialInstagram!.trim() : (isSpiceDemo ? "@spiceroute" : "");

  const phoneDest = phone ? `tel:${cleanPhone(phone)}` : "";
  const waDigits = whatsapp ? cleanDigits(whatsapp) : (isSpiceDemo ? "919876543210" : "");
  const waDest = waDigits ? `https://wa.me/${waDigits}` : "";
  const emailDest = email ? `mailto:${email}` : "";
  const instaDest = instagram ? (instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`) : "";

  // Badges
  const badges = (Array.isArray(ind.badges) && ind.badges.length > 0) ? ind.badges : ["Open till 11 pm", "★ 4.5", "Family seating"];

  // Quick Action Buttons
  const defaultActions = isSpiceDemo ? [
    { label: "View menu", type: "menu", url: "#menu" },
    { label: "Book a table", type: "book", url: `https://wa.me/${waDigits}?text=I%20would%20like%20to%20book%20a%20table%20at%20Spice%20Route` },
    { label: "Order on WhatsApp", type: "whatsapp", url: `https://wa.me/${waDigits}?text=Hi%2C%20I%20want%20to%20place%20a%20food%20order` },
    { label: "Directions", type: "directions", url: `https://maps.google.com/?q=Spice+Route+Restaurant` }
  ] : [];
  const quickActions = (Array.isArray(ind.quickActions) && ind.quickActions.length > 0) ? ind.quickActions : defaultActions;

  // Chef's signatures
  const defaultMenu = isSpiceDemo ? [
    { name: "Paneer Lababdar", desc: "Creamy tomato gravy, house butter", price: "₹320", isVeg: true },
    { name: "Dal Tadka Special", desc: "Smoked and finished with ghee", price: "₹220", isVeg: true },
    { name: "Chicken Dum Biryani", desc: "Slow-cooked, served with raita", price: "₹360", isVeg: false },
    { name: "Kesar Phirni", desc: "Saffron, set in clay", price: "₹140", isVeg: true }
  ] : [];
  const menuTitle = ind.menuTitle || "Chef's signatures";
  const menuItems = (Array.isArray(ind.menuItems) && ind.menuItems.length > 0) ? ind.menuItems : defaultMenu;

  // Dining options
  const diningOptionsTitle = ind.diningOptionsTitle || "Dining options";
  const diningOptions = (Array.isArray(ind.diningOptions) && ind.diningOptions.length > 0) ? ind.diningOptions : ["Dine-in", "Takeaway", "Home delivery", "Family seating", "Private events", "Parking"];

  // Opening hours
  const hoursTitle = ind.hoursTitle || "Opening hours";
  const defaultHours = [
    { label: "Lunch", time: "12 pm to 3 pm" },
    { label: "Dinner", time: "7 pm to 11 pm" },
    { label: "Saturday and Sunday", time: "12 pm to 11:30 pm" }
  ];
  const hoursList = (Array.isArray(ind.hoursList) && ind.hoursList.length > 0) ? ind.hoursList : defaultHours;
  const hoursNotice = ind.hoursNotice || "Tables for six or more: please book a day ahead.";

  // Guest reviews
  const reviewsTitle = ind.reviewsTitle || "Guest reviews";
  const defaultReviews = [
    { quote: "Food tastes like home. The dal tadka is the best in the city.", author: "Guest Name" },
    { quote: "Warm service and delicious family dining experience.", author: "Guest Name" }
  ];
  const reviews = (Array.isArray(ind.reviews) && ind.reviews.length > 0) ? ind.reviews : defaultReviews;

  // Contact section
  const contactTitle = ind.contactTitle || "Get in touch";

  let html = `
    <div class="spice-card-wrapper">
      <!-- Dark Espresso Header with Terracotta Border -->
      <header class="spice-header">
        <div class="spice-overline">${escapeHtml(overline)}</div>
        <h1 class="spice-title">${escapeHtml(restaurantName)}</h1>
        <p class="spice-subtitle">${escapeHtml(tagline)}</p>

        <div class="spice-badges-row">
          ${badges.map((b: string) => {
            const isDot = b.includes("Open") || b.includes("●") || b.includes("•");
            const cleanBadge = b.replace(/^[•●]\s*/, "");
            return `
              <span class="spice-badge-pill">
                ${isDot ? `<span class="spice-badge-dot">●</span> ` : ""}${escapeHtml(cleanBadge)}
              </span>
            `;
          }).join("")}
        </div>
        <div class="spice-header-line"></div>
      </header>

      <!-- 2x2 Quick Actions Grid -->
      ${visibility.quickActions !== false && quickActions.length > 0 ? `
        <section class="spice-actions-grid">
          ${quickActions.map((act: any, idx: number) => {
            const isTerracotta = idx === 0;
            const isBlack = idx === 2;
            const btnClass = isTerracotta ? "spice-btn-terracotta" : (isBlack ? "spice-btn-black" : "spice-btn-white");
            return `
              <a href="${escapeHtml(act.url || '#')}" ${act.url && act.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="${btnClass}">
                <span>${escapeHtml(act.label || "")}</span>
              </a>
            `;
          }).join("")}
        </section>
      ` : ""}

      <!-- Chef's Signatures Menu -->
      ${visibility.menu !== false && menuItems.length > 0 ? `
        <section class="spice-section" id="menu">
          <h2 class="spice-section-heading">${escapeHtml(menuTitle)}</h2>
          <div class="spice-menu-box">
            ${menuItems.map((item: any, idx: number) => {
              const isVeg = item.isVeg !== false && item.veg !== false && !item.nonVeg;
              return `
                <div class="spice-menu-row ${idx < menuItems.length - 1 ? 'has-divider' : ''}">
                  <div class="spice-menu-left">
                    <span class="spice-diet-icon ${isVeg ? 'veg' : 'non-veg'}" title="${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
                      <span class="spice-diet-dot"></span>
                    </span>
                    <div class="spice-menu-text">
                      <div class="spice-menu-name">${escapeHtml(item.name || "")}</div>
                      ${item.desc ? `<div class="spice-menu-desc">${escapeHtml(item.desc)}</div>` : ""}
                    </div>
                  </div>
                  <div class="spice-menu-price">${escapeHtml(item.price || "")}</div>
                </div>
              `;
            }).join("")}
          </div>
        </section>
      ` : ""}

      <!-- Dining Options -->
      ${visibility.diningOptions !== false && diningOptions.length > 0 ? `
        <section class="spice-section">
          <h2 class="spice-section-heading">${escapeHtml(diningOptionsTitle)}</h2>
          <div class="spice-chips-row">
            ${diningOptions.map((opt: string) => `
              <span class="spice-option-chip">${escapeHtml(opt)}</span>
            `).join("")}
          </div>
        </section>
      ` : ""}

      <!-- Opening Hours -->
      ${visibility.hours !== false && hoursList.length > 0 ? `
        <section class="spice-section">
          <h2 class="spice-section-heading">${escapeHtml(hoursTitle)}</h2>
          <div class="spice-hours-box">
            ${hoursList.map((h: any, idx: number) => `
              <div class="spice-hours-row ${idx < hoursList.length - 1 ? 'has-divider' : ''}">
                <span class="spice-hours-lbl">${escapeHtml(h.label || "")}</span>
                <span class="spice-hours-val">${escapeHtml(h.time || "")}</span>
              </div>
            `).join("")}
          </div>
          ${hoursNotice ? `<p class="spice-hours-notice">${escapeHtml(hoursNotice)}</p>` : ""}
        </section>
      ` : ""}

      <!-- Guest Reviews -->
      ${visibility.reviews !== false && reviews.length > 0 ? `
        <section class="spice-section">
          <h2 class="spice-section-heading">${escapeHtml(reviewsTitle)}</h2>
          <div class="spice-reviews-scroll">
            ${reviews.map((r: any) => `
              <div class="spice-review-card">
                <blockquote class="spice-review-quote">&ldquo;${escapeHtml(r.quote || "")}&rdquo;</blockquote>
                <div class="spice-review-author">${escapeHtml(r.author || "Guest Name")}</div>
              </div>
            `).join("")}
          </div>
        </section>
      ` : ""}

      <!-- Get in touch -->
      ${visibility.contact !== false ? `
        <section class="spice-section">
          <h2 class="spice-section-heading">${escapeHtml(contactTitle)}</h2>
          <div class="spice-contact-box">
            ${phone ? `
              <div class="spice-contact-row">
                <div class="spice-contact-left">
                  <div class="spice-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#716558" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <div class="spice-contact-lbl">Call</div>
                    <div class="spice-contact-val">${escapeHtml(phone)}</div>
                  </div>
                </div>
                <a href="${phoneDest}" class="spice-contact-action">Call</a>
              </div>
            ` : ""}

            ${instagram ? `
              <div class="spice-contact-row">
                <div class="spice-contact-left">
                  <div class="spice-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#716558" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </div>
                  <div>
                    <div class="spice-contact-lbl">Instagram</div>
                    <div class="spice-contact-val">${escapeHtml(instagram)}</div>
                  </div>
                </div>
                <a href="${instaDest}" target="_blank" rel="noopener noreferrer" class="spice-contact-action">Follow</a>
              </div>
            ` : ""}

            ${email ? `
              <div class="spice-contact-row">
                <div class="spice-contact-left">
                  <div class="spice-contact-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#716558" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  </div>
                  <div>
                    <div class="spice-contact-lbl">Email</div>
                    <div class="spice-contact-val">${escapeHtml(email)}</div>
                  </div>
                </div>
                <a href="${emailDest}" class="spice-contact-action">Write</a>
              </div>
            ` : ""}
          </div>

          <!-- Save contact button -->
          <button type="button" class="spice-btn-save-contact" id="saveContactBtn">
            <span>Save contact</span>
          </button>

          <!-- Social & Digital Presence Icon Row -->
          ${(() => {
            const allLinks = resolveCustomerLinks(card);
            const iconLinks = allLinks.filter(l => ["website", "instagram", "facebook", "linkedin", "youtube", "twitter", "x"].includes(l.type) || l.isCustom);
            if (iconLinks.length === 0) return "";
            return `
              <div class="spice-social-icon-row" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                ${iconLinks.map(l => {
                  const dest = formatLinkDestination(l.type, l.value);
                  if (!dest) return "";
                  return `<a href="${dest}" target="_blank" rel="noopener noreferrer" class="spice-social-square" aria-label="${escapeHtml(l.label)}">${getLinkIconSvg(l.type, 18)}</a>`;
                }).join("")}
              </div>
            `;
          })()}

          <!-- Bottom Action Pair: Share card + Share QR -->
          <div class="spice-bottom-actions">
            <button type="button" class="spice-btn-white" id="shareCardBtn">Share card</button>
            <button type="button" class="spice-btn-terracotta" id="showQrBtn">Share QR</button>
          </div>
        </section>
      ` : ""}

      <!-- Brand Watermark Footer -->
      <footer class="spice-footer">
        <a href="https://ambrosstudio.com" target="_blank" rel="noopener noreferrer">
          Ambros Studio &bull; Digital Identity
        </a>
      </footer>
    </div>
  `;

  return html;
}

function renderInteriorLuxuryBody(card: ResolvedCustomerCard): string {
  const name = escapeHtml(card.fullName || (card as any).full_name || "Maison Aurelle");
  const designation = escapeHtml(card.designation || (card as any).role || "Luxury Interior Architects");
  const rawPhone = card.phone || (card as any).mobile_number || "";
  const phone = escapeHtml(rawPhone);
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const rawWa = card.whatsapp || (card as any).whatsapp_number || "";
  const wa = escapeHtml(rawWa ? rawWa.replace(/\D/g, "") : cleanPhone.replace(/^\+/, ""));
  const email = escapeHtml(card.email || "");
  const website = escapeHtml(card.website || "");
  const city = escapeHtml(card.address || (card as any).business_address || "Mumbai, India");
  const insta = escapeHtml(card.socialInstagram || (card as any).instagram_url || "");
  const heroImg = escapeHtml(card.avatarUrl || (card as any).avatar_url || (card as any).profile_image_url || "/assets/interior/hero.jpg");
  const initials = getInitials(card.fullName || (card as any).full_name || "Maison Aurelle");

  const appearance = (card.customSettings && card.customSettings.appearance) ? card.customSettings.appearance : {};
  const bg = appearance.backgroundColor || "#fbf9f5";
  const primary = appearance.primaryColor || "#c29a67";
  const text = appearance.textColor || "#1a1614";

  return `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
    
    :root {
      --int-bg: ${bg};
      --int-espresso: ${text};
      --int-brass: ${primary};
      --int-ivory: #faf7f2;
      --int-muted: #78716c;
      --int-border: rgba(26, 22, 20, 0.12);
    }
    
    html.theme-interior-luxury,
    body.theme-interior-luxury {
      background: #110e0c !important;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
      color: var(--int-espresso);
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      overflow-x: hidden !important;
    }
    .theme-interior-luxury .viewport-wrapper {
      padding: 0 !important;
      max-width: 440px !important;
      width: 100% !important;
      margin: 0 auto !important;
      background: transparent !important;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      min-width: 0 !important;
    }
    @media (min-width: 640px) {
      .theme-interior-luxury .viewport-wrapper {
        padding: 24px 0 !important;
      }
    }
    .int-shell {
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
      background: var(--int-bg);
      box-sizing: border-box;
      overflow-x: hidden;
      overflow-y: visible;
      min-height: 100vh;
      position: relative;
      min-width: 0;
    }
    @media (max-width: 480px) {
      .int-shell {
        box-shadow: none;
        border-radius: 0;
        width: 100%;
        max-width: 100%;
      }
    }
    @media (min-width: 640px) {
      .int-shell {
        margin: 24px auto;
        border-radius: 32px;
        box-shadow: 0 30px 80px rgba(0,0,0,0.4);
      }
    }
    .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
    
    /* 1. Hero Cover Keyframe Animations (Immediate on load) */
    @keyframes intHeroZoom {
      0% { opacity: 0.6; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes intHeroFadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes intHeroSlideUp {
      0% { opacity: 0; transform: translateY(24px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .int-hero {
      position: relative;
      height: 82vh;
      max-height: 720px;
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }
    .int-hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      animation: intHeroZoom 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      will-change: transform, opacity;
    }
    .int-hero-veil {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(26,22,20,0.3) 0%, rgba(26,22,20,0.1) 40%, rgba(26,22,20,0.92) 100%);
    }
    .int-hero-top {
      position: absolute;
      top: 0; left: 0; right: 0;
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--int-ivory);
      z-index: 2;
      box-sizing: border-box;
      animation: intHeroFadeIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
    }
    .int-hero-bottom {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 28px;
      color: var(--int-ivory);
      z-index: 2;
      box-sizing: border-box;
      animation: intHeroSlideUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
    }
    .int-hero-title {
      font-size: clamp(38px, 10.5vw, 52px);
      line-height: 0.95;
      margin: 8px 0 16px;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    
    /* 2. Scroll Reveal Base Classes (Trigger naturally on scroll) */
    .int-reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform;
    }
    .int-reveal.is-revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* Founder / Action Card */
    .int-profile-card {
      position: relative;
      margin-top: -24px;
      border-radius: 32px 32px 0 0;
      background: var(--int-bg);
      padding: 32px 24px 20px;
      z-index: 3;
      width: 100%;
      box-sizing: border-box;
    }

    /* 3. Statistics Grid & Staggered Reveal */
    .int-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border-top: 1px solid var(--int-border);
      border-bottom: 1px solid var(--int-border);
      padding: 18px 0;
      margin: 24px 0;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }
    .int-stat-item {
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      min-width: 0;
    }
    .is-revealed .int-stat-item:nth-child(1), .int-stat-item:nth-child(1).is-revealed { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
    .is-revealed .int-stat-item:nth-child(2), .int-stat-item:nth-child(2).is-revealed { opacity: 1; transform: translateY(0); transition-delay: 0.18s; }
    .is-revealed .int-stat-item:nth-child(3), .int-stat-item:nth-child(3).is-revealed { opacity: 1; transform: translateY(0); transition-delay: 0.30s; }
    .int-stat-num { font-size: 26px; font-weight: 600; color: var(--int-brass); }
    .int-stat-lbl { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--int-muted); margin-top: 4px; }
    
    /* 4. Text Sections with Elegant Staggered Upward Reveal */
    .int-stagger > * {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .is-revealed.int-stagger > *:nth-child(1), .is-revealed .int-stagger > *:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
    .is-revealed.int-stagger > *:nth-child(2), .is-revealed .int-stagger > *:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.18s; }
    .is-revealed.int-stagger > *:nth-child(3), .is-revealed .int-stagger > *:nth-child(3) { opacity: 1; transform: translateY(0); transition-delay: 0.30s; }
    .is-revealed.int-stagger > *:nth-child(4), .is-revealed .int-stagger > *:nth-child(4) { opacity: 1; transform: translateY(0); transition-delay: 0.42s; }

    /* 5. Contact Buttons with Micro-Interactions (Hover & Tap) */
    .int-btn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      width: 100%;
      box-sizing: border-box;
    }
    .int-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 13px 8px;
      border-radius: 9999px;
      font-size: clamp(10px, 2.7vw, 11px);
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      width: 100%;
      box-sizing: border-box;
      white-space: nowrap;
      min-width: 0;
    }
    .int-btn:hover {
      transform: translateY(-2px);
    }
    .int-btn:active {
      transform: scale(0.97) translateY(0);
    }
    .int-btn-primary {
      background: var(--int-espresso);
      color: var(--int-ivory);
      border: none;
    }
    .int-btn-primary:hover {
      background: #2a2320;
      box-shadow: 0 6px 18px rgba(26,22,20,0.22);
    }
    .int-btn-brass {
      background: var(--int-brass);
      color: #fff;
      border: none;
    }
    .int-btn-brass:hover {
      background: #cfa873;
      box-shadow: 0 6px 20px rgba(194,154,103,0.38);
    }
    .int-btn-outline {
      background: transparent;
      color: var(--int-espresso);
      border: 1px solid var(--int-border);
    }
    .int-btn-outline:hover {
      background: rgba(26,22,20,0.04);
      border-color: var(--int-espresso);
    }

    /* Consultation CTA button */
    .int-cta-consultation {
      width: 100%;
      box-sizing: border-box;
      padding: 16px 12px;
      margin-top: 28px;
      font-size: clamp(11px, 2.8vw, 12px);
      letter-spacing: 0.16em;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .int-cta-consultation:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(194,154,103,0.45);
      background: #cfa873;
    }
    .int-cta-consultation:active {
      transform: scale(0.98) translateY(0);
    }
    
    /* 6. Continuous Materials Marquee (Smooth 60fps GPU-accelerated) */
    .int-marquee-wrap {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      white-space: nowrap;
      border-top: 1px solid var(--int-border);
      border-bottom: 1px solid var(--int-border);
      padding: 14px 0;
      margin: 24px 0;
    }
    .int-marquee {
      display: inline-block;
      animation: int-scroll 28s linear infinite;
      font-size: 20px;
      font-style: italic;
      color: var(--int-muted);
      will-change: transform;
      transform: translate3d(0, 0, 0);
    }
    @keyframes int-scroll {
      from { transform: translate3d(0, 0, 0); }
      to { transform: translate3d(-50%, 0, 0); }
    }
    
    /* Sections */
    .int-section {
      padding: 40px 20px;
      width: 100%;
      box-sizing: border-box;
    }
    @media (min-width: 480px) {
      .int-section {
        padding: 48px 24px;
      }
    }
    .int-eyebrow { font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; color: var(--int-brass); margin-bottom: 12px; }
    .int-dark { background: var(--int-espresso); color: var(--int-ivory); }
    
    /* 7. Staggered Services Rows */
    .int-service-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 0;
      border-bottom: 1px solid rgba(250,247,242,0.12);
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease;
      border-radius: 8px;
      width: 100%;
      box-sizing: border-box;
    }
    .is-revealed .int-service-row,
    .int-service-row.is-revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .is-revealed .int-service-row:nth-child(1), .int-service-row:nth-child(1).is-revealed { transition-delay: 0.06s; }
    .is-revealed .int-service-row:nth-child(2), .int-service-row:nth-child(2).is-revealed { transition-delay: 0.18s; }
    .is-revealed .int-service-row:nth-child(3), .int-service-row:nth-child(3).is-revealed { transition-delay: 0.30s; }
    .is-revealed .int-service-row:nth-child(4), .int-service-row:nth-child(4).is-revealed { transition-delay: 0.42s; }
    .int-service-row:hover {
      background: rgba(250,247,242,0.03);
    }

    /* 8. Portfolio Cards with Smooth Zoom & Scale Effect */
    .int-portfolio-card {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
      width: 100%;
      box-sizing: border-box;
    }
    .int-portfolio-card.is-revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .int-portfolio-img-wrap {
      width: 100%;
      aspect-ratio: 4/5;
      overflow: hidden;
      border-radius: 20px;
      background: #201b18;
    }
    .int-portfolio-img {
      width: 100%;
      height: 100%;
      aspect-ratio: 4/5;
      object-fit: cover;
      display: block;
      transform: scale(1.06);
      transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }
    .int-portfolio-card.is-revealed .int-portfolio-img {
      transform: scale(1);
    }
    .int-portfolio-card.is-revealed:hover .int-portfolio-img {
      transform: scale(1.035);
      transition-duration: 0.6s;
    }
    .int-portfolio-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-top: 10px;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* 9. Staggered Process Items */
    .int-process-item {
      position: relative;
      margin-bottom: 24px;
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    }
    .int-process-dot {
      position: absolute;
      left: -26px;
      top: 8px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--int-brass);
    }
    .is-revealed .int-process-item,
    .int-process-item.is-revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .is-revealed .int-process-item:nth-child(1), .int-process-item:nth-child(1).is-revealed { transition-delay: 0.05s; }
    .is-revealed .int-process-item:nth-child(2), .int-process-item:nth-child(2).is-revealed { transition-delay: 0.16s; }
    .is-revealed .int-process-item:nth-child(3), .int-process-item:nth-child(3).is-revealed { transition-delay: 0.27s; }
    .is-revealed .int-process-item:nth-child(4), .int-process-item:nth-child(4).is-revealed { transition-delay: 0.38s; }
    .is-revealed .int-process-item:nth-child(5), .int-process-item:nth-child(5).is-revealed { transition-delay: 0.49s; }

    /* 10. Contact Rows Staggered */
    .int-contact-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(250,247,242,0.12);
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      width: 100%;
      box-sizing: border-box;
    }
    .int-contact-row > span:first-child {
      flex-shrink: 0;
    }
    .int-contact-row > :last-child {
      text-align: right;
      max-width: 65%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .is-revealed .int-contact-row,
    .int-contact-row.is-revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .is-revealed .int-contact-row:nth-child(1), .int-contact-row:nth-child(1).is-revealed { transition-delay: 0.08s; }
    .is-revealed .int-contact-row:nth-child(2), .int-contact-row:nth-child(2).is-revealed { transition-delay: 0.16s; }
    .is-revealed .int-contact-row:nth-child(3), .int-contact-row:nth-child(3).is-revealed { transition-delay: 0.24s; }
    .is-revealed .int-contact-row:nth-child(4), .int-contact-row:nth-child(4).is-revealed { transition-delay: 0.32s; }
    .is-revealed .int-contact-row:nth-child(5), .int-contact-row:nth-child(5).is-revealed { transition-delay: 0.40s; }

    /* 11. Accessibility: Respect User's Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .int-reveal,
      .int-stagger > *,
      .int-stat-item,
      .int-service-row,
      .int-portfolio-card,
      .int-portfolio-img,
      .int-process-item,
      .int-contact-row,
      .int-hero img,
      .int-hero-top,
      .int-hero-bottom {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
        animation: none !important;
      }
      .int-marquee {
        animation-duration: 60s !important;
      }
    }
  </style>

  <div class="int-shell">
    <!-- Hero Cover -->
    <header class="int-hero">
      <img src="${heroImg}" alt="${name}" />
      <div class="int-hero-veil"></div>
      <div class="int-hero-top">
        <span class="font-cormorant" style="font-size: 22px; letter-spacing: 0.25em;">M·A</span>
        <span style="font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.8;">Est. 2014</span>
      </div>
      <div class="int-hero-bottom">
        <p class="int-eyebrow" style="color: var(--int-brass);">Interior Architecture</p>
        <h1 class="font-cormorant int-hero-title">${name}</h1>
        <p style="font-size: 13px; line-height: 1.6; opacity: 0.85; max-width: 280px; margin: 0;">${escapeHtml(card.description || (card as any).bio || "Spaces shaped by light, material and the quiet art of living well.")}</p>
      </div>
    </header>

    <!-- Profile Info & Quick Actions -->
    <div class="int-profile-card int-reveal">
      <div style="display: flex; align-items: center; gap: 16px; min-width: 0;">
        <div style="width: 56px; height: 56px; border-radius: 50%; border: 1px solid var(--int-brass); display: flex; align-items: center; justify-content: center; color: var(--int-brass); font-size: 20px; flex-shrink: 0;" class="font-cormorant">${initials}</div>
        <div style="flex: 1; min-width: 0;">
          <h2 class="font-cormorant" style="font-size: clamp(22px, 6.5vw, 28px); margin: 0; line-height: 1.1; overflow-wrap: break-word; word-break: break-word;">${name}</h2>
          <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--int-muted); margin: 4px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${designation}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="int-stats-grid int-reveal">
        <div class="int-stat-item"><div class="int-stat-num font-cormorant">350+</div><div class="int-stat-lbl">Homes</div></div>
        <div class="int-stat-item"><div class="int-stat-num font-cormorant">12</div><div class="int-stat-lbl">Years</div></div>
        <div class="int-stat-item"><div class="int-stat-num font-cormorant">28</div><div class="int-stat-lbl">Awards</div></div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="int-btn-grid">
        ${phone ? `<a href="tel:${cleanPhone}" class="int-btn int-btn-primary">Call</a>` : ""}
        ${wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer" class="int-btn int-btn-brass">WhatsApp</a>` : ""}
        ${email ? `<a href="mailto:${email}" class="int-btn int-btn-outline">Email</a>` : ""}
        <button type="button" onclick="downloadVCard()" class="int-btn int-btn-outline">Save Contact</button>
      </div>
    </div>

    <!-- Scrolling Materials Marquee -->
    <div class="int-marquee-wrap int-reveal">
      <div class="int-marquee font-cormorant">
        Travertine &bull; Walnut &bull; Brushed Brass &bull; Natural Linen &bull; Fluted Glass &bull; Italian Boucl&eacute; &bull; Calacatta Marble &bull;&nbsp;
        Travertine &bull; Walnut &bull; Brushed Brass &bull; Natural Linen &bull; Fluted Glass &bull; Italian Boucl&eacute; &bull; Calacatta Marble &bull;&nbsp;
      </div>
    </div>

    <!-- Philosophy -->
    <section class="int-section int-reveal int-stagger" style="padding-top: 24px; padding-bottom: 24px;">
      <p class="int-eyebrow">— Philosophy</p>
      <p class="font-cormorant" style="font-size: 28px; line-height: 1.25; margin: 8px 0 0;">
        We don't decorate rooms. We <em style="color: var(--int-brass);">compose</em> the feeling of coming home.
      </p>
    </section>

    <!-- Services Section -->
    <section class="int-section int-dark int-reveal">
      <p class="int-eyebrow" style="color: var(--int-brass);">— Services</p>
      <div class="int-services-list int-reveal" style="margin-top: 20px;">
        <div class="int-service-row">
          <span class="font-cormorant" style="color: var(--int-brass); font-size: 16px;">01</span>
          <div style="flex: 1;"><h3 class="font-cormorant" style="font-size: 20px; margin: 0;">Residential Interiors</h3><p style="font-size: 12px; opacity: 0.6; margin: 4px 0 0;">Homes composed around how you live.</p></div>
        </div>
        <div class="int-service-row">
          <span class="font-cormorant" style="color: var(--int-brass); font-size: 16px;">02</span>
          <div style="flex: 1;"><h3 class="font-cormorant" style="font-size: 20px; margin: 0;">Turnkey Execution</h3><p style="font-size: 12px; opacity: 0.6; margin: 4px 0 0;">Concept to handover, one studio.</p></div>
        </div>
        <div class="int-service-row">
          <span class="font-cormorant" style="color: var(--int-brass); font-size: 16px;">03</span>
          <div style="flex: 1;"><h3 class="font-cormorant" style="font-size: 20px; margin: 0;">Styling & Curation</h3><p style="font-size: 12px; opacity: 0.6; margin: 4px 0 0;">Art, lighting and objects, edited.</p></div>
        </div>
        <div class="int-service-row" style="border-bottom: none;">
          <span class="font-cormorant" style="color: var(--int-brass); font-size: 16px;">04</span>
          <div style="flex: 1;"><h3 class="font-cormorant" style="font-size: 20px; margin: 0;">Villas & Penthouses</h3><p style="font-size: 12px; opacity: 0.6; margin: 4px 0 0;">Grand scale, quiet luxury.</p></div>
        </div>
      </div>
    </section>

    <!-- Selected Work / Portfolio -->
    <section class="int-section int-reveal">
      <p class="int-eyebrow">— Selected Work</p>
      <h2 class="font-cormorant" style="font-size: 36px; margin: 4px 0 24px;">Portfolio</h2>
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div class="int-portfolio-card">
          <div class="int-portfolio-img-wrap">
            <img src="/assets/interior/kitchen.jpg" alt="The Walnut Kitchen" class="int-portfolio-img" />
          </div>
          <div class="int-portfolio-meta">
            <span class="font-cormorant" style="font-size: 22px;">The Walnut Kitchen</span>
            <span style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--int-muted);">Bandra &bull; 2025</span>
          </div>
        </div>
        <div class="int-portfolio-card">
          <div class="int-portfolio-img-wrap">
            <img src="/assets/interior/bedroom.jpg" alt="Linen Suite" class="int-portfolio-img" />
          </div>
          <div class="int-portfolio-meta">
            <span class="font-cormorant" style="font-size: 22px;">Linen Suite</span>
            <span style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--int-muted);">Juhu &bull; 2025</span>
          </div>
        </div>
        <div class="int-portfolio-card">
          <div class="int-portfolio-img-wrap">
            <img src="/assets/interior/dining.jpg" alt="Travertine Dining" class="int-portfolio-img" />
          </div>
          <div class="int-portfolio-meta">
            <span class="font-cormorant" style="font-size: 22px;">Travertine Dining</span>
            <span style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--int-muted);">Alibaug &bull; 2024</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Process -->
    <section class="int-section int-reveal" style="background: #f2ece4;">
      <p class="int-eyebrow">— The Process</p>
      <ol class="int-process-list int-reveal" style="margin: 20px 0 0 10px; padding-left: 20px; border-left: 2px solid var(--int-brass); list-style: none; box-sizing: border-box;">
        <li class="int-process-item">
          <span class="int-process-dot"></span>
          <span class="font-cormorant" style="font-size: 24px;">1. Consultation</span>
        </li>
        <li class="int-process-item">
          <span class="int-process-dot"></span>
          <span class="font-cormorant" style="font-size: 24px;">2. Concept &amp; Mood</span>
        </li>
        <li class="int-process-item">
          <span class="int-process-dot"></span>
          <span class="font-cormorant" style="font-size: 24px;">3. Design Development</span>
        </li>
        <li class="int-process-item">
          <span class="int-process-dot"></span>
          <span class="font-cormorant" style="font-size: 24px;">4. Execution</span>
        </li>
        <li class="int-process-item">
          <span class="int-process-dot"></span>
          <span class="font-cormorant" style="font-size: 24px;">5. The Handover</span>
        </li>
      </ol>
    </section>

    <!-- Client Testimonial -->
    <section class="int-section int-reveal int-stagger" style="text-align: center;">
      <p class="font-cormorant" style="font-size: 64px; color: var(--int-brass); margin: 0; line-height: 1;">&ldquo;</p>
      <p class="font-cormorant" style="font-size: 26px; font-style: italic; line-height: 1.3; margin: 8px 0 16px;">
        They understood our home before we could even describe it.
      </p>
      <p style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--int-muted); margin: 0;">&mdash; The Mehta Family, Juhu</p>
    </section>

    <!-- Footer & Direct Contact -->
    <footer class="int-section int-dark int-reveal" style="padding-bottom: 36px;">
      <div class="int-stagger">
        <h2 class="font-cormorant" style="font-size: 36px; line-height: 1.1; margin: 0 0 28px;">
          Let's create<br/><em style="color: var(--int-brass);">something timeless.</em>
        </h2>
      </div>
      <div class="int-contact-list int-reveal" style="display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
        ${city ? `<div class="int-contact-row"><span>Location</span><span style="color: var(--int-brass);">${city}</span></div>` : ""}
        ${email ? `<div class="int-contact-row"><span>Email</span><a href="mailto:${email}" style="color: var(--int-brass); text-decoration: none;">${email}</a></div>` : ""}
        ${insta ? `<div class="int-contact-row"><span>Instagram</span><a href="${insta.startsWith('http') ? insta : `https://instagram.com/${insta.replace(/^@/, '')}`}" target="_blank" rel="noopener noreferrer" style="color: var(--int-brass); text-decoration: none;">${insta.startsWith('http') ? cleanDisplayUrl(insta) : `@${insta.replace(/^@/, '')}`}</a></div>` : ""}
        ${card.socialLinkedIn ? `<div class="int-contact-row"><span>LinkedIn</span><a href="${card.socialLinkedIn.startsWith('http') ? card.socialLinkedIn : `https://linkedin.com/in/${card.socialLinkedIn}`}" target="_blank" rel="noopener noreferrer" style="color: var(--int-brass); text-decoration: none;">LinkedIn</a></div>` : ""}
        ${website ? `<div class="int-contact-row"><span>Website</span><a href="${website.startsWith('http') ? website : `https://${website}`}" target="_blank" rel="noopener noreferrer" style="color: var(--int-brass); text-decoration: none;">${cleanDisplayUrl(website)}</a></div>` : ""}
        ${(() => {
          const links = resolveCustomerLinks(card);
          const additionalLinks = links.filter(l => !['phone', 'whatsapp', 'email', 'website', 'maps'].includes(l.type) && (!insta || !l.value.includes(insta)) && (!card.socialLinkedIn || !l.value.includes(card.socialLinkedIn)));
          return additionalLinks.map(l => {
            const dest = formatLinkDestination(l.type, l.value);
            if (!dest) return "";
            return `<div class="int-contact-row"><span>${escapeHtml(l.label || l.type)}</span><a href="${dest}" target="_blank" rel="noopener noreferrer" style="color: var(--int-brass); text-decoration: none;">${escapeHtml(cleanDisplayUrl(l.value))}</a></div>`;
          }).join("");
        })()}
      </div>

      ${wa ? `
      <a href="https://wa.me/${wa}?text=Hi,%20I'd%20like%20to%20discuss%20my%20home%20interior." target="_blank" rel="noopener noreferrer" class="int-btn int-btn-brass int-cta-consultation">
        Book a design consultation
      </a>` : ""}
      
      <p style="text-align: center; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.4; margin: 32px 0 0;">
        &copy; ${name} &bull; Ambros Studio
      </p>
    </footer>
  </div>

  <script>
    function downloadVCard() {
      const vcard = "BEGIN:VCARD\\nVERSION:3.0\\nFN:${name.replace(/"/g, '\\"')}\\nORG:${name.replace(/"/g, '\\"')}\\nTITLE:${designation.replace(/"/g, '\\"')}\\nTEL:${cleanPhone}\\nEMAIL:${email}\\nURL:${website}\\nEND:VCARD";
      const blob = new Blob([vcard], { type: "text/vcard" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "contact.vcf";
      a.click();
    }

    function initInteriorLuxuryScrollReveal() {
      if (!window || !document) return;

      const revealElements = document.querySelectorAll(
        '.int-reveal, .int-service-row, .int-portfolio-card, .int-process-item, .int-contact-row'
      );
      if (!revealElements.length) return;

      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealElements.forEach(function (el) {
          el.classList.add('is-revealed');
        });
        return;
      }

      if (!('IntersectionObserver' in window)) {
        revealElements.forEach(function (el) {
          el.classList.add('is-revealed');
        });
        return;
      }

      const observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              obs.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -40px 0px',
          threshold: 0.08
        }
      );

      revealElements.forEach(function (el) {
        observer.observe(el);
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initInteriorLuxuryScrollReveal);
    } else {
      initInteriorLuxuryScrollReveal();
    }
    window.initInteriorLuxuryScrollReveal = initInteriorLuxuryScrollReveal;
  </script>
  `;
}


function renderMahadevSpaBody(card: ResolvedCustomerCard, options: { isPreview?: boolean } = {}): string {
  const isPreview = options.isPreview;
  const name = escapeHtml(card.fullName || "Mahadev Spa Centre");

  return `
  <style>
:root{--bg:#f6efe6;--card:#fffaf3;--ink:#2f3a2f;--sage:#5c7160;--deep:#3f5143;--rose:#b9825f;--line:#e6dacb;--mut:#7b8174}
*{box-sizing:border-box;margin:0;-webkit-tap-highlight-color:transparent}
body{background:var(--bg);color:var(--ink);font:15px/1.55 Inter,system-ui,sans-serif;padding-bottom:calc(90px + env(safe-area-inset-bottom))}
h1,h2,h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;line-height:1.1}
em{font-style:italic;color:var(--rose)}
.w{max-width:480px;margin:0 auto;padding:0 20px}
.hero{position:relative;min-height:600px;display:flex;flex-direction:column;justify-content:flex-end;color:#fff;background:linear-gradient(180deg,#1c261d55 0,#1c261d33 35%,#1c261dee 100%),url('/assets/mahadev/hero-bg.jpg') 50% 25%/cover}
.hero .in{max-width:480px;margin:0 auto;width:100%;padding:0 20px 30px}
.badge{position:absolute;top:22px;left:20px;display:flex;align-items:center;gap:10px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase}
.badge svg{width:46px;height:46px;background:#ffffff26;border-radius:50%;backdrop-filter:blur(8px);padding:3px}
.women{display:inline-block;border:1px solid #ffffffaa;border-radius:99px;padding:5px 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;backdrop-filter:blur(6px);background:#ffffff1c}
h1{font-size:46px}
.tag{margin:10px 0 16px;color:#f1ebe0;max-width:330px;font-size:16px}
.status{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:#f1ebe0}
.dot{width:8px;height:8px;border-radius:50%;background:#e0a33a}.open .dot{background:#5fe09b}
.btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border-radius:99px;border:1px solid var(--deep);background:none;color:var(--deep);font:600 14.5px Inter,sans-serif;text-decoration:none;cursor:pointer}
.btn.pri{background:var(--deep);color:#fff;font-size:16.5px;padding:17px;box-shadow:0 10px 26px #3f514340}
.btn svg,.ic{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.acts{margin-top:-26px;position:relative}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.grid .btn{background:var(--card)}
.mq{margin-top:34px;overflow:hidden;white-space:nowrap;border-block:1px solid var(--line);padding:13px 0;color:var(--sage);font:italic 600 19px 'Cormorant Garamond',serif}
.mq span{display:inline-block;animation:m 28s linear infinite}@keyframes m{to{transform:translateX(-50%)}}
section{margin-top:44px}
.k{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--rose);margin-bottom:10px;font-weight:600}
h2{font-size:34px}
.big{font:600 28px/1.25 'Cormorant Garamond',serif}
.svc{display:flex;gap:16px;padding:18px 0;border-bottom:1px solid var(--line);cursor:pointer;align-items:flex-start}
.svc i{font:italic 600 22px 'Cormorant Garamond',serif;color:var(--rose);min-width:30px}
.svc h3{font-size:22px}.svc p{color:var(--mut);font-size:13.5px}
.svc .go{margin-left:auto;align-self:center;color:var(--sage);font-size:13px;white-space:nowrap}
.gal{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
.gal figure{position:relative;border-radius:20px;overflow:hidden;aspect-ratio:3/4}
.gal figure:nth-child(1){grid-column:span 2;aspect-ratio:16/10}
.gal img{width:100%;height:100%;object-fit:cover;display:block}
.gal figcaption{position:absolute;left:0;right:0;bottom:0;padding:28px 14px 11px;color:#fff;font-size:13px;background:linear-gradient(transparent,#1c261dcc)}
.steps{counter-reset:s;margin-top:14px}
.steps li{list-style:none;counter-increment:s;display:flex;gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid var(--line)}
.steps li:before{content:counter(s);width:34px;height:34px;border-radius:50%;background:var(--deep);color:#fff;display:grid;place-items:center;font:600 15px Inter;flex:none}
.pts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;text-align:center}
.pts div{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 6px;font-size:12.5px}
.pts svg{display:block;margin:0 auto 8px;color:var(--rose);width:26px;height:26px}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;margin-top:14px}
.row{display:flex;justify-content:space-between;padding:13px 18px;border-bottom:1px solid var(--line)}.row:last-child{border:0}
.row b{font-weight:600}.row span{color:var(--mut)}.row.today{background:#5c716014}
.loc{display:flex;gap:14px;padding:18px}.loc p{color:var(--mut);font-size:13.5px}
.qr{text-align:center;padding:24px 18px}.qr #qr{display:inline-block;padding:10px;background:#fff;border-radius:14px;margin:12px 0 6px}
.qr small{display:block;color:var(--mut)}
.foot{text-align:center;color:var(--mut);font-size:12px;margin:34px 0 8px}.foot a{color:var(--rose);text-decoration:none}
.bar{position:fixed;left:0;right:0;bottom:0;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:#f6efe6ee;backdrop-filter:blur(10px);border-top:1px solid var(--line);z-index:5}
.bar .in{max-width:480px;margin:auto;display:flex;gap:10px}.bar .btn{padding:14px}.bar .sq{width:54px;flex:none}
.sheet{position:fixed;inset:0;background:#1c261d88;z-index:9;display:none;align-items:flex-end}.sheet.on{display:flex}
.pane{background:var(--bg);border-radius:26px 26px 0 0;width:100%;max-width:480px;margin:auto;padding:22px 20px calc(22px + env(safe-area-inset-bottom));max-height:92vh;overflow:auto}
.pane h2{font-size:30px}label{display:block;font-size:12px;color:var(--mut);margin:14px 0 6px}
input,select{width:100%;padding:13px;border-radius:14px;border:1px solid var(--line);background:#fff;color:var(--ink);font:16px Inter,sans-serif}
.slots{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.slot{padding:10px 0;text-align:center;border:1px solid var(--line);border-radius:12px;font-size:13px;cursor:pointer;background:#fff}
.slot.sel{background:var(--deep);color:#fff;border-color:var(--deep);font-weight:600}
.x{float:right;background:none;border:0;color:var(--mut);font-size:30px;line-height:1;cursor:pointer}
.note{font-size:12px;color:var(--mut);margin-top:10px;text-align:center}

  @media (min-width: 600px) {
    body.theme-mahadev-spa {
      background: #1c261d !important;
      display: flex !important;
      justify-content: center !important;
    }
    .theme-mahadev-spa .viewport-wrapper {
      box-shadow: 0 0 50px rgba(0,0,0,0.5) !important;
    }
  }
  </style>

  ${isPreview ? `
    <div style="background: #0f172a; color: #f8fafc; font-size: 11.5px; font-weight: 700; text-align: center; padding: 8px 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #334155; position: sticky; top: 0; z-index: 1000;">
      ADMIN PREVIEW &bull; Mahadev Spa (${card.is_active !== false ? '<span style="color: #34d399;">Active</span>' : '<span style="color: #fbbf24;">Inactive</span>'})
    </div>
  ` : ""}

<svg width="0" height="0" style="position:absolute"><defs><mask id="mn"><rect width="120" height="120" fill="#fff"/><circle cx="66" cy="27" r="11" fill="#000"/></mask>
<path id="p" d="M60 96C47 82 47 62 60 46C73 62 73 82 60 96Z"/>
<symbol id="logo" viewBox="0 0 120 120"><circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width=".6" opacity=".6"/>
<circle cx="60" cy="29" r="11" fill="currentColor" mask="url(#mn)"/><circle cx="60" cy="44" r="2" fill="currentColor"/>
<g fill="currentColor"><use href="#p" transform="rotate(-62 60 96)" opacity=".55"/><use href="#p" transform="rotate(62 60 96)" opacity=".55"/><use href="#p" transform="rotate(-32 60 96)" opacity=".8"/><use href="#p" transform="rotate(32 60 96)" opacity=".8"/><use href="#p"/></g>
<path d="M34 98h52" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol></defs></svg>

<header class="hero">
<div class="badge"><svg style="color:#f0dcae"><use href="#logo"/></svg></div>
<div class="in">
<span class="women">Exclusively for Women</span>
<h1>Mahadev<br>Spa Centre</h1>
<p class="tag">Relax your body. Calm your mind. Feel renewed in a peaceful, women-only space.</p>
<div class="status" id="status"><i class="dot"></i><span>Checking hours...</span></div>
</div></header>

<main class="w">
<div class="acts"><button class="btn pri" onclick="openBook()"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>Book Appointment</button>
<div class="grid">
<a class="btn" id="call"><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>Call Now</a>
<a class="btn" id="wa"><svg viewBox="0 0 24 24"><path d="M3 21l1.6-4.6A9 9 0 1 1 8 19.6z"/><path d="M9 9c0 3 3 6 6 6l1-2-2-1-1 .7a4 4 0 0 1-2-2L12 10l-1-2z"/></svg>WhatsApp</a>
<a class="btn" id="dir" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>Directions</a>
<button class="btn" onclick="saveContact()"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0M19 3v4M17 5h4"/></svg>Save Contact</button>
</div></div>
</main>

<div class="mq"><span id="mq"></span></div>

<main class="w">
<section><div class="k">— Our Promise</div><p class="big">A quiet corner where you can <em>breathe out,</em> be cared for, and walk back lighter.</p></section>

<section><div class="k">— Treatments</div><h2>Our Services</h2><div id="svcs" style="margin-top:8px"></div></section>

<section><div class="k">— The Space</div><h2>Calm, <em>by design</em></h2>
<div class="gal">
<figure><img src="/assets/mahadev/gallery-1.jpg" alt="Neck and shoulder massage" loading="lazy"><figcaption>Gentle, skilled hands</figcaption></figure>
<figure><img src="/assets/mahadev/gallery-2.jpg" alt="Relaxing face massage" loading="lazy"><figcaption>Face &amp; head care</figcaption></figure>
<figure><img src="/assets/mahadev/gallery-3.jpg" alt="Aroma bath with lemon and candles" loading="lazy"><figcaption>Aroma &amp; candlelight</figcaption></figure>
<figure style="grid-column:span 2;aspect-ratio:16/10"><img src="/assets/mahadev/gallery-4.jpg" alt="Fresh rolled towels" loading="lazy"><figcaption>Fresh, clean, ready for you</figcaption></figure>
</div></section>

<section><div class="k">— How It Works</div><h2>Book in <em>four</em> steps</h2>
<ol class="steps"><li>Choose your treatment</li><li>Pick a date and time</li><li>Confirm on WhatsApp</li><li>Arrive and relax</li></ol>
<div class="pts">
<div><svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M12 12v8M9 17h6"/></svg>Women only</div>
<div><svg class="ic" viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/></svg>Clean &amp; hygienic</div>
<div><svg class="ic" viewBox="0 0 24 24"><path d="M5 11V8a4 4 0 0 1 14 0v3M4 11h16v9H4z"/></svg>Private rooms</div></div></section>

<section><div class="k">— Visit Us</div><h2>Opening Hours</h2><div class="card" id="hrs"></div></section>

<section><h2>Find Us</h2><div class="card loc">
<svg class="ic" style="color:var(--rose);width:26px;height:26px;flex:none" viewBox="0 0 24 24"><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
<div><b>Mahadev Spa Centre</b><p>Sanawad, Madhya Pradesh<br>Plus Code: 53G9+H7</p></div></div>
<a class="btn" id="dir2" target="_blank" rel="noopener" style="margin-top:10px">Open in Google Maps</a></section>

<section><div class="card qr"><div class="k" style="margin:0">— Share</div><h2>Mahadev Spa Centre</h2><div id="qr"></div><small>Scan with phone camera to open profile</small>
<div class="grid"><button class="btn" onclick="share()">Share</button><button class="btn" onclick="copyLink(this)">Copy Link</button></div></div></section>

<p class="foot">© Mahadev Spa Centre &bull; Digital Profile by <a href="https://ambrosstudio.com">Ambros Studio</a></p>
</main>

<div class="bar"><div class="in"><button class="btn pri" onclick="openBook()">Book Appointment</button>
<a class="btn sq" id="call2" aria-label="Call"><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg></a></div></div>

<div class="sheet" id="sheet" onclick="if(event.target===this)closeBook()"><div class="pane">
<button class="x" onclick="closeBook()" aria-label="Close">&times;</button>
<h2>Book Appointment</h2><p class="note" style="text-align:left;margin:2px 0 0">Women only. We confirm on WhatsApp.</p>
<label>Your name</label><input id="nm" placeholder="Full name" autocomplete="name">
<label>Treatment</label><select id="sv"></select>
<label>Date</label><input id="dt" type="date" onchange="makeSlots()">
<label>Preferred time</label><div class="slots" id="slots"></div>
<button class="btn pri" style="margin-top:20px" onclick="sendBook()">Confirm on WhatsApp</button>
<p class="note">No payment needed now. Pay at the centre.</p></div></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script>
/* ====== DYNAMIC INITIALIZATION FROM CARD PAYLOAD ====== */
var cardData = (typeof window !== 'undefined' && window.__INITIAL_CARD__) ? window.__INITIAL_CARD__ : {};
var customData = cardData.customSettings || {};
var C = {
 name: cardData.fullName || "Mahadev Spa Centre",
 phone: cardData.phone ? cardData.phone.replace(/[^0-9]/g, '') : "917000527974",
 place: cardData.address || "53G9+H7 Sanawad, Madhya Pradesh",
 hours: customData.hours || {1:[9,19],2:[9,19],3:[9,19],4:[9,19],5:[9,19],6:[9,19],0:[10,18]},
 services: (Array.isArray(customData.services) && customData.services.length)
   ? customData.services.map(function(s) { return Array.isArray(s) ? s : [s.name, s.duration, s.desc, s.price || '']; })
   : [
       ["Full Body Massage","60 min","Slow, flowing strokes to ease the whole body.",""],
       ["Deep Tissue Massage","60 min","Firm, focused pressure for tight, tired muscles.",""],
       ["Head, Neck & Shoulder","30 min","Relief for desk-day stiffness and tension.",""],
       ["Foot Reflexology","30 min","Pressure-point care for tired feet and legs.",""],
       ["Aromatherapy Massage","60 min","Soothing oils and a gentle, calming scent.",""],
       ["Ayurvedic Oil Massage","60 min","A traditional warm-oil massage for deep rest.",""]
     ]
};
/* ======================================================== */
const $=id=>document.getElementById(id),pad=n=>String(n).padStart(2,'0'),h12=h=>(h%12||12)+(h<12?' AM':' PM');
const D=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
$('call').href=$('call2').href='tel:+'+C.phone;
$('wa').href='https://wa.me/'+C.phone+'?text='+encodeURIComponent('Hello '+C.name+', I would like to know more.');
$('dir').href=$('dir2').href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(C.place);
\$('svcs').innerHTML=C.services.map(function(s,i){return '<div class="svc" onclick="openBook('+i+')"><i>'+pad(i+1)+'</i><div><h3>'+s[0]+'</h3><p>'+(s[3]?'<b>'+s[3]+'</b> &bull; ':'')+s[1]+(s[2]?' &bull; '+s[2]:'')+'</p></div><span class="go">Book &rarr;</span></div>';}).join('');
const tx=C.services.map(s=>s[0]).join(' &bull; ')+' &bull; ';$('mq').innerHTML=tx+tx+tx+tx;
const now=new Date(),td=now.getDay();
\$('hrs').innerHTML=[1,2,3,4,5,6,0].map(function(d){return '<div class="row'+(d===td?' today':'')+'"><b>'+D[d]+'</b><span>'+h12(C.hours[d][0])+' - '+h12(C.hours[d][1])+'</span></div>';}).join('');
(function(){const [o,c]=C.hours[td],h=now.getHours()+now.getMinutes()/60,on=h>=o&&h<c,e=$('status');
 e.classList.toggle('open',on);e.querySelector('span').textContent=on?'Open now, closes '+h12(c):'Closed now'+(h<o?', opens '+h12(o):'')})();
\$('sv').innerHTML=C.services.map(function(s,i){return '<option value="'+i+'">'+s[0]+' ('+s[1]+')</option>';}).join('');
let slot='';
function makeSlots(){slot='';const sl=$('slots');sl.innerHTML='';const d=new Date($('dt').value+'T12:00');const [o,c]=C.hours[isNaN(d)?td:d.getDay()];
 for(let h=o;h<c;h++){const e=document.createElement('div');e.className='slot';e.textContent=h12(h);e.onclick=()=>{slot=e.textContent;[...sl.children].forEach(x=>x.classList.toggle('sel',x===e))};sl.appendChild(e)}}
\$('dt').min=\$('dt').value=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());makeSlots();
function openBook(i){if(typeof i==='number')$('sv').value=i;$('sheet').classList.add('on')}
function closeBook(){$('sheet').classList.remove('on')}
function sendBook(){
 const n=$('nm').value.trim();if(!n){$('nm').focus();return}
 if(!slot){alert('Please choose a time');return}
 const d=new Date($('dt').value+'T12:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
 const m='Hello '+C.name+',\\nI would like to book an appointment.\\n\\nName: '+n+'\\nTreatment: '+C.services[\$('sv').value][0]+' ('+C.services[\$('sv').value][1]+')\\nDate: '+d+'\\nTime: '+slot+'\\n\\nPlease confirm availability.';
 location.href='https://wa.me/'+C.phone+'?text='+encodeURIComponent(m)}
function saveContact(){
 const v='BEGIN:VCARD\\nVERSION:3.0\\nFN:'+C.name+'\\nORG:'+C.name+'\\nTEL;TYPE=CELL:+'+C.phone+'\\nADR:;;'+C.place+';;;;\\nNOTE:Women-only massage & spa centre in Sanawad\\nURL:'+location.href+'\\nEND:VCARD';
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([v],{type:'text/vcard'}));a.download='Mahadev-Spa-Centre.vcf';a.click()}
function share(){const d={title:C.name,text:C.name+' - Women\'s Massage & Spa, Sanawad',url:location.href};
 if(navigator.share)navigator.share(d).catch(()=>{});else copyLink()}
function copyLink(b){navigator.clipboard&&navigator.clipboard.writeText(location.href);if(b){b.textContent='Copied!';setTimeout(()=>b.textContent='Copy Link',1500)}else alert('Link copied')}
if(window.QRCode)new QRCode($('qr'),{text:location.href,width:150,height:150,colorDark:'#3f5143',colorLight:'#ffffff'});else $('qr').style.display='none';
</script>
  `;
}

export function renderCompleteMahadevSpaHtml(card: ResolvedCustomerCard, options: { isPreview?: boolean } = {}): string {
  const name = escapeHtml(card.fullName || "Mahadev Spa Centre");
  const desc = escapeHtml(card.description || "A calm, women-only massage and spa centre in Sanawad, Madhya Pradesh. Book your appointment in one tap.");

  return `<!DOCTYPE html>
<html lang="en" class="theme-mahadev-spa">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f6efe6">
<title>${name} | Women's Massage &amp; Spa, Sanawad</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script id="__INITIAL_CARD_DATA__">
  window.__INITIAL_CARD__ = ${JSON.stringify(card)};
</script>
</head>
<body class="theme-mahadev-spa">
  <main class="viewport-wrapper" id="cardViewport">
    ${renderMahadevSpaBody(card, options)}
  </main>
</body>
</html>`;
}

function renderAmbrosFlagshipBody(card: ResolvedCustomerCard, options: { isPreview?: boolean } = {}): string {
  const isPreview = options.isPreview;
  const name = escapeHtml(card.fullName || "Ambros Studio");

  return `
  <style>
:root{
  box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);
  --bg:#fff;--soft:#f3f3ef;--line:#e6e6e0;--ink:#0a0a0a;--muted:#6a6a64;
  --green:#0c7c59;--lime:#19b583;--yellow:#f2b632;
  --head:'Sora','Segoe UI',Helvetica,Arial,sans-serif;
  --body:'Inter',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  --ease:cubic-bezier(.2,.7,.2,1);
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:env(safe-area-inset-top,0px)}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--body);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden;padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))}
a{color:inherit;text-decoration:none}
.wrap{max-width:480px;margin:0 auto;padding:0 24px}
h1,h2,h3{font-family:var(--head);margin:0;letter-spacing:-.025em}
.lbl{font:600 11px var(--body);letter-spacing:.22em;text-transform:uppercase;color:var(--green);display:flex;align-items:center;gap:10px}
.lbl::before{content:"";width:26px;height:2px;background:currentColor}
.on-dark .lbl{color:var(--lime)}
.h2{font:800 34px/1.02 var(--head);text-transform:uppercase;margin-top:16px}
.h2 b{color:var(--green)}.on-dark .h2 b{color:var(--lime)}

.js .rv{opacity:0;transform:translateY(26px);transition:opacity .8s var(--ease),transform .8s var(--ease);transition-delay:var(--d,0s)}
.js .rv.in{opacity:1;transform:none}

/* buttons */
.btn{position:relative;overflow:hidden;display:flex;justify-content:center;align-items:center;padding:15px 10px;border-radius:12px;font:600 13px var(--body);border:1.5px solid var(--ink);background:#fff;color:var(--ink);cursor:pointer;transition:transform .25s var(--ease),background .25s,color .25s,border-color .25s}
.btn::after{content:"";position:absolute;top:0;left:-70%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);transition:left .7s var(--ease)}
.btn:hover::after{left:130%}
.btn:hover{transform:translateY(-2px)}
.btn:active{transform:scale(.97)}
.btn.pri{background:var(--ink);color:#fff}
.btn.pri:hover{background:var(--green);border-color:var(--green)}
.btn.full{grid-column:1/-1}

/* hero */
.hero{padding:30px 0 70px;position:relative}
.hero::before{content:"";position:absolute;right:-80px;top:-60px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(12,124,89,.16),transparent 70%);animation:drift 9s ease-in-out infinite alternate}
@keyframes drift{to{transform:translate(-40px,60px) scale(1.2)}}
.top{position:relative;display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:500;color:var(--muted)}
.top i{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--green);margin-right:8px;animation:pulse 2.2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(12,124,89,.55)}70%,100%{box-shadow:0 0 0 10px rgba(12,124,89,0)}}
.logo{display:block;width:100%;margin:14px 0 0;mix-blend-mode:multiply;animation:wipe 1.3s .15s var(--ease) both}
@keyframes wipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.hero h1{margin-top:40px;font:800 clamp(40px,13vw,58px)/.98 var(--head);text-transform:uppercase}
.ln{display:block;overflow:hidden;padding-bottom:.06em}
.ln span{display:block;animation:rise .9s var(--ease) both}
.ln:nth-child(1) span{animation-delay:.7s}.ln:nth-child(2) span{animation-delay:.85s}.ln:nth-child(3) span{animation-delay:1s}
@keyframes rise{from{transform:translateY(110%)}}
.ln.g span{color:var(--green)}
.intro{margin:22px 0 28px;color:var(--muted);font-size:15.5px;max-width:340px;animation:fade .9s 1.2s both}
@keyframes fade{from{opacity:0;transform:translateY(12px)}}
.acts{display:grid;grid-template-columns:1fr 1fr;gap:10px;animation:fade .9s 1.35s both}

/* marquee */
.tick{background:var(--green);color:#fff;transform:rotate(-2.2deg) scale(1.06);padding:14px 0;overflow:hidden;white-space:nowrap;position:relative;z-index:3;margin-top:-10px}
.tick div{display:inline-block;animation:m 22s linear infinite;font:800 15px var(--head);letter-spacing:.14em;text-transform:uppercase}
.tick span{margin:0 18px;opacity:.55}
@keyframes m{to{transform:translateX(-50%)}}

/* dark / green blocks */
.blk{position:relative;padding:92px 0 96px;margin-top:-30px;clip-path:polygon(0 30px,100% 0,100% calc(100% - 30px),0 100%)}
.on-dark{background:var(--ink);color:#fff}
.on-green{background:var(--green);color:#fff}
.on-green .lbl{color:#fff}
.sv{display:block;position:relative;margin-top:12px;padding:24px 22px;background:#151515;clip-path:polygon(0 0,calc(100% - 24px) 0,100% 24px,100% 100%,0 100%);transition:background .35s,transform .35s var(--ease)}
.sv:first-of-type{margin-top:28px}
.sv:hover{background:var(--green);transform:translateX(6px)}
.sv .n{font:800 40px/1 var(--head);color:transparent;-webkit-text-stroke:1.2px var(--lime);transition:.35s}
.sv:hover .n{-webkit-text-stroke-color:#fff}
.sv h3{font:700 19px/1.25 var(--head);margin-top:14px}
.sv p{margin:6px 0 0;font-size:13.5px;color:#a3a39c;transition:color .35s}
.sv:hover p{color:#e4f3ec}
.sv .ar{position:absolute;right:20px;bottom:20px;color:var(--lime);font-size:20px;transition:.35s}
.sv:hover .ar{color:#fff;transform:translate(4px,-4px)}

/* work */
.work{padding:64px 0 40px}
.note{font-size:12.5px;color:var(--muted);margin:10px 0 0}
.scroll{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:24px 24px 10px;margin:0 -24px;scrollbar-width:none}
.scroll::-webkit-scrollbar{display:none}
.pc{flex:none;width:76%;scroll-snap-align:center;transition:transform .4s var(--ease)}
.pc:hover{transform:translateY(-6px)}
.art{height:240px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;clip-path:polygon(0 0,calc(100% - 34px) 0,100% 34px,100% 100%,0 100%);position:relative;overflow:hidden}
.art::after{content:"";position:absolute;right:-30%;top:-10%;width:90%;height:140%;background:rgba(255,255,255,.07);transform:skewX(-18deg);transition:transform .6s var(--ease)}
.pc:hover .art::after{transform:skewX(-18deg) translateX(-30px)}
.art em{align-self:flex-start;font-style:normal;font:600 9.5px var(--body);letter-spacing:.16em;text-transform:uppercase;border:1px solid currentColor;border-radius:99px;padding:4px 10px}
.art b{font:800 52px/.92 var(--head);text-transform:uppercase;letter-spacing:-.03em}
.a1{background:var(--ink);color:#fff}.a1 b{color:var(--lime)}
.a2{background:var(--green);color:#fff}
.a3{background:var(--soft);color:var(--ink)}.a3 b{color:var(--green)}
.a4{background:#1c1c1c;color:#fff}.a4 b{-webkit-text-stroke:1.2px #fff;color:transparent}
.pc .m{padding:16px 2px 0}
.pc h3{font:700 17px var(--head)}
.pc .k{font-size:11.5px;font-weight:600;color:var(--green);margin:3px 0 6px}
.pc p{margin:0;font-size:13.5px;color:var(--muted)}
.hint{font-size:11px;letter-spacing:.2em;color:var(--muted);font-weight:600;margin-top:4px}

/* nfc */
.nfc p.l{color:#d3ece2;font-size:15px;margin:14px 0 0}
.nfc .h2{color:#fff}
.card{margin:34px 0 26px;aspect-ratio:1.62;border-radius:18px;background:#0a0a0a;color:#fff;padding:20px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;box-shadow:0 26px 50px rgba(0,0,0,.35);animation:float 5s ease-in-out infinite}
@keyframes float{50%{transform:translateY(-10px) rotate(-2deg)}}
.card::before{content:"";position:absolute;left:20px;right:20px;bottom:48px;height:2px;background:var(--lime)}
.card::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.12),transparent);transform:skewX(-20deg);animation:sweep 4.5s 1s infinite}
@keyframes sweep{to{left:130%}}
.card .r{display:flex;justify-content:space-between;font-size:10px;letter-spacing:.24em;font-weight:600;color:#bdbdb6}
.card b{font:800 22px var(--head);letter-spacing:.08em;text-transform:uppercase}
.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.two div{background:rgba(255,255,255,.12);border-radius:14px;padding:16px;font-size:12.5px;color:#d3ece2}
.two b{display:block;color:#fff;font:700 14px var(--head);margin-bottom:4px}

/* process */
.proc{padding:70px 0 30px}
.steps{position:relative;margin-top:30px;padding-left:4px}
.track{position:absolute;left:23px;top:20px;bottom:30px;width:2px;background:var(--line)}
.track i{display:block;width:100%;height:0;background:var(--green)}
.st{position:relative;display:grid;grid-template-columns:48px 1fr;padding-bottom:30px}
.st .d{width:40px;height:40px;border-radius:50%;background:#fff;border:2px solid var(--line);display:grid;place-items:center;font:800 14px var(--head);transition:.4s var(--ease);position:relative;z-index:1}
.st.in .d{border-color:var(--green);background:var(--green);color:#fff}
.st h3{font:700 19px var(--head);margin-top:6px}
.st p{margin:4px 0 0;font-size:14px;color:var(--muted)}

/* cta */
.cta h2{font:800 40px/1 var(--head);text-transform:uppercase}
.cta h2 b{color:var(--lime)}
.cta .btn{margin-top:28px;width:100%;padding:18px;background:var(--yellow);border-color:var(--yellow);color:var(--ink);font-size:14px}
.cta .btn:hover{background:#fff;border-color:#fff}
.info{margin-top:44px;border-top:1px solid rgba(255,255,255,.16)}
.info a,.info div{display:flex;justify-content:space-between;gap:16px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.16);font-size:14px}
.info span{font-size:10.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#8d8d86;padding-top:3px;flex:none}
.info b{font-weight:500;text-align:right}
.info a:hover b{color:var(--lime)}
.soc{display:flex;gap:10px;margin-top:24px}
.soc a{padding:10px 16px;border:1px solid rgba(255,255,255,.25);border-radius:99px;font-size:12px;font-weight:600;transition:.25s}
.soc a:hover{background:#fff;color:var(--ink)}
.foot{margin-top:40px;font-size:11.5px;color:#8d8d86}

/* dock */
.dock{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:min(432px,calc(100% - 32px));z-index:20;display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:6px;padding:6px;border-radius:18px;background:rgba(255,255,255,.9);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid var(--line);box-shadow:0 12px 34px rgba(0,0,0,.18)}
.dock a,.dock button{display:grid;place-items:center;padding:12px 6px;border-radius:13px;font:600 12.5px var(--body);background:transparent;border:0;color:var(--ink);cursor:pointer;transition:transform .2s}
.dock a:active,.dock button:active{transform:scale(.95)}
.dock .go{background:var(--green);color:#fff}
.toast{position:fixed;left:50%;bottom:calc(88px + env(safe-area-inset-bottom,0px));transform:translate(-50%,16px);opacity:0;background:var(--ink);color:#fff;padding:9px 16px;border-radius:99px;font-size:12px;font-weight:500;transition:.3s;pointer-events:none;z-index:30}
.toast.on{opacity:1;transform:translate(-50%,0)}
/* booking modal */
.ov{position:fixed;inset:0;z-index:50;background:rgba(10,10,10,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .3s;display:flex;align-items:flex-end;justify-content:center}
.ov.open{opacity:1;pointer-events:auto}
.sheet{width:100%;max-width:480px;max-height:92%;overflow:auto;background:#fff;border-radius:26px 26px 0 0;padding:12px 22px calc(24px + env(safe-area-inset-bottom,0px));transform:translateY(100%);transition:transform .5s var(--ease)}
.ov.open .sheet{transform:none}
.grab{width:40px;height:4px;border-radius:4px;background:var(--line);margin:0 auto 14px}
.sh-top{display:flex;justify-content:space-between;align-items:center}
.bars{display:flex;gap:6px;flex:1;margin-right:16px}
.bars i{height:3px;flex:1;background:var(--line);border-radius:3px;transition:background .4s}
.bars i.on{background:var(--green)}
.x{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:#fff;font-size:15px;cursor:pointer;color:var(--ink)}
.stp[hidden]{display:none}
.stp{animation:fade .5s var(--ease) both}
.stp .kk{margin-top:20px;font:600 11px var(--body);letter-spacing:.2em;text-transform:uppercase;color:var(--green)}
.stp h3{font:800 26px/1.05 var(--head);text-transform:uppercase;margin:6px 0 4px}
.stp .sub{font-size:13.5px;color:var(--muted);margin:0 0 20px}
.fld{margin-bottom:16px}
.fld label,.fld .q{display:block;font:600 12.5px var(--body);margin-bottom:7px}
.fld label small,.fld .q small{color:var(--muted);font-weight:400}
.fld input,.fld select,.fld textarea{width:100%;font:400 16px var(--body);padding:14px;border:1.5px solid var(--line);border-radius:12px;background:#fff;color:var(--ink);outline:none;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none;appearance:none;min-height:50px}
.fld select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%230a0a0a' stroke-width='2'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;padding-right:40px}
.fld textarea{resize:none;min-height:84px}
.fld input:focus,.fld select:focus,.fld textarea:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(12,124,89,.14)}
.msg{display:none;color:#d32f2f;font-size:12px;margin-top:5px}
.fld.err input,.fld.err select,.fld.err textarea,.fld.err .chip{border-color:#d32f2f}
.fld.err .msg{display:block}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{padding:11px 14px;border-radius:99px;border:1.5px solid var(--line);background:#fff;font:600 13px var(--body);cursor:pointer;transition:.2s;color:var(--ink)}
.chip:active{transform:scale(.95)}
.chip.on{background:var(--green);border-color:var(--green);color:#fff}
.nav2{display:flex;gap:10px;margin-top:8px}
.nav2 .btn{flex:1;padding:16px}
.nav2 .back{flex:0 0 34%}
.btn.grn{background:var(--green);border-color:var(--green);color:#fff}
.btn.grn:hover{background:var(--ink);border-color:var(--ink)}
.sum{border:1px solid var(--line);border-radius:14px;margin-bottom:16px}
.sum div{display:flex;justify-content:space-between;gap:14px;padding:12px 14px;border-bottom:1px solid var(--line);font-size:13.5px}
.sum div:last-child{border:0}
.sum span{color:var(--muted);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;padding-top:3px;flex:none}
.sum b{font-weight:500;text-align:right}
.alt{display:block;text-align:center;font-size:12.5px;color:var(--muted);margin-top:14px}
.alt a{color:var(--green);font-weight:600}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.js .rv{opacity:1;transform:none}}

  @media (min-width: 600px) {
    body.theme-ambros-flagship {
      background: #0a0a0a !important;
      display: flex !important;
      justify-content: center !important;
    }
    .theme-ambros-flagship .viewport-wrapper {
      box-shadow: 0 0 50px rgba(0,0,0,0.5) !important;
    }
  }
  </style>

  ${isPreview ? `
    <div style="background: #0f172a; color: #f8fafc; font-size: 11.5px; font-weight: 700; text-align: center; padding: 8px 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #334155; position: sticky; top: 0; z-index: 1000;">
      ADMIN PREVIEW &bull; Ambros Flagship (${card.is_active !== false ? '<span style="color: #34d399;">Active</span>' : '<span style="color: #fbbf24;">Inactive</span>'})
    </div>
  ` : ""}

<header class="hero"><div class="wrap">
  <img class="logo" alt="Ambros — Crafted with Purpose" src="/assets/ambros-crafted-hero.jpg">
  <h1><span class="ln"><span>Built to</span></span><span class="ln g"><span>stand out</span></span><span class="ln"><span>online.</span></span></h1>
  <p class="intro">Websites, Meta ads and digital identities for brands that want to be remembered.</p>
  <div class="acts">
    <a class="btn pri" href="tel:+919157778915">Call</a>
    <a class="btn" href="https://wa.me/919157778915?text=Hi%20Ambros%20Studio!%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services." target="_blank" rel="noopener">WhatsApp</a>
    <a class="btn" href="mailto:ambrosstudioltd@gmail.com">Email</a>
    <button class="btn" id="copy" type="button">Copy Link</button>
  </div>
</div></header>

<div class="tick" aria-hidden="true"><div>
  Websites<span>/</span>Meta Ads<span>/</span>Metal NFC Cards<span>/</span>Brand Identity<span>/</span>Local SEO<span>/</span>WhatsApp Funnels<span>/</span>
  Websites<span>/</span>Meta Ads<span>/</span>Metal NFC Cards<span>/</span>Brand Identity<span>/</span>Local SEO<span>/</span>WhatsApp Funnels<span>/</span>
</div></div>

<section class="blk on-dark"><div class="wrap">
  <div class="lbl rv">Services</div>
  <h2 class="h2 rv">We don’t just build websites. We build <b>digital prestige.</b></h2>
  <a class="sv rv" href="https://ambrosstudio.com/services#webDesign" target="_blank" rel="noopener"><div class="n">01</div><h3>Website Design &amp; Development</h3><p>Bespoke, ultra-fast sites that build authority and drive inquiries.</p><span class="ar">↗</span></a>
  <a class="sv rv" href="https://ambrosstudio.com/services#leadGen" target="_blank" rel="noopener"><div class="n">02</div><h3>Meta Ads</h3><p>Instagram &amp; Facebook campaigns that bring local buyers to you.</p><span class="ar">↗</span></a>
  <a class="sv rv" href="https://ambrosstudio.com/services#digitalCards" target="_blank" rel="noopener"><div class="n">03</div><h3>Digital &amp; Metal NFC Cards</h3><p>Engraved steel cards with a live profile, shared in one tap.</p><span class="ar">↗</span></a>
  <a class="sv rv" href="https://ambrosstudio.com/services" target="_blank" rel="noopener"><div class="n">04</div><h3>Brand Identity &amp; Local SEO</h3><p>Distinct visual systems and stronger Google Maps visibility.</p><span class="ar">↗</span></a>
</div></section>

<section class="blk on-green nfc"><div class="wrap">
  <div class="lbl rv">Smart Networking</div>
  <h2 class="h2 rv">Metal card. Living profile.</h2>
  <p class="l rv">Tap on any NFC phone or scan a QR. Your profile opens instantly, ready to save and share.</p>
  <div class="card rv"><div class="r"><span>NFC</span><span>MATTE BLACK</span></div><b>Ambros Studio</b><div class="r"><span>STAINLESS STEEL</span><span>TAP ▸</span></div></div>
  <div class="two rv"><div><b>Physical card</b>Tap an NFC phone and your profile opens.</div><div><b>Digital link</b>Open via link or QR on any browser.</div></div>
</div></section>

<section class="proc"><div class="wrap">
  <div class="lbl rv">The Process</div>
  <h2 class="h2 rv">Four phases to <b>prestige</b></h2>
  <div class="steps" id="steps">
    <div class="track"><i id="fill"></i></div>
    <div class="st"><div class="d">1</div><div><h3>Discovery &amp; Strategy</h3><p>We study your business, clientele and the one action you want visitors to take.</p></div></div>
    <div class="st"><div class="d">2</div><div><h3>Bespoke Design</h3><p>Custom layouts, intentional typography. Zero generic templates.</p></div></div>
    <div class="st"><div class="d">3</div><div><h3>High-Performance Build</h3><p>Clean, responsive, fast code with WhatsApp integration.</p></div></div>
    <div class="st"><div class="d">4</div><div><h3>Launch &amp; Scale</h3><p>Domain setup, Meta campaigns and delivery of your NFC cards.</p></div></div>
  </div>
</div></section>

<section class="blk on-dark cta" style="margin-bottom:-30px"><div class="wrap">
  <div class="lbl rv">Let’s talk</div>
  <h2 class="rv" style="margin-top:16px">Let’s build <b>something timeless.</b></h2>
  <button type="button" class="btn rv" data-open>Book a Demo →</button>
  <div class="info rv">
    <a href="tel:+919157778915"><span>Phone</span><b>+91 91577 78915</b></a>
    <a href="mailto:ambrosstudioltd@gmail.com"><span>Email</span><b>ambrosstudioltd@gmail.com</b></a>
    <a href="https://ambrosstudio.com" target="_blank" rel="noopener"><span>Web</span><b>ambrosstudio.com</b></a>
    <div><span>Studio</span><b>VIP Gallaria, Althan,<br>Surat, Gujarat 395017</b></div>
  </div>
  <div class="soc rv">
    <a href="https://www.instagram.com/ambros.studio" target="_blank" rel="noopener">Instagram</a>
    <a href="https://x.com/ambrosstudio" target="_blank" rel="noopener">X</a>
    <a href="https://www.facebook.com/share/p/1HrAAE5Yjf/" target="_blank" rel="noopener">Facebook</a>
  </div>
  <div class="foot">© 2026 Ambros Studio · Crafted with Purpose</div>
</div></section>

<nav class="dock">
  <a href="tel:+919157778915">Call</a>
  <button type="button" class="go" data-open>Book a Demo</button>
  <button type="button" id="copy2">Share</button>
</nav>
<div class="ov" id="modal" aria-hidden="true">
 <div class="sheet" role="dialog" aria-modal="true" aria-label="Book a demo">
  <div class="grab"></div>
  <div class="sh-top"><div class="bars"><i></i><i></i><i></i></div><button class="x" type="button" id="close" aria-label="Close">✕</button></div>

  <div class="stp" data-s="0">
   <div class="kk">Step 1 of 3</div>
   <h3>About you</h3>
   <p class="sub">So we know who we’re speaking with.</p>
   <div class="fld"><label for="f-name">Your name</label><input id="f-name" type="text" autocomplete="name" placeholder="e.g. Rahul Shah"><div class="msg">Please enter your name.</div></div>
   <div class="fld"><label for="f-biz">Business name</label><input id="f-biz" type="text" autocomplete="organization" placeholder="e.g. Zaika Restaurant"><div class="msg">Please enter your business name.</div></div>
   <div class="fld"><label for="f-cat">Business category</label><select id="f-cat"><option value="">Select a category</option><option>Restaurant &amp; Café</option><option>Salon &amp; Spa</option><option>Real Estate</option><option>Fitness &amp; Wellness</option><option>Clinic &amp; Healthcare</option><option>Retail &amp; E-commerce</option><option>Education &amp; Coaching</option><option>Professional Services</option><option>Other</option></select><div class="msg">Please select a category.</div></div>
   <div class="nav2"><button class="btn grn" type="button" data-next="0">Continue →</button></div>
  </div>

  <div class="stp" data-s="1" hidden>
   <div class="kk">Step 2 of 3</div>
   <h3>Plan your demo</h3>
   <p class="sub">Pick what you’d like to see and when.</p>
   <div class="fld" data-k="service"><div class="q">Demo category</div><div class="chips"><button type="button" class="chip">Website</button><button type="button" class="chip">Meta Ads</button><button type="button" class="chip">NFC Cards</button><button type="button" class="chip">Branding &amp; SEO</button><button type="button" class="chip">Not sure yet</button></div><div class="msg">Please choose a category.</div></div>
   <div class="fld"><label for="f-date">Preferred date</label><input id="f-date" type="date"><div class="msg">Please pick a date.</div></div>
   <div class="fld" data-k="time"><div class="q">Preferred time</div><div class="chips"><button type="button" class="chip">10:00 AM</button><button type="button" class="chip">11:00 AM</button><button type="button" class="chip">12:00 PM</button><button type="button" class="chip">2:00 PM</button><button type="button" class="chip">3:00 PM</button><button type="button" class="chip">4:00 PM</button><button type="button" class="chip">5:00 PM</button><button type="button" class="chip">6:00 PM</button></div><div class="msg">Please choose a time.</div></div>
   <div class="fld"><label for="f-note">Anything we should know? <small>(optional)</small></label><textarea id="f-note" placeholder="Goals, questions, current website link..."></textarea></div>
   <div class="nav2"><button class="btn back" type="button" data-back>← Back</button><button class="btn grn" type="button" data-next="1">Review →</button></div>
  </div>

  <div class="stp" data-s="2" hidden>
   <div class="kk">Step 3 of 3</div>
   <h3>Confirm &amp; send</h3>
   <p class="sub">Check your details, then send the request to us on WhatsApp.</p>
   <div class="sum" id="sum"></div>
   <a class="btn grn" id="wa" href="#" target="_blank" rel="noopener" style="width:100%;padding:17px">Send on WhatsApp →</a>
   <div class="nav2" style="margin-top:10px"><button class="btn back" type="button" data-back style="flex:1">← Edit details</button></div>
   <span class="alt">Prefer email? <a id="mail" href="#">Send by email</a></span>
  </div>
 </div>
</div>
<div class="toast" id="toast">Link copied</div>
<script>
(function(){
  var t=document.getElementById('toast');
  function show(m){t.textContent=m;t.classList.add('on');setTimeout(function(){t.classList.remove('on')},1800)}
  function copy(){
    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(location.href).then(function(){show('Link copied')},function(){show('Copy from the address bar')});return}}catch(e){}
    show('Copy from the address bar');
  }
  document.getElementById('copy').addEventListener('click',copy);
  document.getElementById('copy2').addEventListener('click',copy);
  var els=document.querySelectorAll('.rv,.st');
  function chk(){els.forEach(function(el){if(el.getBoundingClientRect().top<innerHeight*.9)el.classList.add('in')})}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});
    els.forEach(function(el){io.observe(el)});
  }
  chk();setTimeout(chk,300);
  var s=document.getElementById('steps'),f=document.getElementById('fill');
  function prog(){var r=s.getBoundingClientRect(),p=(innerHeight*.65-r.top)/(r.height-40);p=Math.max(0,Math.min(1,p));f.style.height=(p*100)+'%'}
  addEventListener('scroll',prog,{passive:true});prog();
  /* booking */
  var m=document.getElementById('modal'),sh=m.querySelector('.sheet'),stp=[].slice.call(m.querySelectorAll('.stp')),bars=m.querySelectorAll('.bars i'),cur=0,V={service:'',time:''},NL='\n';
  function $(id){return document.getElementById(id)}
  var dt=new Date();dt.setMinutes(dt.getMinutes()-dt.getTimezoneOffset());$('f-date').min=dt.toISOString().slice(0,10);
  function go(n){cur=n;stp.forEach(function(s,i){s.hidden=i!==n});bars.forEach(function(b,i){b.className=i<=n?'on':''});sh.scrollTop=0}
  function openM(){m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';go(0);setTimeout(function(){try{$('f-name').focus({preventScroll:true})}catch(e){}},400)}
  function closeM(){m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  document.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',openM)});
  $('close').addEventListener('click',closeM);
  m.addEventListener('click',function(e){if(e.target===m)closeM()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeM()});
  m.querySelectorAll('.fld input,.fld select,.fld textarea').forEach(function(el){['input','change'].forEach(function(ev){el.addEventListener(ev,function(){el.closest('.fld').classList.remove('err')})})});
  m.querySelectorAll('.fld[data-k] .chip').forEach(function(c){c.addEventListener('click',function(){var f=c.closest('.fld');f.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on')});c.classList.add('on');V[f.getAttribute('data-k')]=c.textContent;f.classList.remove('err')})});
  function bad(el){el.classList.add('err');return false}
  function chkTxt(id){var e=$(id);return e.value.trim()?true:bad(e.closest('.fld'))}
  function chkK(k){return V[k]?true:bad(m.querySelector('.fld[data-k="'+k+'"]'))}
  function pretty(v){var p=v.split('-');return new Date(p[0],p[1]-1,p[2]).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
  function esc(s){return s.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  m.querySelectorAll('[data-back]').forEach(function(b){b.addEventListener('click',function(){go(Math.max(0,cur-1))})});
  m.querySelector('[data-next="0"]').addEventListener('click',function(){var a=chkTxt('f-name'),b=chkTxt('f-biz'),c=chkTxt('f-cat');if(a&&b&&c)go(1)});
  m.querySelector('[data-next="1"]').addEventListener('click',function(){
    var a=chkK('service'),b=chkTxt('f-date'),c=chkK('time');if(!(a&&b&&c))return;
    var d={n:$('f-name').value.trim(),b:$('f-biz').value.trim(),c:$('f-cat').value,s:V.service,d:pretty($('f-date').value),t:V.time,x:$('f-note').value.trim()};
    var rows=[['Name',d.n],['Business',d.b],['Category',d.c],['Demo for',d.s],['Date',d.d],['Time',d.t]];if(d.x)rows.push(['Notes',d.x]);
    $('sum').innerHTML=rows.map(function(r){return '<div><span>'+r[0]+'</span><b>'+esc(r[1])+'</b></div>'}).join('');
    var msg='Hi Ambros Studio! I would like to book a demo.'+NL+NL+'Name: '+d.n+NL+'Business: '+d.b+NL+'Business category: '+d.c+NL+'Demo for: '+d.s+NL+'Preferred date: '+d.d+NL+'Preferred time: '+d.t+(d.x?NL+'Notes: '+d.x:'');
    $('wa').href='https://wa.me/919157778915?text='+encodeURIComponent(msg);
    $('mail').href='mailto:ambrosstudioltd@gmail.com?subject='+encodeURIComponent('Demo request - '+d.b)+'&body='+encodeURIComponent(msg);
    go(2);
  });
})();
</script>
  `;
}

export function renderCompleteAmbrosFlagshipHtml(card: ResolvedCustomerCard, options: { isPreview?: boolean } = {}): string {
  const name = escapeHtml(card.fullName || "Ambros Studio");
  const desc = escapeHtml(card.description || "Websites, Meta ads and digital identities for brands that want to be remembered.");

  return `<!DOCTYPE html>
<html lang="en" class="theme-ambros-flagship">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${name} — Crafted with Purpose</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script>document.documentElement.className='js'</script>
<script id="__INITIAL_CARD_DATA__">
  window.__INITIAL_CARD__ = ${JSON.stringify(card)};
</script>
</head>
<body class="theme-ambros-flagship">
  <main class="viewport-wrapper" id="cardViewport">
    ${renderAmbrosFlagshipBody(card, options)}
  </main>
</body>
</html>`;
}


function renderNoirGoldBody(card: ResolvedCustomerCard): string {
  const name = hasText(card.fullName) ? card.fullName!.trim() : "";
  const role = hasText(card.designation) ? card.designation!.trim() : "";
  const company = hasText(card.company) ? card.company!.trim() : "";
  const bio = hasText(card.description) ? card.description!.trim() : "";
  const phone = hasText(card.phone) ? card.phone!.trim() : "";
  const whatsapp = hasText(card.whatsapp) ? card.whatsapp!.trim() : "";
  const email = hasText(card.email) ? card.email!.trim() : "";
  const website = hasText(card.website) ? card.website!.trim() : "";
  const address = hasText(card.address) ? card.address!.trim() : "";
  const avatarUrl = hasText(card.avatarUrl) ? card.avatarUrl!.trim() : "";
  const custom = (card.customSettings && typeof card.customSettings === "object") ? card.customSettings : {};
  const ind = (custom.industry && custom.industry.data && typeof custom.industry.data === "object")
    ? custom.industry.data
    : ((custom as any).industryData && typeof (custom as any).industryData === "object" ? (custom as any).industryData : {});

  let html = "";

  // 1. Mandatory Hero strip with diagonal line pattern
  html += `<div class="hero" aria-hidden="true"></div>`;

  // 2. Profile ID Header
  html += `<header class="id">`;
  html += `  <div class="ring">`;
  if (avatarUrl) {
    html += `    <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name || "Profile photo")}">`;
  } else {
    html += `    ${escapeHtml(getInitials(name || "YN"))}`;
  }
  html += `  </div>`;

  if (name) {
    html += `  <h1>${escapeHtml(name)}</h1>`;
  }

  const roleText = [role, company].filter(Boolean).join(", ");
  if (roleText) {
    html += `  <p class="role">${escapeHtml(roleText)}</p>`;
  }

  const statusText = hasText(ind.status)
    ? ind.status.trim()
    : (hasText(ind.availability) ? ind.availability.trim() : (hasText(ind.hours) ? ind.hours.trim() : ""));
  if (statusText) {
    html += `  <span class="status"><i></i>${escapeHtml(statusText)}</span>`;
  }
  html += `</header>`;

  // 3. Primary Action Button (Add to contacts)
  html += `
  <div class="actions">
    <button type="button" class="btn gold" id="saveContactBtn">Add to contacts</button>
  </div>
  `;

  // 4. About Section (only if bio has text)
  if (bio) {
    html += `
  <section>
    <h2>About</h2>
    <div class="tile"><p>${escapeHtml(bio)}</p></div>
  </section>
    `;
  }

  // 5. Stats Section (only if valid stats exist)
  if (Array.isArray(ind.stats) && ind.stats.length > 0 && ind.stats.some((s: any) => s && hasText(s.num || s.value))) {
    const validStats = ind.stats.filter((s: any) => s && hasText(s.num || s.value)).slice(0, 3);
    html += `
  <section>
    <div class="stats">
      ${validStats.map((s: any) => `<div><b>${escapeHtml(s.num || s.value || "")}</b><span>${escapeHtml(s.label || "")}</span></div>`).join("")}
    </div>
  </section>
    `;
  }

  // 6. Get in touch Section (using unified resolved links)
  const links = resolveCustomerLinks(card);
  const contactLinks = links.filter((l) => !SOCIAL_TYPES.has(l.type));
  const socialLinks = links.filter((l) => SOCIAL_TYPES.has(l.type));

  const contactRows: string[] = [];
  contactLinks.forEach((l) => {
    const dest = formatLinkDestination(l.type, l.value);
    if (!dest) return;
    const label = escapeHtml(l.label);
    const display = escapeHtml(getDisplayValue(l.type, l.value, l.label));
    const isExt = l.type !== "phone" && l.type !== "email";

    let actionWord = "Open";
    if (l.type === "phone") actionWord = "Call";
    else if (l.type === "whatsapp") actionWord = "Chat";
    else if (l.type === "email") actionWord = "Write";
    else if (l.type === "website") actionWord = "Visit";
    else if (l.type === "maps" || l.type === "directions") actionWord = "Navigate";

    contactRows.push(`
      <a class="row" href="${dest}" ${isExt ? 'target="_blank" rel="noopener noreferrer"' : ""}>
        ${getLinkIconSvg(l.type, 18)}
        <span><small>${label}</small>${display}</span><span class="go">${actionWord}</span>
      </a>
    `);
  });

  if (contactRows.length > 0) {
    html += `
  <section>
    <h2>Get in touch</h2>
    <div class="rows">
      ${contactRows.join("")}
    </div>
  </section>
    `;
  }

  // 7. Services Section (only if valid services exist)
  if (Array.isArray(ind.services) && ind.services.length > 0) {
    const validServices = ind.services.filter((s: any) => {
      if (typeof s === "string") return hasText(s);
      return s && (hasText(s.name) || hasText(s.title));
    });

    if (validServices.length > 0) {
      html += `
  <section>
    <h2>Our services</h2>
    <div class="tile svc">
      ${validServices.map((s: any) => {
        const title = typeof s === "string" ? s : (s.name || s.title || "");
        const detail = typeof s === "object" ? (s.sub || s.detail || s.price || "") : "";
        return `<div><em>${escapeHtml(title)}</em>${detail ? `<span>${escapeHtml(detail)}</span>` : ""}</div>`;
      }).join("")}
    </div>
  </section>
      `;
    }
  }

  // 8. Kind words Section (only if valid testimonials exist)
  const rawReviews = Array.isArray(ind.reviews) ? ind.reviews : (Array.isArray(ind.testimonials) ? ind.testimonials : []);
  const validReviews = rawReviews.filter((r: any) => r && (hasText(r.quote) || hasText(r.text) || hasText(r.comment)));
  if (validReviews.length > 0) {
    html += `
  <section>
    <h2>Kind words</h2>
    <div class="quotes">
      ${validReviews.map((r: any) => {
        const qText = r.quote || r.text || r.comment || "";
        const author = r.author || r.name || r.client || "";
        const companyText = r.company || "";
        const footerText = [author, companyText].filter(Boolean).join(", ");
        return `<div class="quote"><p>${escapeHtml(qText)}</p>${footerText ? `<footer>${escapeHtml(footerText)}</footer>` : ""}</div>`;
      }).join("")}
    </div>
  </section>
    `;
  }

  // 9. Find me Section (only if address exists)
  if (address) {
    html += `
  <section>
    <h2>Find me</h2>
    <div class="tile">
      <div class="map" aria-hidden="true"><div class="pin"></div></div>
      <p>${escapeHtml(address)}</p>
      <div class="actions" style="padding:14px 0 0">
        <a class="btn gold" href="https://maps.google.com/?q=${encodeURIComponent(address)}" target="_blank" rel="noopener noreferrer">Get directions</a>
      </div>
    </div>
  </section>
    `;
  }

  // 10. Social Links (only if valid social links exist)
  const socialItems: string[] = [];
  socialLinks.forEach((l) => {
    const dest = formatLinkDestination(l.type, l.value);
    if (!dest) return;
    socialItems.push(`
      <a href="${dest}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(l.label)}">
        ${getLinkIconSvg(l.type, 18)}
      </a>
    `);
  });

  if (socialItems.length > 0) {
    html += `
  <nav class="social" aria-label="Social profiles">
    ${socialItems.join("")}
  </nav>
    `;
  }

  // 11. Share actions
  html += `
  <div class="share">
    <button type="button" class="btn ghost" id="shareCardBtn" style="flex:none;padding:12px 24px">Share card</button>
    <button type="button" class="btn gold" id="showQrBtn" style="flex:none;padding:12px 24px">Share QR</button>
  </div>
  `;

  // 12. Ambros Studio Brand Watermark Footer
  html += `
  <footer class="f">Digital card by Ambros Studio</footer>
  `;

  return html;
}

export function renderCardBody(card: ResolvedCustomerCard, design: CardDesignDefinition): string {
  if (design.id === "interior-luxury") {
    return renderInteriorLuxuryBody(card);
  }
  if (design.id === "noir-gold") {
    return renderNoirGoldBody(card);
  }
  if (design.id === "raftcon-luxury") {
    return renderRaftconLuxuryBody(card);
  }
  if (design.id === "atg-study-abroad") {
    return renderAtgStudyAbroadBody(card);
  }
  if (design.id === "spice-route") {
    return renderSpiceRouteBody(card);
  }

  const name = hasText(card.fullName) ? card.fullName!.trim() : "";
  const role = hasText(card.designation) ? card.designation!.trim() : "";
  const company = hasText(card.company) ? card.company!.trim() : "";
  const bio = hasText(card.description) ? card.description!.trim() : "";
  const phone = hasText(card.phone) ? card.phone!.trim() : "";
  const whatsapp = hasText(card.whatsapp) ? card.whatsapp!.trim() : "";
  const address = hasText(card.address) ? card.address!.trim() : "";
  const avatarUrl = hasText(card.avatarUrl) ? card.avatarUrl!.trim() : "";
  const custom = card.customSettings || {};
  const industryData = (custom.industry && custom.industry.data && typeof custom.industry.data === "object") ? custom.industry.data : {};

  const links = resolveCustomerLinks(card);
  const contactLinks = links.filter((l) => !SOCIAL_TYPES.has(l.type));
  const socialLinks = links.filter((l) => SOCIAL_TYPES.has(l.type));

  const initials = getInitials(name);
  const avatarHtml = avatarUrl
    ? `<div class="profile-avatar-circle" aria-label="${escapeHtml(name)}">
         <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name)}" class="profile-avatar-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
         ${initials ? `<span class="profile-avatar-initials" style="display: none;">${escapeHtml(initials)}</span>` : ""}
       </div>`
    : (initials
      ? `<div class="profile-avatar-circle" aria-label="${escapeHtml(name)}">
           <span class="profile-avatar-initials">${escapeHtml(initials)}</span>
         </div>`
      : "");

  let html = "";

  // =========================================================================
  // 1. HEADER (Tailored per Canonical Design Identity)
  // =========================================================================
  if (design.id === "atelier") {
    html += `
      <header style="text-align: center; margin-bottom: 20px;">
        ${avatarHtml}
        ${name ? `
          <p style="font-size: 13px; font-family: var(--app-font); opacity: 0.7; margin-bottom: 4px; margin-top: 12px; text-align: center;">Hello, I'm</p>
          <h1 class="profile-name">${escapeHtml(name)}</h1>
        ` : ""}
        ${role ? `
          <div style="text-align: center; margin: 10px 0;">
            <span class="fashion-tag">${escapeHtml(role)}</span>
          </div>
        ` : ""}
        ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ""}
        ${bio ? `<p class="profile-bio" style="font-family: var(--app-font);">${escapeHtml(bio)}</p>` : ""}
      </header>
    `;
  } else if (design.id === "care-plus") {
    html += `
      <header style="text-align: center; margin-bottom: 20px;">
        ${avatarHtml}
        ${name ? `<h1 class="profile-name">${escapeHtml(name)}</h1>` : ""}
        ${role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : ""}
        ${company ? `
          <div style="text-align: center; margin: 6px 0 14px;">
            <span class="doctor-specialty-pill">${escapeHtml(company)}</span>
          </div>
        ` : ""}
        ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ""}
      </header>
    `;
  } else if (design.id === "skyline") {
    const hasBadges = Array.isArray(industryData.badges) && industryData.badges.some(hasText);
    const badgesHtml = hasBadges
      ? industryData.badges.filter(hasText).map((b: string) => `<span class="badge-pill">${escapeHtml(b)}</span>`).join("")
      : "";

    html += `
      <header style="text-align: center; margin-bottom: 20px;">
        ${avatarHtml}
        ${name ? `<h1 class="profile-name">${escapeHtml(name)}</h1>` : ""}
        ${role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : ""}
        ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ""}
        ${badgesHtml ? `<div class="badges-row">${badgesHtml}</div>` : ""}
        ${bio ? `<p class="profile-bio" style="margin-top: 12px;">${escapeHtml(bio)}</p>` : ""}
      </header>
    `;
  } else if (design.id === "roast-and-co") {
    const hasCafeBadges = Array.isArray(industryData.badges) && industryData.badges.some(hasText);
    const cafeBadgesHtml = hasCafeBadges
      ? industryData.badges.filter(hasText).map((b: string) => `<span class="cafe-badge">${escapeHtml(b)}</span>`).join("")
      : "";
    const mainTitle = company || name;
    const subTitle = (company && name) ? name : role;

    html += `
      <header style="text-align: center; margin-bottom: 20px;">
        ${avatarHtml}
        ${mainTitle ? `<h1 class="profile-name">${escapeHtml(mainTitle)}</h1>` : ""}
        ${subTitle ? `<p class="profile-designation" style="opacity: 0.85;">${escapeHtml(subTitle)}</p>` : ""}
        ${cafeBadgesHtml ? `<div class="cafe-badges">${cafeBadgesHtml}</div>` : ""}
        ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ""}
      </header>
    `;
  } else if (design.category === "business") {
    const bizTitle = company || name;
    const bizSub = (company && name)
      ? `${escapeHtml(name)}${role ? " &bull; " + escapeHtml(role) : ""}`
      : (role ? escapeHtml(role) : "");
    const statusText = hasText(industryData.status) ? industryData.status.trim() : (hasText(industryData.hours) ? industryData.hours.trim() : "");

    html += `
      <header style="text-align: center; margin-bottom: 20px;">
        ${avatarHtml}
        ${bizTitle ? `<h1 class="profile-name">${escapeHtml(bizTitle)}</h1>` : ""}
        ${bizSub ? `<p class="profile-designation">${bizSub}</p>` : ""}
        ${statusText ? `
          <div style="text-align: center;">
            <span class="status-pill">
              <span class="status-dot"></span>
              <span>${escapeHtml(statusText)}</span>
            </span>
          </div>
        ` : ""}
        ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ""}
      </header>
    `;
  } else {
    // Personal Collection
    html += `
      <header style="text-align: center; margin-bottom: 18px;">
        ${avatarHtml}
        ${name ? `<h1 class="profile-name">${escapeHtml(name)}</h1>` : ""}
        ${role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : ""}
        ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ""}
      </header>
    `;

    if (bio) {
      if (["noir-gold", "emerald-ivory", "neon-pulse", "mono-studio"].includes(design.id)) {
        html += `
          <div class="about-card">
            <div class="card-subtitle">About</div>
            <p class="profile-bio">${escapeHtml(bio)}</p>
          </div>
        `;
      } else {
        html += `<p class="profile-bio" style="margin-bottom: 20px;">${escapeHtml(bio)}</p>`;
      }
    }
  }

  // =========================================================================
  // 2. STATS ROW (Personal Consultant / Real Estate Designs)
  // =========================================================================
  if (["emerald-ivory", "neon-pulse", "mono-studio"].includes(design.id)) {
    if (Array.isArray(industryData.stats) && industryData.stats.length > 0 && industryData.stats.some((s: any) => s && hasText(s.num || s.value))) {
      html += `<div class="stats-row">`;
      industryData.stats.slice(0, 3).forEach((s: any) => {
        if (s && hasText(s.num || s.value)) {
          html += `<div><div class="stat-num">${escapeHtml(s.num || s.value || "")}</div><div class="stat-label">${escapeHtml(s.label || "")}</div></div>`;
        }
      });
      html += `</div>`;
    }
  }

  // =========================================================================
  // 3. SPECIALIZED CTA BUTTONS
  // =========================================================================
  const waDest = whatsapp ? `https://wa.me/${cleanDigits(whatsapp)}` : "";
  const phoneDest = phone ? `tel:${cleanPhone(phone)}` : "";
  const mapsDest = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : "";

  if (design.id === "skyline" || design.id === "atelier" || design.id === "care-plus") {
    const bookingUrl = hasText(industryData.bookingUrl) ? formatLinkDestination("website", industryData.bookingUrl) : null;
    if (bookingUrl) {
      const defaultLabel = design.id === "skyline" ? "Book a site visit" : (design.id === "atelier" ? "Book a fitting" : "Book appointment");
      const bookingLabel = industryData.bookingLabel || defaultLabel;
      html += `
        <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-primary cta-btn-full" id="btnIndustryCta" style="margin-bottom: 12px;">
          ${getLinkIconSvg("calendar", 16)}
          <span>${escapeHtml(bookingLabel)}</span>
        </a>
      `;
    }

    const secActions: Array<{ html: string }> = [];
    if (phoneDest) {
      secActions.push({
        html: `<a href="${phoneDest}" class="cta-btn cta-btn-primary" aria-label="Call">${getLinkIconSvg("phone", 15)}<span>Call</span></a>`
      });
    }
    if (waDest && secActions.length < 2) {
      secActions.push({
        html: `<a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="WhatsApp">${getLinkIconSvg("whatsapp", 15)}<span>WhatsApp</span></a>`
      });
    }
    if (mapsDest && secActions.length < 2) {
      secActions.push({
        html: `<a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">${getLinkIconSvg("directions", 15)}<span>Directions</span></a>`
      });
    }
    if (secActions.length < 2) {
      secActions.push({
        html: `<button type="button" class="cta-btn ${secActions.length === 0 ? 'cta-btn-primary' : 'cta-btn-secondary'}" id="saveContactBtn">${getLinkIconSvg("contact", 15)}<span>Save Contact</span></button>`
      });
    }
    if (secActions.length < 2) {
      secActions.push({
        html: `<button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">${getLinkIconSvg("share", 15)}<span>Share</span></button>`
      });
    }

    html += `<div class="cta-actions-row">${secActions.map(a => a.html).join("")}</div>`;
  } else if (design.id === "roast-and-co") {
    html += `<div class="cta-actions-row">`;
    if (waDest) {
      html += `
        <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-primary" aria-label="Order on WhatsApp">
          ${getLinkIconSvg("whatsapp", 16)}
          <span>Order on WhatsApp</span>
        </a>
      `;
    } else {
      html += `
        <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn">
          ${getLinkIconSvg("contact", 16)}
          <span>Save Contact</span>
        </button>
      `;
    }

    if (mapsDest) {
      html += `
        <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">
          ${getLinkIconSvg("directions", 16)}
          <span>Directions</span>
        </a>
      `;
    } else if (phoneDest) {
      html += `
        <a href="${phoneDest}" class="cta-btn cta-btn-secondary" aria-label="Call">
          ${getLinkIconSvg("phone", 16)}
          <span>Call</span>
        </a>
      `;
    } else {
      html += `
        <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">
          ${getLinkIconSvg("share", 16)}
          <span>Share</span>
        </button>
      `;
    }
    html += `</div>`;
  } else if (design.category === "business") {
    // 3-Trio Quick Action Buttons
    html += `<div class="cta-actions-trio">`;
    if (phoneDest) {
      html += `
        <a href="${phoneDest}" class="cta-btn cta-btn-primary" aria-label="Call">
          ${getLinkIconSvg("phone", 15)}
          <span>Call</span>
        </a>
      `;
    } else {
      html += `
        <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn">
          ${getLinkIconSvg("contact", 15)}
          <span>Save</span>
        </button>
      `;
    }

    if (waDest) {
      html += `
        <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="WhatsApp">
          ${getLinkIconSvg("whatsapp", 15)}
          <span>WhatsApp</span>
        </a>
      `;
    } else if (phoneDest) {
      html += `
        <button type="button" class="cta-btn cta-btn-secondary" id="saveContactBtn">
          ${getLinkIconSvg("contact", 15)}
          <span>Save</span>
        </button>
      `;
    } else {
      html += `
        <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">
          ${getLinkIconSvg("share", 15)}
          <span>Share</span>
        </button>
      `;
    }

    if (mapsDest) {
      html += `
        <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">
          ${getLinkIconSvg("directions", 15)}
          <span>Directions</span>
        </a>
      `;
    } else {
      html += `
        <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">
          ${getLinkIconSvg("share", 15)}
          <span>Share</span>
        </button>
      `;
    }
    html += `</div>`;
  } else {
    // 2-Pair Action Row for Personal Designs
    html += `
      <div class="cta-actions-row">
        <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn" aria-label="Save contact">
          ${getLinkIconSvg("contact", 16)}
          <span>${escapeHtml(design.ctaStyle.primaryText || "Save Contact")}</span>
        </button>
        ${waDest ? `
          <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="WhatsApp me">
            ${getLinkIconSvg("whatsapp", 16)}
            <span>WhatsApp me</span>
          </a>` : (phoneDest ? `
          <a href="${phoneDest}" class="cta-btn cta-btn-secondary" aria-label="Call directly">
            ${getLinkIconSvg("phone", 16)}
            <span>Call directly</span>
          </a>` : (mapsDest ? `
          <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">
            ${getLinkIconSvg("directions", 16)}
            <span>Directions</span>
          </a>` : `
          <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" aria-label="Share card">
            ${getLinkIconSvg("share", 16)}
            <span>Share</span>
          </button>`))
        }
      </div>
    `;
  }

  // =========================================================================
  // 4. INDUSTRY & DESIGN SPECIALIZED MODULES
  // =========================================================================

  // A. Skyline (Real Estate Suite)
  if (design.id === "skyline") {
    if (Array.isArray(industryData.stats) && industryData.stats.length > 0 && industryData.stats.some((s: any) => s && hasText(s.num || s.value))) {
      html += `<div class="stats-row">`;
      industryData.stats.slice(0, 3).forEach((s: any) => {
        if (s && hasText(s.num || s.value)) {
          html += `<div><div class="stat-num">${escapeHtml(s.num || s.value || "")}</div><div class="stat-label">${escapeHtml(s.label || "")}</div></div>`;
        }
      });
      html += `</div>`;
    }

    if (Array.isArray(industryData.listings) && industryData.listings.length > 0) {
      html += `<h2 class="section-title">Featured Listings</h2>`;
      industryData.listings.forEach((item: any) => {
        if (!item || !hasText(item.title || item.price || item.name)) return;
        html += `
          <div class="listing-card">
            ${item.tag ? `<span class="listing-tag">${escapeHtml(item.tag)}</span>` : ""}
            ${item.price ? `<div class="listing-price">${escapeHtml(item.price)}</div>` : ""}
            <div class="listing-title">${escapeHtml(item.title || item.name || "")}</div>
            ${item.location ? `<div class="listing-loc">${escapeHtml(item.location)}</div>` : ""}
            ${Array.isArray(item.pills) && item.pills.length > 0 ? `
              <div class="listing-pills">
                ${item.pills.map((p: string) => `<span class="listing-pill">${escapeHtml(p)}</span>`).join("")}
              </div>` : ""}
          </div>
        `;
      });
    }

    if (Array.isArray(industryData.advisory) && industryData.advisory.length > 0) {
      html += `<h2 class="section-title" style="margin-top: 18px;">How I can help</h2><div class="advisory-grid">`;
      industryData.advisory.forEach((adv: any, idx: number) => {
        html += `
          <div class="advisory-card">
            <div class="advisory-num">${idx + 1}</div>
            <div class="advisory-title">${escapeHtml(adv.title || "")}</div>
            ${adv.desc ? `<div class="advisory-desc">${escapeHtml(adv.desc)}</div>` : ""}
          </div>
        `;
      });
      html += `</div>`;
    }

    if (Array.isArray(industryData.reviews) && industryData.reviews.length > 0) {
      html += `<h2 class="section-title">Client Feedback</h2><div class="reviews-list">`;
      industryData.reviews.forEach((rev: any) => {
        html += `
          <div class="review-card">
            <div class="review-stars">${escapeHtml(rev.stars || "★★★★★")}</div>
            <div class="review-text">${escapeHtml(rev.text || "")}</div>
            ${rev.author ? `<div class="review-author">${escapeHtml(rev.author)}</div>` : ""}
          </div>
        `;
      });
      html += `</div>`;
    }
  }

  // B. Atelier (Fashion Lookbook & Services)
  if (design.id === "atelier") {
    if (Array.isArray(industryData.lookbook) && industryData.lookbook.length > 0) {
      html += `<div class="lookbook-grid">`;
      industryData.lookbook.slice(0, 2).forEach((lb: any, idx: number) => {
        const cls = idx === 0 ? "lookbook-terracotta" : "lookbook-charcoal";
        html += `
          <div class="lookbook-box ${cls}">
            <div class="lookbook-title">${escapeHtml(lb.title || "")}</div>
            ${lb.sub ? `<div class="lookbook-sub">${escapeHtml(lb.sub)}</div>` : ""}
          </div>
        `;
      });
      html += `</div>`;
    }

    if (Array.isArray(industryData.services) && industryData.services.length > 0) {
      html += `<div class="fashion-services">`;
      industryData.services.forEach((s: any) => {
        html += `
          <div class="fashion-service-row">
            <span style="font-weight: 600;">${escapeHtml(s.name || s.title || "")}</span>
            <span style="opacity: 0.7;">${escapeHtml(s.subtitle || s.price || "")}</span>
          </div>
        `;
      });
      html += `</div>`;
    }
  }

  // C. Care Plus (Healthcare Slot & Clinic Timings)
  if (design.id === "care-plus") {
    if (hasText(industryData.nextSlot)) {
      html += `
        <div class="slot-card">
          ${getLinkIconSvg("calendar", 22)}
          <div>
            <div class="slot-title">Next Available Consultation</div>
            <div class="slot-val">${escapeHtml(industryData.nextSlot.trim())}</div>
          </div>
        </div>
      `;
    }

    if (Array.isArray(industryData.treatments) && industryData.treatments.length > 0) {
      html += `<h2 class="section-title">Specialties Treated</h2><div class="tags-cloud">`;
      industryData.treatments.forEach((t: string) => {
        if (hasText(t)) {
          html += `<span class="tag-chip">${escapeHtml(t)}</span>`;
        }
      });
      html += `</div>`;
    }

    if (hasText(industryData.timings)) {
      html += `
        <div class="timings-card">
          <div style="font-weight: 700; margin-bottom: 8px;">Clinic Timings</div>
          <div style="opacity: 0.9; line-height: 1.5;">${escapeHtml(industryData.timings.trim())}</div>
        </div>
      `;
    }
  }

  // D. Roast & Co. (Cafe Menu & Loyalty)
  if (design.id === "roast-and-co") {
    if (Array.isArray(industryData.menu) && industryData.menu.length > 0) {
      html += `
        <div class="menu-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h2 class="section-title" style="margin-bottom: 0;">Signature Menu</h2>
          </div>
      `;
      industryData.menu.forEach((item: any) => {
        html += `
          <div class="menu-item">
            <div>
              <div class="menu-item-name">
                ${escapeHtml(item.name || "")}
                ${item.popular ? `<span class="menu-item-popular">Popular</span>` : ""}
              </div>
              ${item.sub ? `<div class="menu-item-sub">${escapeHtml(item.sub)}</div>` : ""}
            </div>
            ${item.price ? `<div class="menu-item-price">${escapeHtml(item.price)}</div>` : ""}
          </div>
        `;
      });
      html += `</div>`;
    }

    if (hasText(industryData.loyalty)) {
      html += `
        <div class="loyalty-box">
          <div class="loyalty-title">Roastery Stamp Card</div>
          <div class="loyalty-desc">${escapeHtml(industryData.loyalty.trim())}</div>
        </div>
      `;
    }
  }

  // E. Bento Grid (Modular Dynamic Experience)
  if (design.id === "bento-grid") {
    const bentoTiles: string[] = [];

    if (phoneDest) {
      bentoTiles.push(`
        <a href="${phoneDest}" class="bento-tile bento-tile-coral" aria-label="Call us">
          <span class="bento-tile-title">Call us</span>
          <span class="bento-tile-main">${escapeHtml(phone)}</span>
        </a>
      `);
    }

    if (waDest) {
      bentoTiles.push(`
        <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="bento-tile bento-tile-sun" aria-label="WhatsApp">
          <span class="bento-tile-title">WhatsApp</span>
          <span class="bento-tile-main">Instant Reply</span>
        </a>
      `);
    }

    if (mapsDest) {
      bentoTiles.push(`
        <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="bento-tile bento-tile-mint" aria-label="Location">
          <span class="bento-tile-title">Location</span>
          <span class="bento-tile-main">${escapeHtml(address)}</span>
        </a>
      `);
    }

    if (hasText(industryData.rating) || hasText(industryData.clientRating)) {
      const ratingText = industryData.rating || industryData.clientRating;
      bentoTiles.push(`
        <div class="bento-tile bento-tile-lavender">
          <span class="bento-tile-title">Client Rating</span>
          <span class="bento-tile-main">${escapeHtml(ratingText)}</span>
        </div>
      `);
    }

    if (hasText(industryData.hours) || hasText(industryData.workingHours)) {
      const hoursText = industryData.hours || industryData.workingHours;
      bentoTiles.push(`
        <div class="bento-tile bento-tile-mint">
          <span class="bento-tile-title">Working Hours</span>
          <span class="bento-tile-main">${escapeHtml(hoursText)}</span>
        </div>
      `);
    }

    if (bentoTiles.length === 1) {
      bentoTiles.push(`
        <button type="button" class="bento-tile bento-tile-lavender" id="saveContactBtn" aria-label="Save Contact" style="cursor: pointer; text-align: left; border: none;">
          <span class="bento-tile-title">Contact Card</span>
          <span class="bento-tile-main">Save Contact</span>
        </button>
      `);
    }

    if (bentoTiles.length > 0) {
      for (let i = 0; i < bentoTiles.length; i += 2) {
        html += `<div class="bento-tile-row">`;
        html += bentoTiles[i];
        if (bentoTiles[i + 1]) {
          html += bentoTiles[i + 1];
        }
        html += `</div>`;
      }
    }

    if (Array.isArray(industryData.services) && industryData.services.length > 0) {
      html += `<h2 class="section-title">What we do</h2><div class="services-grid">`;
      industryData.services.forEach((s: any) => {
        const txt = typeof s === "string" ? s : (s.name || s.title || "");
        if (hasText(txt)) {
          html += `<div class="service-card">${escapeHtml(txt)}</div>`;
        }
      });
      html += `</div>`;
    }
  }

  // F. Business Hubs (Classic Navy, Fresh Mint, Bold Pop, Glass Aurora, Luxe Foil)
  if (["classic-navy", "fresh-mint", "bold-pop", "glass-aurora", "luxe-foil"].includes(design.id)) {
    const bizServices = Array.isArray(industryData.services) ? industryData.services : [];
    if (bizServices.length > 0) {
      html += `<h2 class="section-title">What we do</h2><div class="services-grid">`;
      bizServices.forEach((s: any) => {
        const txt = typeof s === "string" ? s : (s.name || s.title || "");
        if (hasText(txt)) {
          html += `<div class="service-card">${escapeHtml(txt)}</div>`;
        }
      });
      html += `</div>`;
    }

    const bizHours = Array.isArray(industryData.hours) ? industryData.hours : (hasText(industryData.hours) ? [industryData.hours] : []);
    if (bizHours.length > 0) {
      html += `<div class="hours-table"><h2 class="section-title" style="margin-bottom: 8px;">Opening Hours</h2>`;
      bizHours.forEach((h: any) => {
        if (typeof h === "string") {
          html += `<div class="hours-row"><span>Hours</span><span>${escapeHtml(h)}</span></div>`;
        } else if (h && typeof h === "object") {
          html += `<div class="hours-row"><span>${escapeHtml(h.days || h.label || "")}</span><span>${escapeHtml(h.time || h.value || "")}</span></div>`;
        }
      });
      html += `</div>`;
    }
  }

  // =========================================================================
  // 5. CONTACT & DYNAMIC LINKS LIST (Get in touch)
  // =========================================================================
  if (contactLinks.length > 0) {
    html += `<h2 class="section-title">Get in touch</h2><div class="contact-list">`;
    contactLinks.forEach((link) => {
      const dest = formatLinkDestination(link.type, link.value);
      if (!dest) return;
      const isExternal = link.type !== "phone" && link.type !== "email";
      const displayVal = getDisplayValue(link.type, link.value, link.label);

      html += `
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
    html += `</div>`;
  }

  // =========================================================================
  // 6. SOCIAL MEDIA GRID (Connect)
  // =========================================================================
  if (socialLinks.length > 0) {
    html += `<h2 class="section-title">Connect</h2><div class="social-grid">`;
    socialLinks.forEach((link) => {
      const dest = formatLinkDestination(link.type, link.value);
      if (!dest) return;
      html += `
        <a href="${dest}" target="_blank" rel="noopener noreferrer" class="social-item" aria-label="${escapeHtml(link.label)}">
          ${getLinkIconSvg(link.type, 20)}
          <span>${escapeHtml(link.label)}</span>
        </a>
      `;
    });
    html += `</div>`;
  }

  // =========================================================================
  // 7. SECONDARY QUICK ACTIONS (QR + Share)
  // =========================================================================
  html += `
    <div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
      <button type="button" class="cta-btn cta-btn-secondary" id="showQrBtn" style="min-width: 130px; font-size: 12.5px;" aria-label="Show scannable QR Code">
        ${getLinkIconSvg("qr", 15)}
        <span>Show QR</span>
      </button>
      <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" style="min-width: 130px; font-size: 12.5px;" aria-label="Share digital card">
        ${getLinkIconSvg("share", 15)}
        <span>Share Card</span>
      </button>
    </div>
  `;

  // =========================================================================
  // 8. BRAND WATERMARK FOOTER
  // =========================================================================
  html += `
    <footer class="card-footer">
      <a href="https://ambrosstudio.com" target="_blank" rel="noopener noreferrer">
        Ambros Studio &bull; Digital Identity
      </a>
    </footer>
  `;

  return html;
}

export function renderCardHtml(card: ResolvedCustomerCard, options: { isPreview?: boolean } = {}): string {
  const design = resolveCardDesign(card.cardDesign);
  if (design.id === "mahadev-spa") {
    return renderCompleteMahadevSpaHtml(card, options);
  }
  if (design.id === "ambros-flagship") {
    return renderCompleteAmbrosFlagshipHtml(card, options);
  }
  const name = card.fullName || "Ambros Studio";
  const role = card.designation || "";
  const company = card.company || "";
  const desc = card.description || "";
  const title = `${name} — ${role ? role + " | " : ""}${company || "Ambros Studio"}`;

  const appearance = (card.customSettings && card.customSettings.appearance) ? card.customSettings.appearance : {};
  // Avoid leaking Mint Haven default pastel colors into non-mint canonical designs
  const isDefaultMint = (appearance.backgroundColor === "#faf6ee" || appearance.primaryColor === "#10b981") && design.id !== "mint-haven";
  const primaryColor = (!isDefaultMint && appearance.primaryColor) ? appearance.primaryColor : design.theme.primaryColor;
  const bgColor = (!isDefaultMint && appearance.backgroundColor) ? appearance.backgroundColor : design.theme.backgroundColor;
  const textColor = (!isDefaultMint && appearance.textColor) ? appearance.textColor : design.theme.textColor;
  const fontFamily = appearance.fontFamily || design.theme.fontFamily;

  const fontQuery = design.theme.fontUrl ? `<link rel="stylesheet" href="${design.theme.fontUrl}">` : "";
  const innerBody = renderCardBody(card, design);

  return `<!DOCTYPE html>
<html lang="en" class="theme-${design.id}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc || title)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${fontQuery}
  <link rel="stylesheet" href="/cards/card-themes.css?v=2.1">
  <style id="__THEME_OVERRIDES__">
    :root {
      ${primaryColor ? `--card-primary: ${primaryColor};` : ""}
      ${bgColor ? `--card-background: ${bgColor};` : ""}
      ${textColor ? `--card-text: ${textColor};` : ""}
      ${fontFamily ? `--card-font: '${fontFamily}', system-ui, sans-serif;` : ""}
    }
  </style>
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
    ${innerBody}
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

  <script src="/cards/design-registry.js?v=2.1" defer></script>
  ${options.isPreview ? `
    <script src="/cards/card-renderer.js?v=2.1" defer></script>
  ` : ""}
  <script src="/cards/qrcode.js?v=2.1" defer></script>
  <script src="/cards/card-loader.js?v=2.1" defer></script>
</body>
</html>`;
}
