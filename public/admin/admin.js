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

  function mapDbCustomerToUi(c) {
    const name = c.full_name || '';
    const nameParts = name.split(' ').filter(Boolean);
    const initials = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : (name.slice(0, 2)).toUpperCase() || 'CU';

    const isEvergreen = c.card_design === 'Evergreen';
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
      design: isEvergreen ? 'Evergreen' : 'Mint Haven',
      status: isActive ? 'active' : 'inactive',
      is_active: isActive,
      avatarUrl: c.avatar_url || c.profile_image_url || c.photo_url || '',
      customSettings: c.custom_settings || c.customSettings || {
        appearance: { primaryColor: '', backgroundColor: '', textColor: '', fontFamily: '' },
        links: []
      },
      publicUrl: `/c/${slug}`,
      profileLink: `https://www.ambrosstudio.space/c/${slug}`,
      profileSlug: slug,
      createdDate: formattedDate,
      cardUrl: isEvergreen
        ? `/cards/design-2/index.html?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(c.id)}&preview=true`
        : `/cards/design-1/index.html?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(c.id)}&preview=true`
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
            <a href="/c/${encodeURIComponent(slug)}" target="_blank" class="btn btn-white btn-sm" title="Open customer public card">View Profile</a>
            <button type="button" class="btn btn-white btn-sm btn-edit-customer" data-id="${c.id}">Edit</button>
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
            <a href="/c/${encodeURIComponent(slug)}" target="_blank" class="icon-action-btn" title="View Customer Public Card" aria-label="View ${escapeHtml(c.name)} profile">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </a>
            <button type="button" class="icon-action-btn btn-edit-customer" data-id="${c.id}" title="Edit Customer" aria-label="Edit ${escapeHtml(c.name)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
          </div>
        </td>
      `;
      dashboardRecentTableBody.appendChild(tr);
    });

    attachTableEventListeners();
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
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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

  function updateClientDelivery(slug, name) {
    const canonicalSlug = (slug || '').trim().toLowerCase();
    const origin = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null')
      ? window.location.origin
      : 'https://www.ambrosstudio.space';

    const publicUrl = canonicalSlug
      ? `${origin}/c/${encodeURIComponent(canonicalSlug)}`
      : `${origin}/c/your-slug`;

    const custProfileLink = document.getElementById('custProfileLink');
    if (custProfileLink) {
      custProfileLink.textContent = publicUrl;
    }

    const openCardBtn = document.getElementById('btnAdminOpenCard');
    if (openCardBtn) {
      openCardBtn.href = canonicalSlug ? `/c/${encodeURIComponent(canonicalSlug)}` : '#';
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

    // Dynamic QR generation
    const qrBox = document.getElementById('adminQrBox');
    if (qrBox && typeof qrcode !== 'undefined') {
      try {
        const qr = qrcode(0, 'M');
        qr.addData(publicUrl);
        qr.make();
        currentDeliveryQr = { qr, slug: canonicalSlug || 'client-card' };
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
    updateClientDelivery(customer.profileSlug, customer.name);

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
    const app = customSettings.appearance || {};
    const isEvergreen = customer.design === 'Evergreen';
    if (custPrimaryColor) {
      custPrimaryColor.value = app.primaryColor || '';
      custPrimaryColor.placeholder = isEvergreen ? '#1b3a2f' : '#10b981';
    }
    if (custPrimaryColorPicker) custPrimaryColorPicker.value = app.primaryColor || (isEvergreen ? '#1b3a2f' : '#10b981');
    if (custBgColor) {
      custBgColor.value = app.backgroundColor || '';
      custBgColor.placeholder = isEvergreen ? '#ffffff' : '#faf6ee';
    }
    if (custBgColorPicker) custBgColorPicker.value = app.backgroundColor || (isEvergreen ? '#ffffff' : '#faf6ee');
    if (custTextColor) {
      custTextColor.value = app.textColor || '';
      custTextColor.placeholder = isEvergreen ? '#111827' : '#1e293b';
    }
    if (custTextColorPicker) custTextColorPicker.value = app.textColor || (isEvergreen ? '#111827' : '#1e293b');
    if (custFontFamily) custFontFamily.value = app.fontFamily || '';

    currentCustomLinks = Array.isArray(customSettings.links) ? JSON.parse(JSON.stringify(customSettings.links)) : [];
    if (typeof renderCustomLinks === 'function') renderCustomLinks();
    if (typeof updateAvatarSyncPreview === 'function') updateAvatarSyncPreview(customer.avatarUrl, customer.initials);

    // 8. Open the Form Tab
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

  function setDesignSelection(designName) {
    cardSelectOptions.forEach(opt => {
      const optDesign = opt.getAttribute('data-design');
      if (optDesign === designName) {
        opt.classList.add('selected');
        opt.setAttribute('aria-checked', 'true');
      } else {
        opt.classList.remove('selected');
        opt.setAttribute('aria-checked', 'false');
      }
    });
  }

  // Digital card selection click handler
  cardSelectOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const dName = opt.getAttribute('data-design') || "Mint Haven";
      selectedDesign = dName;
      setDesignSelection(dName);

      const isEvergreen = dName === 'Evergreen';

      // If custom color inputs are currently empty, update picker bubbles and placeholders to match the chosen template defaults
      if (custPrimaryColor && !custPrimaryColor.value.trim() && custPrimaryColorPicker) {
        custPrimaryColorPicker.value = isEvergreen ? '#1b3a2f' : '#10b981';
        custPrimaryColor.placeholder = isEvergreen ? '#1b3a2f' : '#10b981';
      }
      if (custBgColor && !custBgColor.value.trim() && custBgColorPicker) {
        custBgColorPicker.value = isEvergreen ? '#ffffff' : '#faf6ee';
        custBgColor.placeholder = isEvergreen ? '#ffffff' : '#faf6ee';
      }
      if (custTextColor && !custTextColor.value.trim() && custTextColorPicker) {
        custTextColorPicker.value = isEvergreen ? '#111827' : '#1e293b';
        custTextColor.placeholder = isEvergreen ? '#111827' : '#1e293b';
      }

      // If editing an existing customer, update preview button href to reflect chosen design
      if (currentEditingCustomerId) {
        const c = customers.find(item => String(item.id) === String(currentEditingCustomerId));
        const btnPreviewChosenDesign = document.getElementById('btnPreviewChosenDesign');
        if (c && btnPreviewChosenDesign) {
          btnPreviewChosenDesign.href = `/cards/${isEvergreen ? 'design-2' : 'design-1'}/index.html?slug=${encodeURIComponent(c.profileSlug || '')}&id=${encodeURIComponent(c.id)}&preview=true`;
        }
      }
    });
  });

  // Profile link and Client Delivery live update on Full Name typing (only in Create mode)
  if (custFullName) {
    custFullName.addEventListener('input', () => {
      // In create mode, dynamically update link and QR from name
      if (!currentEditingCustomerId) {
        const val = custFullName.value.trim();
        const slug = val ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
        updateClientDelivery(slug, val);
      }
    });
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

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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
        profileLink: `https://www.ambrosstudio.space/c/${slug}`,
        profileSlug: slug,
        avatar_url: currentUploadedAvatar,
        custom_settings: {
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

  let currentCustomLinks = [];
  let editingLinkIndex = -1;

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
  const loginPasswordToggle = document.getElementById('loginPasswordToggle');
  const pwdEyeIcon = document.getElementById('pwdEyeIcon');
  const adminUserName = document.getElementById('adminUserName');
  const adminUserAvatar = document.getElementById('adminUserAvatar');

  // Helper to show/hide login alert
  function showLoginError(msg) {
    if (loginAlert && loginAlertMessage) {
      loginAlertMessage.textContent = msg;
      loginAlert.style.display = 'flex';
    }
  }

  function hideLoginError() {
    if (loginAlert) {
      loginAlert.style.display = 'none';
    }
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

  // Run initial session check
  checkAdminSession();
});
