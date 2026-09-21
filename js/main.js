/**
 * AbrosStudio — "CRAFTED WITH PURPOSE"
 * Main Client-Side Controller
 * Pure ES6+ Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDigitalCard();
  initTestimonialSlider();
  initPortfolioModal();
  initContactForm();
  initScrollReveals();
});

/* ==========================================================================
   1. Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');

  // Sticky header background
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Mobile menu toggle
  if (toggle && drawer) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close on clicking outside
    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && !toggle.contains(e.target) && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close when clicking a link inside drawer
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   2. Interactive 3D Digital Business Card (Smooth Natural Flip)
   ========================================================================== */
function initDigitalCard() {
  const cardScene = document.querySelector('.card-scene');
  if (!cardScene) return;

  const card3D = cardScene.querySelector('.card-3d');
  let isFlipped = false;

  function setFlipState(flipped) {
    isFlipped = flipped;
    cardScene.classList.toggle('flipped', isFlipped);
    if (card3D) {
      card3D.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }
  }

  // Click & tap listener on cardScene
  cardScene.addEventListener('click', (e) => {
    // If clicking an action link (call, whatsapp, email), allow the link action without flipping
    if (e.target.closest('a')) return;
    setFlipState(!isFlipped);
  });

  // Accessible keyboard support (Enter or Space)
  cardScene.setAttribute('tabindex', '0');
  cardScene.setAttribute('role', 'button');
  cardScene.setAttribute('aria-label', 'Interactive Business Card. Press Enter to flip.');

  cardScene.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipState(!isFlipped);
    }
  });

  // Subtle interactive 3D tilt on desktop mouse move (only when front is facing)
  if (card3D && window.matchMedia('(pointer: fine)').matches) {
    cardScene.addEventListener('mousemove', (e) => {
      if (isFlipped) return; // Never tilt when card is flipped to the back
      const rect = cardScene.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / (rect.height / 2)) * 7;
      const rotateY = (x / (rect.width / 2)) * 8;
      card3D.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    cardScene.addEventListener('mouseleave', () => {
      card3D.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    });
  }
}

/* ==========================================================================
   3. Testimonial Review Slider
   ========================================================================== */
function initTestimonialSlider() {
  const track = document.querySelector('.testimonials-track');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;

  function updateSlider(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateSlider(currentIndex - 1);
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateSlider(currentIndex + 1);
      resetAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateSlider(idx);
      resetAutoplay();
    });
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      updateSlider(currentIndex + 1);
      resetAutoplay();
    } else if (touchEndX - touchStartX > 50) {
      updateSlider(currentIndex - 1);
      resetAutoplay();
    }
  }, { passive: true });

  // Autoplay
  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      updateSlider(currentIndex + 1);
    }, 6500);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  track.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  track.addEventListener('mouseleave', () => startAutoplay());

  startAutoplay();
}

/* ==========================================================================
   4. Selected Work / Portfolio Filter & Modal Popup
   ========================================================================== */
const PROJECT_DATABASE = {
  'restaurant': {
    title: 'Zaika Gourmet — Contemporary Indian Dining',
    tag: 'Restaurant & Hospitality',
    image: 'assets/project-restaurant.jpg',
    services: 'Web Design & Development • Digital Business Cards',
    challenge: 'A premier Indian dining establishment needed a digital experience that reflected its rich atmosphere, allowed instant reservation requests via WhatsApp, and reduced physical menu printing costs.',
    solution: 'Engineered an ambient, dark emerald responsive website with an interactive digital menu, sub-second photo gallery loading, and a seamless one-tap WhatsApp table booking funnel.',
    deliverables: [
      'Interactive culinary lookbook',
      'One-tap WhatsApp table reservation',
      'Mobile-optimized contactless QR menu',
      'Local Surat Google Maps integration'
    ]
  },
  'salon': {
    title: 'Aura Hair & Skin — Luxury Wellness Studio',
    tag: 'Salon & Spa Studio',
    image: 'assets/project-salon.jpg',
    services: 'Web Design & Development • Targeted Meta Ads',
    challenge: 'A high-end salon needed to attract bridal clients and recurring weekly grooming appointments in a highly competitive local market without wasting ad budget on broad demographics.',
    solution: 'Designed an elegant, editorial aesthetic featuring stylist profiles, service rate-cards with clear consultation CTAs, and localized Instagram ad funnels geo-targeted within an 8km radius.',
    deliverables: [
      'Editorial lookbook & bridal package flow',
      'Direct WhatsApp consultation booking',
      'Local Meta ad campaign creatives',
      'Mobile client intake workflow'
    ]
  },
  'estate': {
    title: 'PrimeHabitat Developments — Luxury Residences',
    tag: 'Real Estate & Living',
    image: 'assets/project-estate.jpg',
    services: 'Web Design & Development • Lead Capture Ads',
    challenge: 'A luxury residential builder needed a high-credibility digital showcase for an upcoming gated community to capture pre-launch buyer inquiries and digital brochure downloads.',
    solution: 'Built an architectural presentation site with interactive unit floorplans, drone view photography integration, and a friction-free WhatsApp & phone call consultation pipeline.',
    deliverables: [
      'Architectural visual gallery',
      'Interactive floorplan & amenity viewer',
      'High-intent buyer inquiry lead form',
      'Fast-loading PDF brochure delivery system'
    ]
  },
  'clinic': {
    title: 'Dr. Mehta Dental Care — Multi-Specialty Clinic',
    tag: 'Healthcare & Clinic',
    image: 'assets/project-clinic.jpg',
    services: 'Web Design & Development • Local SEO',
    challenge: 'Patients often feel anxious and face difficulty finding transparent clinic hours, specialist doctor qualifications, and emergency consultation channels online.',
    solution: 'Created a calm, reassuring digital presence emphasizing clinical hygiene standards, patient treatment FAQs, doctor credentials, and an instant emergency appointment button.',
    deliverables: [
      'Treatment information architecture',
      'Direct emergency call & WhatsApp button',
      'Patient hygiene protocol assurance page',
      'Local search schema & Google My Business sync'
    ]
  },
  'gym': {
    title: 'IronForge Studio — Premium Fitness & Training',
    tag: 'Fitness & Athletics',
    image: 'assets/project-gym.jpg',
    services: 'Web Design & Development • Digital Ads • Digital Cards',
    challenge: 'A boutique strength and conditioning gym needed to convert social media followers into in-person 3-day trial pass sign-ups and introduce contactless gym member cards.',
    solution: 'Designed an energetic, high-contrast dark aesthetic showcasing trainer coaching certifications, class timetables, and a friction-free trial pass booking form.',
    deliverables: [
      'Live trainer timetable & class breakdown',
      '3-Day Trial Pass lead generation funnel',
      'Digital NFC trainer business cards',
      'Local Instagram Story & Reel ad creatives'
    ]
  },
  'fashion': {
    title: 'Zari Thread & Couture — Designer Ethnic Wear',
    tag: 'Bespoke Fashion & Couture',
    image: 'assets/project-fashion.jpg',
    services: 'Web Design & Development • Digital Cards',
    challenge: 'An exclusive designer ethnic couture atelier needed a luxury online lookbook to showcase intricate embroidery craftsmanship and schedule private bridal appointments.',
    solution: 'Crafted a minimalist, high-fashion layout with generous whitespace, high-fidelity fabric zoom, and a private VIP fitting room reservation mechanism.',
    deliverables: [
      'Seasonal haute couture visual lookbook',
      'Private bridal styling appointment scheduler',
      'Direct WhatsApp concierge chat trigger',
      'Digital boutique business card for clients'
    ]
  },
  'consultant': {
    title: 'Apex Financial Advisory — CA & Corporate Consulting',
    tag: 'Business & Financial Consulting',
    image: 'assets/project-consultant.jpg',
    services: 'Web Design & Development • Corporate Identity',
    challenge: 'A chartered accountancy and corporate tax advisory firm needed to stand out from antiquated competitors with an authoritative, modern digital footprint.',
    solution: 'Engineered a clean, typographic layout highlighting corporate compliance expertise, regulatory advisory services, and a secure client consultation gateway.',
    deliverables: [
      'Corporate advisory services matrix',
      'Direct business consultation scheduling',
      'Tax compliance resource articles layout',
      'Founder and partner digital business cards'
    ]
  },
  'cleaning': {
    title: 'SparkClean Solutions — Professional Facility Services',
    tag: 'Local Facility Services',
    image: 'assets/project-cleaning.jpg',
    services: 'Web Design & Development • Local Search Ads',
    challenge: 'A local commercial and residential deep cleaning enterprise needed rapid booking requests from property managers and homeowners with immediate response times.',
    solution: 'Built a clean, transparent service selection layout with instant quotation requests, service checklists, and a direct WhatsApp dispatch connection.',
    deliverables: [
      'Service calculator & quotation request form',
      'One-tap WhatsApp dispatch inquiry',
      'Commercial client verification badges',
      'Localized Google Search ad landing page'
    ]
  }
};

function initPortfolioModal() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const modalCloseBtn = document.querySelector('.modal-close-btn');

  // Filter Buttons Logic
  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (filterValue === 'all' || cardCategory === filterValue) {
            card.style.display = 'flex';
            setTimeout(() => card.style.opacity = '1', 20);
          } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 200);
          }
        });
      });
    });
  }

  // Modal Open Logic
  document.querySelectorAll('[data-open-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = trigger.getAttribute('data-open-modal');
      const data = PROJECT_DATABASE[projectId];
      if (!data || !modalBackdrop) return;

      // Populate Modal Fields
      document.getElementById('modalImage').src = data.image;
      document.getElementById('modalImage').alt = data.title;
      document.getElementById('modalTag').textContent = data.tag;
      document.getElementById('modalTitle').textContent = data.title;
      document.getElementById('modalChallenge').textContent = data.challenge;
      document.getElementById('modalSolution').textContent = data.solution;
      document.getElementById('modalServices').textContent = data.services;

      const deliverablesList = document.getElementById('modalDeliverablesList');
      deliverablesList.innerHTML = '';
      data.deliverables.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${item}</span>
        `;
        deliverablesList.appendChild(li);
      });

      // Show modal
      modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Modal Close Logic
  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   5. Contact Form Handler & Direct WhatsApp Integration
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const business = document.getElementById('formBusiness').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const phone = document.getElementById('formPhone').value.trim();
    const service = document.getElementById('formService').value;
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !business || !phone) {
      alert('Please provide your name, business name, and phone number.');
      return;
    }

    // Format WhatsApp inquiry
    const waText = encodeURIComponent(
      `Hello AbrosStudio! 👋\n\n` +
      `My Name: ${name}\n` +
      `Business: ${business}\n` +
      `Phone: ${phone}\n` +
      `Email: ${email || 'N/A'}\n` +
      `Service: ${service}\n\n` +
      `Requirement:\n${message || 'I would like to discuss a digital project.'}`
    );

    const waUrl = `https://wa.me/919998441519?text=${waText}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // Display confirmation
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span>Inquiry Sent to WhatsApp ✓</span>`;
    btn.style.background = '#25D366';
    btn.style.color = '#000';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = '';
      btn.style.color = '';
      contactForm.reset();
    }, 4000);
  });
}

/* ==========================================================================
   6. Scroll Reveal Animations (Intersection Observer)
   ========================================================================== */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.fade-in-up');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}
