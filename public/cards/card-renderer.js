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
      case 'telegram':
      case 'custom':
      default: {
        let target = val;
        if (!/^https?:\/\//i.test(target)) {
          if (type === 'instagram' && !val.includes('/')) target = `https://instagram.com/${val.replace(/^@/, '')}`;
          else if (type === 'twitter' && !val.includes('/')) target = `https://twitter.com/${val.replace(/^@/, '')}`;
          else if (type === 'telegram' && !val.includes('/')) target = `https://t.me/${val.replace(/^@/, '')}`;
          else target = `https://${val}`;
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
    if (type === 'twitter') {
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
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`;
      case 'telegram':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
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

  const SOCIAL_TYPES = new Set(['instagram', 'facebook', 'linkedin', 'youtube', 'twitter']);

  /**
   * Resolves links from customer customSettings OR legacy direct fields.
   */
  function resolveCustomerLinks(card) {
    const custom = card.customSettings || card.custom_settings;
    if (custom && Array.isArray(custom.links) && custom.links.length > 0) {
      return custom.links
        .filter(l => l && l.enabled !== false && ALLOWED_LINK_TYPES.includes((l.type || '').toLowerCase()))
        .map((l, idx) => ({
          type: (l.type || '').toLowerCase(),
          label: l.label || getDefaultLabel((l.type || '').toLowerCase()),
          value: l.value || '',
          order: typeof l.order === 'number' ? l.order : idx,
        }))
        .filter(l => formatLinkDestination(l.type, l.value) !== null)
        .sort((a, b) => a.order - b.order);
    }

    const list = [];
    if (card.phone || card.mobile_number) {
      list.push({ type: 'phone', label: 'Call Directly', value: card.phone || card.mobile_number, order: 0 });
    }
    if (card.whatsapp || card.whatsapp_number) {
      list.push({ type: 'whatsapp', label: 'WhatsApp', value: card.whatsapp || card.whatsapp_number, order: 1 });
    }
    if (card.email) {
      list.push({ type: 'email', label: 'Email', value: card.email, order: 2 });
    }
    if (card.website) {
      list.push({ type: 'website', label: 'Website', value: card.website, order: 3 });
    }
    if (card.socialInstagram || card.instagram_url) {
      list.push({ type: 'instagram', label: 'Instagram', value: card.socialInstagram || card.instagram_url, order: 4 });
    }
    if (card.socialLinkedIn || card.linkedin_url) {
      list.push({ type: 'linkedin', label: 'LinkedIn', value: card.socialLinkedIn || card.linkedin_url, order: 5 });
    }
    if (card.address || card.business_address) {
      list.push({ type: 'maps', label: 'Directions', value: card.address || card.business_address, order: 6 });
    }

    return list;
  }

  /**
   * Generates the entire inner HTML for a card based on design definition and customer object.
   */
  function renderCardBody(card, design) {
    const name = card.fullName || card.full_name || card.name || 'Ambros Studio Member';
    const role = card.designation || card.role || '';
    const company = card.company || card.company_name || '';
    const bio = card.description || '';
    const phone = card.phone || card.mobile_number || '';
    const whatsapp = card.whatsapp || card.whatsapp_number || '';
    const address = card.address || card.business_address || '';
    const avatarUrl = card.avatarUrl || card.avatar_url || card.profile_image_url || card.photo || '';
    const custom = card.customSettings || card.custom_settings || {};
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

    let html = '';

    // =========================================================================
    // 1. HEADER (Tailored per Canonical Design Identity)
    // =========================================================================
    if (design.id === 'atelier') {
      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          <p style="font-size: 13px; font-family: var(--app-font); opacity: 0.7; margin-bottom: 4px; margin-top: 12px; text-align: center;">Hello, I'm</p>
          <h1 class="profile-name">${escapeHtml(name)}</h1>
          <div style="text-align: center; margin: 10px 0;">
            <span class="fashion-tag">${escapeHtml(role || 'Fashion designer & stylist')}</span>
          </div>
          ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ''}
          ${bio ? `<p class="profile-bio" style="font-family: var(--app-font);">${escapeHtml(bio)}</p>` : ''}
        </header>
      `;
    } else if (design.id === 'care-plus') {
      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          <h1 class="profile-name">${escapeHtml(name)}</h1>
          <p class="profile-designation">${escapeHtml(role || 'Consultant Dermatologist & Physician')}</p>
          <div style="text-align: center; margin: 6px 0 14px;">
            <span class="doctor-specialty-pill">${escapeHtml(company || 'Clinical Dermatology & Aesthetics')}</span>
          </div>
          ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ''}
        </header>
      `;
    } else if (design.id === 'skyline') {
      const badgesHtml = (Array.isArray(industryData.badges) && industryData.badges.length > 0)
        ? industryData.badges.map(b => `<span class="badge-pill">${escapeHtml(b)}</span>`).join('')
        : `<span class="badge-pill">Demo RERA · Sample</span><span class="badge-pill">English · Hindi</span><span class="badge-pill">Property Advisory</span>`;

      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          <h1 class="profile-name">${escapeHtml(name)}</h1>
          <p class="profile-designation">${escapeHtml(role || 'Senior Property Consultant')}</p>
          ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ''}
          <div class="badges-row">
            ${badgesHtml}
          </div>
        </header>
      `;
    } else if (design.id === 'roast-and-co') {
      const cafeBadgesHtml = (Array.isArray(industryData.badges) && industryData.badges.length > 0)
        ? industryData.badges.map(b => `<span class="cafe-badge">${escapeHtml(b)}</span>`).join('')
        : `<span class="cafe-badge">• Open · till 10pm</span><span class="cafe-badge">★ 4.8</span><span class="cafe-badge">Free Wi-Fi</span>`;

      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          <h1 class="profile-name">${escapeHtml(company || name)}</h1>
          <p class="profile-designation" style="opacity: 0.85;">${escapeHtml(bio || role || 'Small-batch coffee and fresh bakes, all day.')}</p>
          <div class="cafe-badges">
            ${cafeBadgesHtml}
          </div>
        </header>
      `;
    } else if (design.category === 'business') {
      html += `
        <header style="text-align: center; margin-bottom: 20px;">
          ${avatarHtml}
          <h1 class="profile-name">${escapeHtml(company || name)}</h1>
          ${company && name ? `<p class="profile-designation">${escapeHtml(name)}${role ? ' · ' + escapeHtml(role) : ''}</p>` : (role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : '')}
          <div style="text-align: center;">
            <span class="status-pill">
              <span class="status-dot"></span>
              <span>Open now · closes 8 pm</span>
            </span>
          </div>
          ${bio ? `<p class="profile-bio">${escapeHtml(bio)}</p>` : ''}
        </header>
      `;
    } else {
      // Personal Collection (Mint Haven, Evergreen, Noir Gold, Emerald Ivory, Neon Pulse, Mono Studio)
      html += `
        <header style="text-align: center; margin-bottom: 18px;">
          ${avatarHtml}
          <h1 class="profile-name">${escapeHtml(name)}</h1>
          ${role ? `<p class="profile-designation">${escapeHtml(role)}</p>` : ''}
          ${company ? `<p class="profile-company">${escapeHtml(company)}</p>` : ''}
        </header>
      `;

      // Structured About Card for luxury / editorial personal designs
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
      const stats = Array.isArray(industryData.stats) ? industryData.stats : [
        { num: '12+', label: 'Years Exp.' },
        { num: '340+', label: 'Clients' },
        { num: '4.9 ★', label: 'Satisfaction' }
      ];
      html += `<div class="stats-row">`;
      stats.slice(0, 3).forEach(s => {
        html += `<div><div class="stat-num">${escapeHtml(s.num || s.value || '')}</div><div class="stat-label">${escapeHtml(s.label || '')}</div></div>`;
      });
      html += `</div>`;
    }

    // =========================================================================
    // 3. SPECIALIZED CTA BUTTONS (Matching Portfolio Identities)
    // =========================================================================
    const waDest = whatsapp ? `https://wa.me/${cleanDigits(whatsapp)}` : '';
    const phoneDest = phone ? `tel:${cleanPhone(phone)}` : '';
    const mapsDest = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';

    if (design.id === 'skyline') {
      html += `
        <button type="button" class="cta-btn cta-btn-primary cta-btn-full" id="btnIndustryCta" style="margin-bottom: 12px;">
          ${getLinkIconSvg('calendar', 16)}
          <span>Book a site visit</span>
        </button>
        <div class="cta-actions-row">
          ${phoneDest ? `
            <a href="${phoneDest}" class="cta-btn cta-btn-secondary" aria-label="Call consultant">
              ${getLinkIconSvg('phone', 15)}
              <span>Call</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-secondary" id="saveContactBtn">
              ${getLinkIconSvg('contact', 15)}
              <span>Save contact</span>
            </button>`
          }
          <button type="button" class="cta-btn cta-btn-secondary" id="saveContactBtn">
            ${getLinkIconSvg('contact', 15)}
            <span>Save contact</span>
          </button>
        </div>
      `;
    } else if (design.id === 'atelier') {
      html += `
        <button type="button" class="cta-btn cta-btn-primary cta-btn-full" id="btnIndustryCta" style="margin-bottom: 12px;">
          ${getLinkIconSvg('calendar', 16)}
          <span>Book a fitting</span>
        </button>
        <div class="cta-actions-row">
          ${phoneDest ? `
            <a href="${phoneDest}" class="cta-btn cta-btn-secondary" aria-label="Call studio">
              ${getLinkIconSvg('phone', 15)}
              <span>Call studio</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-secondary" id="saveContactBtn">
              ${getLinkIconSvg('contact', 15)}
              <span>Save contact</span>
            </button>`
          }
          <button type="button" class="cta-btn cta-btn-secondary" id="saveContactBtn">
            ${getLinkIconSvg('contact', 15)}
            <span>Save contact</span>
          </button>
        </div>
      `;
    } else if (design.id === 'care-plus') {
      html += `
        <button type="button" class="cta-btn cta-btn-primary cta-btn-full" id="btnIndustryCta" style="margin-bottom: 12px;">
          ${getLinkIconSvg('calendar', 16)}
          <span>Book appointment</span>
        </button>
        <div class="cta-actions-row">
          ${phoneDest ? `
            <a href="${phoneDest}" class="cta-btn cta-btn-secondary" aria-label="Call clinic">
              ${getLinkIconSvg('phone', 15)}
              <span>Call clinic</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-secondary" id="saveContactBtn">
              ${getLinkIconSvg('contact', 15)}
              <span>Save contact</span>
            </button>`
          }
          <button type="button" class="cta-btn cta-btn-secondary" id="saveContactBtn">
            ${getLinkIconSvg('contact', 15)}
            <span>Save contact</span>
          </button>
        </div>
      `;
    } else if (design.id === 'roast-and-co') {
      html += `
        <div class="cta-actions-row">
          ${waDest ? `
            <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-primary" aria-label="Order on WhatsApp">
              ${getLinkIconSvg('whatsapp', 16)}
              <span>Order on WhatsApp</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn">
              ${getLinkIconSvg('contact', 16)}
              <span>Save contact</span>
            </button>`
          }
          ${mapsDest ? `
            <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">
              ${getLinkIconSvg('directions', 16)}
              <span>Directions</span>
            </a>` : (phoneDest ? `
            <a href="${phoneDest}" class="cta-btn cta-btn-secondary" aria-label="Call cafe">
              ${getLinkIconSvg('phone', 16)}
              <span>Call cafe</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">
              ${getLinkIconSvg('share', 16)}
              <span>Share</span>
            </button>`)
          }
        </div>
      `;
    } else if (design.category === 'business') {
      // 3-Trio Quick Action Buttons
      html += `
        <div class="cta-actions-trio">
          ${phoneDest ? `
            <a href="${phoneDest}" class="cta-btn cta-btn-primary" aria-label="Call">
              ${getLinkIconSvg('phone', 15)}
              <span>Call</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-primary" id="saveContactBtn">
              ${getLinkIconSvg('contact', 15)}
              <span>Save</span>
            </button>`
          }
          ${waDest ? `
            <a href="${waDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="WhatsApp">
              ${getLinkIconSvg('whatsapp', 15)}
              <span>WhatsApp</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn">
              ${getLinkIconSvg('share', 15)}
              <span>Share</span>
            </button>`
          }
          ${mapsDest ? `
            <a href="${mapsDest}" target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-secondary" aria-label="Directions">
              ${getLinkIconSvg('directions', 15)}
              <span>Directions</span>
            </a>` : `
            <button type="button" class="cta-btn cta-btn-secondary" id="showQrBtn">
              ${getLinkIconSvg('qr', 15)}
              <span>QR Code</span>
            </button>`
          }
        </div>
      `;
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
            </a>` : `
            <button type="button" class="cta-btn cta-btn-secondary" id="shareCardBtn" aria-label="Share card">
              ${getLinkIconSvg('share', 16)}
              <span>Share</span>
            </button>`
          }
        </div>
      `;
    }

    // =========================================================================
    // 4. INDUSTRY & DESIGN SPECIALIZED MODULES
    // =========================================================================

    // A. Skyline (Real Estate Suite)
    if (design.id === 'skyline') {
      const stats = Array.isArray(industryData.stats) ? industryData.stats : [
        { num: '320+', label: 'Homes sold' },
        { num: '₹450Cr', label: 'Deals closed' },
        { num: '9 yrs', label: 'Experience' }
      ];
      html += `<div class="stats-row">`;
      stats.slice(0, 3).forEach(s => {
        html += `<div><div class="stat-num">${escapeHtml(s.num || s.value || '')}</div><div class="stat-label">${escapeHtml(s.label || '')}</div></div>`;
      });
      html += `</div>`;

      if (bio) {
        html += `
          <div class="about-card">
            <div class="card-subtitle">About me</div>
            <p class="profile-bio">${escapeHtml(bio)}</p>
          </div>
        `;
      }

      const listings = Array.isArray(industryData.listings) && industryData.listings.length > 0 ? industryData.listings : [
        { tag: 'For sale', price: '₹1.85 Cr', title: '3 BHK · 1,450 sq ft', location: 'VIP Road, Vesu, Surat', pills: ['Sea view', '2 parking', 'Ready to move'] },
        { tag: 'New launch', price: '₹96 Lac', title: '2 BHK · 920 sq ft', location: 'Althan Canal Corridor, Surat', pills: ['Gym', 'Clubhouse', 'RERA approved'] },
        { tag: 'For rent', price: '₹55k / mo', title: '3 BHK · 1,600 sq ft', location: 'City Light Hub, Surat', pills: ['Furnished', 'Near metro', 'Pet friendly'] },
        { tag: 'Premium villa', price: '₹2.4 Cr', title: '4 BHK · 3,200 sq ft', location: 'Dumas Resort Road, Surat', pills: ['Private garden', 'Pool', 'Gated society'] }
      ];

      html += `<h2 class="section-title">Featured Listings</h2>`;
      listings.forEach(item => {
        html += `
          <div class="listing-card">
            ${item.tag ? `<span class="listing-tag">${escapeHtml(item.tag)}</span>` : ''}
            <div class="listing-price">${escapeHtml(item.price || '')}</div>
            <div class="listing-title">${escapeHtml(item.title || item.type || '')}</div>
            <div class="listing-loc">${escapeHtml(item.location || '')}</div>
            ${Array.isArray(item.pills) ? `
              <div class="listing-pills">
                ${item.pills.map(p => `<span class="listing-pill">${escapeHtml(p)}</span>`).join('')}
              </div>` : ''}
          </div>
        `;
      });

      html += `
        <h2 class="section-title" style="margin-top: 18px;">How I can help</h2>
        <div class="advisory-grid">
          <div class="advisory-card"><div class="advisory-num">1</div><div class="advisory-title">Buy a home</div><div class="advisory-desc">Shortlist, visit, and negotiate</div></div>
          <div class="advisory-card"><div class="advisory-num">2</div><div class="advisory-title">Sell property</div><div class="advisory-desc">Right price, faster closing</div></div>
          <div class="advisory-card"><div class="advisory-num">3</div><div class="advisory-title">Rent & lease</div><div class="advisory-desc">Verified tenants & owners</div></div>
          <div class="advisory-card"><div class="advisory-num">4</div><div class="advisory-title">Investments</div><div class="advisory-desc">High-growth areas & yields</div></div>
        </div>

        <h2 class="section-title">Sample Client Feedback</h2>
        <div class="reviews-list">
          <div class="review-card">
            <div class="review-stars">★★★★★</div>
            <div class="review-text">"Found us the ideal sea-facing residence in two weeks and handled paperwork seamlessly."</div>
            <div class="review-author">Sample Buyer · Bandra</div>
          </div>
          <div class="review-card">
            <div class="review-stars">★★★★★</div>
            <div class="review-text">"Handled our penthouse transaction with complete discretion, clear valuations, and weekly updates."</div>
            <div class="review-author">Sample Client · Surat</div>
          </div>
        </div>
      `;
    }

    // B. Atelier (Fashion Lookbook & Services)
    if (design.id === 'atelier') {
      html += `
        <div class="lookbook-grid">
          <div class="lookbook-box lookbook-terracotta">
            <div class="lookbook-title">Spring Edit '26</div>
            <div class="lookbook-sub">Hand-spun silks</div>
          </div>
          <div class="lookbook-box lookbook-charcoal">
            <div class="lookbook-title">Bespoke Studio</div>
            <div class="lookbook-sub">Tailored to measure</div>
          </div>
        </div>
      `;

      const services = Array.isArray(industryData.services) && industryData.services.length > 0 ? industryData.services : [
        { name: 'Bridal Couture', subtitle: 'by appointment' },
        { name: 'Custom Tailoring', subtitle: 'from 7 days' },
        { name: 'Personal Styling', subtitle: '1:1 sessions' },
        { name: 'Festive Edit', subtitle: 'new seasonal' }
      ];

      html += `<div class="fashion-services">`;
      services.forEach(s => {
        html += `
          <div class="fashion-service-row">
            <span style="font-weight: 600;">${escapeHtml(s.name || s.title || '')}</span>
            <span style="opacity: 0.7;">${escapeHtml(s.subtitle || s.price || '')}</span>
          </div>
        `;
      });
      html += `</div>`;
    }

    // C. Care Plus (Healthcare Slot & Clinic Timings)
    if (design.id === 'care-plus') {
      const nextSlot = industryData.nextSlot || 'Today, 4:00 pm';
      html += `
        <div class="slot-card">
          ${getLinkIconSvg('calendar', 22)}
          <div>
            <div class="slot-title">Next Available Consultation</div>
            <div class="slot-val">${escapeHtml(nextSlot)}</div>
          </div>
        </div>
      `;

      const treatments = Array.isArray(industryData.treatments) && industryData.treatments.length > 0 ? industryData.treatments : [
        'Acne & Scars', 'Hair Fall Therapy', 'Skin Rejuvenation', 'Eczema Care', 'Laser Aesthetics', 'Allergy Screening'
      ];

      html += `<h2 class="section-title">Specialties Treated</h2><div class="tags-cloud">`;
      treatments.forEach(t => {
        html += `<span class="tag-chip">${escapeHtml(t)}</span>`;
      });
      html += `</div>`;

      const timings = industryData.timings || 'Mon – Fri: 10:00 am – 2:00 pm, 5:00 – 8:00 pm · Sat: 10:00 am – 2:00 pm';
      html += `
        <div class="timings-card">
          <div style="font-weight: 700; margin-bottom: 8px;">Clinic Timings</div>
          <div style="opacity: 0.9; line-height: 1.5;">${escapeHtml(timings)}</div>
        </div>
      `;
    }

    // D. Roast & Co. (Cafe Menu & Loyalty)
    if (design.id === 'roast-and-co') {
      const menu = Array.isArray(industryData.menu) && industryData.menu.length > 0 ? industryData.menu : [
        { name: 'Flat White', sub: 'Double shot, silky microfoam', price: '₹190', popular: true },
        { name: 'Cappuccino', sub: 'Classic balance, velvety foam', price: '₹170' },
        { name: 'Specialty Cold Brew', sub: 'Steeped 18 hours, citrus notes', price: '₹210', popular: true },
        { name: 'Artisan Pour Over', sub: 'Single-origin, roasted in-house', price: '₹180' }
      ];

      html += `
        <div class="menu-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h2 class="section-title" style="margin-bottom: 0;">Signature Menu</h2>
            <div class="menu-tabs">
              <span class="menu-tab active">Coffee</span>
              <span class="menu-tab">Cold</span>
              <span class="menu-tab">Bites</span>
            </div>
          </div>
      `;
      menu.forEach(item => {
        html += `
          <div class="menu-item">
            <div>
              <div class="menu-item-name">
                ${escapeHtml(item.name || '')}
                ${item.popular ? `<span class="menu-item-popular">Popular</span>` : ''}
              </div>
              ${item.sub ? `<div class="menu-item-sub">${escapeHtml(item.sub)}</div>` : ''}
            </div>
            <div class="menu-item-price">${escapeHtml(item.price || '')}</div>
          </div>
        `;
      });
      html += `</div>`;

      const loyalty = industryData.loyalty || 'Collect 8 stamps, get a free specialty beverage: 8 to go';
      html += `
        <div class="loyalty-box">
          <div class="loyalty-title">Roastery Stamp Card</div>
          <div class="loyalty-desc">${escapeHtml(loyalty)}</div>
        </div>
      `;
    }

    // E. Bento Grid (Design 10 4-Tile Experience)
    if (design.id === 'bento-grid') {
      html += `
        <div class="bento-tile-row">
          ${phone ? `
            <a href="tel:${cleanPhone(phone)}" class="bento-tile bento-tile-coral">
              <span class="bento-tile-title">Call us</span>
              <span class="bento-tile-main">${escapeHtml(phone)}</span>
            </a>` : `
            <div class="bento-tile bento-tile-coral">
              <span class="bento-tile-title">Call us</span>
              <span class="bento-tile-main">Tap below</span>
            </div>`
          }
          ${whatsapp ? `
            <a href="https://wa.me/${cleanDigits(whatsapp)}" target="_blank" rel="noopener noreferrer" class="bento-tile bento-tile-sun">
              <span class="bento-tile-title">WhatsApp</span>
              <span class="bento-tile-main">Instant Reply</span>
            </a>` : `
            <div class="bento-tile bento-tile-sun">
              <span class="bento-tile-title">WhatsApp</span>
              <span class="bento-tile-main">Online</span>
            </div>`
          }
        </div>
        <div class="bento-tile-row">
          <div class="bento-tile bento-tile-lavender">
            <span class="bento-tile-title">Client Rating</span>
            <span class="bento-tile-main">4.9 ★ (320+ Reviews)</span>
          </div>
          <div class="bento-tile bento-tile-mint">
            <span class="bento-tile-title">Working Hours</span>
            <span class="bento-tile-main">Mon–Sat: 9am–8pm</span>
          </div>
        </div>
        <h2 class="section-title">What we do</h2>
        <div class="services-grid">
          <div class="service-card">Digital Architecture</div>
          <div class="service-card">NFC Business Cards</div>
          <div class="service-card">Brand Direction</div>
          <div class="service-card">Performance Systems</div>
        </div>
      `;
    }

    // F. Business Hubs (Classic Navy, Fresh Mint, Bold Pop, Glass Aurora, Luxe Foil)
    if (['classic-navy', 'fresh-mint', 'bold-pop', 'glass-aurora', 'luxe-foil'].includes(design.id)) {
      html += `
        <h2 class="section-title">What we do</h2>
        <div class="services-grid">
          <div class="service-card">Consultation</div>
          <div class="service-card">Installation</div>
          <div class="service-card">Maintenance</div>
          <div class="service-card">Custom Orders</div>
          <div class="service-card">Home Delivery</div>
          <div class="service-card">Corporate Plans</div>
        </div>

        <div class="hours-table">
          <h2 class="section-title" style="margin-bottom: 8px;">Opening Hours</h2>
          <div class="hours-row"><span>Mon – Fri</span><span>9:00 am – 8:00 pm</span></div>
          <div class="hours-row"><span>Saturday</span><span>10:00 am – 6:00 pm</span></div>
          <div class="hours-row"><span>Sunday</span><span style="opacity: 0.65;">Closed</span></div>
        </div>
      `;
    }

    // =========================================================================
    // 5. CONTACT & DYNAMIC LINKS LIST
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
    // 6. SOCIAL MEDIA GRID
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

  /**
   * Generates a complete standalone HTML document for the card.
   */
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

  <script src="/cards/card-loader.js"></script>
</body>
</html>`;
  }

  return {
    renderCardBody: renderCardBody,
    renderCardHtml: renderCompleteCardHtml,
    renderCompleteCardHtml: renderCompleteCardHtml,
    resolveCustomerLinks: resolveCustomerLinks,
    getInitials: getInitials
  };
});
