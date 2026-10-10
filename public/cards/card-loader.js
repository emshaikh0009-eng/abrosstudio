/**
 * Ambros Studio — Universal Digital Card Dynamic Hydration Controller
 * Supports all 16 Canonical Designs:
 *   - Personal (6): Mint Haven, Evergreen, Noir Gold, Emerald Ivory, Neon Pulse, Mono Studio
 *   - Business (6): Classic Navy, Fresh Mint, Bold Pop, Bento Grid, Glass Aurora, Luxe Foil
 *   - Industry Specials (4): Skyline, Atelier, Care Plus, Roast & Co.
 * 
 * Supports:
 *   1. Pre-hydrated Server Mode (window.__INITIAL_CARD__ with 0ms paint)
 *   2. Public Mode: ?slug={profile_slug} via GET /api/cards/{slug}
 *   3. Admin Preview Mode: ?id={id}&preview=true via GET /api/admin/customers/{id}
 *   4. Legacy Template Mode (/cards/design-1/ & /cards/design-2/)
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
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return String(name).slice(0, 2).toUpperCase();
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
    'Inter': 'family=Inter:wght@400;500;600;700;800;900',
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
    const slug = card.profileSlug || card.profile_slug || '';
    const origin = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null')
      ? window.location.origin
      : 'https://ambrosstudio.com';
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
    const slug = card.profileSlug || card.profile_slug || 'card';
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
    // 1. Save Contact
    const saveBtn = document.getElementById('saveContactBtn');
    if (saveBtn) {
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

    // 2. Share
    const shareBtn = document.getElementById('shareCardBtn');
    if (shareBtn) {
      shareBtn.onclick = function(e) {
        e.preventDefault();
        handleCardShare(card);
      };
    }

    // 3. QR Modal
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

  /**
   * Universal Hydration for All 16 Designs
   */
  function hydrateUniversal(card, isPreview) {
    const registry = window.CARD_DESIGN_REGISTRY;
    const renderer = window.CARD_RENDERER;
    const design = registry ? registry.resolveCardDesign(card.cardDesign || card.card_design) : { id: 'mint-haven', name: 'Mint Haven' };

    applyCustomAppearance(card.customSettings ? card.customSettings.appearance : null);

    const name = card.fullName || card.full_name || card.name || 'Ambros Studio Member';
    const role = card.designation || card.role || '';
    const company = card.company || card.company_name || '';

    document.title = `${name} — ${role ? role + ' | ' : ''}${company || 'Ambros Studio'}`;

    // Update body theme classes
    document.documentElement.className = `theme-${design.id}`;
    document.body.className = `theme-${design.id}`;

    // If viewport wrapper exists and needs body rendering (e.g. preview mode or dynamic fetch)
    const viewport = document.getElementById('cardViewport') || document.querySelector('main.viewport-wrapper');
    if (viewport && renderer && typeof renderer.renderCardBody === 'function') {
      let previewBanner = '';
      if (isPreview) {
        const isActive = card.is_active !== false;
        previewBanner = `
          <div style="background: #0f172a; color: #f8fafc; font-size: 11.5px; font-weight: 700; text-align: center; padding: 8px 14px; border-radius: 8px; margin-bottom: 14px; border: 1px solid #334155;">
            ADMIN PREVIEW &bull; ${escapeHtml(design.name)} (${isActive ? '<span style="color: #34d399;">Active</span>' : '<span style="color: #fbbf24;">Inactive</span>'})
          </div>
        `;
      }
      viewport.innerHTML = previewBanner + renderer.renderCardBody(card, design);
    }

    attachCardActions(card);

    document.documentElement.classList.remove('card-loading');
    const skeleton = document.getElementById('cardSkeleton');
    if (skeleton) skeleton.remove();
  }

  /**
   * Legacy Template Hydration: Design 1 (Mint Haven)
   */
  function hydrateLegacyDesign1(card, isPreview) {
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

    document.title = `${name} — ${role ? role + ' | ' : ''}${company || 'Ambros Studio'}`;

    if (isPreview) {
      const banner = document.createElement('div');
      const isActive = card.is_active !== false;
      banner.style.cssText = `background: #0f172a; color: #f8fafc; font-size: 12px; font-weight: 600; text-align: center; padding: 10px 16px; border-bottom: 2px solid ${isActive ? '#10b981' : '#f59e0b'}; position: sticky; top: 0; z-index: 1000; letter-spacing: 0.02em;`;
      banner.innerHTML = `ADMIN PREVIEW &bull; ${escapeHtml(name)} (${isActive ? '<span style="color: #34d399;">Active Card</span>' : '<span style="color: #fbbf24;">Inactive</span>'})`;
      document.body.prepend(banner);
    }

    // Avatar
    const avatarImgUrl = card.avatarUrl || card.avatar_url || card.profile_image_url || card.photo || '';
    const avatarWrap = document.querySelector('.profile-avatar-wrap');
    if (avatarWrap) {
      if (avatarImgUrl) {
        avatarWrap.innerHTML = `
          <img src="${escapeHtml(avatarImgUrl)}" alt="${escapeHtml(name)}" class="profile-avatar" width="88" height="88" loading="eager" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
          <div class="profile-avatar-initials-fallback" style="display: none; width: 88px; height: 88px; border-radius: 50%; background: #fef3c7; color: #92400e; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin: 0 auto; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">${escapeHtml(getInitials(name))}</div>
          <span class="profile-badge-active" title="Available for projects" aria-hidden="true"></span>
        `;
      } else {
        avatarWrap.innerHTML = `
          <div style="width: 88px; height: 88px; border-radius: 50%; background: #fef3c7; color: #92400e; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin: 0 auto; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">${escapeHtml(getInitials(name))}</div>
          <span class="profile-badge-active" title="Available for projects" aria-hidden="true"></span>
        `;
      }
    }

    const nameEl = document.querySelector('.profile-name');
    if (nameEl) nameEl.textContent = name;
    const roleEl = document.querySelector('.profile-designation');
    if (roleEl) { roleEl.textContent = role; roleEl.style.display = role ? '' : 'none'; }
    const companyEl = document.querySelector('.profile-company');
    if (companyEl) { companyEl.textContent = company; companyEl.style.display = company ? '' : 'none'; }
    const bioEl = document.querySelector('.profile-bio');
    if (bioEl) { bioEl.textContent = bio; bioEl.style.display = bio ? '' : 'none'; }

    // Business details section
    const bSection = document.querySelector('.business-section');
    if (bSection) {
      let hasBiz = false;
      const bCompany = bSection.querySelector('.detail-group-company');
      if (bCompany) {
        if (company) { bCompany.querySelector('.detail-value').textContent = company; bCompany.style.display = ''; hasBiz = true; }
        else bCompany.style.display = 'none';
      }
      const bRole = bSection.querySelector('.detail-group-designation');
      if (bRole) {
        if (role) { bRole.querySelector('.detail-value').textContent = role; bRole.style.display = ''; hasBiz = true; }
        else bRole.style.display = 'none';
      }
      const bAddress = bSection.querySelector('.detail-group-address');
      if (bAddress) {
        if (address) { bAddress.querySelector('.detail-value').textContent = address; bAddress.style.display = ''; hasBiz = true; }
        else bAddress.style.display = 'none';
      }
      const bWeb = bSection.querySelector('.detail-group-website');
      if (bWeb) {
        if (website) {
          const a = bWeb.querySelector('a');
          if (a) { a.href = normalizeUrl(website); a.textContent = website.replace(/^https?:\/\//i, '').replace(/\/$/, ''); }
          bWeb.style.display = '';
          hasBiz = true;
        } else bWeb.style.display = 'none';
      }
      bSection.style.display = hasBiz ? '' : 'none';
    }

    // Call / WA / Email / Web
    const callCard = document.querySelector('.contact-card[href^="tel:"]');
    if (callCard) {
      if (phone) { callCard.href = `tel:${phone.replace(/\s+/g, '')}`; const val = callCard.querySelector('.contact-value'); if (val) val.textContent = phone; callCard.style.display = ''; }
      else callCard.style.display = 'none';
    }
    const waCard = document.querySelector('.contact-card[href*="wa.me"]');
    if (waCard) {
      if (whatsapp) { waCard.href = `https://wa.me/${whatsapp.replace(/\D/g, '')}`; waCard.style.display = ''; }
      else waCard.style.display = 'none';
    }
    const emCard = document.querySelector('.contact-card[href^="mailto:"]');
    if (emCard) {
      if (email) { emCard.href = `mailto:${email}`; const val = emCard.querySelector('.contact-value'); if (val) val.textContent = email; emCard.style.display = ''; }
      else emCard.style.display = 'none';
    }
    const webCard = document.querySelector('.contact-card-website') || document.querySelector('.contact-card[href*="lumenstudio.co"]');
    if (webCard) {
      if (website) { webCard.href = normalizeUrl(website); const val = webCard.querySelector('.contact-value'); if (val) val.textContent = website.replace(/^https?:\/\//i, '').replace(/\/$/, ''); webCard.style.display = ''; }
      else webCard.style.display = 'none';
    }

    // Socials
    const sSection = document.querySelector('.social-section');
    if (sSection) {
      let hasSoc = false;
      const ig = sSection.querySelector('.social-card-instagram') || sSection.querySelector('a[href*="instagram.com"]');
      if (ig) { if (instagram) { ig.href = normalizeUrl(instagram); ig.style.display = ''; hasSoc = true; } else ig.style.display = 'none'; }
      const li = sSection.querySelector('.social-card-linkedin') || sSection.querySelector('a[href*="linkedin.com"]');
      if (li) { if (linkedin) { li.href = normalizeUrl(linkedin); li.style.display = ''; hasSoc = true; } else li.style.display = 'none'; }
      const fb = sSection.querySelector('.social-card-facebook');
      if (fb) fb.style.display = 'none';
      sSection.style.display = hasSoc ? '' : 'none';
    }

    attachCardActions(card);
    document.documentElement.classList.remove('card-loading');
    const skeleton = document.getElementById('cardSkeleton');
    if (skeleton) skeleton.remove();
  }

  /**
   * Legacy Template Hydration: Design 2 (Evergreen)
   */
  function hydrateLegacyDesign2(card, isPreview) {
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

    document.title = `${name} — ${role ? role + ' | ' : ''}${company || 'Ambros Studio'}`;

    if (isPreview) {
      const banner = document.createElement('div');
      const isActive = card.is_active !== false;
      banner.style.cssText = `background: #0f172a; color: #f8fafc; font-size: 12px; font-weight: 600; text-align: center; padding: 10px 16px; border-bottom: 2px solid ${isActive ? '#10b981' : '#f59e0b'}; position: sticky; top: 0; z-index: 1000; letter-spacing: 0.02em;`;
      banner.innerHTML = `ADMIN PREVIEW &bull; ${escapeHtml(name)} (${isActive ? '<span style="color: #34d399;">Active Card</span>' : '<span style="color: #fbbf24;">Inactive</span>'})`;
      document.body.prepend(banner);
    }

    // Avatar
    const avatarImgUrl = card.avatarUrl || card.avatar_url || card.profile_image_url || card.photo || '';
    const avatarCircle = document.querySelector('.profile-avatar-circle');
    if (avatarCircle) {
      if (avatarImgUrl) {
        avatarCircle.innerHTML = `
          <img src="${escapeHtml(avatarImgUrl)}" alt="${escapeHtml(name)}" class="profile-avatar-img" style="width: 100%; height: 100%; border-radius: 50%; object-fit: contain; padding: 4px; box-sizing: border-box; background: #ffffff;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';">
          <span class="profile-avatar-initials" style="display: none;">${escapeHtml(getInitials(name))}</span>
        `;
      } else {
        avatarCircle.innerHTML = `<span class="profile-avatar-initials">${escapeHtml(getInitials(name))}</span>`;
      }
    }

    const nameEl = document.querySelector('.profile-name');
    if (nameEl) nameEl.textContent = name;
    const roleEl = document.querySelector('.profile-designation');
    if (roleEl) { roleEl.textContent = role; roleEl.style.display = role ? '' : 'none'; }
    const companyEl = document.querySelector('.profile-company');
    if (companyEl) { companyEl.textContent = company; companyEl.style.display = company ? '' : 'none'; }
    const bioEl = document.querySelector('.profile-bio');
    if (bioEl) { bioEl.textContent = bio; bioEl.style.display = bio ? '' : 'none'; }

    // Business details section (NO LEAKS)
    const bSection = document.querySelector('.business-section') || document.querySelector('section[aria-label="Business details"]');
    if (bSection) {
      let hasBiz = false;
      const bCompany = bSection.querySelector('.business-row-company') || bSection.querySelector('.business-row:nth-child(1)');
      if (bCompany) {
        if (company) {
          const val = bCompany.querySelector('.business-val');
          if (val) val.textContent = company;
          bCompany.style.display = '';
          hasBiz = true;
        } else bCompany.style.display = 'none';
      }
      const bRole = bSection.querySelector('.business-row-designation') || bSection.querySelector('.business-row:nth-child(2)');
      if (bRole) {
        if (role) {
          const val = bRole.querySelector('.business-val');
          if (val) val.textContent = role;
          bRole.style.display = '';
          hasBiz = true;
        } else bRole.style.display = 'none';
      }
      const bAddress = bSection.querySelector('.business-row-address') || bSection.querySelector('.business-row:nth-child(3)');
      if (bAddress) {
        if (address) {
          const val = bAddress.querySelector('.business-val') || bAddress.querySelector('address');
          if (val) val.textContent = address;
          bAddress.style.display = '';
          hasBiz = true;
        } else bAddress.style.display = 'none';
      }
      const bWeb = bSection.querySelector('.business-row-website') || bSection.querySelector('.business-row:nth-child(4)');
      if (bWeb) {
        if (website) {
          const a = bWeb.querySelector('a');
          if (a) { a.href = normalizeUrl(website); a.textContent = website.replace(/^https?:\/\//i, '').replace(/\/$/, ''); }
          bWeb.style.display = '';
          hasBiz = true;
        } else bWeb.style.display = 'none';
      }
      bSection.style.display = hasBiz ? '' : 'none';
    }

    // Call / WA / Email / Web
    const callRow = document.querySelector('.contact-row[href^="tel:"]');
    if (callRow) {
      if (phone) { callRow.href = `tel:${phone.replace(/\s+/g, '')}`; const val = callRow.querySelector('.contact-main'); if (val) val.textContent = phone; callRow.style.display = ''; }
      else callRow.style.display = 'none';
    }
    const waRow = document.querySelector('.contact-row[href*="wa.me"]');
    if (waRow) {
      if (whatsapp) { waRow.href = `https://wa.me/${whatsapp.replace(/\D/g, '')}`; waRow.style.display = ''; }
      else waRow.style.display = 'none';
    }
    const emRow = document.querySelector('.contact-row[href^="mailto:"]');
    if (emRow) {
      if (email) { emRow.href = `mailto:${email}`; const val = emRow.querySelector('.contact-main'); if (val) val.textContent = email; emRow.style.display = ''; }
      else emRow.style.display = 'none';
    }
    const webRow = document.querySelector('.contact-row-website') || document.querySelector('.contact-row[href*="desaipartners.in"]');
    if (webRow) {
      if (website) { webRow.href = normalizeUrl(website); const val = webRow.querySelector('.contact-main'); if (val) val.textContent = website.replace(/^https?:\/\//i, '').replace(/\/$/, ''); webRow.style.display = ''; }
      else webRow.style.display = 'none';
    }

    // Socials
    const sSection = document.querySelector('.social-section');
    if (sSection) {
      let hasSoc = false;
      const ig = sSection.querySelector('.follow-item-instagram') || sSection.querySelector('a[href*="instagram.com"]');
      if (ig) { if (instagram) { ig.href = normalizeUrl(instagram); ig.style.display = ''; hasSoc = true; } else ig.style.display = 'none'; }
      const li = sSection.querySelector('.follow-item-linkedin') || sSection.querySelector('a[href*="linkedin.com"]');
      if (li) { if (linkedin) { li.href = normalizeUrl(linkedin); li.style.display = ''; hasSoc = true; } else li.style.display = 'none'; }
      const fb = sSection.querySelector('.follow-item-facebook');
      if (fb) fb.style.display = 'none';
      sSection.style.display = hasSoc ? '' : 'none';
    }

    attachCardActions(card);
    document.documentElement.classList.remove('card-loading');
    const skeleton = document.getElementById('cardSkeleton');
    if (skeleton) skeleton.remove();
  }

  function dispatchCardHydration(card, isPreview) {
    const isLegacy1 = window.location.pathname.includes('design-1');
    const isLegacy2 = window.location.pathname.includes('design-2');

    if (isLegacy1) {
      hydrateLegacyDesign1(card, isPreview);
      return;
    }
    if (isLegacy2) {
      hydrateLegacyDesign2(card, isPreview);
      return;
    }

    hydrateUniversal(card, isPreview);
  }

  async function loadPublicCard(slug) {
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
        dispatchCardHydration(data.card, false);
      } else {
        renderError('Card data format invalid.', 'Error');
      }
    } catch (err) {
      console.error('Public card hydration error:', err);
      renderError('Unable to display digital card due to a network connection error.', 'Connection Error');
    }
  }

  function renderError(message, title) {
    document.documentElement.classList.remove('card-loading');
    const skeleton = document.getElementById('cardSkeleton');
    if (skeleton) skeleton.remove();

    const main = document.querySelector('main') || document.body;
    main.innerHTML = `
      <div style="min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
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

  async function init() {
    // If preview mode or preview.html, allow preview controller to manage rendering cleanly
    if (typeof window !== 'undefined' && (window.__CARD_PREVIEW__ || window.location.pathname.includes('preview.html'))) {
      return;
    }

    // 0. Pre-hydrated Server Data Check (0ms instantaneous execution)
    if (typeof window !== 'undefined' && window.__INITIAL_CARD__) {
      dispatchCardHydration(window.__INITIAL_CARD__, false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const custId = params.get('id');
    const isPreview = params.get('preview') === 'true';

    let slug = params.get('slug');
    if (!slug) {
      const pathMatch = window.location.pathname.match(/\/c\/([^/?#]+)/i);
      if (pathMatch) {
        slug = decodeURIComponent(pathMatch[1]);
      }
    }

    if (!slug && !custId) {
      document.documentElement.classList.remove('card-loading');
      return;
    }

    document.documentElement.classList.add('card-loading');

    // 1. Admin Preview Mode
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
            dispatchCardHydration(data.customer, true);
            return;
          }
        }
      } catch (err) {
        console.error('Admin preview fetch error:', err);
      }
    }

    // 2. Public Slug Mode
    if (slug) {
      await loadPublicCard(slug);
    } else {
      renderError('Customer profile record not found.', 'Record Not Found');
    }
  }

  if (typeof window !== 'undefined') {
    window.attachCardActions = attachCardActions;
    window.generateVCard = generateVCard;
    window.handleCardShare = handleCardShare;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
