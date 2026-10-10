/**
 * Ambros Studio — Universal Digital Card Design Registry (Browser Client)
 * Canonical 16 Designs matching utils/card-designs.ts
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CARD_DESIGN_REGISTRY = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CARD_DESIGNS = {
    // PERSONAL (6)
    'mint-haven': {
      id: 'mint-haven',
      name: 'Mint Haven',
      category: 'personal',
      categoryLabel: 'Personal',
      badge: 'Design 1',
      description: 'Warm, friendly pastel layout with soft rounded cards and organic touch.',
      theme: {
        baseMode: 'light',
        primaryColor: '#10b981',
        backgroundColor: '#faf6ee',
        textColor: '#1e293b',
        accentColor: '#34d399',
        fontFamily: 'Inter',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      },
      layoutType: 'personal-stack',
      ctaStyle: {
        primaryText: 'Save Contact',
        primaryStyle: 'rounded-pill',
        secondaryText: 'Share',
        secondaryStyle: 'rounded-pill-outline'
      },
      wireframe: {
        bg: '#faf6ee',
        accent: '#10b981',
        text: '#1e293b',
        style: 'wf-mint'
      }
    },

    'evergreen': {
      id: 'evergreen',
      name: 'Evergreen',
      category: 'personal',
      categoryLabel: 'Personal',
      badge: 'Design 2',
      description: 'Clean modern layout with forest green accents and structured metadata.',
      theme: {
        baseMode: 'light',
        primaryColor: '#1b3a2f',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        accentColor: '#2d5a49',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'personal-stack',
      ctaStyle: {
        primaryText: 'Save Contact',
        primaryStyle: 'rounded-pill-dark',
        secondaryText: 'Share',
        secondaryStyle: 'rounded-pill-outline'
      },
      wireframe: {
        bg: '#ffffff',
        accent: '#1b3a2f',
        text: '#111827',
        style: 'wf-evergreen'
      }
    },

    'noir-gold': {
      id: 'noir-gold',
      name: 'Noir Gold',
      category: 'personal',
      categoryLabel: 'Personal',
      badge: 'Design 3',
      description: 'Refined dark card with metallic gold ring, charcoal surfaces, and executive typography.',
      theme: {
        baseMode: 'dark',
        primaryColor: '#dfb76c',
        backgroundColor: '#0b0d13',
        textColor: '#f8fafc',
        accentColor: '#c59d53',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'personal-stack',
      ctaStyle: {
        primaryText: 'Add to contacts',
        primaryStyle: 'gold-solid',
        secondaryText: 'Exchange contact',
        secondaryStyle: 'gold-outline'
      },
      wireframe: {
        bg: '#0b0d13',
        accent: '#dfb76c',
        text: '#ffffff',
        style: 'wf-noir-gold'
      }
    },

    'emerald-ivory': {
      id: 'emerald-ivory',
      name: 'Emerald Ivory',
      category: 'personal',
      categoryLabel: 'Personal',
      badge: 'Design 4',
      description: 'Warm ivory background paired with deep forest emerald for consultants & founders.',
      theme: {
        baseMode: 'light',
        primaryColor: '#0f382c',
        backgroundColor: '#faf7f2',
        textColor: '#15241f',
        accentColor: '#1d5a47',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'personal-stack',
      ctaStyle: {
        primaryText: 'Add to contacts',
        primaryStyle: 'emerald-solid',
        secondaryText: 'WhatsApp me',
        secondaryStyle: 'emerald-outline'
      },
      wireframe: {
        bg: '#faf7f2',
        accent: '#0f382c',
        text: '#15241f',
        style: 'wf-emerald-ivory'
      }
    },

    'neon-pulse': {
      id: 'neon-pulse',
      name: 'Neon Pulse',
      category: 'personal',
      categoryLabel: 'Personal',
      badge: 'Design 5',
      description: 'Violet-to-cyan gradient on dark canvas with subtle glowing accents and high contrast.',
      theme: {
        baseMode: 'dark',
        primaryColor: '#8b5cf6',
        backgroundColor: '#0a0b16',
        textColor: '#f1f5f9',
        accentColor: '#06b6d4',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'personal-stack',
      ctaStyle: {
        primaryText: 'Add to contacts',
        primaryStyle: 'neon-gradient',
        secondaryText: 'WhatsApp me',
        secondaryStyle: 'glass-outline'
      },
      wireframe: {
        bg: '#0a0b16',
        accent: '#8b5cf6',
        text: '#06b6d4',
        style: 'wf-neon-pulse'
      }
    },

    'mono-studio': {
      id: 'mono-studio',
      name: 'Mono Studio',
      category: 'personal',
      categoryLabel: 'Personal',
      badge: 'Design 6',
      description: 'Strict editorial black & white with sharp corners, hairline borders, and pure typography.',
      theme: {
        baseMode: 'light',
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        accentColor: '#525252',
        fontFamily: 'Inter',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
      },
      layoutType: 'editorial',
      ctaStyle: {
        primaryText: 'Add to contacts',
        primaryStyle: 'sharp-black',
        secondaryText: 'WhatsApp me',
        secondaryStyle: 'sharp-outline'
      },
      wireframe: {
        bg: '#ffffff',
        accent: '#000000',
        text: '#000000',
        style: 'wf-mono-studio'
      }
    },

    // BUSINESS (6)
    'classic-navy': {
      id: 'classic-navy',
      name: 'Classic Navy',
      category: 'business',
      categoryLabel: 'Business',
      badge: 'Design 7',
      description: 'Deep navy & gold authoritative corporate identity with open status, quick-action trio, and services.',
      theme: {
        baseMode: 'dark',
        primaryColor: '#d4af37',
        backgroundColor: '#0c172a',
        textColor: '#f8fafc',
        accentColor: '#e2ba48',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'business-hub',
      ctaStyle: {
        primaryText: 'Call',
        primaryStyle: 'gold-pill',
        secondaryText: 'WhatsApp',
        secondaryStyle: 'navy-pill-outline'
      },
      wireframe: {
        bg: '#0c172a',
        accent: '#d4af37',
        text: '#ffffff',
        style: 'wf-classic-navy'
      }
    },

    'fresh-mint': {
      id: 'fresh-mint',
      name: 'Fresh Mint',
      category: 'business',
      categoryLabel: 'Business',
      badge: 'Design 8',
      description: 'Light, friendly mint canvas with vibrant teal accents, crisp white cards, and local service overview.',
      theme: {
        baseMode: 'light',
        primaryColor: '#0d9488',
        backgroundColor: '#edf7f4',
        textColor: '#134e4a',
        accentColor: '#14b8a6',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'business-hub',
      ctaStyle: {
        primaryText: 'Call',
        primaryStyle: 'teal-pill',
        secondaryText: 'WhatsApp',
        secondaryStyle: 'teal-outline'
      },
      wireframe: {
        bg: '#edf7f4',
        accent: '#0d9488',
        text: '#134e4a',
        style: 'wf-fresh-mint'
      }
    },

    'bold-pop': {
      id: 'bold-pop',
      name: 'Bold Pop',
      category: 'business',
      categoryLabel: 'Business',
      badge: 'Design 9',
      description: 'Vivid yellow high-impact retail identity with bold black borders and maximum visual energy.',
      theme: {
        baseMode: 'light',
        primaryColor: '#000000',
        backgroundColor: '#ffdd00',
        textColor: '#000000',
        accentColor: '#000000',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap'
      },
      layoutType: 'business-hub',
      ctaStyle: {
        primaryText: 'Call',
        primaryStyle: 'black-pill',
        secondaryText: 'WhatsApp',
        secondaryStyle: 'white-bordered-pill'
      },
      wireframe: {
        bg: '#ffdd00',
        accent: '#000000',
        text: '#000000',
        style: 'wf-bold-pop'
      }
    },

    'bento-grid': {
      id: 'bento-grid',
      name: 'Bento Grid',
      category: 'business',
      categoryLabel: 'Business',
      badge: 'Design 10',
      description: 'Colorful modular bento layout organizing services, hours, contact, and rating in playful tiles.',
      theme: {
        baseMode: 'light',
        primaryColor: '#4f46e5',
        backgroundColor: '#f5f3fa',
        textColor: '#1e1b4b',
        accentColor: '#ec4899',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'bento-modular',
      ctaStyle: {
        primaryText: 'Call us',
        primaryStyle: 'bento-coral',
        secondaryText: 'WhatsApp',
        secondaryStyle: 'bento-sun'
      },
      wireframe: {
        bg: '#f5f3fa',
        accent: '#f87171',
        text: '#1e1b4b',
        style: 'wf-bento-grid'
      }
    },

    'glass-aurora': {
      id: 'glass-aurora',
      name: 'Glass Aurora',
      category: 'business',
      categoryLabel: 'Business',
      badge: 'Design 11',
      description: 'Translucent frosted glass over subtle aurora mesh layers with gentle borders and depth.',
      theme: {
        baseMode: 'dark',
        primaryColor: '#38bdf8',
        backgroundColor: '#0b0d1e',
        textColor: '#f8fafc',
        accentColor: '#a855f7',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'glassmorphism',
      ctaStyle: {
        primaryText: 'Call us',
        primaryStyle: 'glass-panel-btn',
        secondaryText: 'WhatsApp',
        secondaryStyle: 'glass-panel-btn'
      },
      wireframe: {
        bg: '#0b0d1e',
        accent: '#38bdf8',
        text: '#f8fafc',
        style: 'wf-glass-aurora'
      }
    },

    'luxe-foil': {
      id: 'luxe-foil',
      name: 'Luxe Foil',
      category: 'business',
      categoryLabel: 'Business',
      badge: 'Design 12',
      description: 'Deep matte black with gold foil lettering, hairline metallic borders, and understated luxury.',
      theme: {
        baseMode: 'dark',
        primaryColor: '#d4af37',
        backgroundColor: '#080808',
        textColor: '#f5f5f5',
        accentColor: '#e5c468',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'business-hub',
      ctaStyle: {
        primaryText: 'Call us',
        primaryStyle: 'luxe-dark-gold',
        secondaryText: 'WhatsApp',
        secondaryStyle: 'luxe-dark-gold'
      },
      wireframe: {
        bg: '#080808',
        accent: '#d4af37',
        text: '#f5f5f5',
        style: 'wf-luxe-foil'
      }
    },

    // INDUSTRY SPECIALS (4)
    'skyline': {
      id: 'skyline',
      name: 'Skyline',
      category: 'industry',
      categoryLabel: 'Industry · Real Estate',
      badge: 'Design 13',
      description: 'High-end real estate consultant identity with listings showcase, sales track-record, and site visits.',
      theme: {
        baseMode: 'dark',
        primaryColor: '#2563eb',
        backgroundColor: '#0d1526',
        textColor: '#f8fafc',
        accentColor: '#38bdf8',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'industry-special',
      industryModule: 'real-estate',
      ctaStyle: {
        primaryText: 'Book a site visit',
        primaryStyle: 'blue-solid',
        secondaryText: 'Call',
        secondaryStyle: 'dark-outline'
      },
      wireframe: {
        bg: '#0d1526',
        accent: '#2563eb',
        text: '#f8fafc',
        style: 'wf-skyline'
      }
    },

    'atelier': {
      id: 'atelier',
      name: 'Atelier',
      category: 'industry',
      categoryLabel: 'Industry · Fashion',
      badge: 'Design 14',
      description: 'Editorial haute couture aesthetics with lookbook highlights, bespoke services, and fitting appointments.',
      theme: {
        baseMode: 'light',
        primaryColor: '#e0533c',
        backgroundColor: '#faf7f2',
        textColor: '#1a1a1a',
        accentColor: '#1c1917',
        fontFamily: 'Playfair Display',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
      },
      layoutType: 'industry-special',
      industryModule: 'fashion',
      ctaStyle: {
        primaryText: 'Book a fitting',
        primaryStyle: 'coral-statement',
        secondaryText: 'Call studio',
        secondaryStyle: 'soft-outline'
      },
      wireframe: {
        bg: '#faf7f2',
        accent: '#e0533c',
        text: '#1a1a1a',
        style: 'wf-atelier'
      }
    },

    'care-plus': {
      id: 'care-plus',
      name: 'Care Plus',
      category: 'industry',
      categoryLabel: 'Industry · Healthcare',
      badge: 'Design 15',
      description: 'Calm, trustworthy medical UI with live next-slot badge, conditions treated, clinic timings, and appointments.',
      theme: {
        baseMode: 'light',
        primaryColor: '#0d9488',
        backgroundColor: '#f8fbfc',
        textColor: '#0f172a',
        accentColor: '#0284c7',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'industry-special',
      industryModule: 'healthcare',
      ctaStyle: {
        primaryText: 'Book appointment',
        primaryStyle: 'teal-solid',
        secondaryText: 'Call clinic',
        secondaryStyle: 'white-outline'
      },
      wireframe: {
        bg: '#f8fbfc',
        accent: '#0d9488',
        text: '#0f172a',
        style: 'wf-care-plus'
      }
    },

    'roast-and-co': {
      id: 'roast-and-co',
      name: 'Roast & Co.',
      category: 'industry',
      categoryLabel: 'Industry · Cafe',
      badge: 'Design 16',
      description: 'Warm cafe & roastery aesthetic with WhatsApp ordering, coffee menu, Wi-Fi badge, and stamp loyalty card.',
      theme: {
        baseMode: 'dark',
        primaryColor: '#d4a373',
        backgroundColor: '#1b140e',
        textColor: '#f5ebe0',
        accentColor: '#84cc16',
        fontFamily: 'Plus Jakarta Sans',
        fontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
      },
      layoutType: 'industry-special',
      industryModule: 'cafe',
      ctaStyle: {
        primaryText: 'Order on WhatsApp',
        primaryStyle: 'cafe-whatsapp',
        secondaryText: 'Directions',
        secondaryStyle: 'cafe-outline'
      },
      wireframe: {
        bg: '#1b140e',
        accent: '#d4a373',
        text: '#f5ebe0',
        style: 'wf-roast-and-co'
      }
    }
  };

  function resolveCardDesign(rawNameOrId) {
    if (!rawNameOrId || typeof rawNameOrId !== 'string') {
      return CARD_DESIGNS['mint-haven'];
    }
    var clean = rawNameOrId.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (CARD_DESIGNS[clean]) return CARD_DESIGNS[clean];

    var keys = Object.keys(CARD_DESIGNS);
    for (var i = 0; i < keys.length; i++) {
      if (CARD_DESIGNS[keys[i]].name.toLowerCase() === rawNameOrId.trim().toLowerCase()) {
        return CARD_DESIGNS[keys[i]];
      }
    }

    if (clean === 'design-1' || clean === 'mint') return CARD_DESIGNS['mint-haven'];
    if (clean === 'design-2' || clean === 'evergreen') return CARD_DESIGNS['evergreen'];
    if (clean === 'roast' || clean === 'roast-co') return CARD_DESIGNS['roast-and-co'];

    return CARD_DESIGNS['mint-haven'];
  }

  function getDesignsByCategory() {
    var grouped = { personal: [], business: [], industry: [] };
    var keys = Object.keys(CARD_DESIGNS);
    for (var i = 0; i < keys.length; i++) {
      var d = CARD_DESIGNS[keys[i]];
      if (grouped[d.category]) {
        grouped[d.category].push(d);
      }
    }
    return grouped;
  }

  var allDesignsList = Object.keys(CARD_DESIGNS).map(function (k) { return CARD_DESIGNS[k]; });

  var AUTHORITATIVE_AMBROS_CUSTOMER = {
    fullName: 'Ambros Studio',
    designation: 'Creative & Digital Team',
    company: 'Ambros Studio',
    description: 'Bespoke websites, high-impact digital campaigns, and luxury contactless NFC business cards crafted with purpose.',
    phone: '+91 91577 78915',
    whatsapp: '919157778915',
    email: 'ambrosstudioltd@gmail.com',
    website: 'https://ambrosstudio.com',
    address: '3rd Floor, VIP Gallaria, 214, near Zen Hospital, Althan, Surat, Gujarat 395017',
    socialInstagram: 'https://www.instagram.com/ambros.studio',
    socialLinkedIn: 'https://linkedin.com/company/ambrosstudio',
    cardDesign: 'mint-haven',
    profileSlug: 'ambros-studio',
    avatarUrl: '/assets/ambros-logo-light.png',
    is_active: true,
    customSettings: {
      appearance: {
        primaryColor: '#10b981',
        backgroundColor: '#faf6ee',
        textColor: '#1e293b',
        fontFamily: 'Plus Jakarta Sans'
      },
      links: [
        { id: '1', type: 'phone', label: 'Call Studio', value: '+91 91577 78915', enabled: true, order: 0 },
        { id: '2', type: 'whatsapp', label: 'Chat on WhatsApp', value: '919157778915', enabled: true, order: 1 },
        { id: '3', type: 'email', label: 'Email Team', value: 'ambrosstudioltd@gmail.com', enabled: true, order: 2 },
        { id: '4', type: 'website', label: 'Visit Website', value: 'https://ambrosstudio.com', enabled: true, order: 3 },
        { id: '5', type: 'instagram', label: 'Instagram', value: 'https://www.instagram.com/ambros.studio', enabled: true, order: 4 },
        { id: '6', type: 'linkedin', label: 'LinkedIn', value: 'https://linkedin.com/company/ambrosstudio', enabled: true, order: 5 }
      ]
    }
  };

  var CANONICAL_DEMO_PROFILES = {
    'mint-haven': {
      fullName: 'Maya Patel',
      designation: 'Holistic Wellness & Brand Consultant',
      company: 'Solstice Living Studio',
      description: 'Guiding mindful brands and conscious founders through holistic design, wellness workshops, and visual identity.',
      phone: '+91 98200 12345',
      whatsapp: '919820012345',
      email: 'maya@solsticeliving.demo',
      website: 'https://solsticeliving.demo',
      address: 'Demo Studio, Althan, Surat',
      socialInstagram: 'https://instagram.com/maya.wellness',
      socialLinkedIn: 'https://linkedin.com/in/mayapatel-demo',
      cardDesign: 'mint-haven',
      profileSlug: 'demo-mint-haven',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#10b981', backgroundColor: '#faf6ee', textColor: '#1e293b', fontFamily: 'Inter' },
        links: [
          { id: '1', type: 'phone', label: 'Call Maya', value: '+91 98200 12345', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'Chat on WhatsApp', value: '919820012345', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Email Maya', value: 'maya@solsticeliving.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Explore Studio', value: 'https://solsticeliving.demo', enabled: true, order: 3 }
        ]
      }
    },

    'evergreen': {
      fullName: 'Vikram Nair',
      designation: 'Principal Sustainable Architect',
      company: 'Terraform Ecology Works',
      description: 'Pioneering low-carbon residential architecture, passive solar design, and native biophilic environments.',
      phone: '+91 98200 23456',
      whatsapp: '919820023456',
      email: 'vikram@terraform.demo',
      website: 'https://terraform.demo',
      address: 'Demo Eco Hub, Pune',
      socialInstagram: 'https://instagram.com/terraform.design',
      socialLinkedIn: 'https://linkedin.com/in/vikramnair-demo',
      cardDesign: 'evergreen',
      profileSlug: 'demo-evergreen',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#1b3a2f', backgroundColor: '#ffffff', textColor: '#111827', fontFamily: 'Plus Jakarta Sans' },
        links: [
          { id: '1', type: 'phone', label: 'Direct Call', value: '+91 98200 23456', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Desk', value: '919820023456', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Project Inquiry', value: 'vikram@terraform.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Architecture Portfolio', value: 'https://terraform.demo', enabled: true, order: 3 }
        ]
      }
    },

    'noir-gold': {
      fullName: 'Alexander Sterling',
      designation: 'Managing Director · Private Advisory',
      company: 'Sterling & Vance Partners',
      description: 'Advising enterprise leadership and family offices on cross-border transactions, private capital, and legacy strategy.',
      phone: '+91 98200 34567',
      whatsapp: '919820034567',
      email: 'alexander@sterlingvance.demo',
      website: 'https://sterlingvance.demo',
      address: 'Financial Center, Mumbai',
      socialInstagram: 'https://instagram.com/sterlingvance.demo',
      socialLinkedIn: 'https://linkedin.com/in/alexandersterling-demo',
      cardDesign: 'noir-gold',
      profileSlug: 'demo-noir-gold',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#dfb76c', backgroundColor: '#0b0d13', textColor: '#f8fafc', fontFamily: 'Plus Jakarta Sans' },
        links: [
          { id: '1', type: 'phone', label: 'Executive Line', value: '+91 98200 34567', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Direct', value: '919820034567', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Confidential Email', value: 'alexander@sterlingvance.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Advisory Overview', value: 'https://sterlingvance.demo', enabled: true, order: 3 }
        ]
      }
    },

    'emerald-ivory': {
      fullName: 'Rohan Singhania',
      designation: 'Executive Strategist & Board Advisor',
      company: 'Singhania Corporate Advisory',
      description: 'Facilitating corporate transformations, ESG governance frameworks, and high-stakes executive alignment.',
      phone: '+91 98200 45678',
      whatsapp: '919820045678',
      email: 'rohan@singhania.demo',
      website: 'https://singhania.demo',
      socialInstagram: 'https://instagram.com/singhania.advisory',
      socialLinkedIn: 'https://linkedin.com/in/rohansinghania-demo',
      cardDesign: 'emerald-ivory',
      profileSlug: 'demo-emerald-ivory',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#0f382c', backgroundColor: '#faf7f2', textColor: '#15241f', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'general',
          data: {
            stats: [
              { num: '15+', label: 'Yrs Advisory' },
              { num: '40+', label: 'Corporate Boards' },
              { num: '98%', label: 'Retention' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Call Consultant', value: '+91 98200 45678', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Me', value: '919820045678', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Executive Inquiry', value: 'rohan@singhania.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Advisory Dossier', value: 'https://singhania.demo', enabled: true, order: 3 }
        ]
      }
    },

    'neon-pulse': {
      fullName: 'Kai Vance',
      designation: 'Lead Creative Technologist & Sound Designer',
      company: 'PulseLab Interactive',
      description: 'Blending generative audio, interactive 3D web environments, and cybernetic brand experiences.',
      phone: '+91 98200 56789',
      whatsapp: '919820056789',
      email: 'kai@pulselab.demo',
      website: 'https://pulselab.demo',
      socialInstagram: 'https://instagram.com/pulselab.demo',
      socialLinkedIn: 'https://linkedin.com/in/kaivance-demo',
      cardDesign: 'neon-pulse',
      profileSlug: 'demo-neon-pulse',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#8b5cf6', backgroundColor: '#0a0b16', textColor: '#f1f5f9', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'general',
          data: {
            stats: [
              { num: '120+', label: 'Shipped Builds' },
              { num: '14', label: 'Design Awards' },
              { num: 'Global', label: 'Clients' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Direct Call', value: '+91 98200 56789', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'Chat on WhatsApp', value: '919820056789', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Collaborate', value: 'kai@pulselab.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Interactive Portfolio', value: 'https://pulselab.demo', enabled: true, order: 3 }
        ]
      }
    },

    'mono-studio': {
      fullName: 'Marcus Chen',
      designation: 'Architectural Photographer & Visual Artist',
      company: 'Studio Monochrome',
      description: 'Documenting spatial geometry, brutalist structures, and modern minimalist interiors on medium format film.',
      phone: '+91 98200 67890',
      whatsapp: '919820067890',
      email: 'marcus@monostudio.demo',
      website: 'https://monostudio.demo',
      socialInstagram: 'https://instagram.com/chen.visuals',
      socialLinkedIn: 'https://linkedin.com/in/marcuschen-demo',
      cardDesign: 'mono-studio',
      profileSlug: 'demo-mono-studio',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#171717', backgroundColor: '#ffffff', textColor: '#0a0a0a', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'general',
          data: {
            stats: [
              { num: '8', label: 'Solo Shows' },
              { num: '240+', label: 'Features' },
              { num: 'Global', label: 'Galleries' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Call Studio', value: '+91 98200 67890', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Inquiries', value: '919820067890', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Print & Commission', value: 'marcus@monostudio.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Selected Works', value: 'https://monostudio.demo', enabled: true, order: 3 }
        ]
      }
    },

    'classic-navy': {
      fullName: 'Apex Wealth Partners',
      designation: 'Private Wealth & Trust Management',
      company: 'Apex Wealth Partners',
      description: 'Bespoke wealth structuring, trust administration, and private capital protection for generational enterprises.',
      phone: '+91 98200 70001',
      whatsapp: '919820070001',
      email: 'contact@apexwealth.demo',
      website: 'https://apexwealth.demo',
      address: 'Nariman Point, Financial District, Mumbai',
      socialInstagram: 'https://instagram.com/apexwealth.demo',
      socialLinkedIn: 'https://linkedin.com/company/apexwealth-demo',
      cardDesign: 'classic-navy',
      profileSlug: 'demo-classic-navy',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#c5a880', backgroundColor: '#0c1427', textColor: '#f8fafc', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'business',
          data: {
            services: [
              { name: 'Trust Structuring', subtitle: 'Generational' },
              { name: 'Private Equity', subtitle: 'Direct Deals' },
              { name: 'Tax Governance', subtitle: 'Compliance' },
              { name: 'Estate Planning', subtitle: 'Bespoke' },
              { name: 'Family Office', subtitle: 'Full Suite' },
              { name: 'Liquidity Advisory', subtitle: 'Capital' }
            ],
            hours: [
              { days: 'Monday – Friday', hours: '9:00 am – 6:00 pm' },
              { days: 'Saturday – Sunday', hours: 'By Appointment Only' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Call Reception', value: '+91 98200 70001', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Desk', value: '919820070001', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Private Email', value: 'contact@apexwealth.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Institutional Portal', value: 'https://apexwealth.demo', enabled: true, order: 3 },
          { id: '5', type: 'maps', label: 'Mumbai Offices', value: 'Nariman Point, Mumbai', enabled: true, order: 4 }
        ]
      }
    },

    'fresh-mint': {
      fullName: 'Verve Digital Studio',
      designation: 'Growth Marketing & Product Engineering',
      company: 'Verve Digital Studio',
      description: 'Performance acquisition, high-converting web apps, and data-driven customer acquisition for scaling SaaS teams.',
      phone: '+91 98200 80002',
      whatsapp: '919820080002',
      email: 'hello@vervedigital.demo',
      website: 'https://vervedigital.demo',
      address: 'Tech Hub, Althan Corridor, Surat',
      socialInstagram: 'https://instagram.com/vervedigital.demo',
      socialLinkedIn: 'https://linkedin.com/company/vervedigital-demo',
      cardDesign: 'fresh-mint',
      profileSlug: 'demo-fresh-mint',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#059669', backgroundColor: '#f0fdf4', textColor: '#064e3b', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'business',
          data: {
            services: [
              { name: 'Full-Funnel Growth', subtitle: 'Acquisition' },
              { name: 'Product UI/UX', subtitle: 'Design Systems' },
              { name: 'Next.js Apps', subtitle: 'Fast Builds' },
              { name: 'SEO Architecture', subtitle: 'Organic' },
              { name: 'Lifecycle Flows', subtitle: 'Retention' },
              { name: 'Analytics Setup', subtitle: 'Clean Data' }
            ],
            hours: [
              { days: 'Monday – Friday', hours: '9:30 am – 6:30 pm' },
              { days: 'Saturday', hours: '10:00 am – 2:00 pm' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Call Agency', value: '+91 98200 80002', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'Chat on WhatsApp', value: '919820080002', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Project Briefs', value: 'hello@vervedigital.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Case Studies', value: 'https://vervedigital.demo', enabled: true, order: 3 }
        ]
      }
    },

    'bold-pop': {
      fullName: 'KINETIC Brand Lab',
      designation: 'Brand Identity & Packaging Studio',
      company: 'KINETIC Brand Lab',
      description: 'High-voltage packaging, rebellious visual systems, and unforgettable consumer product identities.',
      phone: '+91 98200 90003',
      whatsapp: '919820090003',
      email: 'studio@kineticlab.demo',
      website: 'https://kineticlab.demo',
      address: 'Design District, Lower Parel, Mumbai',
      socialInstagram: 'https://instagram.com/kineticlab.demo',
      socialLinkedIn: 'https://linkedin.com/company/kineticlab-demo',
      cardDesign: 'bold-pop',
      profileSlug: 'demo-bold-pop',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#ea580c', backgroundColor: '#fff7ed', textColor: '#7c2d12', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'business',
          data: {
            services: [
              { name: 'Brand Identity', subtitle: 'Visual Systems' },
              { name: 'CPG Packaging', subtitle: 'Shelf Impact' },
              { name: 'Retail Activation', subtitle: 'Pop-ups' },
              { name: '3D Prototyping', subtitle: 'Renderings' },
              { name: 'Creative Direction', subtitle: 'Campaigns' },
              { name: 'Custom Fonts', subtitle: 'Typography' }
            ],
            hours: [
              { days: 'Monday – Friday', hours: '10:00 am – 7:00 pm' },
              { days: 'Saturday', hours: 'Creative Sprints' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Call Studio', value: '+91 98200 90003', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Us', value: '919820090003', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Studio Deck', value: 'studio@kineticlab.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Our Portfolio', value: 'https://kineticlab.demo', enabled: true, order: 3 }
        ]
      }
    },

    'bento-grid': {
      fullName: 'Polymath Systems',
      designation: 'Digital Product Engineering & UX Studio',
      company: 'Polymath Systems',
      description: 'End-to-end digital craft: from modular design systems and cloud architectures to micro-interactions.',
      phone: '+91 98200 10004',
      whatsapp: '919820010004',
      email: 'team@polymathsystems.demo',
      website: 'https://polymathsystems.demo',
      socialInstagram: 'https://instagram.com/polymathsystems.demo',
      socialLinkedIn: 'https://linkedin.com/company/polymathsystems-demo',
      cardDesign: 'bento-grid',
      profileSlug: 'demo-bento-grid',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#4f46e5', backgroundColor: '#f8fafc', textColor: '#0f172a', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'business',
          data: {
            services: [
              { name: 'Design Systems', subtitle: 'Figma to Code' },
              { name: 'Cloud Native Apps', subtitle: 'Scalable' },
              { name: 'Mobile Native', subtitle: 'iOS & Android' },
              { name: 'AI Pipelines', subtitle: 'Intelligent' },
              { name: 'Micro-Interactions', subtitle: 'Tactile' },
              { name: 'Performance Audits', subtitle: 'Fast CWV' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Direct Call', value: '+91 98200 10004', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'Chat on WhatsApp', value: '919820010004', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Email Engineering', value: 'team@polymathsystems.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Polymath Lab', value: 'https://polymathsystems.demo', enabled: true, order: 3 }
        ]
      }
    },

    'glass-aurora': {
      fullName: 'Aether Dynamics',
      designation: 'Next-Gen Financial Technology',
      company: 'Aether Dynamics',
      description: 'Institutional digital asset infrastructure, zero-knowledge verification systems, and smart treasury protocols.',
      phone: '+91 98200 20005',
      whatsapp: '919820020005',
      email: 'desk@aetherdynamics.demo',
      website: 'https://aetherdynamics.demo',
      address: 'Global FinTech Hub, Mumbai',
      socialInstagram: 'https://instagram.com/aetherdynamics.demo',
      socialLinkedIn: 'https://linkedin.com/company/aetherdynamics-demo',
      cardDesign: 'glass-aurora',
      profileSlug: 'demo-glass-aurora',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#38bdf8', backgroundColor: '#080c18', textColor: '#f8fafc', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'business',
          data: {
            services: [
              { name: 'Treasury Protocols', subtitle: 'Automated' },
              { name: 'ZK Audits', subtitle: 'Provable' },
              { name: 'API Gateways', subtitle: 'Low Latency' },
              { name: 'Custody Systems', subtitle: 'Multi-Sig' },
              { name: 'Settlement Desk', subtitle: 'Instant' },
              { name: 'Liquidity Routing', subtitle: 'Optimized' }
            ],
            hours: [
              { days: 'Global Trading Desk', hours: '24 / 7 Operations' },
              { days: 'Client Advisory Desk', hours: 'Mon – Fri: 9:00 am – 6:00 pm' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Trading Desk', value: '+91 98200 20005', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Desk', value: '919820020005', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Institutional Inquiries', value: 'desk@aetherdynamics.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Protocol Specs', value: 'https://aetherdynamics.demo', enabled: true, order: 3 }
        ]
      }
    },

    'luxe-foil': {
      fullName: 'Aurum & Co. Private Jewellers',
      designation: 'High Jewellery & Bespoke Gemstones',
      company: 'Aurum & Co.',
      description: 'Handcrafted high jewellery, rare certified gemstones, and private atelier appointments by invitation.',
      phone: '+91 98200 30006',
      whatsapp: '919820030006',
      email: 'concierge@aurumjewellers.demo',
      website: 'https://aurumjewellers.demo',
      address: 'Diamond District, Surat',
      socialInstagram: 'https://instagram.com/aurumjewellers.demo',
      socialLinkedIn: 'https://linkedin.com/company/aurumjewellers-demo',
      cardDesign: 'luxe-foil',
      profileSlug: 'demo-luxe-foil',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#d4af37', backgroundColor: '#0d0c0a', textColor: '#fdf8ee', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'business',
          data: {
            services: [
              { name: 'Bespoke Commissions', subtitle: 'Haute Joaillerie' },
              { name: 'Rare Gemstones', subtitle: 'Sourced Direct' },
              { name: 'Heirloom Redesign', subtitle: 'Atelier Crafted' },
              { name: 'Private Vault', subtitle: 'By Appointment' },
              { name: 'Diamond Advisory', subtitle: 'Certified' },
              { name: 'Valuation', subtitle: 'Insurance' }
            ],
            hours: [
              { days: 'Tuesday – Saturday', hours: '11:00 am – 7:00 pm' },
              { days: 'Private Viewings', hours: 'By Invitation Only' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Private Concierge', value: '+91 98200 30006', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Atelier', value: '919820030006', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Private Appointment', value: 'concierge@aurumjewellers.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'High Jewellery Salon', value: 'https://aurumjewellers.demo', enabled: true, order: 3 }
        ]
      }
    },

    'skyline': {
      fullName: 'Aarav Sharma',
      designation: 'Senior Property Consultant & Luxury Realtor',
      company: 'Skyline Realty & Advisory',
      description: 'Advising buyers and investors on prime residential penthouses, sea-facing villas, and high-yield commercial assets across South Mumbai & Pune.',
      phone: '+91 98200 78901',
      whatsapp: '919820078901',
      email: 'aarav@skylinerealty.demo',
      website: 'https://skylinerealty.demo',
      address: 'Level 14, Platina Tower, BKC, Mumbai',
      socialInstagram: 'https://instagram.com/aarav.realty',
      socialLinkedIn: 'https://linkedin.com/in/aaravsharma-realty',
      cardDesign: 'skyline',
      profileSlug: 'demo-skyline',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#2563eb', backgroundColor: '#090d16', textColor: '#f8fafc', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'real-estate',
          data: {
            badges: ['Demo RERA · Sample Profile', 'English · Hindi · Gujarati', 'Bandra · Worli · Althan'],
            stats: [
              { num: '140+', label: 'Homes Sold' },
              { num: '₹320Cr', label: 'Closed Value' },
              { num: '9+ Yrs', label: 'Experience' }
            ],
            listings: [
              { tag: 'Sample Exclusive', price: '₹3.40 Cr', title: '3 BHK Sea-View Residence', location: 'Bandra West, Mumbai · 1,650 sq ft', pills: ['Sea view', '2 parking', 'Ready to move'] },
              { tag: 'Sample New Launch', price: '₹1.85 Cr', title: '2 BHK Garden Penthouse', location: 'VIP Road Corridor, Surat · 1,220 sq ft', pills: ['Clubhouse', 'Pool', 'Sample RERA'] },
              { tag: 'Sample Lease', price: '₹65,000 / mo', title: '3 BHK High-Floor Suite', location: 'Worli Sea Face, Mumbai · 1,500 sq ft', pills: ['Furnished', 'Serviced', 'Immediate'] }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Call Consultant', value: '+91 98200 78901', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'WhatsApp Listings', value: '919820078901', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Property Inquiry', value: 'aarav@skylinerealty.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'View Available Units', value: 'https://skylinerealty.demo', enabled: true, order: 3 },
          { id: '5', type: 'maps', label: 'BKC Advisory Office', value: 'Level 14, Platina Tower, BKC, Mumbai', enabled: true, order: 4 }
        ]
      }
    },

    'atelier': {
      fullName: 'Elena Rostova',
      designation: 'Haute Couture Designer & Creative Director',
      company: 'Maison Elena Atelier',
      description: 'Bespoke bridal wear, hand-draped silhouettes, and contemporary pret collections crafted for runway and editorial appearances.',
      phone: '+91 98200 89012',
      whatsapp: '919820089012',
      email: 'studio@maisonelena.demo',
      website: 'https://maisonelena.demo',
      address: 'Colaba Atelier District, Mumbai',
      socialInstagram: 'https://instagram.com/maisonelena.couture',
      socialLinkedIn: 'https://linkedin.com/in/elenarostova-demo',
      cardDesign: 'atelier',
      profileSlug: 'demo-atelier',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#e0533c', backgroundColor: '#faf7f2', textColor: '#1a1a1a', fontFamily: 'Playfair Display' },
        industry: {
          type: 'fashion',
          data: {
            services: [
              { name: 'Bespoke Couture', subtitle: 'Handcrafted embroidery' },
              { name: 'Bridal Trousseau', subtitle: 'Full fitting suite' },
              { name: 'Red Carpet Styling', subtitle: '1:1 Consultations' },
              { name: 'Runway Edit', subtitle: 'Limited capsule' }
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Call Studio', value: '+91 98200 89012', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'Book Fitting on WhatsApp', value: '919820089012', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Atelier Desk', value: 'studio@maisonelena.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Lookbook & Catalog', value: 'https://maisonelena.demo', enabled: true, order: 3 }
        ]
      }
    },

    'care-plus': {
      fullName: 'Dr. Ananya Mehta',
      designation: 'Consultant Dermatologist & Aesthetic Physician',
      company: 'Care Plus Aesthetics & Skin Clinic',
      description: 'Evidence-based clinical dermatology, laser aesthetics, and tailored restorative skin and hair care protocols.',
      phone: '+91 98200 90123',
      whatsapp: '919820090123',
      email: 'consult@careplusclinic.demo',
      website: 'https://careplusclinic.demo',
      address: 'Althan Medical Enclave, Surat',
      socialInstagram: 'https://instagram.com/drananyamehta.skin',
      socialLinkedIn: 'https://linkedin.com/in/drananyamehta-demo',
      cardDesign: 'care-plus',
      profileSlug: 'demo-care-plus',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#0284c7', backgroundColor: '#f8fafc', textColor: '#0f172a', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'healthcare',
          data: {
            nextSlot: 'Sample Slot: Today, 4:30 PM (Demo)',
            timings: 'Mon – Sat: 10:00 am – 7:30 pm (Sample Schedule)',
            treatments: [
              'Clinical Dermatology',
              'Laser Resurfacing',
              'Hair Restoration',
              'Anti-Pigmentation',
              'Acne Protocol',
              'Barrier Repair'
            ]
          }
        },
        links: [
          { id: '1', type: 'phone', label: 'Call Clinic Desk', value: '+91 98200 90123', enabled: true, order: 0 },
          { id: '2', type: 'whatsapp', label: 'Book Consultation', value: '919820090123', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Clinical Appointments', value: 'consult@careplusclinic.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Clinic Specialties', value: 'https://careplusclinic.demo', enabled: true, order: 3 },
          { id: '5', type: 'maps', label: 'Directions to Clinic', value: 'Althan Medical Enclave, Surat', enabled: true, order: 4 }
        ]
      }
    },

    'roast-and-co': {
      fullName: 'Roast & Co.',
      designation: 'Artisan Coffee Roasters & Micro-Bakery',
      company: 'Roast & Co. Coffee Lab',
      description: 'Small-batch single-origin coffees, precision manual brews, and sourdough bakes served in an industrial sunlit brew bar.',
      phone: '+91 98200 01234',
      whatsapp: '919820001234',
      email: 'hello@roastandco.demo',
      website: 'https://roastandco.demo',
      address: 'VIP Gallaria Corridor, Althan, Surat',
      socialInstagram: 'https://instagram.com/roastandco.lab',
      socialLinkedIn: 'https://linkedin.com/company/roastandco-demo',
      cardDesign: 'roast-and-co',
      profileSlug: 'demo-roast-and-co',
      avatarUrl: '',
      is_active: true,
      customSettings: {
        appearance: { primaryColor: '#d4a373', backgroundColor: '#1b140e', textColor: '#f5ebe0', fontFamily: 'Plus Jakarta Sans' },
        industry: {
          type: 'cafe',
          data: {
            badges: ['Sample Open · Till 10 PM', '★ 4.8 Sample Rating', 'Free Gigabit Wi-Fi'],
            loyalty: 'Sample Loyalty: Collect 8 stamps, get 1 free brew',
            menu: [
              { name: 'Flat White', sub: 'Double shot, silky microfoam', price: '₹190', popular: true },
              { name: 'Specialty Cold Brew', sub: 'Steeped 18 hours, citrus notes', price: '₹210', popular: true },
              { name: 'Manual Pour-Over', sub: 'Single-origin Ethiopian Yirgacheffe', price: '₹180' },
              { name: 'Spanish Latte', sub: 'Espresso with textured condensed milk', price: '₹220' },
              { name: 'Almond Butter Croissant', sub: 'Fresh daily bake, flaky layers', price: '₹160' },
              { name: 'Truffle Mushroom Toast', sub: 'Toasted sourdough with herb ricotta', price: '₹240' }
            ]
          }
        },
        links: [
          { id: '1', type: 'whatsapp', label: 'Order on WhatsApp', value: '919820001234', enabled: true, order: 0 },
          { id: '2', type: 'phone', label: 'Call Cafe', value: '+91 98200 01234', enabled: true, order: 1 },
          { id: '3', type: 'email', label: 'Catering & Events', value: 'hello@roastandco.demo', enabled: true, order: 2 },
          { id: '4', type: 'website', label: 'Weekly Roast Schedule', value: 'https://roastandco.demo', enabled: true, order: 3 },
          { id: '5', type: 'maps', label: 'Find the Brew Bar', value: 'VIP Gallaria Corridor, Althan, Surat', enabled: true, order: 4 }
        ]
      }
    }
  };

  function getDemoProfile(rawNameOrId) {
    var design = resolveCardDesign(rawNameOrId);
    var demo = CANONICAL_DEMO_PROFILES[design.id] || CANONICAL_DEMO_PROFILES['mint-haven'];
    var copy = JSON.parse(JSON.stringify(demo));
    copy.cardDesign = design.id;
    return copy;
  }

  return {
    DESIGNS: CARD_DESIGNS,
    ALL_DESIGNS: allDesignsList,
    resolveCardDesign: resolveCardDesign,
    getDesignsByCategory: getDesignsByCategory,
    AUTHORITATIVE_AMBROS_CUSTOMER: AUTHORITATIVE_AMBROS_CUSTOMER,
    CANONICAL_DEMO_PROFILES: CANONICAL_DEMO_PROFILES,
    getDemoProfile: getDemoProfile
  };
});

