/**
 * Ambros Studio — Universal Digital Card Renderer (Browser Client)
 * 
 * Renders all 16 canonical designs from ONE authoritative customer object:
 *   - Personal (6): Mint Haven, Evergreen, Noir Gold, Emerald Ivory, Neon Pulse, Mono Studio
 *   - Business (6): Classic Navy, Fresh Mint, Bold Pop, Bento Grid, Glass Aurora, Luxe Foil
 *   - Industry Specials (4): Skyline, Atelier, Care Plus, Roast & Co.
 * 
 * Production-ready visual excellence, zero cross-customer leaks, fully accessible.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./design-registry.js'));
  } else {
    root.CARD_RENDERER = factory(root.CARD_DESIGN_REGISTRY);
  }
})(typeof self !== 'undefined' ? self : this, function (designRegistry) {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getInitials(name) {
    if (!name) return 'AS';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return String(name).slice(0, 2).toUpperCase();
  }

  function cleanPhone(val) {
    if (!val) return '';
    return String(val).replace(/[^0-9+]/g, '');
  }

  function cleanDigits(val) {
    if (!val) return '';
    return String(val).replace(/\D/g, '');
  }

  function cleanDisplayUrl(val) {
    if (!val) return '';
    return String(val).trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }

  const ALLOWED_LINK_TYPES = [
    'whatsapp', 'phone', 'email', 'website', 'instagram',
    'facebook', 'linkedin', 'youtube', 'twitter', 'telegram', 'maps', 'custom'
  ];

  function formatLinkDestination(type, rawValue) {
    if (!rawValue || typeof rawValue !== 'string') return null;
    const val = rawValue.trim();
    if (!val) return null;

    const lower = val.toLowerCase().replace(/[\x00-\x20]/g, '');
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('file:') ||
      lower.startsWith('blob:')
    ) {
      return null;
    }

    switch (type) {
      case 'whatsapp': {
        if (val.startsWith('https://wa.me/') || val.startsWith('http://wa.me/')) {
          return val.replace('http://', 'https://');
        }
        const digits = val.replace(/\D/g, '');
        return digits ? `https://wa.me/${digits}` : null;
      }
      case 'phone': {
        const cleaned = val.replace(/[^0-9+]/g, '');
        return cleaned ? `tel:${cleaned}` : null;
      }
      case 'email': {
        const email = val.replace(/^mailto:/i, '').trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : null;
      }
      case 'maps': {
        if (val.startsWith('https://maps.google.com') || val.startsWith('https://goo.gl/maps') || val.startsWith('https://www.google.com/maps')) {
          return val;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(val)}`;
      }
      case 'website':
      case 'instagram':
      case 'facebook':
      case 'linkedin':
      case 'youtube':
      case 'twitter':
      case 'x':
      case 'telegram':
      case 'github':
      case 'custom':
      default: {
        let target = val.trim();
        if (!/^https?:\/\//i.test(target)) {
          if (type === 'instagram') {
            if (/^instagram\.com/i.test(target)) target = `https://${target}`;
            else target = `https://www.instagram.com/${target.replace(/^@/, '').replace(/^\/+/, '')}`;
          } else if (type === 'facebook') {
            if (/^(?:facebook|fb)\.com/i.test(target)) target = `https://${target}`;
            else target = `https://www.facebook.com/${target.replace(/^@/, '').replace(/^\/+/, '')}`;
          } else if (type === 'linkedin') {
            if (/^linkedin\.com/i.test(target)) target = `https://${target}`;
            else if (/^(?:in|company|school)\//i.test(target)) target = `https://www.linkedin.com/${target}`;
            else target = `https://www.linkedin.com/in/${target.replace(/^@/, '').replace(/^\/+/, '')}`;
          } else if (type === 'twitter' || type === 'x') {
            if (/^(?:twitter|x)\.com/i.test(target)) target = `https://${target}`;
            else target = `https://x.com/${target.replace(/^@/, '').replace(/^\/+/, '')}`;
          } else if (type === 'youtube') {
            if (/^(?:youtube\.com|youtu\.be)/i.test(target)) target = `https://${target}`;
            else if (target.startsWith('@')) target = `https://www.youtube.com/${target}`;
            else target = `https://${target}`;
          } else if (type === 'telegram') {
            if (/^(?:t\.me|telegram\.me)/i.test(target)) target = `https://${target}`;
            else target = `https://t.me/${target.replace(/^@/, '').replace(/^\/+/, '')}`;
          } else {
            target = `https://${target}`;
          }
        }
        try {
          const parsed = new URL(target);
          if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            return target;
          }
        } catch (_) {
          return null;
        }
        return null;
      }
    }
  }

  function normalizeDestinationKey(type, url) {
    if (!url) return '';
    let clean = url.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//i, '').replace(/^mailto:/i, '').replace(/^tel:/i, '');
    clean = clean.replace(/^www\./i, '');
    clean = clean.replace(/\/+$/, '');
    return `${type}:${clean}`;
  }

  function getDefaultLabel(type) {
    const map = {
      whatsapp: 'WhatsApp',
      phone: 'Call Directly',
      email: 'Email',
      website: 'Website',
      instagram: 'Instagram',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      twitter: 'X / Twitter',
      telegram: 'Telegram',
      github: 'GitHub',
      maps: 'Directions / Office',
      custom: 'Link'
    };
    return map[type] || 'Link';
  }

  function getDisplayValue(type, rawVal, label) {
    if (!rawVal) return label || '';
    const val = rawVal.trim();
    if (type === 'phone' || type === 'whatsapp') return val;
    if (type === 'email') return val.replace(/^mailto:/i, '');
    if (type === 'website' || type === 'custom') return val.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (type === 'instagram') {
      const match = val.match(/instagram\.com\/([^/?#]+)/i);
      return match ? `@${match[1]}` : (val.startsWith('@') ? val : `@${val}`);
    }
    if (type === 'facebook') {
      const match = val.match(/(?:facebook|fb)\.com\/([^/?#]+)/i);
      return match ? match[1] : val.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }
    if (type === 'twitter' || type === 'x') {
      const match = val.match(/(?:twitter|x)\.com\/([^/?#]+)/i);
      return match ? `@${match[1]}` : (val.startsWith('@') ? val : `@${val}`);
    }
    if (type === 'telegram') {
      const match = val.match(/t\.me\/([^/?#]+)/i);
      const identifier = match ? match[1] : val;
      return identifier.replace(/^@/, '');
    }
    if (type === 'linkedin') {
      const match = val.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/i);
      return match ? match[1] : val.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }
    if (type === 'youtube') {
      const match = val.match(/youtube\.com\/(@[^/?#]+)/i);
      return match ? match[1] : 'YouTube Channel';
    }
    if (type === 'github') {
      const match = val.match(/github\.com\/([^/?#]+)/i);
      return match ? match[1] : val.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    }
    if (type === 'maps') {
      return val.startsWith('http') ? 'View on Google Maps' : val;
    }
    return val.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }

  function getLinkIconSvg(type, size = 18) {
    switch (type) {
      case 'phone':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
      case 'whatsapp':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
      case 'email':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`;
      case 'website':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
      case 'instagram':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
      case 'facebook':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`;
      case 'linkedin':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
      case 'youtube':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`;
      case 'twitter':
      case 'x':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`;
      case 'telegram':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
      case 'github':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
      case 'maps':
      case 'directions':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      case 'calendar':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
      case 'share':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
      case 'qr':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
      case 'contact':
      default:
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>`;
    }
  }

  const SOCIAL_TYPES = new Set([
    'website',
    'instagram',
    'facebook',
    'linkedin',
    'youtube',
    'twitter',
    'x',
    'telegram',
    'github',
    'tiktok',
    'threads',
    'pinterest'
  ]);

  function hasText(val) {
    return typeof val === 'string' && val.trim().length > 0;
  }

  /**
   * Resolves links from customer customSettings AND dedicated direct fields with deduplication.
   */
  function resolveCustomerLinks(card) {
    const result = [];
    const seenKeys = new Set();

    const addLinkIfValid = (type, label, rawVal, order, isCustom = false) => {
      if (!hasText(rawVal)) return;
      const val = rawVal.trim();
      const dest = formatLinkDestination(type, val);
      if (!dest) return;
      const key = normalizeDestinationKey(type, dest);
      if (key && seenKeys.has(key)) return;
      if (key) seenKeys.add(key);

      result.push({
        type: type.toLowerCase(),
        label: hasText(label) ? label.trim() : getDefaultLabel(type),
        value: val,
        order: typeof order === 'number' ? order : result.length,
        isCustom,
      });
    };

    // 1. Dedicated core fields
    const phoneVal = card.phone || card.mobile_number;
    if (hasText(phoneVal)) {
      addLinkIfValid('phone', 'Phone', phoneVal, 0);
    }
    const waVal = card.whatsapp || card.whatsapp_number;
    if (hasText(waVal)) {
      addLinkIfValid('whatsapp', 'WhatsApp', waVal, 1);
    }
    if (hasText(card.email)) {
      addLinkIfValid('email', 'Email', card.email, 2);
    }
    if (hasText(card.website)) {
      addLinkIfValid('website', 'Website', card.website, 3);
    }
    const igVal = card.socialInstagram || card.instagram_url;
    if (hasText(igVal)) {
      addLinkIfValid('instagram', 'Instagram', igVal, 4);
    }
    const liVal = card.socialLinkedIn || card.linkedin_url;
    if (hasText(liVal)) {
      addLinkIfValid('linkedin', 'LinkedIn', liVal, 5);
    }
    const addrVal = card.address || card.business_address;
    if (hasText(addrVal)) {
      addLinkIfValid('maps', 'Directions', addrVal, 6);
    }

    // 2. Custom links from customSettings.links
    const custom = card.customSettings || card.custom_settings;
    if (custom && Array.isArray(custom.links)) {
      custom.links.forEach((l, idx) => {
        if (!l || l.enabled === false || !hasText(l.value)) return;
        const type = (l.type || 'custom').toLowerCase();
        const defaultOrder = 10 + idx;
        const order = typeof l.order === 'number' ? l.order : defaultOrder;
        const label = hasText(l.label) ? l.label : getDefaultLabel(type);
        addLinkIfValid(type, label, l.value, order, true);
      });
    }

    return result.sort((a, b) => a.order - b.order);
  }

  function renderRaftconLuxuryBody(card) {
    const custom = card.customSettings || card.custom_settings || {};
    const ind = (custom.industry && custom.industry.data && typeof custom.industry.data === 'object') ? custom.industry.data : {};
    
    const name = hasText(card.fullName || card.full_name) ? (card.fullName || card.full_name).trim() : '';
    const phone = hasText(card.phone || card.mobile_number) ? (card.phone || card.mobile_number).trim() : '';
    const whatsapp = hasText(card.whatsapp || card.whatsapp_number) ? (card.whatsapp || card.whatsapp_number).trim() : '';
    const email = hasText(card.email) ? card.email.trim() : '';
    const bio = hasText(card.description) ? card.description.trim() : '';

    // Contacts
    let contacts = [];
    if (Array.isArray(ind.contacts) && ind.contacts.length > 0) {
      contacts = ind.contacts.filter(c => c && (hasText(c.name) || hasText(c.phone) || hasText(c.phone_display)));
    } else if (name || phone) {
      contacts = [{
        name: name || 'Contact',
        phone: phone,
        rawPhone: phone ? cleanPhone(phone) : ''
      }];
    }

    const metrics = Array.isArray(ind.metrics) ? ind.metrics.filter(m => m && hasText(m.value)) : [];
    const heroMetric = (ind.heroMetric && hasText(ind.heroMetric.value)) ? ind.heroMetric : null;
    const services = Array.isArray(ind.services) ? ind.services.filter(hasText) : [];
    const servicesSummary = hasText(ind.servicesSummary) ? ind.servicesSummary.trim() : '';
    const projects = Array.isArray(ind.projects) ? ind.projects.filter(p => p && hasText(p.name)) : [];
    const safetyText = hasText(ind.safety) ? ind.safety.trim() : '';
    const missionText = hasText(ind.mission) ? ind.mission.trim() : '';
    const footerQuote = hasText(ind.footerQuote) ? ind.footerQuote.trim() : '';
    const brochureUrl = hasText(ind.brochureUrl) ? ind.brochureUrl.trim() : '';
    const officePhone = hasText(ind.officePhone) ? ind.officePhone.trim() : phone;
    const rawOfficePhone = officePhone ? cleanPhone(officePhone) : '';
    const waDest = whatsapp ? cleanDigits(whatsapp) : '';

    let html = `
      <!-- Raftcon Approved Brand Header -->
      <header class="raftcon-header raftcon-reveal">
        <img src="${escapeHtml(card.avatarUrl || card.avatar_url || '/assets/brochures/raftcon-brand-logo.png')}" alt="${escapeHtml(name || 'Raftcon Construction')}" class="raftcon-brand-logo-img" />
      </header>
    `;

    // Contact Section (Only render if there are contacts or actions)
    if (contacts.length > 0 || waDest || email || rawOfficePhone) {
      html += `
        <div class="raftcon-reveal">
          <div class="raftcon-section-eyebrow">C O N T A C T</div>
          <div class="raftcon-contact-list">
      `;

      contacts.forEach(c => {
        const displayPhone = c.phone || c.phone_display || '';
        const rawNum = c.rawPhone || cleanPhone(displayPhone);
        html += `
            <div class="raftcon-contact-card">
              <div class="raftcon-contact-meta">
                <span class="raftcon-contact-name">${escapeHtml(c.name || '')}</span>
                ${displayPhone ? `<span class="raftcon-contact-phone">${escapeHtml(displayPhone)}</span>` : ''}
              </div>
              ${rawNum ? `
                <a href="tel:${rawNum}" class="raftcon-call-circle" aria-label="Call ${escapeHtml(c.name)}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f1e1c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </a>
              ` : ''}
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
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
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
      const aboutTitle = name ? name.replace(/\s*(?:Construction|Developer|Pvt|Ltd).*$/i, '') || name : 'Company';
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
        metrics.forEach(m => {
          html += `
            <div class="raftcon-metric-card">
              <div class="raftcon-metric-num">${escapeHtml(m.value)}</div>
              <div class="raftcon-metric-label">${escapeHtml(m.label || '')}</div>
            </div>
          `;
        });
        html += `</div>`;
      }
      if (heroMetric) {
        html += `
          <div class="raftcon-hero-metric-card">
            <div class="raftcon-hero-metric-num">${escapeHtml(heroMetric.value)}</div>
            <div class="raftcon-hero-metric-label">${escapeHtml(heroMetric.label || '')}</div>
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
      services.forEach(s => {
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
      projects.forEach(p => {
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
              ${p.meta ? `<div class="raftcon-project-meta">${escapeHtml(p.meta)}</div>` : ''}
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
    const raftconSocialLinks = allRaftconLinks.filter(l => SOCIAL_TYPES.has(l.type) || l.isCustom);
    if (raftconSocialLinks.length > 0) {
      html += `
        <div class="raftcon-reveal" style="margin-top: 20px; text-align: center;">
          <div class="raftcon-section-eyebrow" style="margin-bottom: 12px;">C O N N E C T</div>
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            ${raftconSocialLinks.map(l => {
              const dest = formatLinkDestination(l.type, l.value);
              if (!dest) return '';
              return `<a href="${dest}" target="_blank" rel="noopener noreferrer" style="width: 44px; height: 44px; border-radius: 50%; background: #262523; border: 1px solid rgba(255, 224, 181, 0.25); display: inline-flex; align-items: center; justify-content: center; color: #ffe0b5; text-decoration: none; transition: transform 0.2s;" aria-label="${escapeHtml(l.label)}">${getLinkIconSvg(l.type, 18)}</a>`;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 24px;">
          <button type="button" class="cta-btn cta-btn-secondary" id="showQrBtn" style="min-width: 130px; font-size: 12.5px; background: #18191e; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1);" aria-label="Show QR Code">
            ${getLinkIconSvg('qr', 15)}
            <span>Show QR</span>
          </button>
          <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" style="min-width: 130px; font-size: 12.5px; background: #18191e; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1);" aria-label="Share profile">
            ${getLinkIconSvg('share', 15)}
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

  function renderAtgStudyAbroadBody(card) {
    const custom = card.customSettings || card.custom_settings || {};
    const ind = (custom.industry && custom.industry.data && typeof custom.industry.data === 'object') ? custom.industry.data : {};
    const visibility = ind.sectionVisibility || {};

    const isAtgDemo = (card.profileSlug || card.profile_slug) === 'atgstudyabroad' || (card.profileSlug || card.profile_slug) === 'aamirshaikh';
    const name = hasText(card.fullName || card.full_name || card.name) ? (card.fullName || card.full_name || card.name).trim() : (isAtgDemo ? 'Aamir Shaikh' : '');
    const role = hasText(card.designation || card.role) ? (card.designation || card.role).trim() : (isAtgDemo ? 'Founder, ATG Study Abroad' : '');
    const tagline = hasText(ind.tagline) ? ind.tagline.trim() : (isAtgDemo ? 'On a mission, with a vision' : '');
    const bio = hasText(ind.aboutText) ? ind.aboutText.trim() : (hasText(card.description || card.bio) ? (card.description || card.bio).trim() : (isAtgDemo ? 'Across The Globe helps students study abroad with admissions and visa support for the UK, Australia, Dubai, Canada and Europe. More than 4,000 students have been guided by the team, from choosing a course to landing the visa.' : ''));
    const phone = hasText(card.phone || card.mobile_number) ? (card.phone || card.mobile_number).trim() : (isAtgDemo ? '+91 98989 79548' : '');
    const whatsapp = hasText(card.whatsapp || card.whatsapp_number) ? (card.whatsapp || card.whatsapp_number).trim() : (isAtgDemo ? '919898979548' : '');
    const email = hasText(card.email) ? card.email.trim() : (isAtgDemo ? 'info@atgstudyabroad.com' : '');
    const instagram = hasText(card.socialInstagram || card.social_instagram) ? (card.socialInstagram || card.social_instagram).trim() : (isAtgDemo ? '@atgstudyabroad' : '');
    const avatarUrl = hasText(card.avatarUrl || card.avatar_url || card.profile_image_url) ? (card.avatarUrl || card.avatar_url || card.profile_image_url).trim() : '';

    const phoneDest = phone ? `tel:${cleanPhone(phone)}` : '';
    const waDigits = whatsapp ? cleanDigits(whatsapp) : (isAtgDemo ? '919898979548' : '');
    const waDest = waDigits ? `https://wa.me/${waDigits}` : '';
    const emailDest = email ? `mailto:${email}` : '';
    const instaDest = instagram ? (instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace(/^@/, '')}`) : '';

    // Metrics
    const defaultMetrics = [
      { value: '4,000+', label: 'Students guided' },
      { value: '5+', label: 'Study destinations' },
      { value: '5+', label: 'Test prep courses' }
    ];
    const metrics = (Array.isArray(ind.metrics) && ind.metrics.length > 0) ? ind.metrics : defaultMetrics;

    // CTAs
    const ctaPrimaryText = ind.ctaPrimary?.text || (isAtgDemo ? 'Find out which country suits you' : '');
    const ctaPrimaryUrl = ind.ctaPrimary?.url || (waDigits ? `https://wa.me/${waDigits}?text=Hi%2C%20I%20want%20to%20find%20out%20which%20country%20suits%20me%20for%20study%20abroad` : '');
    const ctaWhatsAppText = ind.ctaWhatsApp?.text || (isAtgDemo ? 'Chat on WhatsApp for instant guidance' : '');
    const ctaWhatsAppUrl = ind.ctaWhatsApp?.url || waDest;

    // Destinations
    const defaultDestinations = isAtgDemo ? [
      { code: 'CA', title: 'Study in Canada', sub: 'Courses, eligibility and intakes', url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20Canada` },
      { code: 'UK', title: 'Study in the UK', sub: 'Top universities and scholarships', url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20the%20UK` },
      { code: 'AU', title: 'Study in Australia', sub: 'Eligibility, courses and universities', url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20Australia` },
      { code: 'EU', title: 'Study in Europe', sub: 'Low-tuition and English programs', url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20Europe` },
      { code: 'AE', title: 'Study in Dubai', sub: 'Programs and admissions', url: `https://wa.me/${waDigits}?text=Tell%20me%20about%20Study%20in%20Dubai` }
    ] : [];
    const destinationsTitle = ind.destinationsTitle || 'Popular study destinations';
    const destinations = (Array.isArray(ind.destinations) && ind.destinations.length > 0) ? ind.destinations : defaultDestinations;

    // Test Prep
    const testPrepTitle = ind.testPrepTitle || 'Test preparation';
    const coachingHeading = ind.coachingHeading || 'Book a coaching class for';
    const coachingCourses = (Array.isArray(ind.coachingCourses) && ind.coachingCourses.length > 0) ? ind.coachingCourses : (isAtgDemo ? ['IELTS', 'PTE', 'CELPIP', 'TOEFL', 'GRE'] : []);
    const coachingCtaText = ind.coachingCta?.text || (isAtgDemo ? 'Book coaching class' : '');
    const coachingCtaUrl = ind.coachingCta?.url || (waDigits ? `https://wa.me/${waDigits}?text=I%20would%20like%20to%20book%20a%20test%20prep%20coaching%20class` : '');

    const defaultBatches = isAtgDemo ? [
      { title: 'Basic English class', sub: 'Join the next batch', url: `https://wa.me/${waDigits}?text=Inquiry%20for%20Basic%20English%20class` },
      { title: 'Study + Work', sub: 'Russia, Singapore, Mauritius, Canada', url: `https://wa.me/${waDigits}?text=Inquiry%20for%20Study%20and%20Work%20programs` }
    ] : [];
    const batches = (Array.isArray(ind.testPrepBatches) && ind.testPrepBatches.length > 0) ? ind.testPrepBatches : defaultBatches;

    // Free Guides
    const defaultGuides = isAtgDemo ? [
      { title: '7 things to get right before you apply abroad', sub: 'Free guide', buttonText: 'Download', url: `https://wa.me/${waDigits}?text=Please%20send%20me%20the%20Free%20Guide:%207%20things%20to%20get%20right%20before%20you%20apply%20abroad` },
      { title: 'CELPIP Writing Masterbook', sub: 'Task strategies', buttonText: 'Download', url: `https://wa.me/${waDigits}?text=Please%20send%20me%20the%20CELPIP%20Writing%20Masterbook` }
    ] : [];
    const freeGuidesTitle = ind.freeGuidesTitle || 'Free guides';
    const freeGuides = (Array.isArray(ind.freeGuides) && ind.freeGuides.length > 0) ? ind.freeGuides : defaultGuides;

    // About Section
    const aboutTitle = ind.aboutTitle || 'About ATG Study Abroad';

    // Contact
    const contactTitle = ind.contactTitle || 'Get in touch';

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
          ${role ? `<div class="atg-role">${escapeHtml(role)}</div>` : ''}
          ${tagline ? `<div class="atg-tagline">${escapeHtml(tagline)}</div>` : ''}
        </section>

        <!-- Key Metrics Bar -->
        ${visibility.stats !== false && metrics.length > 0 ? `
          <section class="atg-metrics-bar">
            ${metrics.map((m, idx) => `
              <div class="atg-metric-col ${idx < metrics.length - 1 ? 'has-divider' : ''}">
                <div class="atg-metric-val">${escapeHtml(m.value || '')}</div>
                <div class="atg-metric-lbl">${escapeHtml(m.label || '')}</div>
              </div>
            `).join('')}
          </section>
        ` : ''}

        <!-- Action Buttons -->
        <section class="atg-actions">
          ${ctaPrimaryText && ctaPrimaryUrl ? `
            <a href="${escapeHtml(ctaPrimaryUrl)}" target="_blank" rel="noopener noreferrer" class="atg-btn-lime">
              <span>${escapeHtml(ctaPrimaryText)}</span>
            </a>
          ` : ''}
          ${ctaWhatsAppText && ctaWhatsAppUrl ? `
            <a href="${escapeHtml(ctaWhatsAppUrl)}" target="_blank" rel="noopener noreferrer" class="atg-btn-black">
              <span>${escapeHtml(ctaWhatsAppText)}</span>
            </a>
          ` : ''}
          <div class="atg-btn-pair">
            ${phoneDest ? `
              <a href="${phoneDest}" class="atg-btn-white">
                <span>Call</span>
              </a>
            ` : ''}
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
              ${destinations.map(d => {
                const dUrl = d.url || waDest || '#';
                return `
                <a href="${escapeHtml(dUrl)}" ${dUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="atg-dest-row">
                  <div class="atg-dest-badge">${escapeHtml(d.code || 'GL')}</div>
                  <div class="atg-dest-info">
                    <div class="atg-dest-title">${escapeHtml(d.title || '')}</div>
                    <div class="atg-dest-sub">${escapeHtml(d.sub || '')}</div>
                  </div>
                  <span class="atg-chevron" aria-hidden="true">&rsaquo;</span>
                </a>
              `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Test Preparation -->
        ${visibility.testPrep !== false && (coachingCourses.length > 0 || batches.length > 0) ? `
          <section class="atg-section">
            <div class="atg-accent-bar"></div>
            <h2 class="atg-section-heading">${escapeHtml(testPrepTitle)}</h2>
            
            ${coachingCourses.length > 0 ? `
              <div class="atg-coaching-box">
                <div class="atg-coaching-lbl">${escapeHtml(coachingHeading)}</div>
                <div class="atg-course-tags">
                  ${coachingCourses.map(c => `
                    <span class="atg-course-tag">${escapeHtml(c)}</span>
                  `).join('')}
                </div>
                ${coachingCtaText && coachingCtaUrl ? `
                  <a href="${escapeHtml(coachingCtaUrl)}" target="_blank" rel="noopener noreferrer" class="atg-btn-lime" style="margin-top: 14px;">
                    <span>${escapeHtml(coachingCtaText)}</span>
                  </a>
                ` : ''}
              </div>
            ` : ''}

            ${batches.length > 0 ? `
              <div class="atg-batches-list" style="margin-top: 10px;">
                ${batches.map(b => {
                  const bUrl = b.url || waDest || '#';
                  return `
                  <a href="${escapeHtml(bUrl)}" ${bUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="atg-batch-row">
                    <span class="atg-batch-title">${escapeHtml(b.title || '')}</span>
                    <span class="atg-batch-sub">${escapeHtml(b.sub || '')}</span>
                  </a>
                `;
                }).join('')}
              </div>
            ` : ''}
          </section>
        ` : ''}

        <!-- Free Guides -->
        ${visibility.guides !== false && freeGuides.length > 0 ? `
          <section class="atg-section">
            <div class="atg-accent-bar"></div>
            <h2 class="atg-section-heading">${escapeHtml(freeGuidesTitle)}</h2>
            <div class="atg-guides-list">
              ${freeGuides.map(g => {
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
                      <div class="atg-guide-title">${escapeHtml(g.title || '')}</div>
                      <div class="atg-guide-sub">${escapeHtml(g.sub || 'Free guide')}</div>
                    </div>
                  </div>
                  <a href="${escapeHtml(gUrl)}" ${gUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="atg-guide-btn">
                    <span>${escapeHtml(g.buttonText || 'Download')}</span>
                  </a>
                </div>
              `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        <!-- About ATG Study Abroad -->
        ${visibility.about !== false && bio ? `
          <section class="atg-section">
            <div class="atg-accent-bar"></div>
            <h2 class="atg-section-heading">${escapeHtml(aboutTitle)}</h2>
            <div class="atg-about-box">
              <p>${escapeHtml(bio)}</p>
            </div>
          </section>
        ` : ''}

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
              ` : ''}

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
              ` : ''}

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
              ` : ''}

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
              ` : ''}
            </div>

            <!-- Social & Digital Presence Icon Row -->
            ${(() => {
              const allLinks = resolveCustomerLinks(card);
              const iconLinks = allLinks.filter(l => ['website', 'instagram', 'facebook', 'linkedin', 'whatsapp', 'email', 'youtube', 'twitter', 'x'].includes(l.type) || l.isCustom);
              if (iconLinks.length === 0) return '';
              return `
                <div class="atg-social-icon-row" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                  ${iconLinks.map(l => {
                    const dest = formatLinkDestination(l.type, l.value);
                    if (!dest) return '';
                    const isExt = l.type !== 'phone' && l.type !== 'email';
                    return `<a href="${dest}" ${isExt ? 'target="_blank" rel="noopener noreferrer"' : ''} class="atg-social-square" aria-label="${escapeHtml(l.label)}">${getLinkIconSvg(l.type, 18)}</a>`;
                  }).join('')}
                </div>
              `;
            })()}

            <!-- Bottom Action Pair: Share card + Share QR -->
            <div class="atg-bottom-actions">
              <button type="button" class="atg-btn-white" id="shareCardBtn">Share card</button>
              <button type="button" class="atg-btn-lime" id="showQrBtn">Share QR</button>
            </div>
          </section>
        ` : ''}

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

  function renderSpiceRouteBody(card) {
    const custom = card.customSettings || card.custom_settings || {};
    const ind = (custom.industry && custom.industry.data && typeof custom.industry.data === 'object') ? custom.industry.data : {};
    const visibility = ind.sectionVisibility || {};

    const isSpiceDemo = (card.profileSlug || card.profile_slug) === 'spiceroute';
    const overline = hasText(ind.overline) ? ind.overline.trim() : (isSpiceDemo ? '— Family restaurant —' : '');
    const restaurantName = hasText(ind.restaurantName) ? ind.restaurantName.trim() : (hasText(card.fullName || card.full_name || card.name) ? (card.fullName || card.full_name || card.name).trim() : (isSpiceDemo ? 'Spice Route' : ''));
    const tagline = hasText(ind.tagline) ? ind.tagline.trim() : (hasText(card.description || card.bio) ? (card.description || card.bio).trim() : (isSpiceDemo ? 'Slow-cooked Gujarati and North Indian food, made fresh every day.' : ''));
    const phone = hasText(card.phone || card.mobile_number) ? (card.phone || card.mobile_number).trim() : (isSpiceDemo ? '+91 98765 43210' : '');
    const whatsapp = hasText(card.whatsapp || card.whatsapp_number) ? (card.whatsapp || card.whatsapp_number).trim() : (isSpiceDemo ? '919876543210' : '');
    const email = hasText(card.email) ? card.email.trim() : (isSpiceDemo ? 'hello@spiceroute.com' : '');
    const instagram = hasText(card.socialInstagram || card.social_instagram) ? (card.socialInstagram || card.social_instagram).trim() : (isSpiceDemo ? '@spiceroute' : '');

    const phoneDest = phone ? `tel:${cleanPhone(phone)}` : '';
    const waDigits = whatsapp ? cleanDigits(whatsapp) : (isSpiceDemo ? '919876543210' : '');
    const waDest = waDigits ? `https://wa.me/${waDigits}` : '';
    const emailDest = email ? `mailto:${email}` : '';
    const instaDest = instagram ? (instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace(/^@/, '')}`) : '';

    // Badges
    const badges = (Array.isArray(ind.badges) && ind.badges.length > 0) ? ind.badges : ['Open till 11 pm', '★ 4.5', 'Family seating'];

    // Quick Action Buttons
    const defaultActions = isSpiceDemo ? [
      { label: 'View menu', type: 'menu', url: '#menu' },
      { label: 'Book a table', type: 'book', url: `https://wa.me/${waDigits}?text=I%20would%20like%20to%20book%20a%20table%20at%20Spice%20Route` },
      { label: 'Order on WhatsApp', type: 'whatsapp', url: `https://wa.me/${waDigits}?text=Hi%2C%20I%20want%20to%20place%20a%20food%20order` },
      { label: 'Directions', type: 'directions', url: `https://maps.google.com/?q=Spice+Route+Restaurant` }
    ] : [];
    const quickActions = (Array.isArray(ind.quickActions) && ind.quickActions.length > 0) ? ind.quickActions : defaultActions;

    // Chef's signatures
    const defaultMenu = isSpiceDemo ? [
      { name: 'Paneer Lababdar', desc: 'Creamy tomato gravy, house butter', price: '₹320', isVeg: true },
      { name: 'Dal Tadka Special', desc: 'Smoked and finished with ghee', price: '₹220', isVeg: true },
      { name: 'Chicken Dum Biryani', desc: 'Slow-cooked, served with raita', price: '₹360', isVeg: false },
      { name: 'Kesar Phirni', desc: 'Saffron, set in clay', price: '₹140', isVeg: true }
    ] : [];
    const menuTitle = ind.menuTitle || "Chef's signatures";
    const menuItems = (Array.isArray(ind.menuItems) && ind.menuItems.length > 0) ? ind.menuItems : defaultMenu;

    // Dining options
    const diningOptionsTitle = ind.diningOptionsTitle || 'Dining options';
    const diningOptions = (Array.isArray(ind.diningOptions) && ind.diningOptions.length > 0) ? ind.diningOptions : ['Dine-in', 'Takeaway', 'Home delivery', 'Family seating', 'Private events', 'Parking'];

    // Opening hours
    const hoursTitle = ind.hoursTitle || 'Opening hours';
    const defaultHours = [
      { label: 'Lunch', time: '12 pm to 3 pm' },
      { label: 'Dinner', time: '7 pm to 11 pm' },
      { label: 'Saturday and Sunday', time: '12 pm to 11:30 pm' }
    ];
    const hoursList = (Array.isArray(ind.hoursList) && ind.hoursList.length > 0) ? ind.hoursList : defaultHours;
    const hoursNotice = ind.hoursNotice || 'Tables for six or more: please book a day ahead.';

    // Guest reviews
    const reviewsTitle = ind.reviewsTitle || 'Guest reviews';
    const defaultReviews = [
      { quote: 'Food tastes like home. The dal tadka is the best in the city.', author: 'Guest Name' },
      { quote: 'Warm service and delicious family dining experience.', author: 'Guest Name' }
    ];
    const reviews = (Array.isArray(ind.reviews) && ind.reviews.length > 0) ? ind.reviews : defaultReviews;

    // Contact section
    const contactTitle = ind.contactTitle || 'Get in touch';

    let html = `
      <div class="spice-card-wrapper">
        <!-- Dark Espresso Header with Terracotta Border -->
        <header class="spice-header">
          <div class="spice-overline">${escapeHtml(overline)}</div>
          <h1 class="spice-title">${escapeHtml(restaurantName)}</h1>
          <p class="spice-subtitle">${escapeHtml(tagline)}</p>

          <div class="spice-badges-row">
            ${badges.map(b => {
              const isDot = b.includes('Open') || b.includes('●') || b.includes('•');
              const cleanBadge = b.replace(/^[•●]\s*/, '');
              return `
                <span class="spice-badge-pill">
                  ${isDot ? `<span class="spice-badge-dot">●</span> ` : ''}${escapeHtml(cleanBadge)}
                </span>
              `;
            }).join('')}
          </div>
          <div class="spice-header-line"></div>
        </header>

        <!-- 2x2 Quick Actions Grid -->
        ${visibility.quickActions !== false && quickActions.length > 0 ? `
          <section class="spice-actions-grid">
            ${quickActions.map((act, idx) => {
              const isTerracotta = idx === 0;
              const isBlack = idx === 2;
              const btnClass = isTerracotta ? 'spice-btn-terracotta' : (isBlack ? 'spice-btn-black' : 'spice-btn-white');
              return `
                <a href="${escapeHtml(act.url || '#')}" ${act.url && act.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="${btnClass}">
                  <span>${escapeHtml(act.label || '')}</span>
                </a>
              `;
            }).join('')}
          </section>
        ` : ''}

        <!-- Chef's Signatures Menu -->
        ${visibility.menu !== false && menuItems.length > 0 ? `
          <section class="spice-section" id="menu">
            <h2 class="spice-section-heading">${escapeHtml(menuTitle)}</h2>
            <div class="spice-menu-box">
              ${menuItems.map((item, idx) => {
                const isVeg = item.isVeg !== false && item.veg !== false && !item.nonVeg;
                return `
                  <div class="spice-menu-row ${idx < menuItems.length - 1 ? 'has-divider' : ''}">
                    <div class="spice-menu-left">
                      <span class="spice-diet-icon ${isVeg ? 'veg' : 'non-veg'}" title="${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}">
                        <span class="spice-diet-dot"></span>
                      </span>
                      <div class="spice-menu-text">
                        <div class="spice-menu-name">${escapeHtml(item.name || '')}</div>
                        ${item.desc ? `<div class="spice-menu-desc">${escapeHtml(item.desc)}</div>` : ''}
                      </div>
                    </div>
                    <div class="spice-menu-price">${escapeHtml(item.price || '')}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Dining Options -->
        ${visibility.diningOptions !== false && diningOptions.length > 0 ? `
          <section class="spice-section">
            <h2 class="spice-section-heading">${escapeHtml(diningOptionsTitle)}</h2>
            <div class="spice-chips-row">
              ${diningOptions.map(opt => `
                <span class="spice-option-chip">${escapeHtml(opt)}</span>
              `).join('')}
            </div>
          </section>
        ` : ''}

        <!-- Opening Hours -->
        ${visibility.hours !== false && hoursList.length > 0 ? `
          <section class="spice-section">
            <h2 class="spice-section-heading">${escapeHtml(hoursTitle)}</h2>
            <div class="spice-hours-box">
              ${hoursList.map((h, idx) => `
                <div class="spice-hours-row ${idx < hoursList.length - 1 ? 'has-divider' : ''}">
                  <span class="spice-hours-lbl">${escapeHtml(h.label || '')}</span>
                  <span class="spice-hours-val">${escapeHtml(h.time || '')}</span>
                </div>
              `).join('')}
            </div>
            ${hoursNotice ? `<p class="spice-hours-notice">${escapeHtml(hoursNotice)}</p>` : ''}
          </section>
        ` : ''}

        <!-- Guest Reviews -->
        ${visibility.reviews !== false && reviews.length > 0 ? `
          <section class="spice-section">
            <h2 class="spice-section-heading">${escapeHtml(reviewsTitle)}</h2>
            <div class="spice-reviews-scroll">
              ${reviews.map(r => `
                <div class="spice-review-card">
                  <blockquote class="spice-review-quote">&ldquo;${escapeHtml(r.quote || '')}&rdquo;</blockquote>
                  <div class="spice-review-author">${escapeHtml(r.author || 'Guest Name')}</div>
                </div>
              `).join('')}
            </div>
          </section>
        ` : ''}

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
              ` : ''}

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
              ` : ''}

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
              ` : ''}
            </div>

            <!-- Save contact button -->
            <button type="button" class="spice-btn-save-contact" id="saveContactBtn">
              <span>Save contact</span>
            </button>

            <!-- Social & Digital Presence Icon Row -->
            ${(() => {
              const allLinks = resolveCustomerLinks(card);
              const iconLinks = allLinks.filter(l => ['website', 'instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'x'].includes(l.type) || l.isCustom);
              if (iconLinks.length === 0) return '';
              return `
                <div class="spice-social-icon-row" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                  ${iconLinks.map(l => {
                    const dest = formatLinkDestination(l.type, l.value);
                    if (!dest) return '';
                    return `<a href="${dest}" target="_blank" rel="noopener noreferrer" class="spice-social-square" aria-label="${escapeHtml(l.label)}">${getLinkIconSvg(l.type, 18)}</a>`;
                  }).join('')}
                </div>
              `;
            })()}

            <!-- Bottom Action Pair: Share card + Share QR -->
            <div class="spice-bottom-actions">
              <button type="button" class="spice-btn-white" id="shareCardBtn">Share card</button>
              <button type="button" class="spice-btn-terracotta" id="showQrBtn">Share QR</button>
            </div>
          </section>
        ` : ''}

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

  function renderNoirGoldBody(card) {
    const name = hasText(card.fullName || card.full_name || card.name) ? (card.fullName || card.full_name || card.name).trim() : '';
    const role = hasText(card.designation || card.role) ? (card.designation || card.role).trim() : '';
    const company = hasText(card.company || card.company_name) ? (card.company || card.company_name).trim() : '';
    const bio = hasText(card.description || card.bio) ? (card.description || card.bio).trim() : '';
    const phone = hasText(card.phone || card.mobile_number) ? (card.phone || card.mobile_number).trim() : '';
    const whatsapp = hasText(card.whatsapp || card.whatsapp_number) ? (card.whatsapp || card.whatsapp_number).trim() : '';
    const email = hasText(card.email) ? card.email.trim() : '';
    const website = hasText(card.website) ? card.website.trim() : '';
    const address = hasText(card.address || card.business_address) ? (card.address || card.business_address).trim() : '';
    const avatarUrl = hasText(card.avatarUrl || card.avatar_url || card.profile_image_url) ? (card.avatarUrl || card.avatar_url || card.profile_image_url).trim() : '';
    const custom = (card.customSettings || card.custom_settings) && typeof (card.customSettings || card.custom_settings) === 'object' ? (card.customSettings || card.custom_settings) : {};
    const ind = (custom.industry && custom.industry.data && typeof custom.industry.data === 'object')
      ? custom.industry.data
      : (custom.industryData && typeof custom.industryData === 'object' ? custom.industryData : {});

    let html = '';

    // 1. Mandatory Hero strip with diagonal line pattern
    html += '<div class="hero" aria-hidden="true"></div>';

    // 2. Profile ID Header
    html += '<header class="id">';
    html += '  <div class="ring">';
    if (avatarUrl) {
      html += `    <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name || 'Profile photo')}">`;
    } else {
      html += `    ${escapeHtml(getInitials(name || 'YN'))}`;
    }
    html += '  </div>';

    if (name) {
      html += `  <h1>${escapeHtml(name)}</h1>`;
    }

    const roleText = [role, company].filter(Boolean).join(', ');
    if (roleText) {
      html += `  <p class="role">${escapeHtml(roleText)}</p>`;
    }

    const statusText = hasText(ind.status)
      ? ind.status.trim()
      : (hasText(ind.availability) ? ind.availability.trim() : (hasText(ind.hours) ? ind.hours.trim() : ''));
    if (statusText) {
      html += `  <span class="status"><i></i>${escapeHtml(statusText)}</span>`;
    }
    html += '</header>';

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
    if (Array.isArray(ind.stats) && ind.stats.length > 0 && ind.stats.some(s => s && hasText(s.num || s.value))) {
      const validStats = ind.stats.filter(s => s && hasText(s.num || s.value)).slice(0, 3);
      html += `
  <section>
    <div class="stats">
      ${validStats.map(s => `<div><b>${escapeHtml(s.num || s.value || '')}</b><span>${escapeHtml(s.label || '')}</span></div>`).join('')}
    </div>
  </section>
      `;
    }

    // 6. Get in touch Section (using unified resolved links)
    const links = resolveCustomerLinks(card);
    const contactLinks = links.filter(l => !SOCIAL_TYPES.has(l.type));
    const socialLinks = links.filter(l => SOCIAL_TYPES.has(l.type));

    const contactRows = [];
    contactLinks.forEach(l => {
      const dest = formatLinkDestination(l.type, l.value);
      if (!dest) return;
      const label = escapeHtml(l.label);
      const display = escapeHtml(getDisplayValue(l.type, l.value, l.label));
      const isExt = l.type !== 'phone' && l.type !== 'email';

      let actionWord = 'Open';
      if (l.type === 'phone') actionWord = 'Call';
      else if (l.type === 'whatsapp') actionWord = 'Chat';
      else if (l.type === 'email') actionWord = 'Write';
      else if (l.type === 'website') actionWord = 'Visit';
      else if (l.type === 'maps' || l.type === 'directions') actionWord = 'Navigate';

      contactRows.push(`
        <a class="row" href="${dest}" ${isExt ? 'target="_blank" rel="noopener noreferrer"' : ''}>
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
      ${contactRows.join('')}
    </div>
  </section>
      `;
    }

    // 7. Services Section (only if valid services exist)
    if (Array.isArray(ind.services) && ind.services.length > 0) {
      const validServices = ind.services.filter(s => {
        if (typeof s === 'string') return hasText(s);
        return s && (hasText(s.name) || hasText(s.title));
      });

      if (validServices.length > 0) {
        html += `
  <section>
    <h2>Our services</h2>
    <div class="tile svc">
      ${validServices.map(s => {
        const title = typeof s === 'string' ? s : (s.name || s.title || '');
        const detail = typeof s === 'object' ? (s.sub || s.detail || s.price || '') : '';
        return `<div><em>${escapeHtml(title)}</em>${detail ? `<span>${escapeHtml(detail)}</span>` : ''}</div>`;
      }).join('')}
    </div>
  </section>
        `;
      }
    }

    // 8. Kind words Section (only if valid testimonials exist)
    const rawReviews = Array.isArray(ind.reviews) ? ind.reviews : (Array.isArray(ind.testimonials) ? ind.testimonials : []);
    const validReviews = rawReviews.filter(r => r && (hasText(r.quote) || hasText(r.text) || hasText(r.comment)));
    if (validReviews.length > 0) {
      html += `
  <section>
    <h2>Kind words</h2>
    <div class="quotes">
      ${validReviews.map(r => {
        const qText = r.quote || r.text || r.comment || '';
        const author = r.author || r.name || r.client || '';
        const companyText = r.company || '';
        const footerText = [author, companyText].filter(Boolean).join(', ');
        return `<div class="quote"><p>${escapeHtml(qText)}</p>${footerText ? `<footer>${escapeHtml(footerText)}</footer>` : ''}</div>`;
      }).join('')}
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
    const socialItems = [];
    socialLinks.forEach(l => {
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
    ${socialItems.join('')}
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

  function renderCardBody(card, design) {
    if (design.id === 'noir-gold') {
      return renderNoirGoldBody(card);
    }
    if (design.id === 'raftcon-luxury') {
      return renderRaftconLuxuryBody(card);
    }
    if (design.id === 'atg-study-abroad') {
      return renderAtgStudyAbroadBody(card);
    }
    if (design.id === 'spice-route') {
      return renderSpiceRouteBody(card);
    }

    const name = hasText(card.fullName || card.full_name) ? (card.fullName || card.full_name).trim() : '';
    const role = hasText(card.designation || card.role) ? (card.designation || card.role).trim() : '';
    const company = hasText(card.company || card.company_name) ? (card.company || card.company_name).trim() : '';
    const bio = hasText(card.description) ? card.description.trim() : '';
    const phone = hasText(card.phone || card.mobile_number) ? (card.phone || card.mobile_number).trim() : '';
    const whatsapp = hasText(card.whatsapp || card.whatsapp_number) ? (card.whatsapp || card.whatsapp_number).trim() : '';
    const address = hasText(card.address || card.business_address) ? (card.address || card.business_address).trim() : '';
    const avatarUrl = hasText(card.avatarUrl || card.avatar_url || card.profile_image_url) ? (card.avatarUrl || card.avatar_url || card.profile_image_url).trim() : '';
    const custom = card.customSettings || card.custom_settings || {};
    const industryData = (custom.industry && custom.industry.data && typeof custom.industry.data === 'object') ? custom.industry.data : {};

    const links = resolveCustomerLinks(card);
    const contactLinks = links.filter(l => !SOCIAL_TYPES.has(l.type));
    const socialLinks = links.filter(l => SOCIAL_TYPES.has(l.type));

    const initials = getInitials(name);
    const avatarHtml = avatarUrl
      ? `<div class="profile-avatar-circle" aria-label="${escapeHtml(name)}">
           <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(name)}" class="profile-avatar-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
           ${initials ? `<span class="profile-avatar-initials" style="display: none;">${escapeHtml(initials)}</span>` : ''}
         </div>`
      : (initials
        ? `<div class="profile-avatar-circle" aria-label="${escapeHtml(name)}">
             <span class="profile-avatar-initials">${escapeHtml(initials)}</span>
           </div>`
        : '');

    let html = '';

    // =========================================================================
    // 1. HEADER (Tailored per Canonical Design Identity)
    // =========================================================================
    if (design.id === 'atelier') {
      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          ${name ? `
            <p style="font-size: 13px; font-family: var(--app-font); opacity: 0.7; margin-bottom: 4px; margin-top: 12px; text-align: center;">Hello, I'm</p>
            <h1 class="profile-name">${escapeHtml(name)}</h1>
          ` : ''}
          ${role ? `
            <div style="text-align: center; margin: 10px 0;">
              <span class="fashion-tag">${escapeHtml(role)}</span>
            </div>
          ` : ''}
          ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ''}
          ${bio ? `<p class="profile-bio" style="font-family: var(--app-font);">${escapeHtml(bio)}</p>` : ''}
        </header>
      `;
    } else if (design.id === 'care-plus') {
      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          ${name ? `<h1 class="profile-name">${escapeHtml(name)}</h1>` : ''}
          ${role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : ''}
          ${company ? `
            <div style="text-align: center; margin: 6px 0 14px;">
              <span class="doctor-specialty-pill">${escapeHtml(company)}</span>
            </div>
          ` : ''}
          ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ''}
        </header>
      `;
    } else if (design.id === 'skyline') {
      const hasBadges = Array.isArray(industryData.badges) && industryData.badges.some(hasText);
      const badgesHtml = hasBadges
        ? industryData.badges.filter(hasText).map(b => `<span class="badge-pill">${escapeHtml(b)}</span>`).join('')
        : '';

      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          ${name ? `<h1 class="profile-name">${escapeHtml(name)}</h1>` : ''}
          ${role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : ''}
          ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ''}
          ${badgesHtml ? `<div class="badges-row">${badgesHtml}</div>` : ''}
          ${bio ? `<p class="profile-bio" style="margin-top: 12px;">${escapeHtml(bio)}</p>` : ''}
        </header>
      `;
    } else if (design.id === 'roast-and-co') {
      const hasCafeBadges = Array.isArray(industryData.badges) && industryData.badges.some(hasText);
      const cafeBadgesHtml = hasCafeBadges
        ? industryData.badges.filter(hasText).map(b => `<span class="cafe-badge">${escapeHtml(b)}</span>`).join('')
        : '';
      const mainTitle = company || name;
      const subTitle = (company && name) ? name : role;

      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          ${mainTitle ? `<h1 class="profile-name">${escapeHtml(mainTitle)}</h1>` : ''}
          ${subTitle ? `<p class="profile-designation" style="opacity: 0.85;">${escapeHtml(subTitle)}</p>` : ''}
          ${cafeBadgesHtml ? `<div class="cafe-badges">${cafeBadgesHtml}</div>` : ''}
          ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ''}
        </header>
      `;
    } else if (design.category === 'business') {
      const bizTitle = company || name;
      const bizSub = (company && name)
        ? `${escapeHtml(name)}${role ? ' &bull; ' + escapeHtml(role) : ''}`
        : (role ? escapeHtml(role) : '');
      const statusText = hasText(industryData.status) ? industryData.status.trim() : (hasText(industryData.hours) ? industryData.hours.trim() : '');

      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          ${bizTitle ? `<h1 class="profile-name">${escapeHtml(bizTitle)}</h1>` : ''}
          ${bizSub ? `<p class="profile-designation">${bizSub}</p>` : ''}
          ${statusText ? `
            <div style="text-align: center;">
              <span class="status-pill">
                <span class="status-dot"></span>
                <span>${escapeHtml(statusText)}</span>
              </span>
            </div>
          ` : ''}
          ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ''}
        </header>
      `;
    } else {
      // Personal Collection
      html += `
        <header style="text-align: center; margin-bottom: 18px;">
          ${avatarHtml}
          ${name ? `<h1 class="profile-name">${escapeHtml(name)}</h1>` : ''}
          ${role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : ''}
          ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ''}
        </header>
      `;

      if (bio) {
        if (['noir-gold', 'emerald-ivory', 'neon-pulse', 'mono-studio'].includes(design.id)) {
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
    if (['emerald-ivory', 'neon-pulse', 'mono-studio'].includes(design.id)) {
      if (Array.isArray(industryData.stats) && industryData.stats.length > 0 && industryData.stats.some(s => s && hasText(s.num || s.value))) {
        html += `<div class="stats-row">`;
        industryData.stats.slice(0, 3).forEach(s => {
          if (s && hasText(s.num || s.value)) {
            html += `<div><div class="stat-num">${escapeHtml(s.num || s.value || '')}</div><div class="stat-label">${escapeHtml(s.label || '')}</div></div>`;
          }
        });
        html += `</div>`;
      }
    }

    // =========================================================================
    // 3. SPECIALIZED CTA BUTTONS
    // =========================================================================
    const waDest = whatsapp ? `https://wa.me/${cleanDigits(whatsapp)}` : '';
    const phoneDest = phone ? `tel:${cleanPhone(phone)}` : '';
    const mapsDest = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';

    if (design.id === 'skyline' || design.id === 'atelier' || design.id === 'care-plus') {
      const bookingUrl = hasText(industryData.bookingUrl) ? formatLinkDestination('website', industryData.bookingUrl) : null;
      if (bookingUrl) {
        const defaultLabel = design.id === 'skyline' ? 'Book a site visit' : (design.id === 'atelier' ? 'Book a fitting' : 'Book appointment');
        const bookingLabel = industryData.bookingLabel || defaultLabel;
        html += `
          <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-primary cta-btn-full" id="btnIndustryCta" style="margin-bottom: 12px;">
            ${getLinkIconSvg('calendar', 16)}
            <span>${escapeHtml(bookingLabel)}</span>
          </a>
        `;
      }

      const secActions = [];
      if (phoneDest) {
        secActions.push({
          html: `<a href="${phoneDest}" class="cta-btn cta-btn-primary" aria-label="Call">${getLinkIconSvg('phone', 15)}<span>Call</span></a>`
        });
      }
      if (waDest && secActions.length < 2) {
        secActions.push({
          html: `<a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="WhatsApp">${getLinkIconSvg('whatsapp', 15)}<span>WhatsApp</span></a>`
        });
      }
      if (mapsDest && secActions.length < 2) {
        secActions.push({
          html: `<a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">${getLinkIconSvg('directions', 15)}<span>Directions</span></a>`
        });
      }
      if (secActions.length < 2) {
        secActions.push({
          html: `<button type="button" class="cta-btn ${secActions.length === 0 ? 'cta-btn-primary' : 'cta-btn-secondary'}" id="saveContactBtn">${getLinkIconSvg('contact', 15)}<span>Save Contact</span></button>`
        });
      }
      if (secActions.length < 2) {
        secActions.push({
          html: `<button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">${getLinkIconSvg('share', 15)}<span>Share</span></button>`
        });
      }

      html += `<div class="cta-actions-row">${secActions.map(a => a.html).join('')}</div>`;
    } else if (design.id === 'roast-and-co') {
      html += `<div class="cta-actions-row">`;
      if (waDest) {
        html += `
          <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-primary" aria-label="Order on WhatsApp">
            ${getLinkIconSvg('whatsapp', 16)}
            <span>Order on WhatsApp</span>
          </a>
        `;
      } else {
        html += `
          <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn">
            ${getLinkIconSvg('contact', 16)}
            <span>Save Contact</span>
          </button>
        `;
      }

      if (mapsDest) {
        html += `
          <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">
            ${getLinkIconSvg('directions', 16)}
            <span>Directions</span>
          </a>
        `;
      } else if (phoneDest) {
        html += `
          <a href="${phoneDest}" class="cta-btn cta-btn-secondary" aria-label="Call">
            ${getLinkIconSvg('phone', 16)}
            <span>Call</span>
          </a>
        `;
      } else {
        html += `
          <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">
            ${getLinkIconSvg('share', 16)}
            <span>Share</span>
          </button>
        `;
      }
      html += `</div>`;
    } else if (design.category === 'business') {
      // 3-Trio Quick Action Buttons
      html += `<div class="cta-actions-trio">`;
      if (phoneDest) {
        html += `
          <a href="${phoneDest}" class="cta-btn cta-btn-primary" aria-label="Call">
            ${getLinkIconSvg('phone', 15)}
            <span>Call</span>
          </a>
        `;
      } else {
        html += `
          <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn">
            ${getLinkIconSvg('contact', 15)}
            <span>Save</span>
          </button>
        `;
      }

      if (waDest) {
        html += `
          <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="WhatsApp">
            ${getLinkIconSvg('whatsapp', 15)}
            <span>WhatsApp</span>
          </a>
        `;
      } else if (phoneDest) {
        html += `
          <button type="button" class="cta-btn cta-btn-secondary" id="saveContactBtn">
            ${getLinkIconSvg('contact', 15)}
            <span>Save</span>
          </button>
        `;
      } else {
        html += `
          <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">
            ${getLinkIconSvg('share', 15)}
            <span>Share</span>
          </button>
        `;
      }

      if (mapsDest) {
        html += `
          <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">
            ${getLinkIconSvg('directions', 15)}
            <span>Directions</span>
          </a>
        `;
      } else {
        html += `
          <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">
            ${getLinkIconSvg('share', 15)}
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
            ${getLinkIconSvg('contact', 16)}
            <span>${escapeHtml(design.ctaStyle.primaryText || 'Save Contact')}</span>
          </button>
          ${waDest ? `
            <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="WhatsApp me">
              ${getLinkIconSvg('whatsapp', 16)}
              <span>WhatsApp me</span>
            </a>` : (phoneDest ? `
            <a href="${phoneDest}" class="cta-btn cta-btn-secondary" aria-label="Call directly">
              ${getLinkIconSvg('phone', 16)}
              <span>Call directly</span>
            </a>` : (mapsDest ? `
            <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">
              ${getLinkIconSvg('directions', 16)}
              <span>Directions</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" aria-label="Share card">
              ${getLinkIconSvg('share', 16)}
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
    if (design.id === 'skyline') {
      if (Array.isArray(industryData.stats) && industryData.stats.length > 0 && industryData.stats.some(s => s && hasText(s.num || s.value))) {
        html += `<div class="stats-row">`;
        industryData.stats.slice(0, 3).forEach(s => {
          if (s && hasText(s.num || s.value)) {
            html += `<div><div class="stat-num">${escapeHtml(s.num || s.value || '')}</div><div class="stat-label">${escapeHtml(s.label || '')}</div></div>`;
          }
        });
        html += `</div>`;
      }

      if (Array.isArray(industryData.listings) && industryData.listings.length > 0) {
        html += `<h2 class="section-title">Featured Listings</h2>`;
        industryData.listings.forEach(item => {
          if (!item || !hasText(item.title || item.price || item.name)) return;
          html += `
            <div class="listing-card">
              ${item.tag ? `<span class="listing-tag">${escapeHtml(item.tag)}</span>` : ''}
              ${item.price ? `<div class="listing-price">${escapeHtml(item.price)}</div>` : ''}
              <div class="listing-title">${escapeHtml(item.title || item.name || '')}</div>
              ${item.location ? `<div class="listing-loc">${escapeHtml(item.location)}</div>` : ''}
              ${Array.isArray(item.pills) && item.pills.length > 0 ? `
                <div class="listing-pills">
                  ${item.pills.map(p => `<span class="listing-pill">${escapeHtml(p)}</span>`).join('')}
                </div>` : ''}
            </div>
          `;
        });
      }

      if (Array.isArray(industryData.advisory) && industryData.advisory.length > 0) {
        html += `<h2 class="section-title" style="margin-top: 18px;">How I can help</h2><div class="advisory-grid">`;
        industryData.advisory.forEach((adv, idx) => {
          html += `
            <div class="advisory-card">
              <div class="advisory-num">${idx + 1}</div>
              <div class="advisory-title">${escapeHtml(adv.title || '')}</div>
              ${adv.desc ? `<div class="advisory-desc">${escapeHtml(adv.desc)}</div>` : ''}
            </div>
          `;
        });
        html += `</div>`;
      }

      if (Array.isArray(industryData.reviews) && industryData.reviews.length > 0) {
        html += `<h2 class="section-title">Client Feedback</h2><div class="reviews-list">`;
        industryData.reviews.forEach(rev => {
          html += `
            <div class="review-card">
              <div class="review-stars">${escapeHtml(rev.stars || '★★★★★')}</div>
              <div class="review-text">${escapeHtml(rev.text || '')}</div>
              ${rev.author ? `<div class="review-author">${escapeHtml(rev.author)}</div>` : ''}
            </div>
          `;
        });
        html += `</div>`;
      }
    }

    // B. Atelier (Fashion Lookbook & Services)
    if (design.id === 'atelier') {
      if (Array.isArray(industryData.lookbook) && industryData.lookbook.length > 0) {
        html += `<div class="lookbook-grid">`;
        industryData.lookbook.slice(0, 2).forEach((lb, idx) => {
          const cls = idx === 0 ? 'lookbook-terracotta' : 'lookbook-charcoal';
          html += `
            <div class="lookbook-box ${cls}">
              <div class="lookbook-title">${escapeHtml(lb.title || '')}</div>
              ${lb.sub ? `<div class="lookbook-sub">${escapeHtml(lb.sub)}</div>` : ''}
            </div>
          `;
        });
        html += `</div>`;
      }

      if (Array.isArray(industryData.services) && industryData.services.length > 0) {
        html += `<div class="fashion-services">`;
        industryData.services.forEach(s => {
          html += `
            <div class="fashion-service-row">
              <span style="font-weight: 600;">${escapeHtml(s.name || s.title || '')}</span>
              <span style="opacity: 0.7;">${escapeHtml(s.subtitle || s.price || '')}</span>
            </div>
          `;
        });
        html += `</div>`;
      }
    }

    // C. Care Plus (Healthcare Slot & Clinic Timings)
    if (design.id === 'care-plus') {
      if (hasText(industryData.nextSlot)) {
        html += `
          <div class="slot-card">
            ${getLinkIconSvg('calendar', 22)}
            <div>
              <div class="slot-title">Next Available Consultation</div>
              <div class="slot-val">${escapeHtml(industryData.nextSlot.trim())}</div>
            </div>
          </div>
        `;
      }

      if (Array.isArray(industryData.treatments) && industryData.treatments.length > 0) {
        html += `<h2 class="section-title">Specialties Treated</h2><div class="tags-cloud">`;
        industryData.treatments.forEach(t => {
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
    if (design.id === 'roast-and-co') {
      if (Array.isArray(industryData.menu) && industryData.menu.length > 0) {
        html += `
          <div class="menu-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h2 class="section-title" style="margin-bottom: 0;">Signature Menu</h2>
            </div>
        `;
        industryData.menu.forEach(item => {
          html += `
            <div class="menu-item">
              <div>
                <div class="menu-item-name">
                  ${escapeHtml(item.name || '')}
                  ${item.popular ? `<span class="menu-item-popular">Popular</span>` : ''}
                </div>
                ${item.sub ? `<div class="menu-item-sub">${escapeHtml(item.sub)}</div>` : ''}
              </div>
              ${item.price ? `<div class="menu-item-price">${escapeHtml(item.price)}</div>` : ''}
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
    if (design.id === 'bento-grid') {
      const bentoTiles = [];

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
        industryData.services.forEach(s => {
          const txt = typeof s === 'string' ? s : (s.name || s.title || '');
          if (hasText(txt)) {
            html += `<div class="service-card">${escapeHtml(txt)}</div>`;
          }
        });
        html += `</div>`;
      }
    }

    // F. Business Hubs (Classic Navy, Fresh Mint, Bold Pop, Glass Aurora, Luxe Foil)
    if (['classic-navy', 'fresh-mint', 'bold-pop', 'glass-aurora', 'luxe-foil'].includes(design.id)) {
      const bizServices = Array.isArray(industryData.services) ? industryData.services : [];
      if (bizServices.length > 0) {
        html += `<h2 class="section-title">What we do</h2><div class="services-grid">`;
        bizServices.forEach(s => {
          const txt = typeof s === 'string' ? s : (s.name || s.title || '');
          if (hasText(txt)) {
            html += `<div class="service-card">${escapeHtml(txt)}</div>`;
          }
        });
        html += `</div>`;
      }

      const bizHours = Array.isArray(industryData.hours) ? industryData.hours : (hasText(industryData.hours) ? [industryData.hours] : []);
      if (bizHours.length > 0) {
        html += `<div class="hours-table"><h2 class="section-title" style="margin-bottom: 8px;">Opening Hours</h2>`;
        bizHours.forEach(h => {
          if (typeof h === 'string') {
            html += `<div class="hours-row"><span>Hours</span><span>${escapeHtml(h)}</span></div>`;
          } else if (h && typeof h === 'object') {
            html += `<div class="hours-row"><span>${escapeHtml(h.days || h.label || '')}</span><span>${escapeHtml(h.time || h.value || '')}</span></div>`;
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
      contactLinks.forEach(link => {
        const dest = formatLinkDestination(link.type, link.value);
        if (!dest) return;
        const isExternal = link.type !== 'phone' && link.type !== 'email';
        const displayVal = getDisplayValue(link.type, link.value, link.label);

        html += `
          <a href="${dest}" class="contact-row" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} aria-label="${escapeHtml(link.label)}">
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
      socialLinks.forEach(link => {
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
          ${getLinkIconSvg('qr', 15)}
          <span>Show QR</span>
        </button>
        <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" style="min-width: 130px; font-size: 12.5px;" aria-label="Share digital card">
          ${getLinkIconSvg('share', 15)}
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

  function renderCompleteCardHtml(card, options = {}) {
    const registry = designRegistry || (typeof window !== 'undefined' ? window.CARD_DESIGN_REGISTRY : null);
    const design = registry ? registry.resolveCardDesign(card.cardDesign || card.card_design) : {
      id: 'mint-haven',
      name: 'Mint Haven',
      theme: { fontFamily: 'Inter', primaryColor: '#10b981', backgroundColor: '#faf6ee', textColor: '#1e293b' }
    };

    const name = card.fullName || card.full_name || card.name || 'Ambros Studio';
    const role = card.designation || card.role || '';
    const company = card.company || card.company_name || '';
    const desc = card.description || '';
    const title = `${name} — ${role ? role + ' | ' : ''}${company || 'Ambros Studio'}`;

    const appearance = (card.customSettings && card.customSettings.appearance) ? card.customSettings.appearance : {};
    // Avoid leaking Mint Haven default pastel colors into non-mint canonical designs
    const isDefaultMint = (appearance.backgroundColor === '#faf6ee' || appearance.primaryColor === '#10b981') && design.id !== 'mint-haven';
    const primaryColor = (!isDefaultMint && appearance.primaryColor) ? appearance.primaryColor : design.theme.primaryColor;
    const bgColor = (!isDefaultMint && appearance.backgroundColor) ? appearance.backgroundColor : design.theme.backgroundColor;
    const textColor = (!isDefaultMint && appearance.textColor) ? appearance.textColor : design.theme.textColor;
    const fontFamily = appearance.fontFamily || design.theme.fontFamily;

    const fontQuery = design.theme.fontUrl ? `<link rel="stylesheet" href="${design.theme.fontUrl}">` : '';
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
      ${primaryColor ? `--card-primary: ${primaryColor};` : ''}
      ${bgColor ? `--card-background: ${bgColor};` : ''}
      ${textColor ? `--card-text: ${textColor};` : ''}
      ${fontFamily ? `--card-font: '${fontFamily}', system-ui, sans-serif;` : ''}
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
    ` : ''}
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
  ` : ''}
  <script src="/cards/qrcode.js?v=2.1" defer></script>
  <script src="/cards/card-loader.js?v=2.1" defer></script>
</body>
</html>`;
  }

  return {
    renderCardBody: renderCardBody,
    renderCardHtml: renderCompleteCardHtml,
    renderCompleteCardHtml: renderCompleteCardHtml,
    resolveCustomerLinks: resolveCustomerLinks,
    getInitials: getInitials,
    escapeHtml: escapeHtml
  };
});
