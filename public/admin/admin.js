/**
 * Ambros Studio — Admin Panel Interactive Controller
 * Design Names:
 *   - Design 1: Mint Haven
 *   - Design 2: Evergreen
 * Complete In-Memory Customer State & In-Place Editing System
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // Customer In-Memory Master Data
  // -------------------------------------------------------------
  let customers = [
    {
      id: "cust_1",
      initials: "RM",
      name: "Rahul Mehta",
      role: "Managing Director",
      company: "Mehta Textiles",
      phone: "98250 41872",
      whatsapp: "98250 41872",
      email: "rahul@mehtatextiles.com",
      website: "mehtatextiles.com",
      address: "Ring Road, Surat, Gujarat 395002",
      description: "Leading textile manufacturing and export solutions in Surat.",
      socialInstagram: "instagram.com/mehtatextiles",
      socialLinkedIn: "linkedin.com/in/rahulmehta",
      design: "Mint Haven",
      status: "active",
      profileLink: "ambros.studio/rahul-mehta",
      createdDate: "02 Oct 2026",
      cardUrl: "/cards/design-1/index.html"
    },
    {
      id: "cust_2",
      initials: "PS",
      name: "Priya Shah",
      role: "Founder",
      company: "Shah Diamonds",
      phone: "99099 22315",
      whatsapp: "99099 22315",
      email: "priya@shahdiamonds.com",
      website: "shahdiamonds.com",
      address: "Varachha, Surat, Gujarat 395006",
      description: "Ethically crafted natural diamond jewelry & bespoke designs.",
      socialInstagram: "instagram.com/shahdiamonds",
      socialLinkedIn: "linkedin.com/in/priyashah",
      design: "Evergreen",
      status: "active",
      profileLink: "ambros.studio/priya-shah",
      createdDate: "30 Sep 2026",
      cardUrl: "/cards/design-2/index.html"
    },
    {
      id: "cust_3",
      initials: "KD",
      name: "Kunal Desai",
      role: "Operations Head",
      company: "Desai Logistics",
      phone: "94260 77013",
      whatsapp: "94260 77013",
      email: "kunal@desailogistics.in",
      website: "desailogistics.in",
      address: "GIDC Sachin, Surat, Gujarat 394230",
      description: "Integrated cold storage, supply chain, and inter-state logistics.",
      socialInstagram: "instagram.com/desailogistics",
      socialLinkedIn: "linkedin.com/in/kunaldesai",
      design: "Mint Haven",
      status: "inactive",
      profileLink: "ambros.studio/kunal-desai",
      createdDate: "28 Sep 2026",
      cardUrl: "/cards/design-1/index.html"
    },
    {
      id: "cust_4",
      initials: "AP",
      name: "Anjali Patel",
      role: "Principal Designer",
      company: "Patel Interiors",
      phone: "97144 36620",
      whatsapp: "97144 36620",
      email: "anjali@patelinteriors.in",
      website: "patelinteriors.in",
      address: "Vesu Main Road, Surat, Gujarat 395007",
      description: "Luxury residential interior architecture and contemporary living spaces.",
      socialInstagram: "instagram.com/patelinteriors",
      socialLinkedIn: "linkedin.com/in/anjalipatel",
      design: "Evergreen",
      status: "active",
      profileLink: "ambros.studio/anjali-patel",
      createdDate: "25 Sep 2026",
      cardUrl: "/cards/design-2/index.html"
    },
    {
      id: "cust_5",
      initials: "VJ",
      name: "Vikram Joshi",
      role: "Partner",
      company: "Joshi Realty",
      phone: "98795 10248",
      whatsapp: "98795 10248",
      email: "vikram@joshirealty.com",
      website: "joshirealty.com",
      address: "Dumas Road, Surat, Gujarat 395007",
      description: "Commercial and ultra-luxury high-rise real estate consulting.",
      socialInstagram: "instagram.com/joshirealty",
      socialLinkedIn: "linkedin.com/in/vikramjoshi",
      design: "Mint Haven",
      status: "active",
      profileLink: "ambros.studio/vikram-joshi",
      createdDate: "22 Sep 2026",
      cardUrl: "/cards/design-1/index.html"
    },
    {
      id: "cust_6",
      initials: "NT",
      name: "Neha Trivedi",
      role: "Chief Dentist",
      company: "Trivedi Dental Care",
      phone: "96011 58934",
      whatsapp: "96011 58934",
      email: "drneha@trivedidental.in",
      website: "trivedidental.in",
      address: "City Light, Surat, Gujarat 395007",
      description: "Advanced cosmetic dentistry, implants, and laser treatments.",
      socialInstagram: "instagram.com/trivedidental",
      socialLinkedIn: "linkedin.com/in/drnehatrivedi",
      design: "Evergreen",
      status: "inactive",
      profileLink: "ambros.studio/neha-trivedi",
      createdDate: "18 Sep 2026",
      cardUrl: "/cards/design-2/index.html"
    }
  ];

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
    customers.forEach((c) => {
      const isEvergreen = c.design === 'Evergreen';
      const cardHref = isEvergreen ? '/cards/design-2/index.html' : '/cards/design-1/index.html';
      const isActive = c.status === 'active';

      const tr = document.createElement('tr');
      tr.setAttribute('data-id', c.id);
      tr.setAttribute('data-status', c.status);

      tr.innerHTML = `
        <td>
          <div class="customer-cell">
            <div class="customer-avatar-init">${escapeHtml(c.initials)}</div>
            <div class="customer-meta">
              <span class="customer-name">${escapeHtml(c.name)}</span>
              <span class="customer-role">${escapeHtml(c.role)}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(c.company)}</td>
        <td>+91 ${escapeHtml(c.phone)}</td>
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
            <a href="${cardHref}" target="_blank" class="btn btn-white btn-sm">View Profile</a>
            <button type="button" class="btn btn-white btn-sm btn-edit-customer" data-id="${c.id}">Edit</button>
          </div>
        </td>
      `;
      customersTableBody.appendChild(tr);
    });

    attachTableEventListeners();
  }

  function renderRecentCustomersTable() {
    if (!dashboardRecentTableBody) return;

    dashboardRecentTableBody.innerHTML = '';
    const recent = customers.slice(0, 5);

    recent.forEach((c) => {
      const isEvergreen = c.design === 'Evergreen';
      const cardHref = isEvergreen ? '/cards/design-2/index.html' : '/cards/design-1/index.html';
      const isActive = c.status === 'active';

      const tr = document.createElement('tr');
      tr.setAttribute('data-id', c.id);

      tr.innerHTML = `
        <td>
          <div class="customer-cell">
            <div class="customer-avatar-init">${escapeHtml(c.initials)}</div>
            <div class="customer-meta">
              <span class="customer-name">${escapeHtml(c.name)}</span>
              <span class="customer-role">${escapeHtml(c.role)}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(c.company)}</td>
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
            <a href="${cardHref}" target="_blank" class="icon-action-btn" title="View Digital Card" aria-label="View ${escapeHtml(c.name)} profile">
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

    // Toggle Status Handlers
    document.querySelectorAll('.customer-status-toggle').forEach(checkbox => {
      checkbox.onchange = function() {
        const custId = this.getAttribute('data-id');
        const customer = customers.find(c => c.id === custId);
        if (!customer) return;

        customer.status = this.checked ? 'active' : 'inactive';
        
        // Update row status
        const row = this.closest('tr');
        if (row) {
          row.setAttribute('data-status', customer.status);
          const statusText = row.querySelector('.status-text');
          const statusDot = row.querySelector('.status-dot');
          const badgeStatus = row.querySelector('.badge-status');

          if (this.checked) {
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

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter') || 'all';
      filterCustomers();
    });
  });

  if (customerSearchInput) {
    customerSearchInput.addEventListener('input', () => {
      filterCustomers();
    });
  }

  function filterCustomers() {
    const query = customerSearchInput ? customerSearchInput.value.toLowerCase().trim() : '';
    const rows = customersTableBody ? customersTableBody.querySelectorAll('tr') : [];

    rows.forEach(row => {
      const status = row.getAttribute('data-status');
      const text = row.textContent.toLowerCase();

      const matchesFilter = (currentFilter === 'all') || (status === currentFilter);
      const matchesQuery = query === '' || text.includes(query);

      if (matchesFilter && matchesQuery) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // -------------------------------------------------------------
  // Edit Customer Flow (In-Place Update)
  // -------------------------------------------------------------
  function openEditCustomer(custId) {
    const customer = customers.find(c => c.id === custId);
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

    // 5. Keep exact profile link
    if (custProfileLink) {
      custProfileLink.textContent = customer.profileLink;
    }

    // 6. Avatar Preview
    if (avatarUploadCircle) {
      avatarUploadCircle.innerHTML = `<span style="font-size: 20px; font-weight: 700; color: #92400e;">${customer.initials}</span>`;
    }

    // 7. Open the Form Tab
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

    // Default design
    selectedDesign = "Mint Haven";
    setDesignSelection("Mint Haven");

    if (custProfileLink) {
      custProfileLink.textContent = 'ambros.studio/rahul-mehta';
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
    });
  });

  // Profile link live update on Full Name typing (only in Create mode)
  if (custFullName && custProfileLink) {
    custFullName.addEventListener('input', () => {
      // In create mode, dynamically update link from name
      if (!currentEditingCustomerId) {
        const val = custFullName.value.trim();
        if (val) {
          const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          custProfileLink.textContent = `ambros.studio/${slug}`;
        } else {
          custProfileLink.textContent = 'ambros.studio/rahul-mehta';
        }
      }
    });
  }

  // Form Submit Handler
  if (addCustomerForm) {
    addCustomerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = custFullName.value.trim() || 'New Customer';
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

      // Compute initials
      const nameParts = name.split(' ').filter(Boolean);
      const initials = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : (name.slice(0, 2)).toUpperCase();

      if (currentEditingCustomerId) {
        // ========================================================
        // UPDATE EXISTING CUSTOMER RECORD IN PLACE (NO DUPLICATES)
        // ========================================================
        const index = customers.findIndex(c => c.id === currentEditingCustomerId);
        if (index !== -1) {
          const existing = customers[index];

          // Update record in place while strictly preserving ID & Profile Link
          customers[index] = {
            ...existing,
            name: name,
            initials: initials,
            role: role,
            company: company,
            description: description,
            phone: phone,
            whatsapp: whatsapp,
            email: email,
            website: website,
            address: address,
            socialInstagram: instagram,
            socialLinkedIn: linkedIn,
            design: selectedDesign,
            cardUrl: selectedDesign === 'Evergreen' ? '/cards/design-2/index.html' : '/cards/design-1/index.html'
            // ID and profileLink remain untouched!
          };

          showAdminToast(`Customer "${name}" updated successfully (Existing record updated in place)`);
        }
      } else {
        // ========================================================
        // CREATE NEW CUSTOMER RECORD
        // ========================================================
        const newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newCustomer = {
          id: `cust_${Date.now()}`,
          initials: initials,
          name: name,
          role: role,
          company: company,
          phone: phone,
          whatsapp: whatsapp,
          email: email,
          website: website,
          address: address,
          description: description,
          socialInstagram: instagram,
          socialLinkedIn: linkedIn,
          design: selectedDesign,
          status: "active",
          profileLink: `ambros.studio/${newSlug}`,
          createdDate: "Just now",
          cardUrl: selectedDesign === 'Evergreen' ? '/cards/design-2/index.html' : '/cards/design-1/index.html'
        };

        customers.unshift(newCustomer);
        showAdminToast(`New customer "${name}" added successfully`);
      }

      // Re-render both tables with updated customer list
      renderCustomersTable();
      renderRecentCustomersTable();

      // Reset form mode and return to Customers screen
      resetAddCustomerForm();
      navigateToTab('customers');
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
        const reader = new FileReader();
        reader.onload = function(evt) {
          if (avatarUploadCircle) {
            avatarUploadCircle.innerHTML = `<img src="${evt.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Uploaded Avatar">`;
          }
          showAdminToast('Profile photo loaded for preview');
        };
        reader.readAsDataURL(this.files[0]);
      }
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
        
        // Render dashboard data
        renderCustomersTable();
        renderRecentCustomersTable();
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

      const email = loginEmailInput?.value.trim() || '';
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

          // Initialize dashboard tables
          renderCustomersTable();
          renderRecentCustomersTable();

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

  // Run initial session check
  checkAdminSession();
});
