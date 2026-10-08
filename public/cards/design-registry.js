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
    website: 'https://www.ambrosstudio.space',
    address: '3rd Floor, VIP Gallaria, 214, near Zen Hospital, Althan, Surat, Gujarat 395017',
    socialInstagram: 'https://www.instagram.com/ambros.studio',
    socialLinkedIn: 'https://linkedin.com/company/ambrosstudio',
    cardDesign: 'mint-haven',
    profileSlug: 'ambros-studio',
    avatarUrl: '/assets/abros-logo-transparent.png',
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
        { id: '4', type: 'website', label: 'Visit Website', value: 'https://www.ambrosstudio.space', enabled: true, order: 3 },
        { id: '5', type: 'instagram', label: 'Instagram', value: 'https://www.instagram.com/ambros.studio', enabled: true, order: 4 },
        { id: '6', type: 'linkedin', label: 'LinkedIn', value: 'https://linkedin.com/company/ambrosstudio', enabled: true, order: 5 }
      ]
    }
  };

  return {
    DESIGNS: CARD_DESIGNS,
    ALL_DESIGNS: allDesignsList,
    resolveCardDesign: resolveCardDesign,
    getDesignsByCategory: getDesignsByCategory,
    AUTHORITATIVE_AMBROS_CUSTOMER: AUTHORITATIVE_AMBROS_CUSTOMER
  };
});

