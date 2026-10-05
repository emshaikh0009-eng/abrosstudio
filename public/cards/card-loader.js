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

    // Avatar
    const avatarWrap = document.querySelector('.profile-avatar-wrap');
    if (avatarWrap) {
      avatarWrap.innerHTML = `
        <div style="width: 88px; height: 88px; border-radius: 50%; background: #fef3c7; color: #92400e; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; margin: 0 auto; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
          ${escapeHtml(getInitials(name))}
        </div>
      `;
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

    // Contact Cards
    const callCard = document.querySelector('.contact-card[href^="tel:"]');
    if (callCard) {
      if (phone) {
        callCard.href = `tel:${phone.replace(/\s+/g, '')}`;
        const valEl = callCard.querySelector('.contact-value');
        if (valEl) valEl.textContent = phone;
        callCard.style.display = '';
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
      } else {
        webCard.style.display = 'none';
      }
    }

    // Business Details section
    const studioName = document.querySelector('.studio-name');
    if (studioName) studioName.textContent = company || name;

    const roleDetail = document.querySelector('.business-card .detail-group:nth-child(2) .detail-value');
    if (roleDetail) roleDetail.textContent = role || '—';

    const addressGroup = document.querySelector('.business-card address');
    if (addressGroup) {
      const parentGroup = addressGroup.closest('.detail-group');
      if (address) {
        addressGroup.innerHTML = escapeHtml(address).replace(/\n/g, '<br>');
        if (parentGroup) parentGroup.style.display = '';
      } else {
        if (parentGroup) parentGroup.style.display = 'none';
      }
    }

    const webDetail = document.querySelector('.business-card a.detail-link');
    if (webDetail) {
      const parentGroup = webDetail.closest('.detail-group');
      if (website) {
        webDetail.href = normalizeUrl(website);
        webDetail.textContent = website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        if (parentGroup) parentGroup.style.display = '';
      } else {
        if (parentGroup) parentGroup.style.display = 'none';
      }
    }

    // Socials
    const igLink = document.querySelector('.social-card[href*="instagram.com"]');
    if (igLink) {
      if (instagram) {
        igLink.href = normalizeUrl(instagram);
        igLink.style.display = '';
      } else {
        igLink.style.display = 'none';
      }
    }

    const inLink = document.querySelector('.social-card[href*="linkedin.com"]');
    if (inLink) {
      if (linkedin) {
        inLink.href = normalizeUrl(linkedin);
        inLink.style.display = '';
      } else {
        inLink.style.display = 'none';
      }
    }

    // Hide Facebook by default as customer schema does not store Facebook
    const fbLink = document.querySelector('.social-card[href*="facebook.com"]');
    if (fbLink) fbLink.style.display = 'none';

    // Hook vCard
    attachVCardDownload(card);
  }

  function hydrateDesign2(card, isPreview) {
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

    // Monogram Initials
    const initialsEl = document.querySelector('.profile-avatar-initials');
    if (initialsEl) initialsEl.textContent = getInitials(name);

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

    // Contact Rows
    const callRow = document.querySelector('.contact-row[href^="tel:"]');
    if (callRow) {
      if (phone) {
        callRow.href = `tel:${phone.replace(/\s+/g, '')}`;
        const mainEl = callRow.querySelector('.contact-main');
        if (mainEl) mainEl.textContent = phone;
        callRow.style.display = '';
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
      } else {
        webRow.style.display = 'none';
      }
    }

    // Business Table
    const companyVal = document.querySelector('.business-row:nth-child(1) .business-val');
    if (companyVal) companyVal.textContent = company || name;

    const roleVal = document.querySelector('.business-row:nth-child(2) .business-val');
    if (roleVal) roleVal.textContent = role || '—';

    const addrRow = document.querySelector('.business-row:nth-child(3)');
    if (addrRow) {
      const addrVal = addrRow.querySelector('address');
      if (address) {
        if (addrVal) addrVal.innerHTML = escapeHtml(address).replace(/\n/g, '<br>');
        addrRow.style.display = '';
      } else {
        addrRow.style.display = 'none';
      }
    }

    const webRowB = document.querySelector('.business-row:nth-child(4)');
    if (webRowB) {
      const webLink = webRowB.querySelector('a');
      if (website) {
        if (webLink) {
          webLink.href = normalizeUrl(website);
          webLink.textContent = website.replace(/^https?:\/\//i, '').replace(/\/$/, '');
        }
        webRowB.style.display = '';
      } else {
        webRowB.style.display = 'none';
      }
    }

    // Follow Links
    const igFollow = document.querySelector('.follow-item[href*="instagram.com"]');
    if (igFollow) {
      if (instagram) {
        igFollow.href = normalizeUrl(instagram);
        igFollow.style.display = '';
      } else {
        igFollow.style.display = 'none';
      }
    }

    const inFollow = document.querySelector('.follow-item[href*="linkedin.com"]');
    if (inFollow) {
      if (linkedin) {
        inFollow.href = normalizeUrl(linkedin);
        inFollow.style.display = '';
      } else {
        inFollow.style.display = 'none';
      }
    }

    const fbFollow = document.querySelector('.follow-item[href*="facebook.com"]');
    if (fbFollow) fbFollow.style.display = 'none';

    // Hook vCard
    attachVCardDownload(card);
  }

  function ensureCorrectTemplate(card) {
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
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const custId = params.get('id');
    const isPreview = params.get('preview') === 'true';

    // If no dynamic query parameters exist, do nothing (preserve static template preview)
    if (!slug && !custId) {
      return;
    }

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
        if (!slug) {
          renderError('Unable to load customer preview due to a network error.', 'Connection Error');
          return;
        }
      }
    }

    // 2. Public NFC / Slug Mode
    if (slug) {
      await loadPublicCard(slug);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
