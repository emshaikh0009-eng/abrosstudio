/**
 * Ambros Studio — Admin Panel Interactive Controller
 * Design Names:
 *   - Design 1: Mint Haven
 *   - Design 2: Evergreen
 * Complete In-Memory Customer State & In-Place Editing System
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // Live Supabase Customer State & Field Mapping
  // -------------------------------------------------------------
  let customers = [];
  let isLoadingCustomers = false;
  let currentUploadedAvatar = null;
  let currentFrontImageUrl = '';
  let currentBackImageUrl = '';
  let currentCustomLinks = [];
  let editingLinkIndex = -1;

  function generateCustomerProfileUrl(slug, company) {
    const canonicalSlug = (slug || '').trim().toLowerCase();
    if (!canonicalSlug) return '';

    // 1. Authoritative preservation for Aamir Shaikh / ATG Study Abroad
    if (canonicalSlug === 'aamirshaikh' || canonicalSlug === 'atgstudyabroad' || canonicalSlug === 'atg-study-abroad') {
      return 'https://aamirshaikh.ambrosstudio.com';
    }

    // 2. Authoritative Raftcon Construction / Tabrez Qureshi
    if (canonicalSlug === 'tabrezqureshi' || canonicalSlug === 'raftcon' || canonicalSlug === 'raftcon-construction' || canonicalSlug === 'raftconconstruction') {
      return 'https://raftconconstruction.ambrosstudio.com/tabrezqureshi';
    }

    // 3. Dynamic Business Subdomain generation: https://[businessSubdomain].ambrosstudio.com/[profileSlug]
    const cleanCompany = (company || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

    const reserved = ['www', 'admin', 'api', 'app', 'mail', 'email', 'ambros', 'ambrosstudio'];

    if (cleanCompany && !reserved.includes(cleanCompany)) {
      return `https://${cleanCompany}.ambrosstudio.com/${canonicalSlug}`;
    }

    // 4. Default canonical customer URL on apex domain
    const origin = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('localhost'))
      ? window.location.origin
      : 'https://ambrosstudio.com';

    return `${origin}/c/${encodeURIComponent(canonicalSlug)}`;
  }

  function mapDbCustomerToUi(c) {
    const name = c.full_name || '';
    const nameParts = name.split(' ').filter(Boolean);
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : (name.slice(0, 2)).toUpperCase() || 'CU';

    const registry = window.CARD_DESIGN_REGISTRY;
    const resolvedDesign = registry ? registry.resolveCardDesign(c.card_design) : { id: 'mint-haven', name: 'Mint Haven', category: 'personal' };
    const isActive = Boolean(c.is_active);
    const slug = c.profile_slug || (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

    let formattedDate = 'Recent';
    if (c.created_at) {
      try {
        const d = new Date(c.created_at);
        formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        formattedDate = 'Recent';
      }
    }

    const publicUrl = generateCustomerProfileUrl(slug, c.company_name);

    return {
      id: c.id,
      initials: initials,
      name: name,
      role: c.designation || '',
      company: c.company_name || '',
      phone: c.mobile_number || '',
      whatsapp: c.whatsapp_number || '',
      email: c.email || '',
      website: c.website || '',
      address: c.business_address || '',
      description: c.description || '',
      socialInstagram: c.instagram_url || '',
      socialLinkedIn: c.linkedin_url || '',
      design: resolvedDesign.name,
      designId: resolvedDesign.id,
      status: isActive ? 'active' : 'inactive',
      is_active: isActive,
      avatarUrl: c.avatar_url || c.profile_image_url || c.photo_url || '',
      customSettings: (function() {
        const raw = c.custom_settings || c.customSettings || {};
        return {
          appearance: raw.appearance || { primaryColor: '', backgroundColor: '', textColor: '', fontFamily: '' },
          links: Array.isArray(raw.links) ? raw.links : [],
          cardImages: (raw.cardImages && typeof raw.cardImages === 'object')
            ? { frontUrl: raw.cardImages.frontUrl || raw.cardImages.front_url || '', backUrl: raw.cardImages.backUrl || raw.cardImages.back_url || '' }
            : { frontUrl: '', backUrl: '' },
          industry: raw.industry || null
        };
      })(),
      publicUrl: publicUrl,
      profileLink: publicUrl,
      profileSlug: slug,
      createdDate: formattedDate,
      cardUrl: `/cards/preview.html?design=${encodeURIComponent(resolvedDesign.id)}&slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(c.id)}`
    };
  }

  async function loadCustomers() {
    if (isLoadingCustomers) return;
    isLoadingCustomers = true;

    // Show loading state if table currently has no rows
    if (customersTableBody && customers.length === 0) {
      customersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <span class="btn-spinner" style="display: inline-block; width: 18px; height: 18px; border-width: 2px;" aria-hidden="true"></span>
              <span>Loading customer records from Supabase...</span>
            </div>
          </td>
        </tr>
      `;
    }

    try {
      const res = await apiFetch('/api/admin/customers');
      if (!res.ok) {
        throw new Error('Failed to load customers from server');
      }
      const data = await res.json();
      if (data && Array.isArray(data.customers)) {
        customers = data.customers.map(mapDbCustomerToUi);
      } else {
        customers = [];
      }

      renderCustomersTable();
      renderRecentCustomersTable();
    } catch (err) {
      console.error('loadCustomers error:', err);
      if (customersTableBody && customers.length === 0) {
        customersTableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px 16px; color: #dc2626;">
              Unable to load customer records. Please check connection or sign in again.
            </td>
          </tr>
        `;
      }
      updateCustomerCounts();
      filterCustomers();
    } finally {
      isLoadingCustomers = false;
    }
  }

  // Tracking current editing state (null = Create mode, id string = Edit mode)
  let currentEditingCustomerId = null;
  let selectedDesign = "Mint Haven";
  let currentFilter = "all";

  // Elements
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('pageTitle');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const mobileToggle = document.getElementById('mobileMenuToggle');

  // Form Elements
  const addCustomerForm = document.getElementById('addCustomerForm');
  const formMainTitle = document.getElementById('formMainTitle');
  const formMainSub = document.getElementById('formMainSub');
  const formBreadcrumbCurrent = document.getElementById('formBreadcrumbCurrent');
  const saveCustomerBtn = document.getElementById('saveCustomerBtn');
  const cancelBtn = document.getElementById('cancelAddCustomer');
  const custFullName = document.getElementById('custFullName');
  const custDesignation = document.getElementById('custDesignation');
  const custCompany = document.getElementById('custCompany');
  const custDescription = document.getElementById('custDescription');
  const custPhone = document.getElementById('custPhone');
  const custWhatsApp = document.getElementById('custWhatsApp');
  const custEmail = document.getElementById('custEmail');
  const custWebsite = document.getElementById('custWebsite');
  const custAddress = document.getElementById('custAddress');
  const custInstagram = document.getElementById('custInstagram');
  const custLinkedIn = document.getElementById('custLinkedIn');
  const custProfileLink = document.getElementById('custProfileLink');
  const avatarUploadCircle = document.getElementById('avatarUploadCircle');
  const cardSelectOptions = document.querySelectorAll('.card-select-option');

  // Card Customization & Dynamic Link Manager Elements
  const custPrimaryColor = document.getElementById('custPrimaryColor');
  const custPrimaryColorPicker = document.getElementById('custPrimaryColorPicker');
  const custBgColor = document.getElementById('custBgColor');
  const custBgColorPicker = document.getElementById('custBgColorPicker');
  const custTextColor = document.getElementById('custTextColor');
  const custTextColorPicker = document.getElementById('custTextColorPicker');
  const custFontFamily = document.getElementById('custFontFamily');
  const btnResetCustomization = document.getElementById('btnResetCustomization');

  const custAvatarSyncPreview = document.getElementById('custAvatarSyncPreview');
  const custAvatarSyncStatus = document.getElementById('custAvatarSyncStatus');
  const btnSyncChangeAvatar = document.getElementById('btnSyncChangeAvatar');

  const customLinksContainer = document.getElementById('customLinksContainer');
  const customLinksEmptyState = document.getElementById('customLinksEmptyState');
  const btnOpenAddLinkModal = document.getElementById('btnOpenAddLinkModal');
  const btnImportContactLinks = document.getElementById('btnImportContactLinks');

  const linkEditorModal = document.getElementById('linkEditorModal');
  const linkEditorTitle = document.getElementById('linkEditorTitle');
  const linkEditorForm = document.getElementById('linkEditorForm');
  const linkTypeSelect = document.getElementById('linkTypeSelect');
  const linkLabelInput = document.getElementById('linkLabelInput');
  const linkValueInput = document.getElementById('linkValueInput');
  const linkValueLabel = document.getElementById('linkValueLabel');
  const linkEnabledInput = document.getElementById('linkEnabledInput');
  const btnCloseLinkModal = document.getElementById('btnCloseLinkModal');
  const btnCancelLinkModal = document.getElementById('btnCancelLinkModal');
  const btnSaveLinkModal = document.getElementById('btnSaveLinkModal');
  const saveLinkModalText = document.getElementById('saveLinkModalText');

  // Tables
  const customersTableBody = document.getElementById('customersTableBody');
  const dashboardRecentTableBody = document.getElementById('dashboardRecentTableBody');

  // -------------------------------------------------------------
  // Navigation & Tab Switching
  // -------------------------------------------------------------
  window.navigateToTab = function(tabId) {
    // If navigating away from add-customer via top/nav, reset to create mode
    if (tabId !== 'add-customer' && currentEditingCustomerId !== null) {
      resetAddCustomerForm();
    }

    // Reset customer search field whenever navigating to Customers and load fresh data
    if (tabId === 'customers') {
      if (customerSearchInput) {
        customerSearchInput.value = '';
      }
      loadCustomers();
    }

    tabContents.forEach(tab => tab.classList.remove('active'));
    navItems.forEach(nav => nav.classList.remove('active'));

    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    const matchingNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (matchingNav) {
      matchingNav.classList.add('active');
    }

    // Dynamic Header Title
    const titles = {
      'dashboard': 'Dashboard',
      'customers': 'Customers',
      'add-customer': currentEditingCustomerId ? 'Edit Customer' : 'Add Customer',
      'digital-cards': 'Digital Cards',
      'settings': 'Settings'
    };
    if (pageTitle && titles[tabId]) {
      pageTitle.textContent = titles[tabId];
    }

    closeMobileSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      if (tabId === 'add-customer') {
        // Reset to clean create mode
        resetAddCustomerForm();
      }
      if (tabId) {
        navigateToTab(tabId);
      }
    });
  });

  const btnOpenAddCustomer = document.getElementById('btnOpenAddCustomer');
  if (btnOpenAddCustomer) {
    btnOpenAddCustomer.addEventListener('click', () => {
      resetAddCustomerForm();
      navigateToTab('add-customer');
    });
  }

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarBackdrop.classList.toggle('open');
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeMobileSidebar);
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
  }

  // -------------------------------------------------------------
  // Toast Helper
  // -------------------------------------------------------------
  window.showAdminToast = function(message) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'adminToast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  // -------------------------------------------------------------
  // Render Customer Tables
  // -------------------------------------------------------------
  function renderCustomersTable() {
    if (!customersTableBody) return;

    customersTableBody.innerHTML = '';

    if (customers.length === 0) {
      customersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 56px 16px; color: var(--text-muted);">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-subtle);">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span style="font-size: 14px; font-weight: 600; color: var(--text-headline);">No customers yet</span>
              <span style="font-size: 12.5px; color: var(--text-muted);">Use the Add Customer button to create your first digital card profile.</span>
            </div>
          </td>
        </tr>
      `;
      updateCustomerCounts();
      filterCustomers();
      return;
    }

    customers.forEach((c) => {
      const isEvergreen = c.design === 'Evergreen';
      const slug = c.profileSlug || '';
      const cardHref = isEvergreen
        ? `/cards/design-2/index.html?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(c.id)}&preview=true`
        : `/cards/design-1/index.html?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(c.id)}&preview=true`;
      const isActive = Boolean(c.is_active);

      const tr = document.createElement('tr');
      tr.setAttribute('data-id', c.id);
      tr.setAttribute('data-status', isActive ? 'active' : 'inactive');

      tr.innerHTML = `
        <td>
          <div class="customer-cell">
            <div class="customer-avatar-init">${c.avatarUrl ? `<img src="${escapeHtml(c.avatarUrl)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="${escapeHtml(c.name)}">` : escapeHtml(c.initials)}</div>
            <div class="customer-meta">
              <span class="customer-name">${escapeHtml(c.name)}</span>
              <span class="customer-role">${escapeHtml(c.role || '—')}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(c.company || '—')}</td>
        <td>${c.phone ? (c.phone.startsWith('+') ? escapeHtml(c.phone) : '+91 ' + escapeHtml(c.phone)) : '—'}</td>
        <td><span class="badge-design">${escapeHtml(c.design)}</span></td>
        <td>
          <div class="switch-group">
            <label class="switch-toggle" aria-label="Toggle status for ${escapeHtml(c.name)}">
              <input type="checkbox" class="customer-status-toggle" data-id="${c.id}" ${isActive ? 'checked' : ''}>
              <span class="switch-slider"></span>
            </label>
            <span class="badge-status ${isActive ? 'active' : 'inactive'}">
              <span class="status-dot ${isActive ? 'active' : 'inactive'}"></span>
              <span class="status-text">${isActive ? 'Active' : 'Inactive'}</span>
            </span>
          </div>
        </td>
        <td>
          <div class="table-actions">
            <a href="${c.publicUrl || ('/c/' + encodeURIComponent(slug))}" target="_blank" class="btn btn-white btn-sm btn-action-compact" title="Open customer public card in new tab">View</a>
            <button type="button" class="btn btn-white btn-sm btn-action-compact btn-edit-customer" data-id="${c.id}" title="Edit customer profile">Edit</button>
            <button type="button" class="btn btn-white btn-sm btn-action-compact btn-copy-card-link" data-slug="${escapeHtml(slug)}" data-name="${escapeHtml(c.name)}" data-company="${escapeHtml(c.company || '')}" title="Copy canonical public card link">Link</button>
            <button type="button" class="btn btn-white btn-sm btn-action-compact btn-share-card" data-slug="${escapeHtml(slug)}" data-name="${escapeHtml(c.name)}" data-company="${escapeHtml(c.company || '')}" title="Share digital card">Share</button>
            <button type="button" class="btn btn-white btn-sm btn-action-compact btn-delete-customer" data-id="${c.id}" data-name="${escapeHtml(c.name)}" data-slug="${escapeHtml(slug)}" title="Delete customer" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.25);">Delete</button>
          </div>
        </td>
      `;
      customersTableBody.appendChild(tr);
    });

    attachTableEventListeners();
    updateCustomerCounts();
  }

  function renderRecentCustomersTable() {
    if (!dashboardRecentTableBody) return;

    dashboardRecentTableBody.innerHTML = '';

    if (customers.length === 0) {
      dashboardRecentTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            No recent customer profiles created yet.
          </td>
        </tr>
      `;
      return;
    }

    const recent = customers.slice(0, 5);

    recent.forEach((c) => {
      const isEvergreen = c.design === 'Evergreen';
      const slug = c.profileSlug || '';
      const cardHref = isEvergreen
        ? `/cards/design-2/index.html?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(c.id)}&preview=true`
        : `/cards/design-1/index.html?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(c.id)}&preview=true`;
      const isActive = Boolean(c.is_active);

      const tr = document.createElement('tr');
      tr.setAttribute('data-id', c.id);

      tr.innerHTML = `
        <td>
          <div class="customer-cell">
            <div class="customer-avatar-init">${c.avatarUrl ? `<img src="${escapeHtml(c.avatarUrl)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="${escapeHtml(c.name)}">` : escapeHtml(c.initials)}</div>
            <div class="customer-meta">
              <span class="customer-name">${escapeHtml(c.name)}</span>
              <span class="customer-role">${escapeHtml(c.role || '—')}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(c.company || '—')}</td>
        <td><span class="badge-design">${escapeHtml(c.design)}</span></td>
        <td>
          <span class="badge-status ${isActive ? 'active' : 'inactive'}">
            <span class="status-dot ${isActive ? 'active' : 'inactive'}"></span>
            ${isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>${escapeHtml(c.createdDate)}</td>
        <td>
          <div class="table-actions">
            <a href="${c.publicUrl || ('/c/' + encodeURIComponent(slug))}" target="_blank" class="icon-action-btn" title="View Customer Public Card" aria-label="View ${escapeHtml(c.name)} profile">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </a>
            <button type="button" class="icon-action-btn btn-edit-customer" data-id="${c.id}" title="Edit Customer" aria-label="Edit ${escapeHtml(c.name)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button type="button" class="icon-action-btn btn-copy-card-link" data-slug="${escapeHtml(slug)}" data-name="${escapeHtml(c.name)}" data-company="${escapeHtml(c.company || '')}" title="Copy Canonical Link" aria-label="Copy ${escapeHtml(c.name)} card link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </button>
            <button type="button" class="icon-action-btn btn-share-card" data-slug="${escapeHtml(slug)}" data-name="${escapeHtml(c.name)}" data-company="${escapeHtml(c.company || '')}" title="Share Digital Card" aria-label="Share ${escapeHtml(c.name)} card">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            </button>
            <button type="button" class="icon-action-btn btn-delete-customer" data-id="${c.id}" data-name="${escapeHtml(c.name)}" data-slug="${escapeHtml(slug)}" title="Delete Customer" aria-label="Delete ${escapeHtml(c.name)}" style="color: #ef4444;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      dashboardRecentTableBody.appendChild(tr);
    });

    attachTableEventListeners();
  }

  function getCanonicalCustomerCardUrl(slug, company) {
    if (!slug) return '';
    return generateCustomerProfileUrl(slug, company);
  }

  async function copyCustomerCardUrl(slug, name, company) {
    const url = getCanonicalCustomerCardUrl(slug, company);
    if (!url) {
      showAdminToast('No profile slug available for this customer.');
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const temp = document.createElement('input');
        temp.value = url;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      showAdminToast(`Link copied: ${url}`);
    } catch (err) {
      console.error('Failed to copy public card link:', err);
      showAdminToast('Could not copy link to clipboard.');
    }
  }

  async function shareCustomerCard(slug, name, company) {
    const url = getCanonicalCustomerCardUrl(slug, company);
    if (!url) {
      showAdminToast('No profile slug available for this customer.');
      return;
    }
    const cardTitle = `${name || 'Digital Card'} — Ambros Studio`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: cardTitle,
          text: `Digital business card for ${name || 'Ambros Studio client'}`,
          url: url,
        });
        showAdminToast('Shared successfully.');
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    await copyCustomerCardUrl(slug, name, company);
  }

  function attachTableEventListeners() {
    // Edit Button Handlers
    document.querySelectorAll('.btn-edit-customer').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        const custId = this.getAttribute('data-id');
        if (custId) {
          openEditCustomer(custId);
        }
      };
    });

    // Copy Public Link Handlers
    document.querySelectorAll('.btn-copy-card-link').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        const slug = this.getAttribute('data-slug');
        const name = this.getAttribute('data-name');
        const company = this.getAttribute('data-company') || '';
        copyCustomerCardUrl(slug, name, company);
      };
    });

    // Share Card Handlers
    document.querySelectorAll('.btn-share-card').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        const slug = this.getAttribute('data-slug');
        const name = this.getAttribute('data-name');
        const company = this.getAttribute('data-company') || '';
        shareCustomerCard(slug, name, company);
      };
    });

    // Toggle Status Handlers (Connected to Live Database via PATCH)
    document.querySelectorAll('.customer-status-toggle').forEach(checkbox => {
      checkbox.onchange = async function() {
        const custId = this.getAttribute('data-id');
        const customer = customers.find(c => String(c.id) === String(custId));
        if (!customer) return;

        const targetStatus = this.checked ? 'active' : 'inactive';
        const targetIsActive = this.checked;
        const previousChecked = !this.checked;

        // Prevent duplicate toggling while request is in-flight
        this.disabled = true;

        try {
          const res = await apiFetch(`/api/admin/customers/${custId}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_active: targetIsActive }),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            customer.status = targetStatus;
            customer.is_active = targetIsActive;

            // Update row status
            const row = this.closest('tr');
            if (row) {
              row.setAttribute('data-status', customer.status);
              const statusText = row.querySelector('.status-text');
              const statusDot = row.querySelector('.status-dot');
              const badgeStatus = row.querySelector('.badge-status');

              if (targetIsActive) {
                if (statusText) statusText.textContent = 'Active';
                if (statusDot) statusDot.className = 'status-dot active';
                if (badgeStatus) badgeStatus.className = 'badge-status active';
                showAdminToast(`${customer.name} card set to Active`);
              } else {
                if (statusText) statusText.textContent = 'Inactive';
                if (statusDot) statusDot.className = 'status-dot inactive';
                if (badgeStatus) badgeStatus.className = 'badge-status inactive';
                showAdminToast(`${customer.name} card paused / Inactive`);
              }
            }

            renderRecentCustomersTable();
            updateCustomerCounts();
            filterCustomers();
          } else {
            // Revert checkbox state on error
            this.checked = previousChecked;
            showAdminToast(data.error || 'Failed to update customer status.');
          }
        } catch (err) {
          console.error('Status toggle error:', err);
          this.checked = previousChecked;
          showAdminToast('Network error updating customer status.');
        } finally {
          this.disabled = false;
        }
      };
    });

    // Delete Customer Action Handlers
    document.querySelectorAll('.btn-delete-customer').forEach(btn => {
      btn.onclick = function(e) {
        e.preventDefault();
        const custId = this.getAttribute('data-id');
        const custName = this.getAttribute('data-name');
        const custSlug = this.getAttribute('data-slug');
        if (custId) {
          openDeleteCustomerModal(custId, custName, custSlug);
        }
      };
    });
  }

  // -------------------------------------------------------------
  // Delete Customer Confirmation Modal Controller
  // -------------------------------------------------------------
  const customerDeleteModal = document.getElementById('customerDeleteModal');
  const deleteCustomerTargetName = document.getElementById('deleteCustomerTargetName');
  const deleteCustomerIdVal = document.getElementById('deleteCustomerIdVal');
  const deleteCustomerSlugVal = document.getElementById('deleteCustomerSlugVal');
  const btnCloseDeleteModal = document.getElementById('btnCloseDeleteModal');
  const btnCancelDeleteModal = document.getElementById('btnCancelDeleteModal');
  const btnConfirmDeleteCustomer = document.getElementById('btnConfirmDeleteCustomer');
  const btnConfirmDeleteText = document.getElementById('btnConfirmDeleteText');
  const btnConfirmDeleteSpinner = document.getElementById('btnConfirmDeleteSpinner');
  let customerPendingDelete = null;

  function openDeleteCustomerModal(id, name, slug) {
    if (!customerDeleteModal) return;
    customerPendingDelete = { id, name, slug };
    if (deleteCustomerTargetName) deleteCustomerTargetName.textContent = name || 'Customer';
    if (deleteCustomerIdVal) deleteCustomerIdVal.textContent = id || '—';
    if (deleteCustomerSlugVal) deleteCustomerSlugVal.textContent = slug || '—';
    if (btnConfirmDeleteCustomer) btnConfirmDeleteCustomer.disabled = false;
    if (btnConfirmDeleteText) btnConfirmDeleteText.textContent = 'Delete Customer';
    if (btnConfirmDeleteSpinner) btnConfirmDeleteSpinner.style.display = 'none';

    customerDeleteModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeDeleteCustomerModal() {
    if (!customerDeleteModal) return;
    customerDeleteModal.style.display = 'none';
    document.body.style.overflow = '';
    customerPendingDelete = null;
  }

  if (btnCloseDeleteModal) btnCloseDeleteModal.addEventListener('click', closeDeleteCustomerModal);
  if (btnCancelDeleteModal) btnCancelDeleteModal.addEventListener('click', closeDeleteCustomerModal);
  if (customerDeleteModal) {
    customerDeleteModal.addEventListener('click', (e) => {
      if (e.target === customerDeleteModal) closeDeleteCustomerModal();
    });
  }

  if (btnConfirmDeleteCustomer) {
    btnConfirmDeleteCustomer.addEventListener('click', async () => {
      if (!customerPendingDelete || !customerPendingDelete.id) return;
      const { id, name } = customerPendingDelete;

      btnConfirmDeleteCustomer.disabled = true;
      if (btnConfirmDeleteText) btnConfirmDeleteText.textContent = 'Deleting...';
      if (btnConfirmDeleteSpinner) btnConfirmDeleteSpinner.style.display = 'inline-block';

      try {
        const res = await apiFetch(`/api/admin/customers/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showAdminToast(`Customer "${name}" deleted successfully.`);
          closeDeleteCustomerModal();
          await loadCustomers();
        } else {
          showAdminToast(data.error || 'Failed to delete customer record.');
          btnConfirmDeleteCustomer.disabled = false;
          if (btnConfirmDeleteText) btnConfirmDeleteText.textContent = 'Delete Customer';
          if (btnConfirmDeleteSpinner) btnConfirmDeleteSpinner.style.display = 'none';
        }
      } catch (err) {
        console.error('Delete customer error:', err);
        showAdminToast('Network error while deleting customer.');
        btnConfirmDeleteCustomer.disabled = false;
        if (btnConfirmDeleteText) btnConfirmDeleteText.textContent = 'Delete Customer';
        if (btnConfirmDeleteSpinner) btnConfirmDeleteSpinner.style.display = 'none';
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------
  // Filter & Search Logic
  // -------------------------------------------------------------
  const filterPills = document.querySelectorAll('.filter-pill');
  const customerSearchInput = document.getElementById('customerSearchInput');

  // Dynamically compute and update customer counts across stats and filters
  function updateCustomerCounts() {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active' || c.is_active === true).length;
    const inactive = customers.filter(c => c.status === 'inactive' || c.is_active === false).length;

    // Update Dashboard Stat Cards
    const statTotal = document.getElementById('statTotalCustomers');
    const statActive = document.getElementById('statActiveCustomers');
    const statInactive = document.getElementById('statInactiveCustomers');

    if (statTotal) statTotal.textContent = total;
    if (statActive) statActive.textContent = active;
    if (statInactive) statInactive.textContent = inactive;

    // Update Filter Pills
    const pillAll = document.querySelector('.filter-pill[data-filter="all"]');
    const pillActive = document.querySelector('.filter-pill[data-filter="active"]');
    const pillInactive = document.querySelector('.filter-pill[data-filter="inactive"]');

    if (pillAll) pillAll.textContent = `All ${total}`;
    if (pillActive) pillActive.textContent = `Active ${active}`;
    if (pillInactive) pillInactive.textContent = `Inactive ${inactive}`;
  }

  // Update dynamic customer pagination
  function updatePagination(visibleCount) {
    const paginationInfo = document.getElementById('customersPaginationInfo');
    const paginationPages = document.getElementById('customersPaginationPages');
    if (!paginationInfo) return;

    const query = customerSearchInput ? customerSearchInput.value.trim() : '';

    let totalInFilter = customers.length;
    let filterCategory = 'customers';
    if (currentFilter === 'active') {
      totalInFilter = customers.filter(c => c.status === 'active' || c.is_active === true).length;
      filterCategory = 'active customers';
    } else if (currentFilter === 'inactive') {
      totalInFilter = customers.filter(c => c.status === 'inactive' || c.is_active === false).length;
      filterCategory = 'inactive customers';
    }

    if (query) {
      if (visibleCount === 0) {
        paginationInfo.textContent = `No customers found matching "${query}"`;
      } else if (visibleCount === 1) {
        paginationInfo.textContent = `Showing 1 of ${totalInFilter} ${filterCategory} (1 match)`;
      } else {
        paginationInfo.textContent = `Showing 1–${visibleCount} of ${totalInFilter} ${filterCategory} (${visibleCount} matches)`;
      }
    } else {
      if (visibleCount === 0) {
        paginationInfo.textContent = `No ${filterCategory} available`;
      } else if (visibleCount === 1) {
        paginationInfo.textContent = `Showing 1 of 1 ${currentFilter === 'all' ? 'customer' : filterCategory.slice(0, -1)}`;
      } else {
        paginationInfo.textContent = `Showing 1–${visibleCount} of ${totalInFilter} ${filterCategory}`;
      }
    }

    // Hide unnecessary pagination buttons when all results fit on one page
    if (paginationPages) {
      if (visibleCount > 0) {
        paginationPages.innerHTML = '<span class="page-num active">1</span>';
        paginationPages.style.display = 'flex';
      } else {
        paginationPages.innerHTML = '';
        paginationPages.style.display = 'none';
      }
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter') || 'all';
      filterCustomers();
    });
  });

  if (customerSearchInput) {
    customerSearchInput.value = '';
    customerSearchInput.addEventListener('input', () => {
      filterCustomers();
    });
    customerSearchInput.addEventListener('search', () => {
      filterCustomers();
    });
  }

  function filterCustomers() {
    const query = customerSearchInput ? customerSearchInput.value.toLowerCase().trim() : '';
    const rows = customersTableBody ? customersTableBody.querySelectorAll('tr') : [];
    let visibleCount = 0;

    rows.forEach(row => {
      const status = row.getAttribute('data-status');
      const text = row.textContent.toLowerCase();

      const matchesFilter = (currentFilter === 'all') || (status === currentFilter);
      const matchesQuery = query === '' || text.includes(query);

      if (matchesFilter && matchesQuery) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    updatePagination(visibleCount);
  }

  // -------------------------------------------------------------
  // Client Delivery Section Controller (URL, QR, Copy, Open, Share)
  // -------------------------------------------------------------
  let currentDeliveryQr = null;

  function generateAdminQrCanvas(qr, cellSize = 10, margin = 4) {
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

  function updateClientDelivery(slug, name, company) {
    const canonicalSlug = (slug || '').trim().toLowerCase();
    const publicUrl = canonicalSlug
      ? generateCustomerProfileUrl(canonicalSlug, company)
      : 'https://ambrosstudio.com/c/your-slug';

    const custProfileLink = document.getElementById('custProfileLink');
    if (custProfileLink) {
      custProfileLink.textContent = publicUrl;
    }

    const openCardBtn = document.getElementById('btnAdminOpenCard');
    if (openCardBtn) {
      openCardBtn.href = canonicalSlug ? publicUrl : '#';
      if (!canonicalSlug) {
        openCardBtn.style.pointerEvents = 'none';
        openCardBtn.style.opacity = '0.5';
      } else {
        openCardBtn.style.pointerEvents = '';
        openCardBtn.style.opacity = '1';
      }
    }

    const badge = document.getElementById('deliverySlugBadge');
    if (badge) {
      badge.textContent = canonicalSlug ? 'Active' : 'Draft';
      badge.style.background = canonicalSlug ? '#ecfdf5' : '#f8fafc';
      badge.style.color = canonicalSlug ? '#047857' : '#64748b';
      badge.style.borderColor = canonicalSlug ? '#a7f3d0' : '#e2e8f0';
    }

    // Dynamic QR generation encoding publicUrl
    const qrBox = document.getElementById('adminQrBox');
    if (qrBox && typeof qrcode !== 'undefined') {
      try {
        const qr = qrcode(0, 'M');
        qr.addData(publicUrl);
        qr.make();
        currentDeliveryQr = { qr, slug: canonicalSlug || 'client-card', url: publicUrl };
        qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 1 });
      } catch (err) {
        console.error('Error generating admin delivery QR:', err);
      }
    }
  }

  function setupClientDeliveryListeners() {
    // Copy Link button
    const btnCopy = document.getElementById('btnAdminCopyLink');
    const btnCopyText = document.getElementById('btnAdminCopyLinkText');
    if (btnCopy) {
      btnCopy.onclick = async function(e) {
        e.preventDefault();
        const custProfileLink = document.getElementById('custProfileLink');
        const urlToCopy = custProfileLink ? custProfileLink.textContent.trim() : '';
        if (!urlToCopy) return;

        try {
          await navigator.clipboard.writeText(urlToCopy);
          if (btnCopyText) {
            const orig = btnCopyText.textContent;
            btnCopyText.textContent = 'Copied!';
            setTimeout(() => { btnCopyText.textContent = orig; }, 2000);
          }
          showAdminToast('Client delivery link copied to clipboard');
        } catch (_) {
          const input = document.createElement('input');
          input.value = urlToCopy;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          showAdminToast('Client delivery link copied to clipboard');
        }
      };
    }

    // Share button
    const btnShare = document.getElementById('btnAdminShareCard');
    if (btnShare) {
      btnShare.onclick = async function(e) {
        e.preventDefault();
        const custProfileLink = document.getElementById('custProfileLink');
        const urlToShare = custProfileLink ? custProfileLink.textContent.trim() : '';
        const name = (custFullName && custFullName.value) ? custFullName.value.trim() : 'Digital Business Card';

        if (navigator.share) {
          try {
            await navigator.share({
              title: `${name} — Ambros Studio`,
              text: `Digital business card for ${name}`,
              url: urlToShare
            });
            return;
          } catch (err) {
            if (err && err.name === 'AbortError') return;
          }
        }

        // Fallback to copy
        try {
          await navigator.clipboard.writeText(urlToShare);
          showAdminToast('Client card link copied to clipboard');
        } catch (_) {}
      };
    }

    // Download QR PNG button
    const btnDownloadPng = document.getElementById('btnAdminDownloadQrPng');
    if (btnDownloadPng) {
      btnDownloadPng.onclick = function(e) {
        e.preventDefault();
        if (!currentDeliveryQr) return;
        try {
          const canvas = generateAdminQrCanvas(currentDeliveryQr.qr, 12, 4);
          const a = document.createElement('a');
          a.download = `${currentDeliveryQr.slug}-qr.png`;
          a.href = canvas.toDataURL('image/png');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showAdminToast('Production QR downloaded (PNG)');
        } catch (err) {
          console.error('Error downloading PNG:', err);
        }
      };
    }

    // Download QR SVG button
    const btnDownloadSvg = document.getElementById('btnAdminDownloadQrSvg');
    if (btnDownloadSvg) {
      btnDownloadSvg.onclick = function(e) {
        e.preventDefault();
        if (!currentDeliveryQr) return;
        try {
          const svgData = currentDeliveryQr.qr.createSvgTag({ cellSize: 8, margin: 4 });
          const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.download = `${currentDeliveryQr.slug}-qr.svg`;
          a.href = url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showAdminToast('Production QR downloaded (SVG)');
        } catch (err) {
          console.error('Error downloading SVG:', err);
        }
      };
    }
  }

  // -------------------------------------------------------------
  // Edit Customer Flow (In-Place Update)
  // -------------------------------------------------------------
  function openEditCustomer(custId) {
    const customer = customers.find(c => String(c.id) === String(custId));
    if (!customer) {
      showAdminToast('Customer not found');
      return;
    }

    // 1. Set Edit Mode state
    currentEditingCustomerId = customer.id;

    // 2. Update Header Title, Breadcrumbs & Button Text
    if (pageTitle) pageTitle.textContent = 'Edit Customer';
    if (formBreadcrumbCurrent) formBreadcrumbCurrent.textContent = 'Edit customer';
    if (formMainTitle) formMainTitle.textContent = `Edit Profile: ${customer.name}`;
    if (formMainSub) formMainSub.textContent = `Updating existing record (ID: ${customer.id}) in place.`;

    if (saveCustomerBtn) {
      saveCustomerBtn.innerHTML = `<span>Update Customer</span>`;
    }

    // 3. Pre-fill all form fields with existing information
    if (custFullName) custFullName.value = customer.name;
    if (custDesignation) custDesignation.value = customer.role;
    if (custCompany) custCompany.value = customer.company;
    if (custDescription) custDescription.value = customer.description;
    if (custPhone) custPhone.value = customer.phone;
    if (custWhatsApp) custWhatsApp.value = customer.whatsapp;
    if (custEmail) custEmail.value = customer.email;
    if (custWebsite) custWebsite.value = customer.website;
    if (custAddress) custAddress.value = customer.address;
    if (custInstagram) custInstagram.value = customer.socialInstagram;
    if (custLinkedIn) custLinkedIn.value = customer.socialLinkedIn;

    // 4. Set Digital Card Selection
    selectedDesign = customer.design;
    setDesignSelection(customer.design);

    // 5. Client Delivery section update (URL, QR, Actions)
    updateClientDelivery(customer.profileSlug, customer.name, customer.company);

    // Update design template inspection link to preview this customer directly
    const btnPreviewChosenDesign = document.getElementById('btnPreviewChosenDesign');
    const previewChosenDesignText = document.getElementById('previewChosenDesignText');
    if (btnPreviewChosenDesign) {
      btnPreviewChosenDesign.href = customer.cardUrl;
      if (previewChosenDesignText) {
        previewChosenDesignText.textContent = `Preview ${customer.name}'s Card`;
      }
    }

    // 6. Avatar Preview
    if (avatarUploadCircle) {
      if (customer.avatarUrl) {
        currentUploadedAvatar = customer.avatarUrl;
        avatarUploadCircle.innerHTML = `<img src="${escapeHtml(customer.avatarUrl)}" style="width:100%;height:100%;object-fit:contain;padding:4px;box-sizing:border-box;background:#ffffff;border-radius:50%;" alt="Customer Avatar">`;
      } else {
        currentUploadedAvatar = null;
        avatarUploadCircle.innerHTML = `<span style="font-size: 20px; font-weight: 700; color: #92400e;">${customer.initials}</span>`;
      }
    }

    // 7. Card Customization: Appearance & Links
    const customSettings = customer.customSettings || {};
    const registry = window.CARD_DESIGN_REGISTRY;
    const resolvedD = registry ? registry.resolveCardDesign(customer.design) : null;
    const defaultPrimary = resolvedD?.theme?.primaryColor || '#10b981';
    const defaultBg = resolvedD?.theme?.backgroundColor || '#faf6ee';
    const defaultText = resolvedD?.theme?.textColor || '#1e293b';
    const app = customSettings.appearance || {};

    if (custPrimaryColor) {
      custPrimaryColor.value = app.primaryColor || '';
      custPrimaryColor.placeholder = defaultPrimary;
    }
    if (custPrimaryColorPicker) custPrimaryColorPicker.value = app.primaryColor || defaultPrimary;
    if (custBgColor) {
      custBgColor.value = app.backgroundColor || '';
      custBgColor.placeholder = defaultBg;
    }
    if (custBgColorPicker) custBgColorPicker.value = app.backgroundColor || defaultBg;
    if (custTextColor) {
      custTextColor.value = app.textColor || '';
      custTextColor.placeholder = defaultText;
    }
    if (custTextColorPicker) custTextColorPicker.value = app.textColor || defaultText;
    if (custFontFamily) custFontFamily.value = app.fontFamily || '';

    currentCustomLinks = Array.isArray(customSettings.links) ? JSON.parse(JSON.stringify(customSettings.links)) : [];
    if (typeof renderCustomLinks === 'function') renderCustomLinks();
    if (typeof updateAvatarSyncPreview === 'function') updateAvatarSyncPreview(customer.avatarUrl, customer.initials);

    // Front & Back Card Images
    const cardImages = customSettings.cardImages || {};
    currentFrontImageUrl = cardImages.frontUrl || '';
    currentBackImageUrl = cardImages.backUrl || '';
    if (typeof updateCardImagePreviews === 'function') updateCardImagePreviews();

    // Dynamic Design-Specific Editor & Live Preview Initialization
    if (window.DYNAMIC_CARD_EDITOR && typeof window.DYNAMIC_CARD_EDITOR.renderDesignSpecificEditor === 'function') {
      window.DYNAMIC_CARD_EDITOR.renderDesignSpecificEditor(customer.designId || customer.design, customer);
      window.DYNAMIC_CARD_EDITOR.triggerLivePreviewUpdate();
    }

    // 8. Raftcon Luxury project customization
    const isRaftcon = customer.design === 'Raftcon Luxury' || 
                      customer.designId === 'raftcon-luxury' || 
                      (customer.customSettings?.industry?.type === 'raftcon-construction');
    const raftconCard = document.getElementById('raftconProjectCard');
    if (raftconCard) {
      if (isRaftcon) {
        raftconCard.style.display = 'block';
        if (typeof populateRaftconForm === 'function') {
          populateRaftconForm(customer);
        }
      } else {
        raftconCard.style.display = 'none';
      }
    }

    // 8b. ATG Study Abroad customization
    const isAtg = customer.design === 'ATG Study Abroad' || 
                  customer.designId === 'atg-study-abroad' || 
                  (customer.customSettings?.industry?.type === 'study-abroad');
    const atgCard = document.getElementById('atgStudyAbroadCard');
    if (atgCard) {
      if (isAtg) {
        atgCard.style.display = 'block';
        if (typeof populateAtgForm === 'function') {
          populateAtgForm(customer);
        }
      } else {
        atgCard.style.display = 'none';
      }
    }

    // 8c. Spice Route Restaurant customization
    const isSpice = customer.design === 'Spice Route' || 
                    customer.designId === 'spice-route' || 
                    (customer.customSettings?.industry?.type === 'restaurant');
    const spiceCard = document.getElementById('spiceRouteCard');
    if (spiceCard) {
      if (isSpice) {
        spiceCard.style.display = 'block';
        if (typeof populateSpiceRouteForm === 'function') {
          populateSpiceRouteForm(customer);
        }
      } else {
        spiceCard.style.display = 'none';
      }
    }

    // 9. Open the Form Tab
    navigateToTab('add-customer');
    showAdminToast(`Editing ${customer.name} (Existing Record)`);
  }

  function resetAddCustomerForm() {
    currentEditingCustomerId = null;

    if (pageTitle && document.getElementById('tab-add-customer').classList.contains('active')) {
      pageTitle.textContent = 'Add Customer';
    }
    if (formBreadcrumbCurrent) formBreadcrumbCurrent.textContent = 'New customer';
    if (formMainTitle) formMainTitle.textContent = 'Personal information';
    if (formMainSub) formMainSub.textContent = 'Who the digital card belongs to.';

    if (saveCustomerBtn) {
      saveCustomerBtn.innerHTML = `<span>Save Customer</span>`;
    }

    // Reset Raftcon Luxury Customization
    const raftconCard = document.getElementById('raftconProjectCard');
    if (raftconCard) raftconCard.style.display = 'none';
    if (typeof resetRaftconForm === 'function') {
      resetRaftconForm();
    }

    // Reset ATG Study Abroad Customization
    const atgCard = document.getElementById('atgStudyAbroadCard');
    if (atgCard) atgCard.style.display = 'none';
    if (typeof resetAtgForm === 'function') {
      resetAtgForm();
    }

    // Reset Spice Route Restaurant Customization
    const spiceCard = document.getElementById('spiceRouteCard');
    if (spiceCard) spiceCard.style.display = 'none';
    if (typeof resetSpiceRouteForm === 'function') {
      resetSpiceRouteForm();
    }

    // Clear fields
    if (addCustomerForm) addCustomerForm.reset();
    if (custFullName) custFullName.value = '';
    if (custDesignation) custDesignation.value = '';
    if (custCompany) custCompany.value = '';
    if (custDescription) custDescription.value = '';
    if (custPhone) custPhone.value = '';
    if (custWhatsApp) custWhatsApp.value = '';
    if (custEmail) custEmail.value = '';
    if (custWebsite) custWebsite.value = '';
    if (custAddress) custAddress.value = '';
    if (custInstagram) custInstagram.value = '';
    if (custLinkedIn) custLinkedIn.value = '';

    // Reset Customization
    if (custPrimaryColor) {
      custPrimaryColor.value = '';
      custPrimaryColor.placeholder = '#10b981';
    }
    if (custPrimaryColorPicker) custPrimaryColorPicker.value = '#10b981';
    if (custBgColor) {
      custBgColor.value = '';
      custBgColor.placeholder = '#faf6ee';
    }
    if (custBgColorPicker) custBgColorPicker.value = '#faf6ee';
    if (custTextColor) {
      custTextColor.value = '';
      custTextColor.placeholder = '#1e293b';
    }
    if (custTextColorPicker) custTextColorPicker.value = '#1e293b';
    if (custFontFamily) custFontFamily.value = '';
    currentCustomLinks = [];
    if (typeof renderCustomLinks === 'function') renderCustomLinks();
    if (typeof updateAvatarSyncPreview === 'function') updateAvatarSyncPreview(null, 'AS');

    // Reset Card Images
    currentFrontImageUrl = '';
    currentBackImageUrl = '';
    if (typeof updateCardImagePreviews === 'function') updateCardImagePreviews();

    // Clear avatar
    currentUploadedAvatar = null;
    if (avatarUploadCircle) {
      avatarUploadCircle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>`;
    }
    const photoFileInputEl = document.getElementById('photoFileInput');
    if (photoFileInputEl) photoFileInputEl.value = '';

    // Default design
    selectedDesign = "Mint Haven";
    setDesignSelection("Mint Haven");

    updateClientDelivery('', '');

    const btnPreviewChosenDesign = document.getElementById('btnPreviewChosenDesign');
    const previewChosenDesignText = document.getElementById('previewChosenDesignText');
    if (btnPreviewChosenDesign) {
      btnPreviewChosenDesign.href = '/cards/index.html';
      if (previewChosenDesignText) {
        previewChosenDesignText.textContent = 'Inspect Design Templates Live';
      }
    }

    if (avatarUploadCircle) {
      avatarUploadCircle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>`;
    }
  }

  // -------------------------------------------------------------
  // Digital Card Design Gallery & Live Customer Preview System
  // -------------------------------------------------------------
  const adminDesignGalleryGrid = document.getElementById('adminDesignGalleryGrid');
  const selectedDesignDisplayBadge = document.getElementById('selectedDesignDisplayBadge');
  const selectedDesignInput = document.getElementById('selectedDesignInput');
  const catFilterBtns = document.querySelectorAll('.design-category-tabs .design-cat-btn');

  // Preview Modal Elements
  const adminCardPreviewModal = document.getElementById('adminCardPreviewModal');
  const previewModalIframe = document.getElementById('previewModalIframe');
  const previewModalDesignName = document.getElementById('previewModalDesignName');
  const previewModalCategoryBadge = document.getElementById('previewModalCategoryBadge');
  const previewFooterDesignInfo = document.getElementById('previewFooterDesignInfo');
  const previewPhoneShell = document.getElementById('previewPhoneShell');
  const btnClosePreviewModal = document.getElementById('btnClosePreviewModal');
  const btnClosePreviewFooter = document.getElementById('btnClosePreviewFooter');
  const btnApplyDesignFromPreview = document.getElementById('btnApplyDesignFromPreview');
  const btnPreviewCurrentCustomerDesign = document.getElementById('btnPreviewCurrentCustomerDesign');
  const viewportToggleBtns = document.querySelectorAll('.viewport-toggle-btn');
  let modalActiveDesign = 'Mint Haven';

  function renderDesignGallery(filterCat = 'all') {
    if (!adminDesignGalleryGrid) return;
    const registry = window.CARD_DESIGN_REGISTRY;
    if (!registry || !Array.isArray(registry.ALL_DESIGNS)) {
      adminDesignGalleryGrid.innerHTML = '<div style="padding: 12px; font-size: 12px; color: var(--text-muted);">Loading designs...</div>';
      return;
    }

    const designs = filterCat === 'all'
      ? registry.ALL_DESIGNS
      : registry.ALL_DESIGNS.filter(d => d.category === filterCat);

    const resolvedCurrent = registry.resolveCardDesign(selectedDesign);

    adminDesignGalleryGrid.innerHTML = designs.map(d => {
      const isSelected = d.id === resolvedCurrent.id || d.name === resolvedCurrent.name;
      const catClass = d.category || 'personal';
      const catLabel = d.industryModule ? `Industry: ${d.industryModule}` : (d.categoryLabel || d.category);

      return `
        <div class="admin-design-card ${isSelected ? 'selected' : ''}" 
             data-design-id="${escapeHtml(d.id)}" 
             data-design-name="${escapeHtml(d.name)}"
             role="radio"
             aria-checked="${isSelected ? 'true' : 'false'}"
             tabindex="0">
          <div class="design-card-thumb thumb-${escapeHtml(d.id)}">
            ${d.id === 'bento-grid' ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 6px; width: 50px; height: 50px;">
                <div style="background: #e0e7ff; border-radius: 4px;"></div>
                <div style="background: #fef3c7; border-radius: 4px;"></div>
                <div style="background: #dcfce7; border-radius: 4px;"></div>
                <div style="background: #fce7f3; border-radius: 4px;"></div>
              </div>
            ` : `
              <div class="thumb-elem-avatar"></div>
            `}
          </div>
          <div class="design-card-meta">
            <div class="design-card-title-row">
              <span class="design-card-title">${escapeHtml(d.name)}</span>
              <span class="design-card-cat-pill ${escapeHtml(catClass)}">${escapeHtml(catLabel)}</span>
            </div>
            <p class="design-card-desc">${escapeHtml(d.description || '')}</p>
          </div>
          <div class="design-card-actions">
            <button type="button" class="btn-card-use" data-design-name="${escapeHtml(d.name)}">
              ${isSelected ? '✓ Selected' : 'Use Design'}
            </button>
            <button type="button" class="btn-card-preview" data-design-id="${escapeHtml(d.id)}" title="Preview with customer data">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    adminDesignGalleryGrid.querySelectorAll('.admin-design-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-card-preview')) {
          e.stopPropagation();
          const dId = card.getAttribute('data-design-id');
          const hasForm = Boolean((custFullNameInput && custFullNameInput.value.trim()) || (custDesignationInput && custDesignationInput.value.trim()));
          openCardPreviewModal(dId, { mode: hasForm ? 'customer' : 'demo' });
          return;
        }

        const dName = card.getAttribute('data-design-name') || 'Mint Haven';
        setDesignSelection(dName);
      });
    });

    adminDesignGalleryGrid.querySelectorAll('.btn-card-preview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dId = btn.getAttribute('data-design-id');
        const hasForm = Boolean((custFullNameInput && custFullNameInput.value.trim()) || (custDesignationInput && custDesignationInput.value.trim()));
        openCardPreviewModal(dId, { mode: hasForm ? 'customer' : 'demo' });
      });
    });
  }

  // Category Filter Tab Clicks
  catFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category') || 'all';
      renderDesignGallery(cat);
    });
  });

  function setDesignSelection(designName) {
    const registry = window.CARD_DESIGN_REGISTRY;
    const resolved = registry ? registry.resolveCardDesign(designName) : { id: 'mint-haven', name: 'Mint Haven' };
    selectedDesign = resolved.name;

    if (selectedDesignDisplayBadge) {
      selectedDesignDisplayBadge.textContent = resolved.name;
    }
    if (selectedDesignInput) {
      selectedDesignInput.value = resolved.name;
    }

    // Update gallery cards in form
    const galleryCards = document.querySelectorAll('.admin-design-card');
    galleryCards.forEach(card => {
      const cId = card.getAttribute('data-design-id');
      const cName = card.getAttribute('data-design-name');
      const isSelected = cId === resolved.id || cName === resolved.name;
      if (isSelected) {
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
        const useBtn = card.querySelector('.btn-card-use');
        if (useBtn) useBtn.textContent = '✓ Selected';
      } else {
        card.classList.remove('selected');
        card.setAttribute('aria-checked', 'false');
        const useBtn = card.querySelector('.btn-card-use');
        if (useBtn) useBtn.textContent = 'Use Design';
      }
    });

    // Update color pickers placeholders to match chosen design palette if empty
    if (resolved.theme) {
      if (custPrimaryColor && !custPrimaryColor.value.trim() && custPrimaryColorPicker) {
        custPrimaryColorPicker.value = resolved.theme.primaryColor || '#10b981';
        custPrimaryColor.placeholder = resolved.theme.primaryColor || '#10b981';
      }
      if (custBgColor && !custBgColor.value.trim() && custBgColorPicker) {
        custBgColorPicker.value = resolved.theme.backgroundColor || '#faf6ee';
        custBgColor.placeholder = resolved.theme.backgroundColor || '#faf6ee';
      }
      if (custTextColor && !custTextColor.value.trim() && custTextColorPicker) {
        custTextColorPicker.value = resolved.theme.textColor || '#1e293b';
        custTextColor.placeholder = resolved.theme.textColor || '#1e293b';
      }
    }

    // Toggle Raftcon Construction Project Customization Card
    const isRaftcon = (resolved.id === 'raftcon-luxury' || resolved.name === 'Raftcon Luxury');
    const raftconCard = document.getElementById('raftconProjectCard');
    if (raftconCard) {
      if (isRaftcon) {
        raftconCard.style.display = 'block';
        if (typeof isRaftconInitialized === 'function' && !isRaftconInitialized()) {
          populateRaftconForm(null);
        }
      } else {
        raftconCard.style.display = 'none';
      }
    }

    // Toggle ATG Study Abroad Customization Card
    const isAtg = (resolved.id === 'atg-study-abroad' || resolved.name === 'ATG Study Abroad');
    const atgCard = document.getElementById('atgStudyAbroadCard');
    if (atgCard) {
      if (isAtg) {
        atgCard.style.display = 'block';
        if (typeof isAtgInitialized === 'function' && !isAtgInitialized()) {
          populateAtgForm(null);
        }
      } else {
        atgCard.style.display = 'none';
      }
    }

    // Toggle Spice Route Restaurant Customization Card
    const isSpice = (resolved.id === 'spice-route' || resolved.name === 'Spice Route');
    const spiceCard = document.getElementById('spiceRouteCard');
    if (spiceCard) {
      if (isSpice) {
        spiceCard.style.display = 'block';
        if (typeof isSpiceInitialized === 'function' && !isSpiceInitialized()) {
          populateSpiceRouteForm(null);
        }
      } else {
        spiceCard.style.display = 'none';
      }
    }

    // Update inspect links if customer exists
    if (currentEditingCustomerId) {
      const c = customers.find(item => String(item.id) === String(currentEditingCustomerId));
      const btnPreviewChosenDesign = document.getElementById('btnPreviewChosenDesign');
      if (c && btnPreviewChosenDesign) {
        btnPreviewChosenDesign.href = `/cards/preview.html?design=${encodeURIComponent(resolved.id)}&slug=${encodeURIComponent(c.profileSlug || '')}&id=${encodeURIComponent(c.id)}`;
      }
    }

    // Dynamic Design-Specific Editor & Live Preview Update
    const activeCust = currentEditingCustomerId ? customers.find(item => String(item.id) === String(currentEditingCustomerId)) : null;
    if (window.DYNAMIC_CARD_EDITOR && typeof window.DYNAMIC_CARD_EDITOR.renderDesignSpecificEditor === 'function') {
      window.DYNAMIC_CARD_EDITOR.renderDesignSpecificEditor(resolved.id, activeCust);
      window.DYNAMIC_CARD_EDITOR.triggerLivePreviewUpdate();
    }
  }

  // -------------------------------------------------------------
  // Live Customer Card Preview Modal Implementation
  // -------------------------------------------------------------
  function buildCustomerPreviewPayload(design) {
    const rawName = custFullName ? custFullName.value.trim() : '';
    const rawRole = custDesignation ? custDesignation.value.trim() : '';
    const rawCompany = custCompany ? custCompany.value.trim() : '';
    const rawPhone = custPhone ? custPhone.value.trim() : '';
    const rawWhatsApp = custWhatsApp ? custWhatsApp.value.trim() : '';
    const rawEmail = custEmail ? custEmail.value.trim() : '';
    const rawWebsite = custWebsite ? custWebsite.value.trim() : '';
    const rawAddress = custAddress ? custAddress.value.trim() : '';
    const rawDesc = custDescription ? custDescription.value.trim() : '';
    const rawInstagram = custInstagram ? custInstagram.value.trim() : '';
    const rawLinkedIn = custLinkedIn ? custLinkedIn.value.trim() : '';

    const registry = window.CARD_DESIGN_REGISTRY;

    // Check if there is actual customer data in the editor
    const hasFormInput = Boolean(
      rawName || rawRole || rawCompany || rawPhone || rawWhatsApp || rawEmail || 
      rawWebsite || rawAddress || rawDesc || rawInstagram || rawLinkedIn || 
      currentUploadedAvatar || currentFrontImageUrl || currentBackImageUrl ||
      (Array.isArray(currentCustomLinks) && currentCustomLinks.length > 0)
    );

    let fullName = '';
    let designation = '';
    let company = '';
    let phone = '';
    let whatsapp = '';
    let email = '';
    let website = '';
    let address = '';
    let description = '';
    let avatarUrl = '';
    let socialInstagram = '';
    let socialLinkedIn = '';
    let links = [];
    let industryData = {};

    if (hasFormInput) {
      // Customer Mode: ONLY actual customer data, zero dummy fallback!
      fullName = rawName;
      designation = rawRole;
      company = rawCompany;
      phone = rawPhone;
      whatsapp = rawWhatsApp;
      email = rawEmail;
      website = rawWebsite;
      address = rawAddress;
      description = rawDesc;
      avatarUrl = currentUploadedAvatar || '';
      socialInstagram = rawInstagram;
      socialLinkedIn = rawLinkedIn;

      if (Array.isArray(currentCustomLinks) && currentCustomLinks.length > 0) {
        links = currentCustomLinks.filter(l => l && l.enabled !== false && l.value && l.value.trim());
      } else {
        let order = 0;
        if (phone) links.push({ id: `link_${++order}`, type: 'phone', label: 'Phone', value: phone, enabled: true, order });
        if (whatsapp) links.push({ id: `link_${++order}`, type: 'whatsapp', label: 'WhatsApp', value: whatsapp, enabled: true, order });
        if (email) links.push({ id: `link_${++order}`, type: 'email', label: 'Email', value: email, enabled: true, order });
        if (website) links.push({ id: `link_${++order}`, type: 'website', label: 'Website', value: website, enabled: true, order });
        if (rawInstagram) links.push({ id: `link_${++order}`, type: 'instagram', label: 'Instagram', value: rawInstagram, enabled: true, order });
        if (rawLinkedIn) links.push({ id: `link_${++order}`, type: 'linkedin', label: 'LinkedIn', value: rawLinkedIn, enabled: true, order });
        if (address) links.push({ id: `link_${++order}`, type: 'maps', label: 'Directions', value: address, enabled: true, order });
      }

      if (design.id === 'raftcon-luxury' && typeof collectRaftconIndustryData === 'function') {
        const coll = collectRaftconIndustryData();
        if (coll && coll.data) industryData = coll.data;
      }
      if (design.id === 'atg-study-abroad' && typeof collectAtgIndustryData === 'function') {
        const coll = collectAtgIndustryData();
        if (coll && coll.data) industryData = coll.data;
      }
      if (design.id === 'spice-route' && typeof collectSpiceRouteIndustryData === 'function') {
        const coll = collectSpiceRouteIndustryData();
        if (coll && coll.data) industryData = coll.data;
      }
    } else {
      // Empty editor fallback for showroom template preview
      const demoProfile = (registry && typeof registry.getDemoProfile === 'function')
        ? registry.getDemoProfile(design.id)
        : ((registry && registry.AUTHORITATIVE_AMBROS_CUSTOMER) || {});

      fullName = demoProfile.fullName || 'Ambros Studio';
      designation = demoProfile.designation || '';
      company = demoProfile.company || '';
      phone = demoProfile.phone || '';
      whatsapp = demoProfile.whatsapp || '';
      email = demoProfile.email || '';
      website = demoProfile.website || '';
      address = demoProfile.address || '';
      description = demoProfile.description || '';
      avatarUrl = demoProfile.avatarUrl || '';
      socialInstagram = demoProfile.socialInstagram || '';
      socialLinkedIn = demoProfile.socialLinkedIn || '';

      if (demoProfile.customSettings && Array.isArray(demoProfile.customSettings.links)) {
        links = demoProfile.customSettings.links;
      }
      if (demoProfile.customSettings && demoProfile.customSettings.industry && demoProfile.customSettings.industry.data) {
        industryData = demoProfile.customSettings.industry.data;
      }
    }

    return {
      fullName,
      designation,
      company,
      phone,
      whatsapp,
      email,
      website,
      address,
      description,
      socialInstagram,
      socialLinkedIn,
      cardDesign: design.id,
      profileSlug: (fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'sample-profile',
      avatarUrl: avatarUrl,
      is_active: true,
      customSettings: {
        appearance: {
          primaryColor: custPrimaryColor ? custPrimaryColor.value.trim() : (design.theme?.primaryColor || ''),
          backgroundColor: custBgColor ? custBgColor.value.trim() : (design.theme?.backgroundColor || ''),
          textColor: custTextColor ? custTextColor.value.trim() : (design.theme?.textColor || ''),
          fontFamily: custFontFamily ? custFontFamily.value : (design.theme?.fontFamily || '')
        },
        links,
        cardImages: {
          frontUrl: currentFrontImageUrl || '',
          backUrl: currentBackImageUrl || '',
        },
        industry: {
          type: design.industryModule || 'general',
          data: industryData
        }
      }
    };
  }

  function openCardPreviewModal(designNameOrId, options) {
    if (!adminCardPreviewModal) return;
    options = options || {};
    const registry = window.CARD_DESIGN_REGISTRY;
    const renderer = window.CARD_RENDERER;
    const resolved = registry ? registry.resolveCardDesign(designNameOrId) : { id: 'mint-haven', name: 'Mint Haven', category: 'personal' };
    modalActiveDesign = resolved.name;

    const isDemoMode = options.mode === 'demo' || (!options.mode && options.isDemo);

    if (previewModalDesignName) previewModalDesignName.textContent = resolved.name;
    if (previewModalCategoryBadge) {
      previewModalCategoryBadge.textContent = resolved.industryModule ? `Industry: ${resolved.industryModule}` : resolved.category;
    }
    if (previewModalSubtitle) {
      previewModalSubtitle.textContent = isDemoMode
        ? 'Design Showroom: Fictional sample profile & industry layout.'
        : 'Rendered using current customer form data.';
    }
    if (previewFooterDesignInfo) {
      previewFooterDesignInfo.innerHTML = `Design: <strong>${escapeHtml(resolved.name)}</strong> &bull; ${escapeHtml(resolved.categoryLabel || resolved.category)} &bull; ${escapeHtml(resolved.badge || '')} ${isDemoMode ? '<span style="color:#38bdf8;margin-left:8px;font-size:11px;">[Showroom Demo]</span>' : '<span style="color:#34d399;margin-left:8px;font-size:11px;">[Customer Data]</span>'}`;
    }

    let customerPayload;
    if (isDemoMode && registry && typeof registry.getDemoProfile === 'function') {
      customerPayload = registry.getDemoProfile(resolved.id);
    } else {
      customerPayload = buildCustomerPreviewPayload(resolved);
    }

    if (previewModalIframe) {
      const renderFn = renderer && (renderer.renderCardHtml || renderer.renderCompleteCardHtml);
      if (typeof renderFn === 'function') {
        const fullHtml = renderFn(customerPayload, { isPreview: true });
        previewModalIframe.removeAttribute('src');
        previewModalIframe.srcdoc = fullHtml;
      } else {
        previewModalIframe.removeAttribute('srcdoc');
        previewModalIframe.src = `/cards/preview.html?design=${encodeURIComponent(resolved.id)}`;
      }
    }

    adminCardPreviewModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeCardPreviewModal() {
    if (!adminCardPreviewModal) return;
    adminCardPreviewModal.style.display = 'none';
    document.body.style.overflow = '';
    if (previewModalIframe) {
      previewModalIframe.removeAttribute('srcdoc');
      previewModalIframe.src = 'about:blank';
    }
  }

  if (btnClosePreviewModal) btnClosePreviewModal.addEventListener('click', closeCardPreviewModal);
  if (btnClosePreviewFooter) btnClosePreviewFooter.addEventListener('click', closeCardPreviewModal);
  if (adminCardPreviewModal) {
    adminCardPreviewModal.addEventListener('click', (e) => {
      if (e.target === adminCardPreviewModal) closeCardPreviewModal();
    });
  }

  if (btnApplyDesignFromPreview) {
    btnApplyDesignFromPreview.addEventListener('click', () => {
      setDesignSelection(modalActiveDesign);
      closeCardPreviewModal();
      showAdminToast(`Selected design: ${modalActiveDesign}`);
    });
  }

  if (btnPreviewCurrentCustomerDesign) {
    btnPreviewCurrentCustomerDesign.addEventListener('click', () => {
      openCardPreviewModal(selectedDesign, { mode: 'customer' });
    });
  }

  viewportToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewportToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const w = btn.getAttribute('data-width') || '390';
      if (previewPhoneShell) {
        previewPhoneShell.style.width = w + 'px';
      }
    });
  });

  // -------------------------------------------------------------
  // Showroom Tab Rendering (Screen D: Digital Cards Management)
  // -------------------------------------------------------------
  const showroomCardsGrid = document.getElementById('showroomCardsGrid');
  const showroomCatTabs = document.querySelectorAll('#showroomCatTabs .design-cat-btn');

  function renderShowroom(filterCat = 'all') {
    if (!showroomCardsGrid) return;
    const registry = window.CARD_DESIGN_REGISTRY;
    if (!registry || !Array.isArray(registry.ALL_DESIGNS)) return;

    const designs = filterCat === 'all'
      ? registry.ALL_DESIGNS
      : registry.ALL_DESIGNS.filter(d => d.category === filterCat);

    showroomCardsGrid.innerHTML = designs.map(d => {
      const catClass = d.category || 'personal';
      const catLabel = d.industryModule ? `Industry: ${d.industryModule}` : (d.categoryLabel || d.category);

      return `
        <div class="showroom-card-item">
          <div class="showroom-thumb thumb-${escapeHtml(d.id)}">
            ${d.id === 'bento-grid' ? `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 12px; width: 60px; height: 60px;">
                <div style="background: #e0e7ff; border-radius: 4px;"></div>
                <div style="background: #fef3c7; border-radius: 4px;"></div>
                <div style="background: #dcfce7; border-radius: 4px;"></div>
                <div style="background: #fce7f3; border-radius: 4px;"></div>
              </div>
            ` : `
              <div class="thumb-elem-avatar" style="transform: scale(1.4);"></div>
            `}
          </div>
          <div class="showroom-body">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="font-size: 15px; font-weight: 700; color: var(--text-headline);">${escapeHtml(d.name)}</h3>
              <span class="design-card-cat-pill ${escapeHtml(catClass)}">${escapeHtml(catLabel)}</span>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">${escapeHtml(d.description || '')}</p>
          </div>
          <div class="showroom-footer">
            <button type="button" class="btn btn-white btn-xs btn-showroom-preview" data-design-id="${escapeHtml(d.id)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span>Live Preview</span>
            </button>
            <button type="button" class="btn btn-gold btn-xs btn-showroom-use" data-design-name="${escapeHtml(d.name)}">
              <span>Create Customer</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    showroomCardsGrid.querySelectorAll('.btn-showroom-preview').forEach(btn => {
      btn.addEventListener('click', () => {
        const dId = btn.getAttribute('data-design-id');
        openCardPreviewModal(dId, { mode: 'demo' });
      });
    });

    showroomCardsGrid.querySelectorAll('.btn-showroom-use').forEach(btn => {
      btn.addEventListener('click', () => {
        const dName = btn.getAttribute('data-design-name');
        resetAddCustomerForm();
        setDesignSelection(dName);
        navigateToTab('add-customer');
        showAdminToast(`Selected ${dName}. Ready to create customer profile.`);
      });
    });
  }

  showroomCatTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      showroomCatTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-showroom-cat') || 'all';
      renderShowroom(cat);
    });
  });

  // Profile link and Client Delivery live update on Full Name & Company typing
  function handleFormInputDeliveryUpdate() {
    const nameVal = custFullName ? custFullName.value.trim() : '';
    const compVal = custCompany ? custCompany.value.trim() : '';
    if (!currentEditingCustomerId) {
      const slug = nameVal ? nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
      updateClientDelivery(slug, nameVal, compVal);
    } else {
      const existingCustomer = customers.find(c => String(c.id) === String(currentEditingCustomerId));
      const slug = (existingCustomer && existingCustomer.profileSlug)
        ? existingCustomer.profileSlug
        : (nameVal ? nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
      updateClientDelivery(slug, nameVal, compVal);
    }
  }

  if (custFullName) {
    custFullName.addEventListener('input', handleFormInputDeliveryUpdate);
  }
  if (custCompany) {
    custCompany.addEventListener('input', handleFormInputDeliveryUpdate);
  }

  // Live Card Preview Synchronization Helper
  function triggerAdminLivePreview() {
    if (window.DYNAMIC_CARD_EDITOR && typeof window.DYNAMIC_CARD_EDITOR.triggerLivePreviewUpdate === 'function') {
      window.DYNAMIC_CARD_EDITOR.triggerLivePreviewUpdate();
    }
  }

  // Attach live preview updates to all core fields
  try {
    [
      custFullName, custDesignation, custCompany, custDescription,
      custPhone, custWhatsApp, custEmail, custWebsite, custAddress,
      custInstagram, custLinkedIn, custPrimaryColor, custBgColor, custTextColor, custFontFamily
    ].forEach(el => {
      if (el) {
        el.addEventListener('input', triggerAdminLivePreview);
        el.addEventListener('change', triggerAdminLivePreview);
      }
    });

    if (custPrimaryColorPicker) custPrimaryColorPicker.addEventListener('input', triggerAdminLivePreview);
    if (custBgColorPicker) custBgColorPicker.addEventListener('input', triggerAdminLivePreview);
    if (custTextColorPicker) custTextColorPicker.addEventListener('input', triggerAdminLivePreview);
  } catch (err) {
    console.warn('Could not attach all live preview listeners:', err);
  }

  // Form Submit Handler (Connected to Live Database via POST / PATCH)
  let isSubmittingCustomer = false;

  if (addCustomerForm) {
    addCustomerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (isSubmittingCustomer) return;

      const name = custFullName.value.trim();
      if (!name) {
        showAdminToast('Please enter customer full name.');
        return;
      }

      const role = custDesignation.value.trim();
      const company = custCompany.value.trim();
      const description = custDescription.value.trim();
      const phone = custPhone.value.trim();
      const whatsapp = custWhatsApp.value.trim();
      const email = custEmail.value.trim();
      const website = custWebsite.value.trim();
      const address = custAddress.value.trim();
      const instagram = custInstagram.value.trim();
      const linkedIn = custLinkedIn.value.trim();

      const existing = currentEditingCustomerId ? customers.find(c => String(c.id) === String(currentEditingCustomerId)) : null;
      const slug = (existing && existing.profileSlug) ? existing.profileSlug : (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

      const isRaftconDesign = (selectedDesign === 'Raftcon Luxury' || selectedDesign === 'raftcon-luxury') || 
        (existing && (existing.design === 'Raftcon Luxury' || existing.designId === 'raftcon-luxury')) ||
        (document.getElementById('raftconProjectCard') && document.getElementById('raftconProjectCard').style.display !== 'none');

      const isAtgDesign = (selectedDesign === 'ATG Study Abroad' || selectedDesign === 'atg-study-abroad') || 
        (existing && (existing.design === 'ATG Study Abroad' || existing.designId === 'atg-study-abroad')) ||
        (document.getElementById('atgStudyAbroadCard') && document.getElementById('atgStudyAbroadCard').style.display !== 'none');

      const isSpiceRouteDesign = (selectedDesign === 'Spice Route' || selectedDesign === 'spice-route') || 
        (existing && (existing.design === 'Spice Route' || existing.designId === 'spice-route')) ||
        (document.getElementById('spiceRouteCard') && document.getElementById('spiceRouteCard').style.display !== 'none');

      let industryPayload = null;
      if (window.DYNAMIC_CARD_EDITOR && typeof window.DYNAMIC_CARD_EDITOR.collectDesignSpecificData === 'function') {
        const dynData = window.DYNAMIC_CARD_EDITOR.collectDesignSpecificData();
        const registry = window.CARD_DESIGN_REGISTRY;
        const resolved = registry ? registry.resolveCardDesign(selectedDesign) : { id: 'mint-haven', name: 'Mint Haven' };
        const indType = resolved.industryModule || (existing && existing.customSettings && existing.customSettings.industry && existing.customSettings.industry.type) || 'general';
        industryPayload = {
          type: indType,
          data: dynData
        };
      } else if (isRaftconDesign && typeof collectRaftconIndustryData === 'function') {
        industryPayload = collectRaftconIndustryData();
      } else if (isAtgDesign && typeof collectAtgIndustryData === 'function') {
        industryPayload = collectAtgIndustryData();
      } else if (isSpiceRouteDesign && typeof collectSpiceRouteIndustryData === 'function') {
        industryPayload = collectSpiceRouteIndustryData();
      } else if (existing && existing.customSettings && existing.customSettings.industry) {
        industryPayload = existing.customSettings.industry;
      }

      const payload = {
        name,
        role,
        company,
        description,
        phone,
        whatsapp,
        email,
        website,
        address,
        socialInstagram: instagram,
        socialLinkedIn: linkedIn,
        design: selectedDesign,
        profileLink: generateCustomerProfileUrl(slug, company),
        profileSlug: slug,
        avatar_url: currentUploadedAvatar,
        custom_settings: {
          ...(industryPayload ? { industry: industryPayload } : {}),
          appearance: {
            primaryColor: custPrimaryColor ? custPrimaryColor.value.trim() : '',
            backgroundColor: custBgColor ? custBgColor.value.trim() : '',
            textColor: custTextColor ? custTextColor.value.trim() : '',
            fontFamily: custFontFamily ? custFontFamily.value : '',
          },
          links: Array.isArray(currentCustomLinks)
            ? currentCustomLinks.map((item, idx) => ({
                id: item.id || `link_${Date.now()}_${idx}`,
                type: item.type,
                label: item.label,
                value: item.value,
                enabled: item.enabled !== false,
                order: idx,
              }))
            : [],
          cardImages: {
            frontUrl: currentFrontImageUrl || '',
            backUrl: currentBackImageUrl || '',
          },
        },
      };

      isSubmittingCustomer = true;
      if (saveCustomerBtn) {
        saveCustomerBtn.disabled = true;
        saveCustomerBtn.innerHTML = `<span>${currentEditingCustomerId ? 'Updating...' : 'Saving...'}</span>`;
      }

      try {
        if (currentEditingCustomerId) {
          // ========================================================
          // UPDATE EXISTING CUSTOMER VIA PATCH
          // ========================================================
          const res = await apiFetch(`/api/admin/customers/${currentEditingCustomerId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            showAdminToast(`Customer "${name}" updated successfully.`);
            resetAddCustomerForm();
            await loadCustomers();
            navigateToTab('customers');
          } else {
            showAdminToast(data.error || 'Failed to update customer record.');
          }
        } else {
          // ========================================================
          // CREATE NEW CUSTOMER VIA POST
          // ========================================================
          const res = await apiFetch('/api/admin/customers', {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              status: 'active',
              is_active: true,
            }),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            showAdminToast(`New customer "${name}" created successfully.`);
            resetAddCustomerForm();
            await loadCustomers();
            navigateToTab('customers');
          } else {
            showAdminToast(data.error || 'Failed to create customer record.');
          }
        }
      } catch (err) {
        console.error('Customer form submit error:', err);
        showAdminToast('Network or server error saving customer.');
      } finally {
        isSubmittingCustomer = false;
        if (saveCustomerBtn) {
          saveCustomerBtn.disabled = false;
          saveCustomerBtn.innerHTML = `<span>${currentEditingCustomerId ? 'Update Customer' : 'Save Customer'}</span>`;
        }
      }
    });
  }

  // Cancel Button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      resetAddCustomerForm();
      navigateToTab('customers');
    });
  }

  // Photo Upload Trigger (UI preview)
  const choosePhotoBtn = document.getElementById('choosePhotoBtn');
  const photoFileInput = document.getElementById('photoFileInput');

  if (choosePhotoBtn && photoFileInput) {
    choosePhotoBtn.addEventListener('click', () => photoFileInput.click());
    if (avatarUploadCircle) {
      avatarUploadCircle.addEventListener('click', () => photoFileInput.click());
    }

    photoFileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        if (file.size > 2 * 1024 * 1024) {
          showAdminToast('Photo exceeds 2MB limit. Please choose a smaller image.');
          return;
        }
        const reader = new FileReader();
        reader.onload = function(evt) {
          currentUploadedAvatar = evt.target.result;
          if (avatarUploadCircle) {
            avatarUploadCircle.innerHTML = `<img src="${evt.target.result}" style="width:100%;height:100%;object-fit:contain;padding:4px;box-sizing:border-box;background:#ffffff;border-radius:50%;" alt="Uploaded Avatar">`;
          }
          if (custAvatarSyncPreview) {
            custAvatarSyncPreview.innerHTML = `<img src="${evt.target.result}" style="width:100%;height:100%;object-fit:contain;padding:4px;box-sizing:border-box;background:#ffffff;border-radius:50%;" alt="Uploaded Avatar">`;
          }
          if (custAvatarSyncStatus) {
            custAvatarSyncStatus.textContent = 'New Photo Ready to Save';
          }
          showAdminToast('Profile photo ready to save');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // =============================================================
  // Phase 2: Card Customization & Dynamic Link Manager Controller
  // =============================================================

  const LINK_TYPE_METADATA = {
    whatsapp: { name: 'WhatsApp', badgeClass: 'whatsapp', iconLetter: 'WA', defaultLabel: 'Chat on WhatsApp', placeholder: '+91 98250 41872' },
    phone: { name: 'Phone Call', badgeClass: 'phone', iconLetter: 'TEL', defaultLabel: 'Call Directly', placeholder: '+91 98250 41872' },
    email: { name: 'Email', badgeClass: 'email', iconLetter: 'EM', defaultLabel: 'Send an Email', placeholder: 'hello@company.com' },
    website: { name: 'Website', badgeClass: 'website', iconLetter: 'WEB', defaultLabel: 'Visit Website', placeholder: 'https://company.com' },
    instagram: { name: 'Instagram', badgeClass: 'instagram', iconLetter: 'IG', defaultLabel: 'Follow on Instagram', placeholder: 'https://instagram.com/username' },
    linkedin: { name: 'LinkedIn', badgeClass: 'linkedin', iconLetter: 'IN', defaultLabel: 'Connect on LinkedIn', placeholder: 'https://linkedin.com/in/username' },
    facebook: { name: 'Facebook', badgeClass: 'facebook', iconLetter: 'FB', defaultLabel: 'Facebook Profile', placeholder: 'https://facebook.com/username' },
    youtube: { name: 'YouTube', badgeClass: 'youtube', iconLetter: 'YT', defaultLabel: 'Watch on YouTube', placeholder: 'https://youtube.com/@channel' },
    twitter: { name: 'X / Twitter', badgeClass: 'twitter', iconLetter: 'X', defaultLabel: 'Follow on X', placeholder: 'https://x.com/username' },
    telegram: { name: 'Telegram', badgeClass: 'telegram', iconLetter: 'TG', defaultLabel: 'Message on Telegram', placeholder: 'https://t.me/username' },
    maps: { name: 'Google Maps', badgeClass: 'maps', iconLetter: 'MAP', defaultLabel: 'Get Directions', placeholder: 'https://maps.google.com/...' },
    custom: { name: 'Custom Link', badgeClass: 'custom', iconLetter: 'LNK', defaultLabel: 'Custom Action', placeholder: 'https://...' },
  };

  // Color Pickers <-> Hex Inputs Two-Way Synchronization
  function setupColorControl(pickerEl, textEl) {
    if (!pickerEl || !textEl) return;
    pickerEl.addEventListener('input', () => {
      textEl.value = pickerEl.value;
    });
    textEl.addEventListener('input', () => {
      let val = textEl.value.trim();
      if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(val)) {
        val = '#' + val;
        textEl.value = val;
      }
      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
        if (val.length === 4) {
          pickerEl.value = '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
        } else {
          pickerEl.value = val;
        }
      }
    });
  }

  setupColorControl(custPrimaryColorPicker, custPrimaryColor);
  setupColorControl(custBgColorPicker, custBgColor);
  setupColorControl(custTextColorPicker, custTextColor);

  // Reset Customization Defaults
  if (btnResetCustomization) {
    btnResetCustomization.addEventListener('click', () => {
      if (custPrimaryColor) custPrimaryColor.value = '';
      if (custBgColor) custBgColor.value = '';
      if (custTextColor) custTextColor.value = '';
      if (custPrimaryColorPicker) custPrimaryColorPicker.value = selectedDesign === 'Evergreen' ? '#1b3a2f' : '#10b981';
      if (custBgColorPicker) custBgColorPicker.value = selectedDesign === 'Evergreen' ? '#ffffff' : '#faf6ee';
      if (custTextColorPicker) custTextColorPicker.value = selectedDesign === 'Evergreen' ? '#111827' : '#1e293b';
      if (custFontFamily) custFontFamily.value = '';
      currentCustomLinks = [];
      renderCustomLinks();
      currentFrontImageUrl = '';
      currentBackImageUrl = '';
      if (typeof updateCardImagePreviews === 'function') updateCardImagePreviews();
      showAdminToast('Card customization reset to template defaults.');
    });
  }

  // Profile Photo Sync trigger
  if (btnSyncChangeAvatar && photoFileInput) {
    btnSyncChangeAvatar.addEventListener('click', () => photoFileInput.click());
  }

  function updateAvatarSyncPreview(avatarUrl, initials) {
    if (!custAvatarSyncPreview) return;
    if (avatarUrl) {
      custAvatarSyncPreview.innerHTML = `<img src="${escapeHtml(avatarUrl)}" style="width:100%;height:100%;object-fit:contain;padding:4px;box-sizing:border-box;background:#ffffff;border-radius:50%;" alt="Avatar">`;
      if (custAvatarSyncStatus) custAvatarSyncStatus.textContent = 'Custom Photo Saved';
    } else {
      custAvatarSyncPreview.innerHTML = `<span style="font-size: 15px; font-weight: 700; color: #92400e;">${escapeHtml(initials || 'AS')}</span>`;
      if (custAvatarSyncStatus) custAvatarSyncStatus.textContent = 'Using Generated Monogram';
    }
  }

  // -------------------------------------------------------------
  // Front & Back Card Image Upload Controls & Previews
  // -------------------------------------------------------------
  const frontImageStatus = document.getElementById('frontImageStatus');
  const frontImagePlaceholder = document.getElementById('frontImagePlaceholder');
  const frontImagePreviewImg = document.getElementById('frontImagePreviewImg');
  const frontImageFileInput = document.getElementById('frontImageFileInput');
  const btnUploadFrontImage = document.getElementById('btnUploadFrontImage');
  const btnUploadFrontText = document.getElementById('btnUploadFrontText');
  const btnRemoveFrontImage = document.getElementById('btnRemoveFrontImage');

  const backImageStatus = document.getElementById('backImageStatus');
  const backImagePlaceholder = document.getElementById('backImagePlaceholder');
  const backImagePreviewImg = document.getElementById('backImagePreviewImg');
  const backImageFileInput = document.getElementById('backImageFileInput');
  const btnUploadBackImage = document.getElementById('btnUploadBackImage');
  const btnUploadBackText = document.getElementById('btnUploadBackText');
  const btnRemoveBackImage = document.getElementById('btnRemoveBackImage');

  function updateCardImagePreviews() {
    // Front Image
    if (currentFrontImageUrl) {
      if (frontImagePreviewImg) {
        frontImagePreviewImg.src = currentFrontImageUrl;
        frontImagePreviewImg.style.display = 'block';
      }
      if (frontImagePlaceholder) frontImagePlaceholder.style.display = 'none';
      if (frontImageStatus) {
        frontImageStatus.textContent = 'Uploaded';
        frontImageStatus.classList.add('active');
      }
      if (btnUploadFrontText) btnUploadFrontText.textContent = 'Replace Front';
      if (btnRemoveFrontImage) btnRemoveFrontImage.style.display = 'inline-flex';
    } else {
      if (frontImagePreviewImg) {
        frontImagePreviewImg.src = '';
        frontImagePreviewImg.style.display = 'none';
      }
      if (frontImagePlaceholder) frontImagePlaceholder.style.display = 'flex';
      if (frontImageStatus) {
        frontImageStatus.textContent = 'Not set';
        frontImageStatus.classList.remove('active');
      }
      if (btnUploadFrontText) btnUploadFrontText.textContent = 'Upload Front';
      if (btnRemoveFrontImage) btnRemoveFrontImage.style.display = 'none';
      if (frontImageFileInput) frontImageFileInput.value = '';
    }

    // Back Image
    if (currentBackImageUrl) {
      if (backImagePreviewImg) {
        backImagePreviewImg.src = currentBackImageUrl;
        backImagePreviewImg.style.display = 'block';
      }
      if (backImagePlaceholder) backImagePlaceholder.style.display = 'none';
      if (backImageStatus) {
        backImageStatus.textContent = 'Uploaded';
        backImageStatus.classList.add('active');
      }
      if (btnUploadBackText) btnUploadBackText.textContent = 'Replace Back';
      if (btnRemoveBackImage) btnRemoveBackImage.style.display = 'inline-flex';
    } else {
      if (backImagePreviewImg) {
        backImagePreviewImg.src = '';
        backImagePreviewImg.style.display = 'none';
      }
      if (backImagePlaceholder) backImagePlaceholder.style.display = 'flex';
      if (backImageStatus) {
        backImageStatus.textContent = 'Not set';
        backImageStatus.classList.remove('active');
      }
      if (btnUploadBackText) btnUploadBackText.textContent = 'Upload Back';
      if (btnRemoveBackImage) btnRemoveBackImage.style.display = 'none';
      if (backImageFileInput) backImageFileInput.value = '';
    }
  }

  async function handleCardImageUpload(file, kind) {
    if (!file) return;

    // Validate size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showAdminToast(`File exceeds 2MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller image.`);
      return;
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      showAdminToast('Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    const isFront = kind === 'front';
    const btnText = isFront ? btnUploadFrontText : btnUploadBackText;
    const originalText = btnText ? btnText.textContent : '';

    if (btnText) btnText.textContent = 'Uploading...';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);

      const res = await apiFetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        if (isFront) {
          currentFrontImageUrl = data.url;
        } else {
          currentBackImageUrl = data.url;
        }
        updateCardImagePreviews();
        showAdminToast(`${isFront ? 'Front' : 'Back'} card image uploaded successfully.`);
      } else {
        showAdminToast(data.error || 'Failed to upload card image.');
      }
    } catch (err) {
      console.error('Card image upload error:', err);
      showAdminToast('Network error while uploading card image.');
    } finally {
      if (btnText) {
        const hasUrl = isFront ? currentFrontImageUrl : currentBackImageUrl;
        btnText.textContent = hasUrl ? `Replace ${isFront ? 'Front' : 'Back'}` : `Upload ${isFront ? 'Front' : 'Back'}`;
      }
    }
  }

  if (btnUploadFrontImage && frontImageFileInput) {
    btnUploadFrontImage.addEventListener('click', () => frontImageFileInput.click());
    frontImageFileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        handleCardImageUpload(this.files[0], 'front');
      }
    });
  }

  if (btnRemoveFrontImage) {
    btnRemoveFrontImage.addEventListener('click', () => {
      currentFrontImageUrl = '';
      updateCardImagePreviews();
      showAdminToast('Front card image removed.');
    });
  }

  if (btnUploadBackImage && backImageFileInput) {
    btnUploadBackImage.addEventListener('click', () => backImageFileInput.click());
    backImageFileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        handleCardImageUpload(this.files[0], 'back');
      }
    });
  }

  if (btnRemoveBackImage) {
    btnRemoveBackImage.addEventListener('click', () => {
      currentBackImageUrl = '';
      updateCardImagePreviews();
      showAdminToast('Back card image removed.');
    });
  }

  // Render Custom Links in order
  function renderCustomLinks() {
    if (!customLinksContainer) return;
    customLinksContainer.innerHTML = '';

    if (!Array.isArray(currentCustomLinks) || currentCustomLinks.length === 0) {
      if (customLinksEmptyState) customLinksEmptyState.style.display = 'block';
      return;
    }

    if (customLinksEmptyState) customLinksEmptyState.style.display = 'none';

    currentCustomLinks.forEach((link, idx) => {
      const typeInfo = LINK_TYPE_METADATA[link.type] || LINK_TYPE_METADATA.custom;
      const card = document.createElement('div');
      card.className = `custom-link-card ${link.enabled ? '' : 'disabled'}`;
      card.dataset.index = idx;

      card.innerHTML = `
        <div class="link-card-left">
          <div class="link-type-badge ${typeInfo.badgeClass}" title="${typeInfo.name}">
            <span>${typeInfo.iconLetter}</span>
          </div>
          <div class="link-card-info">
            <div class="link-card-label">${escapeHtml(link.label || typeInfo.defaultLabel)}</div>
            <div class="link-card-meta">
              <span>${typeInfo.name}</span> &bull; <span style="font-family: monospace;">${escapeHtml(link.value || 'No URL')}</span>
            </div>
          </div>
        </div>
        <div class="link-card-actions">
          <button type="button" class="link-btn-icon btn-move-up" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button type="button" class="link-btn-icon btn-move-down" title="Move Down" ${idx === currentCustomLinks.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <label class="switch-toggle" title="Toggle active status on card" style="margin: 0 4px;">
            <input type="checkbox" class="link-toggle-checkbox" ${link.enabled ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </label>
          <button type="button" class="link-btn-icon btn-edit-link" title="Edit Link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button type="button" class="link-btn-icon delete btn-delete-link" title="Delete Link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      // Event handlers
      const btnUp = card.querySelector('.btn-move-up');
      if (btnUp && idx > 0) {
        btnUp.addEventListener('click', () => {
          const temp = currentCustomLinks[idx];
          currentCustomLinks[idx] = currentCustomLinks[idx - 1];
          currentCustomLinks[idx - 1] = temp;
          renderCustomLinks();
        });
      }

      const btnDown = card.querySelector('.btn-move-down');
      if (btnDown && idx < currentCustomLinks.length - 1) {
        btnDown.addEventListener('click', () => {
          const temp = currentCustomLinks[idx];
          currentCustomLinks[idx] = currentCustomLinks[idx + 1];
          currentCustomLinks[idx + 1] = temp;
          renderCustomLinks();
        });
      }

      const toggleCheckbox = card.querySelector('.link-toggle-checkbox');
      if (toggleCheckbox) {
        toggleCheckbox.addEventListener('change', (e) => {
          currentCustomLinks[idx].enabled = e.target.checked;
          card.classList.toggle('disabled', !e.target.checked);
        });
      }

      const btnEdit = card.querySelector('.btn-edit-link');
      if (btnEdit) {
        btnEdit.addEventListener('click', () => {
          openLinkModal(idx);
        });
      }

      const btnDelete = card.querySelector('.btn-delete-link');
      if (btnDelete) {
        btnDelete.addEventListener('click', () => {
          currentCustomLinks.splice(idx, 1);
          renderCustomLinks();
          showAdminToast('Link removed');
        });
      }

      customLinksContainer.appendChild(card);
    });
  }

  // Link Editor Modal open/close
  function openLinkModal(index = -1) {
    editingLinkIndex = index;
    if (!linkEditorModal) return;

    if (index >= 0 && currentCustomLinks[index]) {
      const link = currentCustomLinks[index];
      if (linkEditorTitle) linkEditorTitle.textContent = 'Edit Card Link';
      if (saveLinkModalText) saveLinkModalText.textContent = 'Update Link';
      if (linkTypeSelect) linkTypeSelect.value = link.type || 'custom';
      if (linkLabelInput) linkLabelInput.value = link.label || '';
      if (linkValueInput) linkValueInput.value = link.value || '';
      if (linkEnabledInput) linkEnabledInput.checked = link.enabled !== false;
    } else {
      if (linkEditorTitle) linkEditorTitle.textContent = 'Add Card Link';
      if (saveLinkModalText) saveLinkModalText.textContent = 'Save Link';
      if (linkTypeSelect) linkTypeSelect.value = 'whatsapp';
      const meta = LINK_TYPE_METADATA.whatsapp;
      if (linkLabelInput) linkLabelInput.value = meta.defaultLabel;
      if (linkValueInput) linkValueInput.value = custWhatsApp ? custWhatsApp.value : '';
      if (linkEnabledInput) linkEnabledInput.checked = true;
    }

    updateLinkValuePlaceholder();
    linkEditorModal.style.display = 'flex';
    if (linkLabelInput) linkLabelInput.focus();
  }

  function closeLinkModal() {
    if (linkEditorModal) linkEditorModal.style.display = 'none';
    editingLinkIndex = -1;
  }

  function updateLinkValuePlaceholder() {
    if (!linkTypeSelect) return;
    const type = linkTypeSelect.value;
    const meta = LINK_TYPE_METADATA[type] || LINK_TYPE_METADATA.custom;
    if (linkValueLabel) linkValueLabel.textContent = type === 'phone' || type === 'whatsapp' ? 'Phone Number (+91...)' : 'Destination URL / Link';
    if (linkValueInput) linkValueInput.placeholder = meta.placeholder;
  }

  if (linkTypeSelect) {
    linkTypeSelect.addEventListener('change', () => {
      const meta = LINK_TYPE_METADATA[linkTypeSelect.value] || LINK_TYPE_METADATA.custom;
      if (linkLabelInput && !linkLabelInput.value.trim()) {
        linkLabelInput.value = meta.defaultLabel;
      }
      updateLinkValuePlaceholder();
    });
  }

  if (btnOpenAddLinkModal) {
    btnOpenAddLinkModal.addEventListener('click', () => openLinkModal(-1));
  }
  if (btnCloseLinkModal) {
    btnCloseLinkModal.addEventListener('click', closeLinkModal);
  }
  if (btnCancelLinkModal) {
    btnCancelLinkModal.addEventListener('click', closeLinkModal);
  }
  if (linkEditorModal) {
    linkEditorModal.addEventListener('click', (e) => {
      if (e.target === linkEditorModal) {
        closeLinkModal();
      }
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && linkEditorModal && linkEditorModal.style.display === 'flex') {
      closeLinkModal();
    }
  });

  if (linkEditorForm) {
    linkEditorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = linkTypeSelect ? linkTypeSelect.value : 'custom';
      const meta = LINK_TYPE_METADATA[type] || LINK_TYPE_METADATA.custom;
      const label = linkLabelInput ? linkLabelInput.value.trim() : meta.defaultLabel;
      const value = linkValueInput ? linkValueInput.value.trim() : '';
      const enabled = linkEnabledInput ? linkEnabledInput.checked : true;

      if (!value) {
        showAdminToast('Please provide a URL or phone number.');
        return;
      }

      if (editingLinkIndex >= 0 && currentCustomLinks[editingLinkIndex]) {
        currentCustomLinks[editingLinkIndex] = {
          ...currentCustomLinks[editingLinkIndex],
          type,
          label: label || meta.defaultLabel,
          value,
          enabled,
        };
        showAdminToast('Link updated');
      } else {
        currentCustomLinks.push({
          id: `link_${Date.now()}_${currentCustomLinks.length}`,
          type,
          label: label || meta.defaultLabel,
          value,
          enabled,
          order: currentCustomLinks.length,
        });
        showAdminToast('Link added');
      }

      closeLinkModal();
      renderCustomLinks();
    });
  }

  // Import Contact Links from form fields
  if (btnImportContactLinks) {
    btnImportContactLinks.addEventListener('click', () => {
      const imports = [
        { type: 'whatsapp', val: custWhatsApp ? custWhatsApp.value.trim() : '', label: 'Chat on WhatsApp' },
        { type: 'phone', val: custPhone ? custPhone.value.trim() : '', label: 'Call Mobile' },
        { type: 'email', val: custEmail ? custEmail.value.trim() : '', label: 'Send Email' },
        { type: 'website', val: custWebsite ? custWebsite.value.trim() : '', label: 'Visit Website' },
        { type: 'instagram', val: custInstagram ? custInstagram.value.trim() : '', label: 'Instagram Profile' },
        { type: 'linkedin', val: custLinkedIn ? custLinkedIn.value.trim() : '', label: 'LinkedIn Profile' },
      ];

      let addedCount = 0;
      imports.forEach(item => {
        if (item.val && !currentCustomLinks.some(l => l.type === item.type)) {
          currentCustomLinks.push({
            id: `link_${Date.now()}_${currentCustomLinks.length}`,
            type: item.type,
            label: item.label,
            value: item.val,
            enabled: true,
            order: currentCustomLinks.length,
          });
          addedCount++;
        }
      });

      renderCustomLinks();
      showAdminToast(addedCount > 0 ? `Imported ${addedCount} contact links` : 'All filled contact links are already present');
    });
  }

  // -------------------------------------------------------------
  // Raftcon Luxury Customization Controller
  // -------------------------------------------------------------
  const DEFAULT_RAFTCON_INDUSTRY = {
    tagline: "Crafting Quality, Constructing Futures",
    officePhone: "(+91) 99675-22999",
    rawOfficePhone: "+919967522999",
    contacts: [
      { name: "Ghulamsarwar Qureshi", phone: "(+91) 99675-22999", rawPhone: "+919967522999", role: "Partner" },
      { name: "Tabrez Qureshi", phone: "(+91) 90040-00567", rawPhone: "+919004000567", role: "Executive" }
    ],
    heroMetric: { value: "35+ Years", label: "Of experience" },
    metrics: [
      { value: "33+", label: "Completed projects" },
      { value: "07", label: "Cities" },
      { value: "01", label: "Ongoing project" },
      { value: "96%", label: "Customer retention" }
    ],
    services: [
      "Industrial construction", "Industrial sheds", "Commercial complexes",
      "Residential projects", "Housing societies", "Property redevelopment",
      "Showrooms & workshops", "Godowns & warehouses", "Medical & educational",
      "Agricultural sheds", "Cattle & poultry farms"
    ],
    servicesSummary: "One team for architectural and structural design, RCC, masonry, electrical, plumbing, flooring and interiors.",
    projects: [
      { name: "Kataria Motors", meta: "Piplod, Surat · 2009" },
      { name: "Ashwarath Complex", meta: "Ahmedabad · 2010" },
      { name: "SMT N.M.P Pharmacy College", meta: "Educational · 2014" },
      { name: "Shiv Residency", meta: "Haldharu · 2023" },
      { name: "La Ceremony Banquet", meta: "Restaurant & banquet · 2025" }
    ],
    safety: "Safety is everyone's responsibility. Our goal is zero incidents and injuries, for our team and the public.",
    mission: "A skilled workforce, updated technology and streamlined processes, for quality and reliability on every build.",
    footerQuote: "Lets make success stories together",
    brochureUrl: "/brochure"
  };

  let currentRaftconContacts = [];
  let currentRaftconMetrics = [];
  let currentRaftconServices = [];
  let currentRaftconProjects = [];

  function isRaftconInitialized() {
    return currentRaftconContacts.length > 0 || currentRaftconServices.length > 0;
  }

  function renderRaftconContacts() {
    const container = document.getElementById('raftconContactsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (currentRaftconContacts.length === 0) {
      container.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 8px 0;">No contacts added yet. Click "+ Add Contact" above.</div>';
      return;
    }

    currentRaftconContacts.forEach((contact, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'display: flex; gap: 8px; align-items: center; background: #f8fafc; border: 1px solid var(--border-light); padding: 8px 10px; border-radius: var(--radius-sm);';
      card.innerHTML = `
        <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
          <input type="text" class="form-input" placeholder="Name (e.g. Tabrez Qureshi)" value="${escapeHtml(contact.name || '')}" style="font-size: 12px; padding: 6px 8px;" data-field="name">
          <input type="text" class="form-input" placeholder="Display Phone" value="${escapeHtml(contact.phone || '')}" style="font-size: 12px; padding: 6px 8px;" data-field="phone">
          <input type="text" class="form-input" placeholder="Dial / Raw (+91...)" value="${escapeHtml(contact.rawPhone || contact.phone || '')}" style="font-size: 12px; padding: 6px 8px;" data-field="rawPhone">
        </div>
        <button type="button" class="link-btn-icon delete" title="Remove Contact" style="color: #ef4444; flex-shrink: 0;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      card.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const field = e.target.getAttribute('data-field');
          if (field) currentRaftconContacts[idx][field] = e.target.value;
        });
      });

      card.querySelector('.delete').addEventListener('click', () => {
        currentRaftconContacts.splice(idx, 1);
        renderRaftconContacts();
      });

      container.appendChild(card);
    });
  }

  function renderRaftconMetrics() {
    const container = document.getElementById('raftconMetricsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (currentRaftconMetrics.length === 0) {
      container.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 6px 0;">No grid metrics added yet. Click "+ Add Metric" above.</div>';
      return;
    }

    currentRaftconMetrics.forEach((metric, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; gap: 8px; align-items: center;';
      row.innerHTML = `
        <input type="text" class="form-input" placeholder="Value (e.g. 33+)" value="${escapeHtml(metric.value || '')}" style="font-size: 12px; padding: 6px 8px; width: 110px; flex-shrink: 0;" data-field="value">
        <input type="text" class="form-input" placeholder="Label (e.g. Completed projects)" value="${escapeHtml(metric.label || '')}" style="font-size: 12px; padding: 6px 8px; flex: 1;" data-field="label">
        <button type="button" class="link-btn-icon delete" title="Remove Metric" style="color: #ef4444; flex-shrink: 0;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      row.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const field = e.target.getAttribute('data-field');
          if (field) currentRaftconMetrics[idx][field] = e.target.value;
        });
      });

      row.querySelector('.delete').addEventListener('click', () => {
        currentRaftconMetrics.splice(idx, 1);
        renderRaftconMetrics();
      });

      container.appendChild(row);
    });
  }

  function renderRaftconServices() {
    const list = document.getElementById('raftconServicesList');
    if (!list) return;
    list.innerHTML = '';

    if (currentRaftconServices.length === 0) {
      list.innerHTML = '<span style="font-size: 12px; color: var(--text-muted);">No services listed. Enter a service above and click Add.</span>';
      return;
    }

    currentRaftconServices.forEach((svc, idx) => {
      const chip = document.createElement('span');
      chip.style.cssText = 'display: inline-flex; align-items: center; gap: 5px; background: #e2e8f0; color: #1e293b; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;';
      chip.innerHTML = `
        <span>${escapeHtml(svc)}</span>
        <button type="button" style="border: none; background: transparent; cursor: pointer; color: #64748b; font-weight: bold; font-size: 14px; line-height: 1; padding: 0 2px;" title="Remove service">&times;</button>
      `;
      chip.querySelector('button').addEventListener('click', () => {
        currentRaftconServices.splice(idx, 1);
        renderRaftconServices();
      });
      list.appendChild(chip);
    });
  }

  function renderRaftconProjects() {
    const container = document.getElementById('raftconProjectsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (currentRaftconProjects.length === 0) {
      container.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 8px 0;">No portfolio projects added yet. Click "+ Add Project" above.</div>';
      return;
    }

    currentRaftconProjects.forEach((proj, idx) => {
      const item = document.createElement('div');
      item.style.cssText = 'display: flex; gap: 8px; align-items: center; background: #f8fafc; border: 1px solid var(--border-light); padding: 8px 10px; border-radius: var(--radius-sm);';
      item.innerHTML = `
        <div style="flex: 1; display: grid; grid-template-columns: 1fr 1.5fr; gap: 6px;">
          <input type="text" class="form-input" placeholder="Project Name" value="${escapeHtml(proj.name || '')}" style="font-size: 12px; padding: 6px 8px;" data-field="name">
          <input type="text" class="form-input" placeholder="Details (e.g. Surat · 2024 or Turnkey RCC)" value="${escapeHtml(proj.meta || '')}" style="font-size: 12px; padding: 6px 8px;" data-field="meta">
        </div>
        <button type="button" class="link-btn-icon delete" title="Remove Project" style="color: #ef4444; flex-shrink: 0;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      item.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const field = e.target.getAttribute('data-field');
          if (field) currentRaftconProjects[idx][field] = e.target.value;
        });
      });

      item.querySelector('.delete').addEventListener('click', () => {
        currentRaftconProjects.splice(idx, 1);
        renderRaftconProjects();
      });

      container.appendChild(item);
    });
  }

  // Hook up Raftcon Add Buttons
  const btnAddRaftconContact = document.getElementById('btnAddRaftconContact');
  if (btnAddRaftconContact) {
    btnAddRaftconContact.addEventListener('click', () => {
      currentRaftconContacts.push({ name: '', phone: '', rawPhone: '' });
      renderRaftconContacts();
    });
  }

  const btnAddRaftconMetric = document.getElementById('btnAddRaftconMetric');
  if (btnAddRaftconMetric) {
    btnAddRaftconMetric.addEventListener('click', () => {
      currentRaftconMetrics.push({ value: '', label: '' });
      renderRaftconMetrics();
    });
  }

  const btnAddRaftconService = document.getElementById('btnAddRaftconService');
  const newRaftconServiceInput = document.getElementById('newRaftconServiceInput');
  function addServiceFromInput() {
    if (!newRaftconServiceInput) return;
    const val = newRaftconServiceInput.value.trim();
    if (val && !currentRaftconServices.includes(val)) {
      currentRaftconServices.push(val);
      newRaftconServiceInput.value = '';
      renderRaftconServices();
    }
  }
  if (btnAddRaftconService) {
    btnAddRaftconService.addEventListener('click', addServiceFromInput);
  }
  if (newRaftconServiceInput) {
    newRaftconServiceInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addServiceFromInput();
      }
    });
  }

  const btnAddRaftconProject = document.getElementById('btnAddRaftconProject');
  if (btnAddRaftconProject) {
    btnAddRaftconProject.addEventListener('click', () => {
      currentRaftconProjects.push({ name: '', meta: '' });
      renderRaftconProjects();
    });
  }

  function populateRaftconForm(customer) {
    const custom = customer?.customSettings || {};
    const indData = (custom.industry && custom.industry.data) ? custom.industry.data : {};

    const raftconTagline = document.getElementById('raftconTagline');
    if (raftconTagline) raftconTagline.value = indData.tagline || (customer ? '' : DEFAULT_RAFTCON_INDUSTRY.tagline);

    const raftconOfficePhone = document.getElementById('raftconOfficePhone');
    if (raftconOfficePhone) raftconOfficePhone.value = indData.officePhone || indData.office_phone || (customer ? '' : DEFAULT_RAFTCON_INDUSTRY.officePhone);

    const raftconRawOfficePhone = document.getElementById('raftconRawOfficePhone');
    if (raftconRawOfficePhone) raftconRawOfficePhone.value = indData.rawOfficePhone || indData.office_phone_raw || (customer ? '' : DEFAULT_RAFTCON_INDUSTRY.rawOfficePhone);

    const rawContacts = Array.isArray(indData.contacts) && indData.contacts.length > 0
      ? indData.contacts
      : (customer ? [] : DEFAULT_RAFTCON_INDUSTRY.contacts);
    currentRaftconContacts = rawContacts.map(c => ({
      name: c.name || '',
      phone: c.phone || c.phone_display || '',
      rawPhone: c.rawPhone || c.phone_raw || c.phone || '',
      role: c.role || ''
    }));
    renderRaftconContacts();

    const hero = indData.heroMetric || indData.hero_metric || (customer ? {} : DEFAULT_RAFTCON_INDUSTRY.heroMetric);
    const raftconHeroMetricValue = document.getElementById('raftconHeroMetricValue');
    if (raftconHeroMetricValue) raftconHeroMetricValue.value = hero.value || '';
    const raftconHeroMetricLabel = document.getElementById('raftconHeroMetricLabel');
    if (raftconHeroMetricLabel) raftconHeroMetricLabel.value = hero.label || '';

    const rawMetrics = Array.isArray(indData.metrics) && indData.metrics.length > 0
      ? indData.metrics
      : (customer ? [] : DEFAULT_RAFTCON_INDUSTRY.metrics);
    currentRaftconMetrics = rawMetrics.map(m => ({
      value: m.value || '',
      label: m.label || ''
    }));
    renderRaftconMetrics();

    const rawServices = Array.isArray(indData.services) && indData.services.length > 0
      ? indData.services
      : (customer ? [] : DEFAULT_RAFTCON_INDUSTRY.services);
    currentRaftconServices = [...rawServices];
    renderRaftconServices();

    const raftconServicesSummary = document.getElementById('raftconServicesSummary');
    if (raftconServicesSummary) raftconServicesSummary.value = indData.servicesSummary || indData.services_summary || (customer ? '' : DEFAULT_RAFTCON_INDUSTRY.servicesSummary);

    let rawProjects = customer ? [] : DEFAULT_RAFTCON_INDUSTRY.projects;
    if (Array.isArray(indData.projects) && indData.projects.length > 0) {
      rawProjects = indData.projects;
    } else if (Array.isArray(indData.portfolio_projects) && indData.portfolio_projects.length > 0) {
      rawProjects = indData.portfolio_projects.map(p => ({
        name: p.name || '',
        meta: [p.category, p.description].filter(Boolean).join(' · ')
      }));
    }
    currentRaftconProjects = rawProjects.map(p => ({
      name: p.name || '',
      meta: p.meta || p.description || ''
    }));
    renderRaftconProjects();

    const raftconSafetyText = document.getElementById('raftconSafetyText');
    if (raftconSafetyText) raftconSafetyText.value = indData.safety || indData.safety_policy || (customer ? '' : DEFAULT_RAFTCON_INDUSTRY.safety);

    const raftconMissionText = document.getElementById('raftconMissionText');
    if (raftconMissionText) raftconMissionText.value = indData.mission || indData.mission_statement || (customer ? '' : DEFAULT_RAFTCON_INDUSTRY.mission);

    const raftconFooterQuote = document.getElementById('raftconFooterQuote');
    if (raftconFooterQuote) raftconFooterQuote.value = indData.footerQuote || indData.footer_quote || (customer ? '' : DEFAULT_RAFTCON_INDUSTRY.footerQuote);

    const raftconBrochureUrl = document.getElementById('raftconBrochureUrl');
    if (raftconBrochureUrl) raftconBrochureUrl.value = indData.brochureUrl || indData.brochure_viewer_url || (customer ? '' : DEFAULT_RAFTCON_INDUSTRY.brochureUrl);
  }

  function resetRaftconForm() {
    const ids = [
      'raftconTagline', 'raftconOfficePhone', 'raftconRawOfficePhone',
      'raftconHeroMetricValue', 'raftconHeroMetricLabel', 'raftconServicesSummary',
      'raftconSafetyText', 'raftconMissionText', 'raftconFooterQuote', 'raftconBrochureUrl'
    ];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    currentRaftconContacts = [];
    currentRaftconMetrics = [];
    currentRaftconServices = [];
    currentRaftconProjects = [];
    renderRaftconContacts();
    renderRaftconMetrics();
    renderRaftconServices();
    renderRaftconProjects();
  }

  function collectRaftconIndustryData() {
    return {
      type: 'raftcon-construction',
      data: {
        tagline: document.getElementById('raftconTagline')?.value.trim() || '',
        officePhone: document.getElementById('raftconOfficePhone')?.value.trim() || '',
        rawOfficePhone: document.getElementById('raftconRawOfficePhone')?.value.trim() || '',
        contacts: currentRaftconContacts.filter(c => c.name || c.phone),
        heroMetric: {
          value: document.getElementById('raftconHeroMetricValue')?.value.trim() || '',
          label: document.getElementById('raftconHeroMetricLabel')?.value.trim() || '',
        },
        metrics: currentRaftconMetrics.filter(m => m.value || m.label),
        services: currentRaftconServices.filter(Boolean),
        servicesSummary: document.getElementById('raftconServicesSummary')?.value.trim() || '',
        projects: currentRaftconProjects.filter(p => p.name || p.meta),
        safety: document.getElementById('raftconSafetyText')?.value.trim() || '',
        mission: document.getElementById('raftconMissionText')?.value.trim() || '',
        footerQuote: document.getElementById('raftconFooterQuote')?.value.trim() || '',
        brochureUrl: document.getElementById('raftconBrochureUrl')?.value.trim() || '',
      }
    };
  }

  // -------------------------------------------------------------
  // ATG Study Abroad Customization Controller
  // -------------------------------------------------------------
  const DEFAULT_ATG_INDUSTRY = {
    tagline: 'On a mission, with a vision',
    aboutTitle: 'About ATG Study Abroad',
    aboutText: 'Across The Globe helps students study abroad with admissions and visa support for the UK, Australia, Dubai, Canada and Europe. More than 4,000 students have been guided by the team, from choosing a course to landing the visa.',
    metrics: [
      { value: '4,000+', label: 'Students guided' },
      { value: '5+', label: 'Study destinations' },
      { value: '5+', label: 'Test prep courses' }
    ],
    ctaPrimary: { text: 'Find out which country suits you', url: '' },
    ctaWhatsApp: { text: 'Chat on WhatsApp for instant guidance', url: '' },
    destinationsTitle: 'Popular study destinations',
    destinations: [
      { code: 'CA', title: 'Study in Canada', sub: 'Courses, eligibility and intakes', url: '' },
      { code: 'UK', title: 'Study in the UK', sub: 'Top universities and scholarships', url: '' },
      { code: 'AU', title: 'Study in Australia', sub: 'Eligibility, courses and universities', url: '' },
      { code: 'EU', title: 'Study in Europe', sub: 'Low-tuition and English programs', url: '' },
      { code: 'AE', title: 'Study in Dubai', sub: 'Programs and admissions', url: '' }
    ],
    testPrepTitle: 'Test preparation',
    coachingHeading: 'Book a coaching class for',
    coachingCourses: ['IELTS', 'PTE', 'CELPIP', 'TOEFL', 'GRE'],
    coachingCta: { text: 'Book coaching class', url: '' },
    testPrepBatches: [
      { title: 'Basic English class', sub: 'Join the next batch', url: '' },
      { title: 'Study + Work', sub: 'Russia, Singapore, Mauritius, Canada', url: '' }
    ],
    freeGuidesTitle: 'Free guides',
    freeGuides: [
      { title: '7 things to get right before you apply abroad', sub: 'Free guide', buttonText: 'Download', url: '' },
      { title: 'CELPIP Writing Masterbook', sub: 'Task strategies', buttonText: 'Download', url: '' }
    ],
    sectionVisibility: { stats: true, destinations: true, testPrep: true, guides: true, about: true, contact: true }
  };

  let currentAtgDestinations = [];
  let currentAtgBatches = [];
  let currentAtgGuides = [];

  function isAtgInitialized() {
    return currentAtgDestinations.length > 0 || (document.getElementById('atgTagline')?.value.trim() !== '');
  }

  function triggerLivePreviewUpdate() {
    if (adminCardPreviewModal && adminCardPreviewModal.style.display !== 'none' && modalActiveDesign) {
      openCardPreviewModal(modalActiveDesign, { mode: 'customer' });
    }
  }

  function renderAtgDestinations() {
    const container = document.getElementById('atgDestinationsContainer');
    if (!container) return;
    container.innerHTML = '';

    currentAtgDestinations.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: grid; grid-template-columns: 56px 1fr 1fr 1fr auto; gap: 6px; align-items: center; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border-light);';
      row.innerHTML = `
        <input type="text" class="form-input form-input-sm dest-code" value="${escapeHtml(item.code || '')}" placeholder="CA" style="text-align:center;font-weight:700;">
        <input type="text" class="form-input form-input-sm dest-title" value="${escapeHtml(item.title || '')}" placeholder="Study in Canada">
        <input type="text" class="form-input form-input-sm dest-sub" value="${escapeHtml(item.sub || '')}" placeholder="Intakes & eligibility">
        <input type="text" class="form-input form-input-sm dest-url" value="${escapeHtml(item.url || '')}" placeholder="Custom URL or empty">
        <button type="button" class="btn btn-white btn-xs btn-del-dest" style="color:#ef4444;" title="Remove Destination">&times;</button>
      `;

      row.querySelector('.dest-code').addEventListener('input', (e) => { currentAtgDestinations[idx].code = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.dest-title').addEventListener('input', (e) => { currentAtgDestinations[idx].title = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.dest-sub').addEventListener('input', (e) => { currentAtgDestinations[idx].sub = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.dest-url').addEventListener('input', (e) => { currentAtgDestinations[idx].url = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.btn-del-dest').addEventListener('click', () => {
        currentAtgDestinations.splice(idx, 1);
        renderAtgDestinations();
        triggerLivePreviewUpdate();
      });

      container.appendChild(row);
    });
  }

  function renderAtgBatches() {
    const container = document.getElementById('atgBatchesContainer');
    if (!container) return;
    container.innerHTML = '';

    currentAtgBatches.forEach((b, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 6px; align-items: center; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border-light);';
      row.innerHTML = `
        <input type="text" class="form-input form-input-sm batch-title" value="${escapeHtml(b.title || '')}" placeholder="Batch title">
        <input type="text" class="form-input form-input-sm batch-sub" value="${escapeHtml(b.sub || '')}" placeholder="Subtitle / schedule">
        <input type="text" class="form-input form-input-sm batch-url" value="${escapeHtml(b.url || '')}" placeholder="Inquiry URL (optional)">
        <button type="button" class="btn btn-white btn-xs btn-del-batch" style="color:#ef4444;" title="Remove Batch">&times;</button>
      `;

      row.querySelector('.batch-title').addEventListener('input', (e) => { currentAtgBatches[idx].title = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.batch-sub').addEventListener('input', (e) => { currentAtgBatches[idx].sub = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.batch-url').addEventListener('input', (e) => { currentAtgBatches[idx].url = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.btn-del-batch').addEventListener('click', () => {
        currentAtgBatches.splice(idx, 1);
        renderAtgBatches();
        triggerLivePreviewUpdate();
      });

      container.appendChild(row);
    });
  }

  function renderAtgGuides() {
    const container = document.getElementById('atgGuidesContainer');
    if (!container) return;
    container.innerHTML = '';

    currentAtgGuides.forEach((g, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 90px 1fr auto; gap: 6px; align-items: center; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border-light);';
      row.innerHTML = `
        <input type="text" class="form-input form-input-sm guide-title" value="${escapeHtml(g.title || '')}" placeholder="Guide title">
        <input type="text" class="form-input form-input-sm guide-sub" value="${escapeHtml(g.sub || '')}" placeholder="Subtitle (Free guide)">
        <input type="text" class="form-input form-input-sm guide-btn" value="${escapeHtml(g.buttonText || 'Download')}" placeholder="Download">
        <input type="text" class="form-input form-input-sm guide-url" value="${escapeHtml(g.url || '')}" placeholder="File / Chat URL">
        <button type="button" class="btn btn-white btn-xs btn-del-guide" style="color:#ef4444;" title="Remove Guide">&times;</button>
      `;

      row.querySelector('.guide-title').addEventListener('input', (e) => { currentAtgGuides[idx].title = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.guide-sub').addEventListener('input', (e) => { currentAtgGuides[idx].sub = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.guide-btn').addEventListener('input', (e) => { currentAtgGuides[idx].buttonText = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.guide-url').addEventListener('input', (e) => { currentAtgGuides[idx].url = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.btn-del-guide').addEventListener('click', () => {
        currentAtgGuides.splice(idx, 1);
        renderAtgGuides();
        triggerLivePreviewUpdate();
      });

      container.appendChild(row);
    });
  }

  function populateAtgForm(customer) {
    const custom = customer?.customSettings || customer?.custom_settings || {};
    const indData = (custom.industry && custom.industry.data && typeof custom.industry.data === 'object') ? custom.industry.data : {};

    const elTagline = document.getElementById('atgTagline');
    if (elTagline) elTagline.value = indData.tagline || (customer ? '' : DEFAULT_ATG_INDUSTRY.tagline);

    const elAboutTitle = document.getElementById('atgAboutTitle');
    if (elAboutTitle) elAboutTitle.value = indData.aboutTitle || (customer ? '' : DEFAULT_ATG_INDUSTRY.aboutTitle);

    const elAboutText = document.getElementById('atgAboutText');
    if (elAboutText) elAboutText.value = indData.aboutText || customer?.description || (customer ? '' : DEFAULT_ATG_INDUSTRY.aboutText);

    // Metrics
    const metrics = Array.isArray(indData.metrics) && indData.metrics.length > 0 ? indData.metrics : (customer ? [] : DEFAULT_ATG_INDUSTRY.metrics);
    const m1 = metrics[0] || {};
    const m2 = metrics[1] || {};
    const m3 = metrics[2] || {};
    if (document.getElementById('atgMetric1Val')) document.getElementById('atgMetric1Val').value = m1.value || '';
    if (document.getElementById('atgMetric1Lbl')) document.getElementById('atgMetric1Lbl').value = m1.label || '';
    if (document.getElementById('atgMetric2Val')) document.getElementById('atgMetric2Val').value = m2.value || '';
    if (document.getElementById('atgMetric2Lbl')) document.getElementById('atgMetric2Lbl').value = m2.label || '';
    if (document.getElementById('atgMetric3Val')) document.getElementById('atgMetric3Val').value = m3.value || '';
    if (document.getElementById('atgMetric3Lbl')) document.getElementById('atgMetric3Lbl').value = m3.label || '';

    // CTAs
    const ctaPrim = indData.ctaPrimary || (customer ? {} : DEFAULT_ATG_INDUSTRY.ctaPrimary);
    const ctaWA = indData.ctaWhatsApp || (customer ? {} : DEFAULT_ATG_INDUSTRY.ctaWhatsApp);
    if (document.getElementById('atgCtaPrimaryText')) document.getElementById('atgCtaPrimaryText').value = ctaPrim.text || '';
    if (document.getElementById('atgCtaPrimaryUrl')) document.getElementById('atgCtaPrimaryUrl').value = ctaPrim.url || '';
    if (document.getElementById('atgCtaWhatsAppText')) document.getElementById('atgCtaWhatsAppText').value = ctaWA.text || '';
    if (document.getElementById('atgCtaWhatsAppUrl')) document.getElementById('atgCtaWhatsAppUrl').value = ctaWA.url || '';

    // Destinations
    const elDestTitle = document.getElementById('atgDestinationsTitle');
    if (elDestTitle) elDestTitle.value = indData.destinationsTitle || (customer ? '' : DEFAULT_ATG_INDUSTRY.destinationsTitle);
    const rawDest = Array.isArray(indData.destinations) && indData.destinations.length > 0 ? indData.destinations : (customer ? [] : DEFAULT_ATG_INDUSTRY.destinations);
    currentAtgDestinations = JSON.parse(JSON.stringify(rawDest));
    renderAtgDestinations();

    // Test Prep
    if (document.getElementById('atgTestPrepTitle')) document.getElementById('atgTestPrepTitle').value = indData.testPrepTitle || (customer ? '' : DEFAULT_ATG_INDUSTRY.testPrepTitle);
    if (document.getElementById('atgCoachingHeading')) document.getElementById('atgCoachingHeading').value = indData.coachingHeading || (customer ? '' : DEFAULT_ATG_INDUSTRY.coachingHeading);
    const courses = Array.isArray(indData.coachingCourses) ? indData.coachingCourses.join(', ') : (customer ? '' : DEFAULT_ATG_INDUSTRY.coachingCourses.join(', '));
    if (document.getElementById('atgCoachingCourses')) document.getElementById('atgCoachingCourses').value = courses;

    const coachCta = indData.coachingCta || (customer ? {} : DEFAULT_ATG_INDUSTRY.coachingCta);
    if (document.getElementById('atgCoachingCtaText')) document.getElementById('atgCoachingCtaText').value = coachCta.text || '';
    if (document.getElementById('atgCoachingCtaUrl')) document.getElementById('atgCoachingCtaUrl').value = coachCta.url || '';

    const rawBatches = Array.isArray(indData.testPrepBatches) && indData.testPrepBatches.length > 0 ? indData.testPrepBatches : (customer ? [] : DEFAULT_ATG_INDUSTRY.testPrepBatches);
    currentAtgBatches = JSON.parse(JSON.stringify(rawBatches));
    renderAtgBatches();

    // Free Guides
    if (document.getElementById('atgFreeGuidesTitle')) document.getElementById('atgFreeGuidesTitle').value = indData.freeGuidesTitle || (customer ? '' : DEFAULT_ATG_INDUSTRY.freeGuidesTitle);
    const rawGuides = Array.isArray(indData.freeGuides) && indData.freeGuides.length > 0 ? indData.freeGuides : (customer ? [] : DEFAULT_ATG_INDUSTRY.freeGuides);
    currentAtgGuides = JSON.parse(JSON.stringify(rawGuides));
    renderAtgGuides();

    // Section Visibility
    const vis = indData.sectionVisibility || {};
    if (document.getElementById('atgVisStats')) document.getElementById('atgVisStats').checked = vis.stats !== false;
    if (document.getElementById('atgVisDestinations')) document.getElementById('atgVisDestinations').checked = vis.destinations !== false;
    if (document.getElementById('atgVisTestPrep')) document.getElementById('atgVisTestPrep').checked = vis.testPrep !== false;
    if (document.getElementById('atgVisGuides')) document.getElementById('atgVisGuides').checked = vis.guides !== false;
    if (document.getElementById('atgVisAbout')) document.getElementById('atgVisAbout').checked = vis.about !== false;
    if (document.getElementById('atgVisContact')) document.getElementById('atgVisContact').checked = vis.contact !== false;
  }

  function resetAtgForm() {
    const ids = [
      'atgTagline', 'atgAboutTitle', 'atgAboutText',
      'atgMetric1Val', 'atgMetric1Lbl', 'atgMetric2Val', 'atgMetric2Lbl', 'atgMetric3Val', 'atgMetric3Lbl',
      'atgCtaPrimaryText', 'atgCtaPrimaryUrl', 'atgCtaWhatsAppText', 'atgCtaWhatsAppUrl',
      'atgDestinationsTitle', 'atgTestPrepTitle', 'atgCoachingHeading', 'atgCoachingCourses',
      'atgCoachingCtaText', 'atgCoachingCtaUrl', 'atgFreeGuidesTitle'
    ];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    currentAtgDestinations = [];
    currentAtgBatches = [];
    currentAtgGuides = [];
    renderAtgDestinations();
    renderAtgBatches();
    renderAtgGuides();
  }

  function collectAtgIndustryData() {
    const rawCourses = document.getElementById('atgCoachingCourses')?.value || '';
    const coachingCourses = rawCourses.split(',').map(s => s.trim()).filter(Boolean);

    const metrics = [
      {
        value: document.getElementById('atgMetric1Val')?.value.trim() || '',
        label: document.getElementById('atgMetric1Lbl')?.value.trim() || ''
      },
      {
        value: document.getElementById('atgMetric2Val')?.value.trim() || '',
        label: document.getElementById('atgMetric2Lbl')?.value.trim() || ''
      },
      {
        value: document.getElementById('atgMetric3Val')?.value.trim() || '',
        label: document.getElementById('atgMetric3Lbl')?.value.trim() || ''
      }
    ].filter(m => m.value || m.label);

    return {
      type: 'study-abroad',
      data: {
        tagline: document.getElementById('atgTagline')?.value.trim() || '',
        aboutTitle: document.getElementById('atgAboutTitle')?.value.trim() || '',
        aboutText: document.getElementById('atgAboutText')?.value.trim() || '',
        metrics,
        ctaPrimary: {
          text: document.getElementById('atgCtaPrimaryText')?.value.trim() || '',
          url: document.getElementById('atgCtaPrimaryUrl')?.value.trim() || ''
        },
        ctaWhatsApp: {
          text: document.getElementById('atgCtaWhatsAppText')?.value.trim() || '',
          url: document.getElementById('atgCtaWhatsAppUrl')?.value.trim() || ''
        },
        destinationsTitle: document.getElementById('atgDestinationsTitle')?.value.trim() || '',
        destinations: currentAtgDestinations.filter(d => d.title || d.code),
        testPrepTitle: document.getElementById('atgTestPrepTitle')?.value.trim() || '',
        coachingHeading: document.getElementById('atgCoachingHeading')?.value.trim() || '',
        coachingCourses: coachingCourses.length > 0 ? coachingCourses : ['IELTS', 'PTE', 'CELPIP', 'TOEFL', 'GRE'],
        coachingCta: {
          text: document.getElementById('atgCoachingCtaText')?.value.trim() || '',
          url: document.getElementById('atgCoachingCtaUrl')?.value.trim() || ''
        },
        testPrepBatches: currentAtgBatches.filter(b => b.title || b.sub),
        freeGuidesTitle: document.getElementById('atgFreeGuidesTitle')?.value.trim() || '',
        freeGuides: currentAtgGuides.filter(g => g.title),
        sectionVisibility: {
          stats: document.getElementById('atgVisStats')?.checked !== false,
          destinations: document.getElementById('atgVisDestinations')?.checked !== false,
          testPrep: document.getElementById('atgVisTestPrep')?.checked !== false,
          guides: document.getElementById('atgVisGuides')?.checked !== false,
          about: document.getElementById('atgVisAbout')?.checked !== false,
          contact: document.getElementById('atgVisContact')?.checked !== false,
        }
      }
    };
  }

  // Hook ATG Add Buttons
  document.getElementById('btnAddAtgDestination')?.addEventListener('click', () => {
    currentAtgDestinations.push({ code: 'GL', title: 'New Destination', sub: 'Programs and intakes', url: '' });
    renderAtgDestinations();
    triggerLivePreviewUpdate();
  });

  document.getElementById('btnAddAtgBatch')?.addEventListener('click', () => {
    currentAtgBatches.push({ title: 'New Coaching Batch', sub: 'Join upcoming session', url: '' });
    renderAtgBatches();
    triggerLivePreviewUpdate();
  });

  document.getElementById('btnAddAtgGuide')?.addEventListener('click', () => {
    currentAtgGuides.push({ title: 'Mastering the Visa Interview', sub: 'Free checklist', buttonText: 'Download', url: '' });
    renderAtgGuides();
    triggerLivePreviewUpdate();
  });

  // Attach live input updates for ATG
  document.getElementById('atgStudyAbroadCard')?.addEventListener('input', triggerLivePreviewUpdate);
  document.getElementById('atgStudyAbroadCard')?.addEventListener('change', triggerLivePreviewUpdate);

  // -------------------------------------------------------------
  // Spice Route Restaurant Customization Controller
  // -------------------------------------------------------------
  const DEFAULT_SPICE_INDUSTRY = {
    overline: '— Family restaurant —',
    restaurantName: 'Spice Route',
    tagline: 'Slow-cooked Gujarati and North Indian food, made fresh every day.',
    badges: ['Open till 11 pm', '★ 4.5', 'Family seating'],
    quickActions: [
      { label: 'View menu', url: '#menu' },
      { label: 'Book a table', url: '' },
      { label: 'Order on WhatsApp', url: '' },
      { label: 'Directions', url: '' }
    ],
    menuTitle: "Chef's signatures",
    menuItems: [
      { name: 'Paneer Lababdar', desc: 'Creamy tomato gravy, house butter', price: '₹320', isVeg: true },
      { name: 'Dal Tadka Special', desc: 'Smoked and finished with ghee', price: '₹220', isVeg: true },
      { name: 'Chicken Dum Biryani', desc: 'Slow-cooked, served with raita', price: '₹360', isVeg: false },
      { name: 'Kesar Phirni', desc: 'Saffron, set in clay', price: '₹140', isVeg: true }
    ],
    diningOptionsTitle: 'Dining options',
    diningOptions: ['Dine-in', 'Takeaway', 'Home delivery', 'Family seating', 'Private events', 'Parking'],
    hoursTitle: 'Opening hours',
    hoursList: [
      { label: 'Lunch', time: '12 pm to 3 pm' },
      { label: 'Dinner', time: '7 pm to 11 pm' },
      { label: 'Saturday and Sunday', time: '12 pm to 11:30 pm' }
    ],
    hoursNotice: 'Tables for six or more: please book a day ahead.',
    reviewsTitle: 'Guest reviews',
    reviews: [
      { quote: 'Food tastes like home. The dal tadka is the best in the city.', author: 'Guest Name' },
      { quote: 'Warm service and delicious family dining experience.', author: 'Guest Name' }
    ],
    sectionVisibility: { quickActions: true, menu: true, diningOptions: true, hours: true, reviews: true, contact: true }
  };

  let currentSpiceMenuItems = [];
  let currentSpiceHours = [];
  let currentSpiceReviews = [];

  function isSpiceInitialized() {
    return currentSpiceMenuItems.length > 0 || (document.getElementById('spiceRestaurantName')?.value.trim() !== '');
  }

  function renderSpiceMenuItems() {
    const container = document.getElementById('spiceMenuContainer');
    if (!container) return;
    container.innerHTML = '';

    currentSpiceMenuItems.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: grid; grid-template-columns: 80px 1.2fr 1.2fr 90px auto; gap: 6px; align-items: center; background: #fdfbf7; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border-light);';
      const isVeg = item.isVeg !== false && !item.nonVeg;

      row.innerHTML = `
        <select class="form-input form-input-sm menu-diet" style="padding:4px;font-size:11px;">
          <option value="veg" ${isVeg ? 'selected' : ''}>🟢 Veg</option>
          <option value="non-veg" ${!isVeg ? 'selected' : ''}>🔴 Non-Veg</option>
        </select>
        <input type="text" class="form-input form-input-sm menu-name" value="${escapeHtml(item.name || '')}" placeholder="Dish name">
        <input type="text" class="form-input form-input-sm menu-desc" value="${escapeHtml(item.desc || '')}" placeholder="Description / gravy">
        <input type="text" class="form-input form-input-sm menu-price" value="${escapeHtml(item.price || '')}" placeholder="₹320">
        <button type="button" class="btn btn-white btn-xs btn-del-menu" style="color:#ef4444;" title="Remove Item">&times;</button>
      `;

      row.querySelector('.menu-diet').addEventListener('change', (e) => {
        currentSpiceMenuItems[idx].isVeg = (e.target.value === 'veg');
        triggerLivePreviewUpdate();
      });
      row.querySelector('.menu-name').addEventListener('input', (e) => { currentSpiceMenuItems[idx].name = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.menu-desc').addEventListener('input', (e) => { currentSpiceMenuItems[idx].desc = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.menu-price').addEventListener('input', (e) => { currentSpiceMenuItems[idx].price = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.btn-del-menu').addEventListener('click', () => {
        currentSpiceMenuItems.splice(idx, 1);
        renderSpiceMenuItems();
        triggerLivePreviewUpdate();
      });

      container.appendChild(row);
    });
  }

  function renderSpiceHours() {
    const container = document.getElementById('spiceHoursContainer');
    if (!container) return;
    container.innerHTML = '';

    currentSpiceHours.forEach((h, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr auto; gap: 6px; align-items: center; background: #fdfbf7; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border-light);';
      row.innerHTML = `
        <input type="text" class="form-input form-input-sm hour-label" value="${escapeHtml(h.label || '')}" placeholder="e.g. Lunch">
        <input type="text" class="form-input form-input-sm hour-time" value="${escapeHtml(h.time || '')}" placeholder="12 pm to 3 pm">
        <button type="button" class="btn btn-white btn-xs btn-del-hour" style="color:#ef4444;" title="Remove Hour">&times;</button>
      `;

      row.querySelector('.hour-label').addEventListener('input', (e) => { currentSpiceHours[idx].label = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.hour-time').addEventListener('input', (e) => { currentSpiceHours[idx].time = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.btn-del-hour').addEventListener('click', () => {
        currentSpiceHours.splice(idx, 1);
        renderSpiceHours();
        triggerLivePreviewUpdate();
      });

      container.appendChild(row);
    });
  }

  function renderSpiceReviews() {
    const container = document.getElementById('spiceReviewsContainer');
    if (!container) return;
    container.innerHTML = '';

    currentSpiceReviews.forEach((r, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: grid; grid-template-columns: 1.8fr 1fr auto; gap: 6px; align-items: center; background: #fdfbf7; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--border-light);';
      row.innerHTML = `
        <input type="text" class="form-input form-input-sm rev-quote" value="${escapeHtml(r.quote || '')}" placeholder="Food tastes like home...">
        <input type="text" class="form-input form-input-sm rev-author" value="${escapeHtml(r.author || '')}" placeholder="Guest Name">
        <button type="button" class="btn btn-white btn-xs btn-del-rev" style="color:#ef4444;" title="Remove Review">&times;</button>
      `;

      row.querySelector('.rev-quote').addEventListener('input', (e) => { currentSpiceReviews[idx].quote = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.rev-author').addEventListener('input', (e) => { currentSpiceReviews[idx].author = e.target.value; triggerLivePreviewUpdate(); });
      row.querySelector('.btn-del-rev').addEventListener('click', () => {
        currentSpiceReviews.splice(idx, 1);
        renderSpiceReviews();
        triggerLivePreviewUpdate();
      });

      container.appendChild(row);
    });
  }

  function populateSpiceRouteForm(customer) {
    const custom = customer?.customSettings || customer?.custom_settings || {};
    const indData = (custom.industry && custom.industry.data && typeof custom.industry.data === 'object') ? custom.industry.data : {};

    if (document.getElementById('spiceOverline')) document.getElementById('spiceOverline').value = indData.overline || (customer ? '' : DEFAULT_SPICE_INDUSTRY.overline);
    if (document.getElementById('spiceRestaurantName')) document.getElementById('spiceRestaurantName').value = indData.restaurantName || customer?.company || customer?.name || (customer ? '' : DEFAULT_SPICE_INDUSTRY.restaurantName);
    if (document.getElementById('spiceTagline')) document.getElementById('spiceTagline').value = indData.tagline || customer?.description || (customer ? '' : DEFAULT_SPICE_INDUSTRY.tagline);

    const badges = Array.isArray(indData.badges) ? indData.badges.join(', ') : (customer ? '' : DEFAULT_SPICE_INDUSTRY.badges.join(', '));
    if (document.getElementById('spiceBadges')) document.getElementById('spiceBadges').value = badges;

    // 2x2 Actions
    const acts = Array.isArray(indData.quickActions) && indData.quickActions.length > 0 ? indData.quickActions : (customer ? [] : DEFAULT_SPICE_INDUSTRY.quickActions);
    const a1 = acts[0] || {};
    const a2 = acts[1] || {};
    const a3 = acts[2] || {};
    const a4 = acts[3] || {};
    if (document.getElementById('spiceAction1Label')) document.getElementById('spiceAction1Label').value = a1.label || '';
    if (document.getElementById('spiceAction1Url')) document.getElementById('spiceAction1Url').value = a1.url || '';
    if (document.getElementById('spiceAction2Label')) document.getElementById('spiceAction2Label').value = a2.label || '';
    if (document.getElementById('spiceAction2Url')) document.getElementById('spiceAction2Url').value = a2.url || '';
    if (document.getElementById('spiceAction3Label')) document.getElementById('spiceAction3Label').value = a3.label || '';
    if (document.getElementById('spiceAction3Url')) document.getElementById('spiceAction3Url').value = a3.url || '';
    if (document.getElementById('spiceAction4Label')) document.getElementById('spiceAction4Label').value = a4.label || '';
    if (document.getElementById('spiceAction4Url')) document.getElementById('spiceAction4Url').value = a4.url || '';

    // Menu
    if (document.getElementById('spiceMenuTitle')) document.getElementById('spiceMenuTitle').value = indData.menuTitle || (customer ? '' : DEFAULT_SPICE_INDUSTRY.menuTitle);
    const rawMenu = Array.isArray(indData.menuItems) && indData.menuItems.length > 0 ? indData.menuItems : (customer ? [] : DEFAULT_SPICE_INDUSTRY.menuItems);
    currentSpiceMenuItems = JSON.parse(JSON.stringify(rawMenu));
    renderSpiceMenuItems();

    // Dining options
    if (document.getElementById('spiceDiningOptionsTitle')) document.getElementById('spiceDiningOptionsTitle').value = indData.diningOptionsTitle || (customer ? '' : DEFAULT_SPICE_INDUSTRY.diningOptionsTitle);
    const opts = Array.isArray(indData.diningOptions) ? indData.diningOptions.join(', ') : (customer ? '' : DEFAULT_SPICE_INDUSTRY.diningOptions.join(', '));
    if (document.getElementById('spiceDiningOptions')) document.getElementById('spiceDiningOptions').value = opts;

    // Hours
    if (document.getElementById('spiceHoursTitle')) document.getElementById('spiceHoursTitle').value = indData.hoursTitle || (customer ? '' : DEFAULT_SPICE_INDUSTRY.hoursTitle);
    const rawHours = Array.isArray(indData.hoursList) && indData.hoursList.length > 0 ? indData.hoursList : (customer ? [] : DEFAULT_SPICE_INDUSTRY.hoursList);
    currentSpiceHours = JSON.parse(JSON.stringify(rawHours));
    renderSpiceHours();
    if (document.getElementById('spiceHoursNotice')) document.getElementById('spiceHoursNotice').value = indData.hoursNotice || (customer ? '' : DEFAULT_SPICE_INDUSTRY.hoursNotice);

    // Reviews
    if (document.getElementById('spiceReviewsTitle')) document.getElementById('spiceReviewsTitle').value = indData.reviewsTitle || (customer ? '' : DEFAULT_SPICE_INDUSTRY.reviewsTitle);
    const rawReviews = Array.isArray(indData.reviews) && indData.reviews.length > 0 ? indData.reviews : (customer ? [] : DEFAULT_SPICE_INDUSTRY.reviews);
    currentSpiceReviews = JSON.parse(JSON.stringify(rawReviews));
    renderSpiceReviews();

    // Visibility
    const vis = indData.sectionVisibility || {};
    if (document.getElementById('spiceVisQuickActions')) document.getElementById('spiceVisQuickActions').checked = vis.quickActions !== false;
    if (document.getElementById('spiceVisMenu')) document.getElementById('spiceVisMenu').checked = vis.menu !== false;
    if (document.getElementById('spiceVisDiningOptions')) document.getElementById('spiceVisDiningOptions').checked = vis.diningOptions !== false;
    if (document.getElementById('spiceVisHours')) document.getElementById('spiceVisHours').checked = vis.hours !== false;
    if (document.getElementById('spiceVisReviews')) document.getElementById('spiceVisReviews').checked = vis.reviews !== false;
    if (document.getElementById('spiceVisContact')) document.getElementById('spiceVisContact').checked = vis.contact !== false;
  }

  function resetSpiceRouteForm() {
    const ids = [
      'spiceOverline', 'spiceRestaurantName', 'spiceTagline', 'spiceBadges',
      'spiceAction1Label', 'spiceAction1Url', 'spiceAction2Label', 'spiceAction2Url',
      'spiceAction3Label', 'spiceAction3Url', 'spiceAction4Label', 'spiceAction4Url',
      'spiceMenuTitle', 'spiceDiningOptionsTitle', 'spiceDiningOptions',
      'spiceHoursTitle', 'spiceHoursNotice', 'spiceReviewsTitle'
    ];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    currentSpiceMenuItems = [];
    currentSpiceHours = [];
    currentSpiceReviews = [];
    renderSpiceMenuItems();
    renderSpiceHours();
    renderSpiceReviews();
  }

  function collectSpiceRouteIndustryData() {
    const rawBadges = document.getElementById('spiceBadges')?.value || '';
    const badges = rawBadges.split(',').map(s => s.trim()).filter(Boolean);

    const rawOptions = document.getElementById('spiceDiningOptions')?.value || '';
    const diningOptions = rawOptions.split(',').map(s => s.trim()).filter(Boolean);

    const quickActions = [
      { label: document.getElementById('spiceAction1Label')?.value.trim() || '', url: document.getElementById('spiceAction1Url')?.value.trim() || '' },
      { label: document.getElementById('spiceAction2Label')?.value.trim() || '', url: document.getElementById('spiceAction2Url')?.value.trim() || '' },
      { label: document.getElementById('spiceAction3Label')?.value.trim() || '', url: document.getElementById('spiceAction3Url')?.value.trim() || '' },
      { label: document.getElementById('spiceAction4Label')?.value.trim() || '', url: document.getElementById('spiceAction4Url')?.value.trim() || '' },
    ].filter(a => a.label);

    return {
      type: 'restaurant',
      data: {
        overline: document.getElementById('spiceOverline')?.value.trim() || '',
        restaurantName: document.getElementById('spiceRestaurantName')?.value.trim() || '',
        tagline: document.getElementById('spiceTagline')?.value.trim() || '',
        badges: badges.length > 0 ? badges : ['Open till 11 pm', '★ 4.5', 'Family seating'],
        quickActions,
        menuTitle: document.getElementById('spiceMenuTitle')?.value.trim() || '',
        menuItems: currentSpiceMenuItems.filter(m => m.name),
        diningOptionsTitle: document.getElementById('spiceDiningOptionsTitle')?.value.trim() || '',
        diningOptions: diningOptions.length > 0 ? diningOptions : ['Dine-in', 'Takeaway', 'Home delivery', 'Family seating', 'Private events', 'Parking'],
        hoursTitle: document.getElementById('spiceHoursTitle')?.value.trim() || '',
        hoursList: currentSpiceHours.filter(h => h.label || h.time),
        hoursNotice: document.getElementById('spiceHoursNotice')?.value.trim() || '',
        reviewsTitle: document.getElementById('spiceReviewsTitle')?.value.trim() || '',
        reviews: currentSpiceReviews.filter(r => r.quote),
        sectionVisibility: {
          quickActions: document.getElementById('spiceVisQuickActions')?.checked !== false,
          menu: document.getElementById('spiceVisMenu')?.checked !== false,
          diningOptions: document.getElementById('spiceVisDiningOptions')?.checked !== false,
          hours: document.getElementById('spiceVisHours')?.checked !== false,
          reviews: document.getElementById('spiceVisReviews')?.checked !== false,
          contact: document.getElementById('spiceVisContact')?.checked !== false,
        }
      }
    };
  }

  // Hook Spice Route Add Buttons
  document.getElementById('btnAddSpiceMenuItem')?.addEventListener('click', () => {
    currentSpiceMenuItems.push({ name: 'New Chef Special', desc: 'Fresh local herbs & spices', price: '₹280', isVeg: true });
    renderSpiceMenuItems();
    triggerLivePreviewUpdate();
  });

  document.getElementById('btnAddSpiceHour')?.addEventListener('click', () => {
    currentSpiceHours.push({ label: 'Special Hours', time: '12 pm to 10 pm' });
    renderSpiceHours();
    triggerLivePreviewUpdate();
  });

  document.getElementById('btnAddSpiceReview')?.addEventListener('click', () => {
    currentSpiceReviews.push({ quote: 'Authentic flavours and wonderful hospitality.', author: 'Happy Guest' });
    renderSpiceReviews();
    triggerLivePreviewUpdate();
  });

  // Attach live input updates for Spice Route
  document.getElementById('spiceRouteCard')?.addEventListener('input', triggerLivePreviewUpdate);
  document.getElementById('spiceRouteCard')?.addEventListener('change', triggerLivePreviewUpdate);

  // Global Header Search
  document.getElementById('headerSearchInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      showAdminToast(`Searching for "${e.target.value}"...`);
      navigateToTab('customers');
      if (customerSearchInput) {
        customerSearchInput.value = e.target.value;
        filterCustomers();
      }
    }
  });

  // -------------------------------------------------------------
  // Supabase Authentication & Admin Route Protection
  // -------------------------------------------------------------
  const authOverlay = document.getElementById('adminAuthOverlay');
  const loginScreen = document.getElementById('adminLoginScreen');
  const dashboardLayout = document.getElementById('adminDashboardLayout');
  const loginForm = document.getElementById('adminLoginForm');
  const loginEmailInput = document.getElementById('loginEmail');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginSubmitText = document.getElementById('loginSubmitText');
  const loginSubmitSpinner = document.getElementById('loginSubmitSpinner');
  const loginAlert = document.getElementById('loginAlert');
  const loginAlertMessage = document.getElementById('loginAlertMessage');
  const loginAlertIcon = document.getElementById('loginAlertIcon');
  const loginPasswordToggle = document.getElementById('loginPasswordToggle');
  const pwdEyeIcon = document.getElementById('pwdEyeIcon');
  const adminUserName = document.getElementById('adminUserName');
  const adminUserAvatar = document.getElementById('adminUserAvatar');

  // Forgot password elements
  const loginCardTitle = document.getElementById('loginCardTitle');
  const loginCardSubtitle = document.getElementById('loginCardSubtitle');
  const btnShowForgotModal = document.getElementById('btnShowForgotModal');
  const adminForgotForm = document.getElementById('adminForgotForm');
  const forgotEmailInput = document.getElementById('forgotEmail');
  const forgotSubmitBtn = document.getElementById('forgotSubmitBtn');
  const forgotSubmitText = document.getElementById('forgotSubmitText');
  const forgotSubmitSpinner = document.getElementById('forgotSubmitSpinner');
  const btnBackToLogin = document.getElementById('btnBackToLogin');

  // Helper to show/hide login alert
  function showLoginError(msg) {
    if (loginAlert && loginAlertMessage) {
      loginAlert.classList.remove('login-alert-success');
      if (loginAlertIcon) {
        loginAlertIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
      }
      loginAlertMessage.textContent = msg;
      loginAlert.style.display = 'flex';
    }
  }

  function showLoginSuccess(msg) {
    if (loginAlert && loginAlertMessage) {
      loginAlert.classList.add('login-alert-success');
      if (loginAlertIcon) {
        loginAlertIcon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
      }
      loginAlertMessage.textContent = msg;
      loginAlert.style.display = 'flex';
    }
  }

  function hideLoginError() {
    if (loginAlert) {
      loginAlert.style.display = 'none';
      loginAlert.classList.remove('login-alert-success');
    }
  }

  // Detect password recovery redirect on /admin
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      (search.includes('token_hash=') && search.includes('recovery'))
    ) {
      window.location.replace('/admin/reset-password' + search + hash);
      return;
    }
  } catch (e) {
    console.warn('Recovery redirect detection error:', e);
  }

  // Check for reset=success parameter in URL on load
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'success') {
      showLoginSuccess('Your password has been successfully reset! Please sign in with your new password.');
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch (e) {
    console.warn('URL reset param parse error:', e);
  }

  // Forgot Password View Toggle
  if (btnShowForgotModal) {
    btnShowForgotModal.addEventListener('click', (e) => {
      e.preventDefault();
      hideLoginError();
      if (loginCardTitle) loginCardTitle.textContent = 'Reset Password';
      if (loginCardSubtitle) loginCardSubtitle.textContent = 'Enter your email to receive a password recovery link';
      if (loginForm) loginForm.style.display = 'none';
      if (adminForgotForm) adminForgotForm.style.display = 'flex';
      if (forgotEmailInput) {
        if (loginEmailInput && loginEmailInput.value) {
          forgotEmailInput.value = loginEmailInput.value;
        }
        forgotEmailInput.focus();
      }
    });
  }

  if (btnBackToLogin) {
    btnBackToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      hideLoginError();
      if (loginCardTitle) loginCardTitle.textContent = 'Admin Portal Sign In';
      if (loginCardSubtitle) loginCardSubtitle.textContent = 'Secure access to digital cards & client profile management';
      if (adminForgotForm) adminForgotForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'flex';
      if (loginEmailInput && forgotEmailInput && forgotEmailInput.value) {
        loginEmailInput.value = forgotEmailInput.value;
      }
      if (loginPasswordInput) loginPasswordInput.focus();
    });
  }

  // Handle Forgot Password Form Submission
  if (adminForgotForm) {
    adminForgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideLoginError();

      const email = (forgotEmailInput?.value || '').trim().toLowerCase();
      if (!email) {
        showLoginError('Please enter your administrator email address.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showLoginError('Please enter a valid email address format.');
        return;
      }

      if (forgotSubmitBtn) forgotSubmitBtn.disabled = true;
      if (forgotSubmitText) forgotSubmitText.textContent = 'Sending reset link...';
      if (forgotSubmitSpinner) forgotSubmitSpinner.style.display = 'inline-block';

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          showLoginSuccess(data.message || 'Password reset link sent! Please check your email inbox and spam folder.');
        } else {
          showLoginError(data.error || 'Failed to send password reset email. Please try again.');
        }
      } catch (err) {
        console.error('Forgot password request error:', err);
        showLoginError('Network or server error while sending reset link. Please try again.');
      } finally {
        if (forgotSubmitBtn) forgotSubmitBtn.disabled = false;
        if (forgotSubmitText) forgotSubmitText.textContent = 'Send Reset Link';
        if (forgotSubmitSpinner) forgotSubmitSpinner.style.display = 'none';
      }
    });
  }

  // Toggle password visibility
  if (loginPasswordToggle && loginPasswordInput) {
    loginPasswordToggle.addEventListener('click', () => {
      const isPassword = loginPasswordInput.type === 'password';
      loginPasswordInput.type = isPassword ? 'text' : 'password';
      if (pwdEyeIcon) {
        pwdEyeIcon.innerHTML = isPassword
          ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
          : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      }
    });
  }

  // Helper to update admin user display in header
  function updateAdminProfileHeader(user) {
    if (!user) return;
    const email = user.email || 'Admin';
    if (adminUserName) {
      adminUserName.textContent = email;
    }
    if (adminUserAvatar) {
      const initials = email.split('@')[0].slice(0, 2).toUpperCase() || 'AD';
      adminUserAvatar.textContent = initials;
    }
  }

  // -------------------------------------------------------------
  // Authenticated Admin API Helper with Session Expiration Handling
  // -------------------------------------------------------------
  async function apiFetch(url, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        handleSessionExpired('Your session has expired. Please sign in again.');
      } else if (response.status === 403) {
        handleSessionExpired('Access denied: Administrator privileges required.');
      }

      return response;
    } catch (err) {
      console.error(`API request failed [${url}]:`, err);
      throw err;
    }
  }

  function handleSessionExpired(message) {
    if (dashboardLayout) dashboardLayout.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminUserName) adminUserName.textContent = 'Admin';
    if (adminUserAvatar) adminUserAvatar.textContent = 'AD';
    if (loginPasswordInput) loginPasswordInput.value = '';
    showLoginError(message);
    if (window.showAdminToast) {
      window.showAdminToast(message);
    }
  }

  // Attach to window so all current and future admin modules use consistent error handling
  window.apiFetch = apiFetch;

  // Check existing session on load
  async function checkAdminSession() {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok && data.authenticated && data.user) {
        if (data.isAdmin === false) {
          // Authenticated with valid Supabase user, but not in admin_users!
          showLoginError('Access denied: Your account is authenticated but has not been granted administrator privileges. Please contact Ambros Studio.');
          if (dashboardLayout) dashboardLayout.style.display = 'none';
          if (loginScreen) loginScreen.style.display = 'flex';
          return;
        }

        // Active admin route verification via apiFetch
        const verifyRes = await apiFetch('/api/admin/verify');
        if (!verifyRes || !verifyRes.ok) {
          if (verifyRes && verifyRes.status !== 401 && verifyRes.status !== 403) {
            showLoginError('Unable to verify administrator authorization.');
          }
          return;
        }

        // Authorized administrator: show dashboard, hide login
        if (dashboardLayout) dashboardLayout.style.display = 'flex';
        if (loginScreen) loginScreen.style.display = 'none';
        updateAdminProfileHeader(data.user);
        
        // Load live customer data from Supabase
        await loadCustomers();
      } else {
        // Unauthenticated: hide dashboard, show login
        if (dashboardLayout) dashboardLayout.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
      }
    } catch (err) {
      console.error('Session check failed:', err);
      if (dashboardLayout) dashboardLayout.style.display = 'none';
      if (loginScreen) loginScreen.style.display = 'flex';
    } finally {
      // Hide checking overlay
      if (authOverlay) {
        authOverlay.style.opacity = '0';
        authOverlay.style.pointerEvents = 'none';
        setTimeout(() => {
          authOverlay.style.display = 'none';
        }, 300);
      }
    }
  }

  // Handle Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideLoginError();

      const email = (loginEmailInput?.value || '').trim().toLowerCase();
      const password = loginPasswordInput?.value || '';

      if (!email || !password) {
        showLoginError('Please enter both your email and password.');
        return;
      }

      // Set loading state
      if (loginSubmitBtn) loginSubmitBtn.disabled = true;
      if (loginSubmitText) loginSubmitText.textContent = 'Verifying credentials...';
      if (loginSubmitSpinner) loginSubmitSpinner.style.display = 'inline-block';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.user) {
          if (data.isAdmin === false) {
            showLoginError('Access denied: Your account is authenticated but has not been granted administrator privileges. Please contact Ambros Studio.');
            return;
          }

          // Verify protected route access via apiFetch
          const verifyRes = await apiFetch('/api/admin/verify');
          if (!verifyRes || !verifyRes.ok) {
            if (verifyRes && verifyRes.status !== 401 && verifyRes.status !== 403) {
              showLoginError('Unable to verify administrator authorization.');
            }
            return;
          }

          // Success: reset form, switch to dashboard
          if (loginPasswordInput) loginPasswordInput.value = '';
          updateAdminProfileHeader(data.user);
          
          if (loginScreen) loginScreen.style.display = 'none';
          if (dashboardLayout) dashboardLayout.style.display = 'flex';

          // Initialize dashboard tables with live data
          await loadCustomers();

          showAdminToast(`Welcome back, ${data.user.email}`);
        } else {
          // Failed: display Supabase auth error or 403 message
          showLoginError(data.error || 'Authentication failed. Please check your credentials.');
        }
      } catch (err) {
        console.error('Login request error:', err);
        showLoginError('Network or server error. Please try again.');
      } finally {
        if (loginSubmitBtn) loginSubmitBtn.disabled = false;
        if (loginSubmitText) loginSubmitText.textContent = 'Sign In to Admin Panel';
        if (loginSubmitSpinner) loginSubmitSpinner.style.display = 'none';
      }
    });
  }

  // Handle Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        await apiFetch('/api/auth/logout', {
          method: 'POST',
        });
      } catch (err) {
        console.warn('Logout API error:', err);
      }

      // Clear profile and transition to login screen
      if (adminUserName) adminUserName.textContent = 'Admin';
      if (adminUserAvatar) adminUserAvatar.textContent = 'AD';
      if (dashboardLayout) dashboardLayout.style.display = 'none';
      if (loginScreen) loginScreen.style.display = 'flex';
      hideLoginError();
      if (loginPasswordInput) loginPasswordInput.value = '';

      showAdminToast('Signed out successfully.');
    });
  }

  // Initialize Client Delivery section
  setupClientDeliveryListeners();
  updateClientDelivery('', '');
  updateCardImagePreviews();

  // Initialize Digital Card Design System Gallery & Showroom
  renderDesignGallery('all');
  renderShowroom('all');

  // Initialize Dynamic Design-Specific Editor & Live Preview Engine
  if (window.DYNAMIC_CARD_EDITOR) {
    if (typeof window.DYNAMIC_CARD_EDITOR.initLivePreview === 'function') {
      window.DYNAMIC_CARD_EDITOR.initLivePreview();
    }
    if (typeof window.DYNAMIC_CARD_EDITOR.renderDesignSpecificEditor === 'function') {
      window.DYNAMIC_CARD_EDITOR.renderDesignSpecificEditor('mint-haven', null);
    }
  }

  // Run initial session check
  checkAdminSession();
});
