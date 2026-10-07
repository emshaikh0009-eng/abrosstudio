/**
 * Ambros Studio — Universal Digital Card Dynamic Hydration Controller
 * Supports:
 *   1. Public Mode: ?slug={profile_slug} via GET /api/cards/{slug} (active cards only)
 *   2. Admin Preview Mode: ?id={id}&preview=true via GET /api/admin/customers/{id} (session-protected)
 *   3. Static Showroom Fallback: When no query parameters are present, leaves demo template intact
 */

(function () {
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
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  function normalizeUrl(url) {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
  }

  const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  function isValidHex(val) {
    return typeof val === 'string' && HEX_COLOR_REGEX.test(val.trim());
  }

  const GOOGLE_FONT_MAP = {
    'Inter': 'family=Inter:wght@400;500;600;700',
    'Plus Jakarta Sans': 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800',
    'Poppins': 'family=Poppins:wght@400;500;600;700',
    'Montserrat': 'family=Montserrat:wght@400;500;600;700',
    'DM Sans': 'family=DM+Sans:wght@400;500;700',
    'Playfair Display': 'family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600'
  };

  function loadGoogleFont(fontName) {
    const query = GOOGLE_FONT_MAP[fontName];
    if (!query) return;
    const linkId = `google-font-${fontName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
    document.head.appendChild(link);
  }

  function applyCustomAppearance(appearance) {
    if (!appearance || typeof appearance !== 'object') return;

    if (appearance.primaryColor && isValidHex(appearance.primaryColor)) {
      document.documentElement.style.setProperty('--card-primary', appearance.primaryColor.trim());
    }
    if (appearance.backgroundColor && isValidHex(appearance.backgroundColor)) {
      document.documentElement.style.setProperty('--card-background', appearance.backgroundColor.trim());
    }
    if (appearance.textColor && isValidHex(appearance.textColor)) {
      document.documentElement.style.setProperty('--card-text', appearance.textColor.trim());
    }

    const font = typeof appearance.fontFamily === 'string' ? appearance.fontFamily.trim() : '';
    if (font && font !== 'Template Default' && GOOGLE_FONT_MAP[font]) {
      loadGoogleFont(font);
      document.documentElement.style.setProperty('--card-font', `'${font}', system-ui, sans-serif`);
    }
  }

  const ALLOWED_LINK_TYPES = [
    'whatsapp',
    'phone',
    'email',
    'website',
    'instagram',
    'facebook',
    'linkedin',
    'youtube',
    'twitter',
    'telegram',
    'maps',
    'custom'
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
      phone: 'Call',
      email: 'Email',
      website: 'Website',
      instagram: 'Instagram',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      twitter: 'X / Twitter',
      telegram: 'Telegram',
      maps: 'Location / Maps',
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

  function getLinkIconSvg(type, size) {
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
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      case 'custom':
      default:
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }
  }

  function getDesign1BadgeClass(type) {
    switch (type) {
      case 'phone':
      case 'whatsapp':
        return 'badge-green';
      case 'linkedin':
      case 'twitter':
      case 'telegram':
        return 'badge-blue';
      case 'email':
        return 'badge-yellow';
      case 'website':
      case 'facebook':
      case 'maps':
        return 'badge-purple';
      case 'instagram':
      case 'youtube':
      case 'custom':
      default:
        return 'badge-peach';
    }
  }

  function extractValidLinks(card) {
    const rawLinks = (card.customSettings && Array.isArray(card.customSettings.links))
      ? card.customSettings.links
      : [];

    return rawLinks
      .map((link, originalIndex) => ({ link, originalIndex }))
      .filter(({ link }) => {
        if (!link || typeof link !== 'object') return false;
        if (link.enabled === false) return false;
        const type = typeof link.type === 'string' ? link.type.trim().toLowerCase() : '';
        if (!ALLOWED_LINK_TYPES.includes(type)) return false;
        const dest = formatLinkDestination(type, link.value);
        return Boolean(dest);
      })
      .sort((a, b) => {
        const orderA = typeof a.link.order === 'number' && !isNaN(a.link.order) ? a.link.order : a.originalIndex;
        const orderB = typeof b.link.order === 'number' && !isNaN(b.link.order) ? b.link.order : b.originalIndex;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.originalIndex - b.originalIndex;
      })
      .map(({ link }) => link);
  }


  function generateVCard(card) {
    const fn = card.fullName || card.full_name || card.name || 'Contact';
    const org = card.company || card.company_name || '';
    const title = card.designation || card.role || '';
    const phone = card.phone || card.mobile_number || '';
    const email = card.email || '';
    const website = card.website ? normalizeUrl(card.website) : '';
    const address = card.address || card.business_address || '';
    const note = card.description || '';

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fn}`,
      org ? `ORG:${org}` : '',
      title ? `TITLE:${title}` : '',
      phone ? `TEL;TYPE=CELL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      website ? `URL:${website}` : '',
      address ? `ADR;TYPE=WORK:;;${address.replace(/[\r\n]+/g, ', ')};;;;` : '',
      note ? `NOTE:${note.replace(/[\r\n]+/g, ' ')}` : '',
      'END:VCARD'
    ].filter(Boolean);

    return lines.join('\r\n');
  }

  const SOCIAL_LINK_TYPES = new Set(['instagram', 'facebook', 'linkedin', 'youtube', 'twitter']);

  function showCardToast(message) {
    let toast = document.getElementById('cardToast');
    let toastMsg = document.getElementById('cardToastMessage');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cardToast';
      toast.className = 'card-toast';
      toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span id="cardToastMessage"></span>`;
      document.body.appendChild(toast);
      toastMsg = document.getElementById('cardToastMessage');
    }
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function getCanonicalCardUrl(card) {
    const slug = card.profileSlug || '';
    const origin = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null')
      ? window.location.origin
      : 'https://www.ambrosstudio.space';
    return slug ? `${origin}/c/${encodeURIComponent(slug)}` : window.location.href;
  }

  async function handleCardShare(card) {
    const name = card.fullName || card.full_name || card.name || 'Digital Business Card';
    const canonicalUrl = getCanonicalCardUrl(card);
    const shareBtn = document.getElementById('shareCardBtn');

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} — Ambros Studio`,
          text: `Connect with ${name}`,
          url: canonicalUrl
        });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    // Fallback: Clipboard copy
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      showCardToast('Card link copied to clipboard!');
      if (shareBtn) {
        const originalHtml = shareBtn.innerHTML;
        shareBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style="color: #10b981; font-weight: 600;">Copied!</span>
        `;
        setTimeout(() => {
          shareBtn.innerHTML = originalHtml;
        }, 2500);
      }
    } catch (_) {
      const input = document.createElement('input');
      input.value = canonicalUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showCardToast('Card link copied to clipboard!');
    }
  }

  function generateQrCanvas(qr, cellSize = 8, margin = 4) {
    const moduleCount = qr.getModuleCount();
    const size = (moduleCount + margin * 2) * cellSize;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect((c + margin) * cellSize, (r + margin) * cellSize, cellSize, cellSize);
        }
      }
    }
    return canvas;
  }

  function openQrModal(card) {
    const backdrop = document.getElementById('qrModalBackdrop');
    if (!backdrop) return;

    const name = card.fullName || card.full_name || card.name || 'Digital Card';
    const slug = card.profileSlug || 'card';
    const canonicalUrl = getCanonicalCardUrl(card);

    const titleEl = document.getElementById('qrModalTitle');
    if (titleEl) titleEl.textContent = name;

    const urlTextEl = document.getElementById('qrModalUrlText');
    if (urlTextEl) urlTextEl.textContent = canonicalUrl;

    const container = document.getElementById('qrModalCanvasContainer');
    if (container && typeof qrcode !== 'undefined') {
      try {
        const qr = qrcode(0, 'M');
        qr.addData(canonicalUrl);
        qr.make();
        container.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2 });

        // Download PNG
        const pngBtn = document.getElementById('qrDownloadPngBtn');
        if (pngBtn) {
          pngBtn.onclick = function() {
            try {
              const canvas = generateQrCanvas(qr, 10, 4);
              const a = document.createElement('a');
              a.download = `${slug}-qr.png`;
              a.href = canvas.toDataURL('image/png');
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              showCardToast('QR code downloaded (PNG)');
            } catch (err) {
              console.error('PNG download error:', err);
            }
          };
        }

        // Download SVG
        const svgBtn = document.getElementById('qrDownloadSvgBtn');
        if (svgBtn) {
          svgBtn.onclick = function() {
            try {
              const svgData = qr.createSvgTag({ cellSize: 8, margin: 4 });
              const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.download = `${slug}-qr.svg`;
              a.href = url;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              showCardToast('QR code downloaded (SVG)');
            } catch (err) {
              console.error('SVG download error:', err);
            }
          };
        }
      } catch (err) {
        console.error('Error rendering QR code:', err);
      }
    }

    // Copy Link button in modal
    const copyBtn = document.getElementById('qrCopyLinkBtn');
    if (copyBtn) {
      copyBtn.onclick = function() {
        navigator.clipboard.writeText(canonicalUrl).then(() => {
          showCardToast('Card link copied to clipboard!');
          const textEl = document.getElementById('qrCopyLinkText');
          if (textEl) {
            const orig = textEl.textContent;
            textEl.textContent = 'Copied!';
            setTimeout(() => { textEl.textContent = orig; }, 2000);
          }
        });
      };
    }

    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  function closeQrModal() {
    const backdrop = document.getElementById('qrModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
      backdrop.setAttribute('aria-hidden', 'true');
    }
  }

  function attachCardActions(card) {
    attachVCardDownload(card);

    const shareBtn = document.getElementById('shareCardBtn');
    if (shareBtn) {
      shareBtn.onclick = function(e) {
        e.preventDefault();
        handleCardShare(card);
      };
    }

    const showQrBtn = document.getElementById('showQrBtn');
    if (showQrBtn) {
      showQrBtn.onclick = function(e) {
        e.preventDefault();
        openQrModal(card);
      };
    }

    const closeBtn = document.getElementById('qrModalCloseBtn');
    if (closeBtn) {
      closeBtn.onclick = function() {
        closeQrModal();
      };
    }

    const backdrop = document.getElementById('qrModalBackdrop');
    if (backdrop) {
      backdrop.onclick = function(e) {
        if (e.target === backdrop) {
          closeQrModal();
        }
      };
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeQrModal();
      }
    });
  }

  function attachVCardDownload(card) {
    const saveBtn = document.getElementById('saveContactBtn');
    if (!saveBtn) return;

    saveBtn.onclick = function (e) {
      e.preventDefault();
      try {
        const vcardText = generateVCard(card);
        const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `${(card.fullName || card.full_name || card.name || 'contact').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.vcf`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const originalHtml = saveBtn.innerHTML;
        saveBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Contact Saved!</span>
        `;
        setTimeout(() => {
          saveBtn.innerHTML = originalHtml;
        }, 2500);
      } catch (err) {
        console.error('Error generating vCard:', err);
      }
    };
  }

  function renderError(message, title) {
    document.documentElement.classList.remove('card-loading');
    const skeleton = document.getElementById('cardSkeleton');
    if (skeleton) skeleton.remove();

    const main = document.querySelector('main') || document.body;
    main.innerHTML = `
      <div style="min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 24px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1 style="font-size: 22px; font-weight: 700; color: #f8fafc; margin-bottom: 10px;">${escapeHtml(title || 'Card Unavailable')}</h1>
        <p style="font-size: 14px; color: #94a3b8; max-width: 340px; line-height: 1.6; margin: 0 auto 24px;">${escapeHtml(message)}</p>
        <a href="/" style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #38bdf8; text-decoration: none;">
          &larr; Back to Ambros Studio
        </a>
      </div>
    `;
  }

  function hydrateDesign1(card, isPreview) {
    applyCustomAppearance(card.customSettings ? card.customSettings.appearance : null);

    const name = card.fullName || card.full_name || card.name || 'Ambros Studio Member';
    const role = card.designation || card.role || '';
    const company = card.company || card.company_name || '';
    const bio = card.description || '';
    const phone = card.phone || card.mobile_number || '';
    const whatsapp = card.whatsapp || card.whatsapp_number || '';
    const email = card.email || '';
    const website = card.website || '';
    const address = card.address || card.business_address || '';
    const instagram = card.socialInstagram || card.instagram_url || '';
    const linkedin = card.socialLinkedIn || card.linkedin_url || '';

    // Title & Meta
    document.title = `${name} — ${role ? role + ' | ' : ''}${company || 'Ambros Studio'}`;

    // Admin preview watermark banner
    if (isPreview) {
      const banner = document.createElement('div');
      const isActive = card.is_active !== false;
      banner.style.cssText = `background: #0f172a; color: #f8fafc; font-size: 12px; font-weight: 600; text-align: center; padding: 10px 16px; border-bottom: 2px solid ${isActive ? '#10b981' : '#f59e0b'}; position: sticky; top: 0; z-index: 1000; letter-spacing: 0.02em;`;
      banner.innerHTML = `ADMIN PREVIEW &bull; ${escapeHtml(name)} (${isActive ? '<span style="color: #34d399;">Active Card</span>' : '<span style="color: #fbbf24;">Inactive / Paused Card</span>'})`;
      document.body.prepend(banner);
    }

    // Avatar / Photo
    const avatarImgUrl = card.avatarUrl || card.avatar_url || card.profile_image_url || card.photo || card.image;
    const avatarWrap = document.querySelector('.profile-avatar-wrap');
    if (avatarWrap) {
      if (avatarImgUrl) {
        avatarWrap.innerHTML = `
          <img 
            src="${escapeHtml(avatarImgUrl)}" 
            alt="${escapeHtml(name)}" 
            class="profile-avatar"
            width="88"
            height="88"
            loading="eager"
            onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
          >
          <div class="profile-avatar-initials-fallback" style="display: none; width: 88px; height: 88px; border-radius: 50%; background: #fef3c7; color: #92400e; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin: 0 auto; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
            ${escapeHtml(getInitials(name))}
          </div>
          <span class="profile-badge-active" title="Available for projects" aria-hidden="true"></span>
        `;
      } else {
        avatarWrap.innerHTML = `
          <div style="width: 88px; height: 88px; border-radius: 50%; background: #fef3c7; color: #92400e; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin: 0 auto; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
            ${escapeHtml(getInitials(name))}
          </div>
          <span class="profile-badge-active" title="Available for projects" aria-hidden="true"></span>
        `;
      }
    }

    // Headers
    const nameEl = document.querySelector('.profile-name');
    if (nameEl) nameEl.textContent = name;

    const roleEl = document.querySelector('.profile-designation');
    if (roleEl) {
      roleEl.textContent = role;
      roleEl.style.display = role ? '' : 'none';
    }

    const companyEl = document.querySelector('.profile-company');
    if (companyEl) {
      companyEl.textContent = company;
      companyEl.style.display = company ? '' : 'none';
    }

    const bioEl = document.querySelector('.profile-bio');
    if (bioEl) {
      bioEl.textContent = bio;
      bioEl.style.display = bio ? '' : 'none';
    }

    // Custom Dynamic Links or Legacy Fallback (Get in touch vs Social)
    const validLinks = extractValidLinks(card);
    const hasCustomLinks = validLinks.length > 0;
    const getInTouchSection = document.querySelector('.get-in-touch-section') || document.querySelector('.contact-list')?.closest('section');
    const contactListEl = document.querySelector('.contact-list');
    const socialSection = document.querySelector('.social-section') || document.querySelector('section[aria-label="Social media profiles"]');
    const socialGridEl = document.querySelector('.social-grid');

    if (hasCustomLinks) {
      const contactLinks = validLinks.filter(l => !SOCIAL_LINK_TYPES.has(l.type.toLowerCase()));
      const socialLinks = validLinks.filter(l => SOCIAL_LINK_TYPES.has(l.type.toLowerCase()));

      // 1. Get in touch
      if (contactListEl) {
        contactListEl.innerHTML = '';
        if (contactLinks.length > 0) {
          contactLinks.forEach(link => {
            const type = link.type.toLowerCase();
            const dest = formatLinkDestination(type, link.value);
            if (!dest) return;

            const label = link.label || getDefaultLabel(type);
            const displayVal = getDisplayValue(type, link.value, label);
            const isExternal = type !== 'phone' && type !== 'email';
            const badgeClass = getDesign1BadgeClass(type);
            const svgIcon = getLinkIconSvg(type, 20);

            const cardEl = document.createElement('a');
            cardEl.href = dest;
            cardEl.className = 'contact-card';
            if (isExternal) {
              cardEl.target = '_blank';
              cardEl.rel = 'noopener noreferrer';
            }
            cardEl.setAttribute('aria-label', label);
            cardEl.innerHTML = `
              <div class="contact-card-left">
                <div class="badge-icon ${badgeClass}" aria-hidden="true">
                  ${svgIcon}
                </div>
                <div class="contact-info">
                  <span class="contact-label">${escapeHtml(label)}</span>
                  <span class="contact-value">${escapeHtml(displayVal)}</span>
                </div>
              </div>
              <svg class="card-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            `;
            contactListEl.appendChild(cardEl);
          });
          if (getInTouchSection) getInTouchSection.style.display = '';
        } else {
          if (getInTouchSection) getInTouchSection.style.display = 'none';
        }
      }

      // 2. Social
      if (socialGridEl) {
        socialGridEl.innerHTML = '';
        if (socialLinks.length > 0) {
          socialLinks.forEach(link => {
            const type = link.type.toLowerCase();
            const dest = formatLinkDestination(type, link.value);
            if (!dest) return;

            const label = link.label || getDefaultLabel(type);
            const badgeClass = getDesign1BadgeClass(type);
            const svgIcon = getLinkIconSvg(type, 20);

            const cardEl = document.createElement('a');
            cardEl.href = dest;
            cardEl.className = 'social-card';
            cardEl.target = '_blank';
            cardEl.rel = 'noopener noreferrer';
            cardEl.setAttribute('aria-label', label);
            cardEl.innerHTML = `
              <div class="badge-icon ${badgeClass}" aria-hidden="true">
                ${svgIcon}
              </div>
              <span class="social-label">${escapeHtml(label)}</span>
            `;
            socialGridEl.appendChild(cardEl);
          });
          if (socialSection) socialSection.style.display = '';
        } else {
          if (socialSection) socialSection.style.display = 'none';
        }
      }
    } else {
      // Existing fallback for legacy customers without custom links
      let hasContact = false;
      const callCard = document.querySelector('.contact-card[href^="tel:"]');
      if (callCard) {
        if (phone) {
          callCard.href = `tel:${phone.replace(/\s+/g, '')}`;
          const valEl = callCard.querySelector('.contact-value');
          if (valEl) valEl.textContent = phone;
          callCard.style.display = '';
          hasContact = true;
        } else {
          callCard.style.display = 'none';
        }
      }

      const waCard = document.querySelector('.contact-card[href*="wa.me"]');
      if (waCard) {
        if (whatsapp) {
          const cleanWa = whatsapp.replace(/\D/g, '');
          waCard.href = `https://wa.me/${cleanWa}`;
          waCard.style.display = '';
          hasContact = true;
        } else {
          waCard.style.display = 'none';
        }
      }

      const emailCard = document.querySelector('.contact-card[href^="mailto:"]');
      if (emailCard) {
        if (email) {
          emailCard.href = `mailto:${email}`;
          const valEl = emailCard.querySelector('.contact-value');
          if (valEl) valEl.textContent = email;
          emailCard.style.display = '';
          hasContact = true;
        } else {
          emailCard.style.display = 'none';
        }
      }

      const webCard = document.querySelector('.contact-card[href*="lumenstudio.co"]');
      if (webCard) {
        if (website) {
          webCard.href = normalizeUrl(website);
          const valEl = webCard.querySelector('.contact-value');
          if (valEl) valEl.textContent = website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
          webCard.style.display = '';
          hasContact = true;
        } else {
          webCard.style.display = 'none';
        }
      }

      if (getInTouchSection) {
        getInTouchSection.style.display = hasContact ? '' : 'none';
      }

      // Socials
      let hasSocial = false;
      const igLink = document.querySelector('.social-card[href*="instagram.com"]');
      if (igLink) {
        if (instagram) {
          igLink.href = normalizeUrl(instagram);
          igLink.style.display = '';
          hasSocial = true;
        } else {
          igLink.style.display = 'none';
        }
      }

      const inLink = document.querySelector('.social-card[href*="linkedin.com"]');
      if (inLink) {
        if (linkedin) {
          inLink.href = normalizeUrl(linkedin);
          inLink.style.display = '';
          hasSocial = true;
        } else {
          inLink.style.display = 'none';
        }
      }

      const fbLink = document.querySelector('.social-card[href*="facebook.com"]');
      if (fbLink) fbLink.style.display = 'none';

      if (socialSection) {
        socialSection.style.display = hasSocial ? '' : 'none';
      }
    }

    // Hook card actions (Save Contact, Share, QR Code)
    attachCardActions(card);

    // Dismiss loading state and skeleton
    document.documentElement.classList.remove('card-loading');
    const skeleton = document.getElementById('cardSkeleton');
    if (skeleton) skeleton.remove();
  }

  function hydrateDesign2(card, isPreview) {
    applyCustomAppearance(card.customSettings ? card.customSettings.appearance : null);

    const name = card.fullName || card.full_name || card.name || 'Ambros Studio Member';
    const role = card.designation || card.role || '';
    const company = card.company || card.company_name || '';
    const bio = card.description || '';
    const phone = card.phone || card.mobile_number || '';
    const whatsapp = card.whatsapp || card.whatsapp_number || '';
    const email = card.email || '';
    const website = card.website || '';
    const address = card.address || card.business_address || '';
    const instagram = card.socialInstagram || card.instagram_url || '';
    const linkedin = card.socialLinkedIn || card.linkedin_url || '';

    // Title
    document.title = `${name} — ${role ? role + ' | ' : ''}${company || 'Ambros Studio'}`;

    // Admin preview watermark banner
    if (isPreview) {
      const banner = document.createElement('div');
      const isActive = card.is_active !== false;
      banner.style.cssText = `background: #0f172a; color: #f8fafc; font-size: 12px; font-weight: 600; text-align: center; padding: 10px 16px; border-bottom: 2px solid ${isActive ? '#10b981' : '#f59e0b'}; position: sticky; top: 0; z-index: 1000; letter-spacing: 0.02em;`;
      banner.innerHTML = `ADMIN PREVIEW &bull; ${escapeHtml(name)} (${isActive ? '<span style="color: #34d399;">Active Card</span>' : '<span style="color: #fbbf24;">Inactive / Paused Card</span>'})`;
      document.body.prepend(banner);
    }

    // Avatar / Photo or Monogram Initials
    const avatarImgUrl = card.avatarUrl || card.avatar_url || card.profile_image_url || card.photo || card.image;
    const avatarCircle = document.querySelector('.profile-avatar-circle');
    if (avatarCircle) {
      if (avatarImgUrl) {
        avatarCircle.innerHTML = `
          <img 
            src="${escapeHtml(avatarImgUrl)}" 
            alt="${escapeHtml(name)}" 
            class="profile-avatar-img"
            style="width: 100%; height: 100%; border-radius: 50%; object-fit: contain; padding: 8px; box-sizing: border-box; background: #ffffff; display: block;"
            onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';"
          >
          <span class="profile-avatar-initials" style="display: none;">${escapeHtml(getInitials(name))}</span>
        `;
      } else {
        avatarCircle.innerHTML = `
          <span class="profile-avatar-initials">${escapeHtml(getInitials(name))}</span>
        `;
      }
    }

    // Headers
    const nameEl = document.querySelector('.profile-name');
    if (nameEl) nameEl.textContent = name;

    const roleEl = document.querySelector('.profile-designation');
    if (roleEl) {
      roleEl.textContent = role;
      roleEl.style.display = role ? '' : 'none';
    }

    const companyEl = document.querySelector('.profile-company');
    if (companyEl) {
      companyEl.textContent = company;
      companyEl.style.display = company ? '' : 'none';
    }

    const bioEl = document.querySelector('.profile-bio');
    if (bioEl) {
      bioEl.textContent = bio;
      bioEl.style.display = bio ? '' : 'none';
    }

    // Custom Dynamic Links or Legacy Fallback (Get in touch vs Social)
    const validLinks = extractValidLinks(card);
    const hasCustomLinks = validLinks.length > 0;
    const getInTouchSection = document.querySelector('.get-in-touch-section') || document.querySelector('section[aria-label="Get in touch options"]');
    const contactListEl = document.querySelector('.contact-list');
    const socialSection = document.querySelector('.social-section') || document.querySelector('section[aria-label="Social media profiles"]');
    const followBoxEl = document.querySelector('.follow-box');

    if (hasCustomLinks) {
      const contactLinks = validLinks.filter(l => !SOCIAL_LINK_TYPES.has(l.type.toLowerCase()));
      const socialLinks = validLinks.filter(l => SOCIAL_LINK_TYPES.has(l.type.toLowerCase()));

      // 1. Get in touch
      if (contactListEl) {
        contactListEl.innerHTML = '';
        if (contactLinks.length > 0) {
          contactLinks.forEach(link => {
            const type = link.type.toLowerCase();
            const dest = formatLinkDestination(type, link.value);
            if (!dest) return;

            const label = link.label || getDefaultLabel(type);
            const displayVal = getDisplayValue(type, link.value, label);
            const isExternal = type !== 'phone' && type !== 'email';
            const svgIcon = getLinkIconSvg(type, 18);

            const rowEl = document.createElement('a');
            rowEl.href = dest;
            rowEl.className = 'contact-row';
            if (isExternal) {
              rowEl.target = '_blank';
              rowEl.rel = 'noopener noreferrer';
            }
            rowEl.setAttribute('aria-label', label);
            rowEl.innerHTML = `
              <div class="contact-row-left">
                <div class="icon-circle" aria-hidden="true">
                  ${svgIcon}
                </div>
                <div class="contact-meta">
                  <span class="contact-sub">${escapeHtml(label)}</span>
                  <span class="contact-main">${escapeHtml(displayVal)}</span>
                </div>
              </div>
              <svg class="row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            `;
            contactListEl.appendChild(rowEl);
          });
          if (getInTouchSection) getInTouchSection.style.display = '';
        } else {
          if (getInTouchSection) getInTouchSection.style.display = 'none';
        }
      }

      // 2. Social
      if (followBoxEl) {
        followBoxEl.innerHTML = '';
        if (socialLinks.length > 0) {
          socialLinks.forEach(link => {
            const type = link.type.toLowerCase();
            const dest = formatLinkDestination(type, link.value);
            if (!dest) return;

            const label = link.label || getDefaultLabel(type);
            const svgIcon = getLinkIconSvg(type, 20);

            const rowEl = document.createElement('a');
            rowEl.href = dest;
            rowEl.className = 'follow-item';
            rowEl.target = '_blank';
            rowEl.rel = 'noopener noreferrer';
            rowEl.setAttribute('aria-label', label);
            rowEl.innerHTML = `
              ${svgIcon}
              <span class="follow-item-label">${escapeHtml(label)}</span>
            `;
            followBoxEl.appendChild(rowEl);
          });
          if (socialSection) socialSection.style.display = '';
        } else {
          if (socialSection) socialSection.style.display = 'none';
        }
      }
    } else {
      // Existing fallback for legacy customers without custom links
      let hasContact = false;
      const callRow = document.querySelector('.contact-row[href^="tel:"]');
      if (callRow) {
        if (phone) {
          callRow.href = `tel:${phone.replace(/\s+/g, '')}`;
          const mainEl = callRow.querySelector('.contact-main');
          if (mainEl) mainEl.textContent = phone;
          callRow.style.display = '';
          hasContact = true;
        } else {
          callRow.style.display = 'none';
        }
      }

      const waRow = document.querySelector('.contact-row[href*="wa.me"]');
      if (waRow) {
        if (whatsapp) {
          const cleanWa = whatsapp.replace(/\D/g, '');
          waRow.href = `https://wa.me/${cleanWa}`;
          waRow.style.display = '';
          hasContact = true;
        } else {
          waRow.style.display = 'none';
        }
      }

      const emailRow = document.querySelector('.contact-row[href^="mailto:"]');
      if (emailRow) {
        if (email) {
          emailRow.href = `mailto:${email}`;
          const mainEl = emailRow.querySelector('.contact-main');
          if (mainEl) mainEl.textContent = email;
          emailRow.style.display = '';
          hasContact = true;
        } else {
          emailRow.style.display = 'none';
        }
      }

      const webRow = document.querySelector('.contact-row[href*="desaipartners.in"]');
      if (webRow) {
        if (website) {
          webRow.href = normalizeUrl(website);
          const mainEl = webRow.querySelector('.contact-main');
          if (mainEl) mainEl.textContent = website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
          webRow.style.display = '';
          hasContact = true;
        } else {
          webRow.style.display = 'none';
        }
      }

      if (getInTouchSection) {
        getInTouchSection.style.display = hasContact ? '' : 'none';
      }

      // Follow Links
      let hasSocial = false;
      const igFollow = document.querySelector('.follow-item[href*="instagram.com"]');
      if (igFollow) {
        if (instagram) {
          igFollow.href = normalizeUrl(instagram);
          igFollow.style.display = '';
          hasSocial = true;
        } else {
          igFollow.style.display = 'none';
        }
      }

      const inFollow = document.querySelector('.follow-item[href*="linkedin.com"]');
      if (inFollow) {
        if (linkedin) {
          inFollow.href = normalizeUrl(linkedin);
          inFollow.style.display = '';
          hasSocial = true;
        } else {
          inFollow.style.display = 'none';
        }
      }

      const fbFollow = document.querySelector('.follow-item[href*="facebook.com"]');
      if (fbFollow) fbFollow.style.display = 'none';

      if (socialSection) {
        socialSection.style.display = hasSocial ? '' : 'none';
      }
    }

    // Hook card actions (Save Contact, Share, QR Code)
    attachCardActions(card);

    // Dismiss loading state and skeleton
    document.documentElement.classList.remove('card-loading');
    const skeleton = document.getElementById('cardSkeleton');
    if (skeleton) skeleton.remove();
  }

  function ensureCorrectTemplate(card) {
    if (!window.location.pathname.includes('/cards/')) {
      return true;
    }
    const design = card.cardDesign || card.card_design;
    const isEvergreen = design === 'Evergreen';
    const isDesign2 = window.location.pathname.includes('design-2');
    if (design && ((isEvergreen && !isDesign2) || (!isEvergreen && isDesign2))) {
      const targetDir = isEvergreen ? 'design-2' : 'design-1';
      const newUrl = window.location.pathname.replace(/design-[12]/, targetDir) + window.location.search;
      window.location.replace(newUrl);
      return false;
    }
    return true;
  }

  async function loadPublicCard(slug) {
    const isDesign2 = window.location.pathname.includes('design-2');
    try {
      const res = await fetch(`/api/cards/${encodeURIComponent(slug)}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.status === 404) {
        renderError('This digital business card is currently inactive or does not exist.', 'Card Unavailable');
        return;
      }

      if (!res.ok) {
        renderError('Unable to load card details at this time. Please try again shortly.', 'Temporary Error');
        return;
      }

      const data = await res.json();
      if (data && data.card) {
        if (!ensureCorrectTemplate(data.card)) return;
        if (isDesign2) {
          hydrateDesign2(data.card, false);
        } else {
          hydrateDesign1(data.card, false);
        }
      } else {
        renderError('Card data format invalid.', 'Error');
      }
    } catch (err) {
      console.error('Public card hydration error:', err);
      renderError('Unable to display digital card due to a network connection error.', 'Connection Error');
    }
  }

  async function init() {
    // 0. Pre-hydrated Server Data Check (instant 0ms hydration for clean /c/[slug] URLs)
    if (typeof window !== 'undefined' && window.__INITIAL_CARD__) {
      const card = window.__INITIAL_CARD__;
      const isDesign2 = window.location.pathname.includes('design-2') || card.cardDesign === 'Evergreen';
      if (isDesign2) {
        hydrateDesign2(card, false);
      } else {
        hydrateDesign1(card, false);
      }
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const custId = params.get('id');
    const isPreview = params.get('preview') === 'true';

    // Support slug from query param OR path (/c/[slug])
    let slug = params.get('slug');
    if (!slug) {
      const pathMatch = window.location.pathname.match(/\/c\/([^/?#]+)/i);
      if (pathMatch) {
        slug = decodeURIComponent(pathMatch[1]);
      }
    }

    // If no dynamic query parameters exist, do nothing (preserve static template preview)
    if (!slug && !custId) {
      document.documentElement.classList.remove('card-loading');
      return;
    }

    // Ensure loading state is active whenever dynamic parameters are present
    document.documentElement.classList.add('card-loading');

    const isDesign2 = window.location.pathname.includes('design-2');

    // 1. Admin Preview Mode (activated whenever preview=true and either id or slug is present)
    if (isPreview && (custId || slug)) {
      const identifier = custId || slug;
      try {
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(identifier)}`, {
          headers: { 'Accept': 'application/json' },
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.customer) {
            if (!ensureCorrectTemplate(data.customer)) return;
            if (isDesign2) {
              hydrateDesign2(data.customer, true);
            } else {
              hydrateDesign1(data.customer, true);
            }
            return;
          } else {
            renderError('Customer data format invalid.', 'Error');
            return;
          }
        } else if (res.status === 401 || res.status === 403) {
          // If admin session is expired or not present, fallback to public card lookup if slug is available
          if (slug) {
            await loadPublicCard(slug);
            return;
          }
          renderError('This customer profile preview is restricted to authorized Ambros Studio administrators.', 'Preview Access Denied');
          return;
        } else if (!slug) {
          renderError('Customer profile record not found.', 'Record Not Found');
          return;
        }
      } catch (err) {
        console.error('Admin preview hydration error:', err);
        if (slug) {
          await loadPublicCard(slug);
          return;
        }
        renderError('Unable to load customer preview due to a network error.', 'Connection Error');
        return;
      }
    }

    // 2. Public NFC / Slug Mode
    if (slug) {
      await loadPublicCard(slug);
    } else {
      renderError('Customer profile record not found.', 'Record Not Found');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
