/**
 * Ambros Studio — Design-Specific Dynamic Editor Configurations
 * 
 * Provides an authoritative, design-tailored configuration for all 19 digital card designs:
 * - 6 Personal: Mint Haven, Evergreen, Noir Gold, Emerald Ivory, Neon Pulse, Mono Studio
 * - 6 Business Hubs: Classic Navy, Fresh Mint, Bold Pop, Bento Grid, Glass Aurora, Luxe Foil
 * - 7 Industry Specials: Skyline, Atelier, Care Plus, Roast & Co., Raftcon Luxury, ATG Study Abroad, Spice Route
 * 
 * Every design exposes ONLY its actual supported elements (fields, uploaders, lists, badges, documents).
 */

(function(global) {
  'use strict';

  var CONFIGS = {
    // =========================================================================
    // 1. PERSONAL COLLECTION (6 Designs)
    // =========================================================================
    'mint-haven': {
      id: 'mint-haven',
      name: 'Mint Haven',
      category: 'personal',
      badge: 'Design 1',
      headline: 'Warm pastel organic card with soft rounded surfaces and friendly typography',
      coreFields: {
        fullName: { show: true, label: 'Full name', placeholder: 'e.g. Maya Patel', required: true },
        designation: { show: true, label: 'Professional title', placeholder: 'e.g. Creative Strategist' },
        company: { show: true, label: 'Studio / Company', placeholder: 'e.g. Studio Bloom' },
        description: { show: true, label: 'Personal biography', placeholder: 'Short friendly introduction shown on the card' },
        avatar: { show: true, label: 'Profile photo', help: 'Square portrait, at least 400x400px. Supports JPG, PNG, WEBP.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'mintAppearance',
          title: 'Color Palette & Typography',
          description: 'Customize the pastel aesthetic while maintaining organic elegance.',
          fields: [
            { key: 'primaryColor', label: 'Accent Color', type: 'color', default: '#10b981' },
            { key: 'backgroundColor', label: 'Background Color', type: 'color', default: '#faf6ee' },
            { key: 'textColor', label: 'Text Color', type: 'color', default: '#1e293b' }
          ]
        }
      ]
    },

    'evergreen': {
      id: 'evergreen',
      name: 'Evergreen',
      category: 'personal',
      badge: 'Design 2',
      headline: 'Crisp corporate personal layout with forest green accents and structured metadata',
      coreFields: {
        fullName: { show: true, label: 'Full name', placeholder: 'e.g. Marcus Vance', required: true },
        designation: { show: true, label: 'Designation / Specialty', placeholder: 'e.g. Environmental Consultant' },
        company: { show: true, label: 'Firm / Practice', placeholder: 'e.g. Terra Nova Advisory' },
        description: { show: true, label: 'Professional summary', placeholder: 'Brief overview of consulting background' },
        avatar: { show: true, label: 'Executive portrait', help: 'Professional headshot, minimum 400x400px.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'evergreenMeta',
          title: 'Consulting Credentials & Status',
          description: 'Structured metadata displayed above the contact channels.',
          fields: [
            { key: 'status', label: 'Status / Accreditation Pill', type: 'text', placeholder: 'e.g. Certified ESG Advisor · Available Q4' }
          ]
        }
      ]
    },

    'noir-gold': {
      id: 'noir-gold',
      name: 'Noir Gold',
      category: 'personal',
      badge: 'Design 3',
      headline: 'Executive dark card with metallic gold ring, charcoal depth, and serif elegance',
      coreFields: {
        fullName: { show: true, label: 'Executive name', placeholder: 'e.g. Alexander Wright', required: true },
        designation: { show: true, label: 'Executive title', placeholder: 'e.g. Managing Partner' },
        company: { show: true, label: 'Enterprise / Capital', placeholder: 'e.g. Wright & Sterling Holdings' },
        description: { show: true, label: 'Executive biography', placeholder: 'Distinguished profile text shown in the About box' },
        avatar: { show: true, label: 'Executive portrait', help: 'High-contrast portrait displayed inside the metallic gold ring.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'noirActions',
          title: 'Action Button Customization',
          description: 'Labels for the gold solid and gold outline action buttons.',
          fields: [
            { key: 'primaryCtaText', label: 'Primary Button Label', type: 'text', placeholder: 'Add to contacts' },
            { key: 'secondaryCtaText', label: 'Secondary Button Label', type: 'text', placeholder: 'Exchange contact' }
          ]
        }
      ]
    },

    'emerald-ivory': {
      id: 'emerald-ivory',
      name: 'Emerald Ivory',
      category: 'personal',
      badge: 'Design 4',
      headline: 'Prestigious ivory consultant card with deep emerald tones and statistics highlights',
      coreFields: {
        fullName: { show: true, label: 'Full name', placeholder: 'e.g. Dr. Priya Sharma', required: true },
        designation: { show: true, label: 'Practice area / Role', placeholder: 'e.g. Wealth & Portfolio Advisor' },
        company: { show: true, label: 'Advisory firm', placeholder: 'e.g. Ivory Capital Partners' },
        description: { show: true, label: 'Professional bio', placeholder: 'Advisory credentials and client focus' },
        avatar: { show: true, label: 'Consultant portrait', help: 'Warm portrait matching ivory aesthetic.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'ivoryStats',
          title: 'Performance Highlights (3 Stat Columns)',
          description: 'Key statistics displayed in the 3-column stats bar.',
          fields: [
            {
              key: 'stats',
              label: 'Consultant Statistics',
              type: 'stats_grid',
              default: [
                { num: '12+', label: 'Years active' },
                { num: '₹80Cr+', label: 'AUM advised' },
                { num: '99%', label: 'Retention' }
              ]
            }
          ]
        }
      ]
    },

    'neon-pulse': {
      id: 'neon-pulse',
      name: 'Neon Pulse',
      category: 'personal',
      badge: 'Design 5',
      headline: 'Futuristic cyberpunk dark card with violet neon glow and glassmorphic contact list',
      coreFields: {
        fullName: { show: true, label: 'Creator / Developer name', placeholder: 'e.g. Leo Chen', required: true },
        designation: { show: true, label: 'Specialization', placeholder: 'e.g. Web3 Engineer & Sound Designer' },
        company: { show: true, label: 'Studio / Brand', placeholder: 'e.g. Pulse Media Collective' },
        description: { show: true, label: 'Creative bio', placeholder: 'Innovative bio with futuristic flair' },
        avatar: { show: true, label: 'Profile photo (Neon Glow)', help: 'Portrait framed by dynamic violet neon ambient glow.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: false },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'neonStats',
          title: 'Creator Metrics (3 Stat Columns)',
          description: 'Key metrics displayed in glowing futuristic counters.',
          fields: [
            {
              key: 'stats',
              label: 'Metrics & Reach',
              type: 'stats_grid',
              default: [
                { num: '450K+', label: 'Community' },
                { num: '24', label: 'Releases' },
                { num: '99.8%', label: 'Uptime' }
              ]
            }
          ]
        }
      ]
    },

    'mono-studio': {
      id: 'mono-studio',
      name: 'Mono Studio',
      category: 'personal',
      badge: 'Design 6',
      headline: 'Sharp architectural monochrome card with square crop, editorial typography, and structured grid',
      coreFields: {
        fullName: { show: true, label: 'Architect / Designer name', placeholder: 'e.g. Elena Rostova', required: true },
        designation: { show: true, label: 'Discipline', placeholder: 'e.g. Lead Architect & Urbanist' },
        company: { show: true, label: 'Atelier / Studio', placeholder: 'e.g. Studio Monochrome' },
        description: { show: true, label: 'Architectural manifesto', placeholder: 'Editorial bio or studio philosophy' },
        avatar: { show: true, label: 'Monochrome square portrait', help: 'Sharp square crop for clean editorial aesthetic.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'monoStats',
          title: 'Practice Metrics (3 Columns)',
          description: 'Monochromatic statistics row.',
          fields: [
            {
              key: 'stats',
              label: 'Practice Numbers',
              type: 'stats_grid',
              default: [
                { num: '18', label: 'Built works' },
                { num: '06', label: 'Awards' },
                { num: '14', label: 'Exhibitions' }
              ]
            }
          ]
        }
      ]
    },

    // =========================================================================
    // 2. BUSINESS HUBS (6 Designs)
    // =========================================================================
    'classic-navy': {
      id: 'classic-navy',
      name: 'Classic Navy',
      category: 'business',
      badge: 'Design 7',
      headline: 'Corporate deep navy business hub with gold accents, action trio, services grid, and operating hours',
      coreFields: {
        company: { show: true, label: 'Company / Business name', placeholder: 'e.g. Crestview Logistics', required: true },
        fullName: { show: true, label: 'Executive contact name', placeholder: 'e.g. Rajesh Singhania' },
        designation: { show: true, label: 'Executive role', placeholder: 'e.g. Managing Director' },
        description: { show: true, label: 'Company overview', placeholder: 'Comprehensive business summary' },
        avatar: { show: true, label: 'Corporate logo', help: 'High-res company brand emblem.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'bizHeaderMeta',
          title: 'Operating Status',
          description: 'Live status pill displayed beneath the business title.',
          fields: [
            { key: 'status', label: 'Operating Status Text', type: 'text', placeholder: 'e.g. Open Now · Mon–Sat 9AM–7PM' }
          ]
        },
        {
          id: 'bizServicesSec',
          title: 'Core Business Services',
          description: 'List of capability cards rendered in the "What we do" grid.',
          fields: [
            { key: 'services', label: 'Services List', type: 'chips', placeholder: 'Type service and press Enter (e.g. Supply Chain Optimization)' }
          ]
        },
        {
          id: 'bizHoursSec',
          title: 'Opening Hours Schedule',
          description: 'Operating days and timing slots shown in the structured table.',
          fields: [
            {
              key: 'hours',
              label: 'Weekly Hours',
              type: 'key_value_list',
              keyLabel: 'Days / Day Slot',
              valueLabel: 'Hours / Timings',
              default: [
                { days: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
                { days: 'Saturday', time: '10:00 AM – 4:00 PM' },
                { days: 'Sunday', time: 'Closed' }
              ]
            }
          ]
        }
      ]
    },

    'fresh-mint': {
      id: 'fresh-mint',
      name: 'Fresh Mint',
      category: 'business',
      badge: 'Design 8',
      headline: 'Vibrant teal business hub with modern rounded cards, services showcase, and clean hours table',
      coreFields: {
        company: { show: true, label: 'Company / Studio name', placeholder: 'e.g. Verve Wellness Co.', required: true },
        fullName: { show: true, label: 'Founder / Lead contact', placeholder: 'e.g. Ananya Sen' },
        designation: { show: true, label: 'Role / Designation', placeholder: 'e.g. Founder & Chief Wellness Officer' },
        description: { show: true, label: 'Company mission & bio', placeholder: 'Short story and value proposition' },
        avatar: { show: true, label: 'Brand logo', help: 'Square or round logo.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'freshStatusSec',
          title: 'Availability Status',
          description: 'Displayed in the mint status pill.',
          fields: [
            { key: 'status', label: 'Status Tag', type: 'text', placeholder: 'e.g. Accepting New Clients' }
          ]
        },
        {
          id: 'freshServicesSec',
          title: 'Offered Services',
          description: 'Services cards rendered on the public profile.',
          fields: [
            { key: 'services', label: 'Services', type: 'chips', placeholder: 'e.g. Holistic Nutrition, Mindfulness Workshops' }
          ]
        },
        {
          id: 'freshHoursSec',
          title: 'Operating Schedule',
          description: 'Weekly schedule table.',
          fields: [
            {
              key: 'hours',
              label: 'Working Hours',
              type: 'key_value_list',
              keyLabel: 'Day Slot',
              valueLabel: 'Time',
              default: [
                { days: 'Monday – Friday', time: '8:00 AM – 6:00 PM' },
                { days: 'Saturday', time: '9:00 AM – 1:00 PM' }
              ]
            }
          ]
        }
      ]
    },

    'bold-pop': {
      id: 'bold-pop',
      name: 'Bold Pop',
      category: 'business',
      badge: 'Design 9',
      headline: 'High-contrast black & vibrant yellow layout with bold pill CTAs and impactful service cards',
      coreFields: {
        company: { show: true, label: 'Agency / Brand name', placeholder: 'e.g. HYPERDRIVE Creative', required: true },
        fullName: { show: true, label: 'Creative Director', placeholder: 'e.g. Kabir Roy' },
        designation: { show: true, label: 'Role', placeholder: 'e.g. Executive Creative Lead' },
        description: { show: true, label: 'Agency Manifesto', placeholder: 'Bold statement of what makes you different' },
        avatar: { show: true, label: 'High-contrast logo', help: 'Vector or transparent logo.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'popStatusSec',
          title: 'Status & Working Hours',
          description: 'Tag and operating details.',
          fields: [
            { key: 'status', label: 'Status Text', type: 'text', placeholder: 'e.g. Taking Bookings for Q1' }
          ]
        },
        {
          id: 'popServicesSec',
          title: 'Agency Capabilities',
          description: 'Bold service modules.',
          fields: [
            { key: 'services', label: 'Capabilities', type: 'chips', placeholder: 'e.g. Brand Identity, 3D Motion, Web Architecture' }
          ]
        },
        {
          id: 'popHoursSec',
          title: 'Studio Hours',
          description: 'Opening hours schedule.',
          fields: [
            {
              key: 'hours',
              label: 'Hours',
              type: 'key_value_list',
              keyLabel: 'Days',
              valueLabel: 'Hours',
              default: [
                { days: 'Mon – Fri', time: '10:00 AM – 8:00 PM' }
              ]
            }
          ]
        }
      ]
    },

    'bento-grid': {
      id: 'bento-grid',
      name: 'Bento Grid',
      category: 'business',
      badge: 'Design 10',
      headline: 'Modular dynamic bento cards with colorful tile blocks for rating, hours, call, and services',
      coreFields: {
        company: { show: true, label: 'Studio / Business name', placeholder: 'e.g. Kroma Studio', required: true },
        fullName: { show: true, label: 'Founder / Lead', placeholder: 'e.g. Rohan Varma' },
        designation: { show: true, label: 'Designation', placeholder: 'e.g. Product Design Lead' },
        description: { show: true, label: 'Short studio intro', placeholder: 'Brief overview displayed above the bento grid' },
        avatar: { show: true, label: 'Avatar / Studio logo', help: 'Emblem displayed at the top of the bento stack.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'bentoTilesSec',
          title: 'Bento Metric Tiles',
          description: 'Content displayed inside the distinctive modular bento boxes.',
          fields: [
            { key: 'clientRating', label: 'Client Rating Tile Text', type: 'text', placeholder: 'e.g. ★ 4.9 (120+ client reviews)' },
            { key: 'workingHours', label: 'Working Hours Tile Text', type: 'text', placeholder: 'e.g. Mon – Fri, 9am – 6pm' }
          ]
        },
        {
          id: 'bentoServicesSec',
          title: 'What We Do (Service Tiles)',
          description: 'Interactive service blocks rendered in the bottom bento section.',
          fields: [
            { key: 'services', label: 'Services', type: 'chips', placeholder: 'e.g. UI/UX Systems, Rapid Prototyping, Design Systems' }
          ]
        }
      ]
    },

    'glass-aurora': {
      id: 'glass-aurora',
      name: 'Glass Aurora',
      category: 'business',
      badge: 'Design 11',
      headline: 'Translucent glassmorphism cards with cyber-sky aurora gradients and floating panels',
      coreFields: {
        company: { show: true, label: 'Company / Startup name', placeholder: 'e.g. Aurora Intelligence', required: true },
        fullName: { show: true, label: 'Executive contact', placeholder: 'e.g. Siddharth Rao' },
        designation: { show: true, label: 'Title / Role', placeholder: 'e.g. Chief Technology Officer' },
        description: { show: true, label: 'Company vision', placeholder: 'About the technological innovation and mission' },
        avatar: { show: true, label: 'Brand insignia', help: 'Transparent or glowing emblem.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'glassMetricsSec',
          title: 'Status & Rating',
          description: 'Badges rendered on frosted glass backdrop.',
          fields: [
            { key: 'status', label: 'Status Banner', type: 'text', placeholder: 'e.g. Series-A Funded · Hiring' },
            { key: 'rating', label: 'Client Rating', type: 'text', placeholder: 'e.g. ★ 5.0 Enterprise Trust' }
          ]
        },
        {
          id: 'glassServicesSec',
          title: 'Capabilities & Solutions',
          description: 'Frosted service panels.',
          fields: [
            { key: 'services', label: 'Solutions', type: 'chips', placeholder: 'e.g. Autonomous Agents, Private Cloud, Realtime Sync' }
          ]
        },
        {
          id: 'glassHoursSec',
          title: 'Hours / Response Window',
          description: 'Operating schedule.',
          fields: [
            {
              key: 'hours',
              label: 'Availability',
              type: 'key_value_list',
              keyLabel: 'Days',
              valueLabel: 'Hours',
              default: [{ days: 'Mon – Fri', time: '24/5 Global Support' }]
            }
          ]
        }
      ]
    },

    'luxe-foil': {
      id: 'luxe-foil',
      name: 'Luxe Foil',
      category: 'business',
      badge: 'Design 12',
      headline: 'High-end black & gold foil business layout for private equity, legal, and luxury practices',
      coreFields: {
        company: { show: true, label: 'Firm / Practice name', placeholder: 'e.g. Aurelius Private Wealth', required: true },
        fullName: { show: true, label: 'Managing Partner name', placeholder: 'e.g. Vikramaditya Singhal' },
        designation: { show: true, label: 'Partner title', placeholder: 'e.g. Senior Managing Partner' },
        description: { show: true, label: 'Firm overview', placeholder: 'Bespoke advisory and generational wealth management' },
        avatar: { show: true, label: 'Gold foil crest / logo', help: 'Luxury gold emblem or crest.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'luxeMetaSec',
          title: 'Status & Prestige',
          description: 'Gold-bordered metadata badges.',
          fields: [
            { key: 'status', label: 'Accreditation Status', type: 'text', placeholder: 'e.g. By Confidential Appointment Only' },
            { key: 'rating', label: 'Recognition / Honor', type: 'text', placeholder: 'e.g. Top Private Wealth Firm 2026' }
          ]
        },
        {
          id: 'luxeServicesSec',
          title: 'Advisory Practices',
          description: 'Practice areas rendered in gold-framed cards.',
          fields: [
            { key: 'services', label: 'Practice Areas', type: 'chips', placeholder: 'e.g. Succession Planning, Real Asset Allocation, Family Office' }
          ]
        },
        {
          id: 'luxeHoursSec',
          title: 'Consultation Hours',
          description: 'Hours schedule.',
          fields: [
            {
              key: 'hours',
              label: 'Consultation Hours',
              type: 'key_value_list',
              keyLabel: 'Days',
              valueLabel: 'Hours',
              default: [{ days: 'Mon – Fri', time: '10:00 AM – 6:00 PM' }]
            }
          ]
        }
      ]
    },

    // =========================================================================
    // 3. INDUSTRY SPECIALS (7 Designs)
    // =========================================================================
    'skyline': {
      id: 'skyline',
      name: 'Skyline',
      category: 'industry',
      badge: 'Design 13',
      headline: 'Real estate & architectural development suite with property listings, brochure download, and site viewing CTAs',
      coreFields: {
        company: { show: true, label: 'Agency / Realty brand', placeholder: 'e.g. Skyline Luxury Realty', required: true },
        fullName: { show: true, label: 'Lead Broker / Agent', placeholder: 'e.g. Neha Kapoor', required: true },
        designation: { show: true, label: 'Agent title', placeholder: 'e.g. Principal Luxury Property Broker' },
        description: { show: true, label: 'Broker biography & market focus', placeholder: 'Specialising in prime residential and commercial real estate' },
        avatar: { show: true, label: 'Broker portrait or agency logo', help: 'Professional agent headshot or agency emblem.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'skylineBadgesSec',
          title: 'Broker Badges & Performance Metrics',
          description: 'Showcase track record and credentials directly below the header.',
          fields: [
            {
              key: 'badges',
              label: 'Broker Badges',
              type: 'chips',
              placeholder: 'Type badge and press Enter (e.g. Top 1% Producer, Commercial Specialist)'
            },
            {
              key: 'stats',
              label: 'Performance Statistics (3 Columns)',
              type: 'stats_grid',
              default: [
                { num: '₹150Cr+', label: 'Volume Sold' },
                { num: '85+', label: 'Deals Closed' },
                { num: '98%', label: 'Satisfied Clients' }
              ]
            }
          ]
        },
        {
          id: 'skylineListingsSec',
          title: 'Featured Property Listings',
          description: 'Showcase premier properties with pricing, tags, location, and photos.',
          fields: [
            {
              key: 'listings',
              label: 'Property Listings',
              type: 'repeatable_list',
              itemTitleKey: 'title',
              subfields: [
                { key: 'title', label: 'Property Title', type: 'text', placeholder: 'e.g. 4 BHK Sea-Facing Penthouse' },
                { key: 'price', label: 'Price Tag', type: 'text', placeholder: 'e.g. ₹8.5 Cr' },
                { key: 'location', label: 'Location / Micro-Market', type: 'text', placeholder: 'e.g. Worli Sea Face, Mumbai' },
                { key: 'tag', label: 'Status Tag', type: 'text', placeholder: 'e.g. Exclusive' },
                { key: 'pills', label: 'Property Specs (Pills)', type: 'chips', placeholder: 'e.g. 3,800 sq.ft, 3 Car Parks' },
                { key: 'imageUrl', label: 'Property Photo', type: 'file_upload', fileKind: 'listing', accept: 'image/*', help: 'High-res property interior or exterior image.' }
              ],
              default: [
                {
                  title: '4 BHK Sea-Facing Penthouse',
                  price: '₹8.5 Cr',
                  location: 'Worli Sea Face, Mumbai',
                  tag: 'Exclusive',
                  pills: ['3,800 sq.ft', '4 Bed', 'Private Deck']
                }
              ]
            }
          ]
        },
        {
          id: 'skylineBrochureSec',
          title: 'Site Visit Booking & Property Brochure Upload',
          description: 'Configure the primary appointment CTA and drag-and-drop property brochure PDF.',
          fields: [
            { key: 'bookingLabel', label: 'Site Visit Button Label', type: 'text', placeholder: 'Book a site visit', default: 'Book a site visit' },
            { key: 'bookingUrl', label: 'Site Visit Scheduling URL', type: 'text', placeholder: 'https://calendly.com/... or WhatsApp link' },
            {
              key: 'brochureUrl',
              label: 'Official Property Brochure (PDF)',
              type: 'file_upload',
              fileKind: 'brochure',
              accept: '.pdf,application/pdf',
              help: 'Drag & drop property portfolio PDF. Automatically links to the Brochure button on profile.'
            }
          ]
        },
        {
          id: 'skylineAdvisorySec',
          title: 'Advisory Pillars ("How I Can Help")',
          description: 'Steps or services explaining your real estate process.',
          fields: [
            {
              key: 'advisory',
              label: 'Advisory Pillars',
              type: 'repeatable_list',
              itemTitleKey: 'title',
              subfields: [
                { key: 'title', label: 'Pillar Title', type: 'text', placeholder: 'e.g. High-Yield Investment Selection' },
                { key: 'desc', label: 'Description', type: 'textarea', placeholder: 'Detailed walkthrough of the advisory step' }
              ],
              default: [
                { title: 'Market Evaluation', desc: 'Accurate data-driven valuation of high-value residential and commercial assets.' },
                { title: 'Seamless Closing', desc: 'Complete legal title verification, negotiation, and registration support.' }
              ]
            }
          ]
        },
        {
          id: 'skylineReviewsSec',
          title: 'Client Reviews & Testimonials',
          description: 'Client feedback and star ratings.',
          fields: [
            {
              key: 'reviews',
              label: 'Client Reviews',
              type: 'repeatable_list',
              itemTitleKey: 'author',
              subfields: [
                { key: 'author', label: 'Client Name / Designation', type: 'text', placeholder: 'e.g. Mr. R. Khurana, CEO' },
                { key: 'stars', label: 'Stars Rating', type: 'text', placeholder: '★★★★★', default: '★★★★★' },
                { key: 'text', label: 'Review Text', type: 'textarea', placeholder: 'Exceptional transparency and market intelligence.' }
              ]
            }
          ]
        }
      ]
    },

    'atelier': {
      id: 'atelier',
      name: 'Atelier',
      category: 'industry',
      badge: 'Design 14',
      headline: 'Editorial fashion, architecture & interior design card with lookbook gallery, bespoke services, and fitting bookings',
      coreFields: {
        company: { show: true, label: 'Atelier / Fashion house name', placeholder: 'e.g. Maison Celeste', required: true },
        fullName: { show: true, label: 'Creative Director / Couturier', placeholder: 'e.g. Celeste Dubois', required: true },
        designation: { show: true, label: 'Fashion tag / Title', placeholder: 'e.g. Haute Couture & Bespoke Tailoring' },
        description: { show: true, label: 'Atelier design philosophy', placeholder: 'Poetic statement of craftsmanship and artisanal luxury' },
        avatar: { show: true, label: 'Designer portrait or atelier crest', help: 'Editorial square or circular headshot.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'atelierLookbookSec',
          title: 'Lookbook & Collection Gallery',
          description: 'Curated editorial collections displayed in contrasting terracotta and charcoal boxes.',
          fields: [
            {
              key: 'lookbook',
              label: 'Lookbook Showcase',
              type: 'repeatable_list',
              itemTitleKey: 'title',
              subfields: [
                { key: 'title', label: 'Collection / Look Title', type: 'text', placeholder: 'e.g. Autumn / Winter 2026' },
                { key: 'sub', label: 'Subtitle / Materials', type: 'text', placeholder: 'e.g. Raw Silk & Hand-Embroidered Velvet' },
                { key: 'imageUrl', label: 'Lookbook Image', type: 'file_upload', fileKind: 'gallery', accept: 'image/*', help: 'Collection photography or lookbook plate.' }
              ],
              default: [
                { title: 'Bespoke Bridal Couture', sub: 'Hand-dyed French silks and zardozi embroidery' },
                { title: 'Architectural Ready-to-Wear', sub: 'Structured linen and cashmere silhouettes' }
              ]
            }
          ]
        },
        {
          id: 'atelierServicesSec',
          title: 'Bespoke Services & Pricing',
          description: 'Service offerings with indicative investment tier.',
          fields: [
            {
              key: 'services',
              label: 'Services & Pricing',
              type: 'repeatable_list',
              itemTitleKey: 'name',
              subfields: [
                { key: 'name', label: 'Service Name', type: 'text', placeholder: 'e.g. Bridal Consultation & Fitting' },
                { key: 'subtitle', label: 'Starting Price / Timeline', type: 'text', placeholder: 'e.g. From ₹45,000 · 4–6 Weeks' }
              ],
              default: [
                { name: 'Private Consultation & Sketching', subtitle: 'Complimentary by appointment' },
                { name: 'Bespoke Eveningwear', subtitle: 'From ₹65,000' }
              ]
            }
          ]
        },
        {
          id: 'atelierBookingSec',
          title: 'Fitting / Consultation Booking CTA',
          description: 'Configure the primary appointment button for private studio fittings.',
          fields: [
            { key: 'bookingLabel', label: 'Fitting Button Label', type: 'text', placeholder: 'Book a fitting', default: 'Book a fitting' },
            { key: 'bookingUrl', label: 'Booking URL / Calendar Link', type: 'text', placeholder: 'https://cal.com/... or WhatsApp booking link' }
          ]
        }
      ]
    },

    'care-plus': {
      id: 'care-plus',
      name: 'Care Plus',
      category: 'industry',
      badge: 'Design 15',
      headline: 'Doctor & medical practice card with next available consultation slot, treated conditions cloud, and clinic timings',
      coreFields: {
        fullName: { show: true, label: 'Doctor / Practitioner name', placeholder: 'e.g. Dr. Rohan Mehta', required: true },
        designation: { show: true, label: 'Medical qualifications', placeholder: 'e.g. MBBS, MD (Cardiology), FESC' },
        company: { show: true, label: 'Clinical specialty', placeholder: 'e.g. Senior Consultant Interventional Cardiologist' },
        description: { show: true, label: 'Clinical background & bio', placeholder: 'Physician credentials, hospital affiliations, and areas of excellence' },
        avatar: { show: true, label: 'Physician portrait', help: 'Professional medical headshot.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: false, linkedin: true }
      },
      sections: [
        {
          id: 'careConsultationSec',
          title: 'Consultation Availability & Booking',
          description: 'Highlight the next immediate opening and provide direct appointment booking.',
          fields: [
            { key: 'nextSlot', label: 'Next Available Consultation', type: 'text', placeholder: 'e.g. Today at 4:30 PM (OPD Room 3B)', default: 'Today at 4:30 PM' },
            { key: 'bookingLabel', label: 'Booking Button Label', type: 'text', placeholder: 'Book appointment', default: 'Book appointment' },
            { key: 'bookingUrl', label: 'Appointment Booking Link', type: 'text', placeholder: 'https://practo.com/... or WhatsApp appointment link' }
          ]
        },
        {
          id: 'careSpecialtiesSec',
          title: 'Specialties & Conditions Treated',
          description: 'Tags cloud displaying clinical focus areas and treatments.',
          fields: [
            {
              key: 'treatments',
              label: 'Conditions & Treatments Cloud',
              type: 'chips',
              placeholder: 'Type condition and press Enter (e.g. Hypertension, Angioplasty, Preventive Heart Check)'
            }
          ]
        },
        {
          id: 'careTimingsSec',
          title: 'Clinic Timings & OPD Schedule',
          description: 'Structured hours shown in the clinic timings card.',
          fields: [
            {
              key: 'timings',
              label: 'Clinic Timings Details',
              type: 'textarea',
              placeholder: 'e.g. Mon – Sat: 9:00 AM – 1:00 PM, 5:00 PM – 9:00 PM\nSunday: Emergency & On-Call Only'
            }
          ]
        }
      ]
    },

    'roast-and-co': {
      id: 'roast-and-co',
      name: 'Roast & Co.',
      category: 'industry',
      badge: 'Design 16',
      headline: 'Artisan cafe & coffee roastery card with signature coffee menu, digital stamp card loyalty, and WhatsApp ordering',
      coreFields: {
        company: { show: true, label: 'Cafe / Roastery name', placeholder: 'e.g. Roast & Co. Artisan Roasters', required: true },
        fullName: { show: true, label: 'Head Barista / Host', placeholder: 'e.g. Devansh Trivedi' },
        designation: { show: true, label: 'Subtitle / Roastery tagline', placeholder: 'e.g. Specialty Micro-Roasters & Bakery' },
        description: { show: true, label: 'Roastery story & atmosphere', placeholder: 'Ethically sourced single-origin beans, roasted daily on-site' },
        avatar: { show: true, label: 'Cafe logo / Roastery stamp', help: 'Cafe emblem or latte art avatar.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: false }
      },
      sections: [
        {
          id: 'roastBadgesSec',
          title: 'Cafe Badges & Tags',
          description: 'Highlights displayed below the cafe name.',
          fields: [
            {
              key: 'badges',
              label: 'Roastery Badges',
              type: 'chips',
              placeholder: 'Type badge and press Enter (e.g. Single Origin 100% Arabica, Pet Friendly, Free Wi-Fi)'
            }
          ]
        },
        {
          id: 'roastMenuSec',
          title: 'Signature Menu & Full Menu File Upload',
          description: 'Feature your hero beverage items and upload your complete cafe menu PDF or image.',
          fields: [
            {
              key: 'menuFileUrl',
              label: 'Complete Cafe Menu File (PDF or Image)',
              type: 'file_upload',
              fileKind: 'menu',
              accept: '.pdf,image/*',
              help: 'Drag & drop full cafe menu. Connects directly to the Menu button and viewer on profile.'
            },
            {
              key: 'menu',
              label: 'Signature Menu Items',
              type: 'repeatable_list',
              itemTitleKey: 'name',
              subfields: [
                { key: 'name', label: 'Beverage / Item Name', type: 'text', placeholder: 'e.g. Pour Over (Ethiopia Yirgacheffe)' },
                { key: 'price', label: 'Price', type: 'text', placeholder: 'e.g. ₹280' },
                { key: 'sub', label: 'Tasting Notes / Description', type: 'text', placeholder: 'e.g. Bergamot, jasmine, honey sweetness' },
                { key: 'popular', label: 'Highlight as "Popular"', type: 'text', placeholder: 'yes / no or leave empty' }
              ],
              default: [
                { name: 'Cold Brew Reserve', price: '₹240', sub: 'Steeped for 18 hours, smooth dark chocolate finish', popular: 'true' },
                { name: 'Oat Milk Flat White', price: '₹260', sub: 'Double ristretto with micro-foamed oat milk' },
                { name: 'Classic Sourdough Croissant', price: '₹180', sub: 'Cultured French butter, flaky 27 layers' }
              ]
            }
          ]
        },
        {
          id: 'roastLoyaltySec',
          title: 'Digital Roastery Stamp Card / Loyalty Program',
          description: 'Customer loyalty incentive displayed in the roastery stamp box.',
          fields: [
            {
              key: 'loyalty',
              label: 'Loyalty Reward Description',
              type: 'textarea',
              placeholder: 'e.g. Buy 5 handcrafted coffees and get your 6th drink on the house! Tap WhatsApp to view your card stamps.'
            }
          ]
        }
      ]
    },

    'raftcon-luxury': {
      id: 'raftcon-luxury',
      name: 'Raftcon Luxury',
      category: 'industry',
      badge: 'Design 17',
      headline: 'Heavy infrastructure & civil engineering corporate profile with leadership duo, metrics grid, landmark projects, and corporate brochure',
      coreFields: {
        company: { show: true, label: 'Company name', placeholder: 'Raftcon Construction', required: true },
        fullName: { show: true, label: 'Managing Director name', placeholder: 'Tabrez Qureshi', required: true },
        designation: { show: true, label: 'Leadership designation', placeholder: 'Managing Director' },
        description: { show: true, label: 'Company history & capability', placeholder: 'Since 1990, Raftcon has grown into a fully integrated civil engineering company...' },
        avatar: { show: true, label: 'Official brand logo', help: 'Raftcon gold emblem.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: false, linkedin: false }
      },
      sections: [
        {
          id: 'raftconLeadershipSec',
          title: 'Executive Leadership Contacts (Duo)',
          description: 'Primary corporate directors shown in the golden contact cards.',
          fields: [
            {
              key: 'contacts',
              label: 'Executive Directors',
              type: 'repeatable_list',
              itemTitleKey: 'name',
              subfields: [
                { key: 'name', label: 'Director Name', type: 'text', placeholder: 'e.g. Ghulamsarwar Qureshi' },
                { key: 'phone', label: 'Display Phone', type: 'text', placeholder: 'e.g. (+91) 99675-22999' },
                { key: 'rawPhone', label: 'Dialable Phone', type: 'text', placeholder: 'e.g. +919967522999' }
              ],
              default: [
                { name: 'Ghulamsarwar Qureshi', phone: '(+91) 99675-22999', rawPhone: '+919967522999' },
                { name: 'Tabrez Qureshi', phone: '(+91) 90040-00567', rawPhone: '+919004000567' }
              ]
            },
            { key: 'tagline', label: 'Company Tagline', type: 'text', placeholder: 'Crafting Quality, Constructing Futures' },
            { key: 'officePhone', label: 'Head Office Phone', type: 'text', placeholder: '+91 99675 22999' }
          ]
        },
        {
          id: 'raftconMetricsSec',
          title: 'Engineering Metrics & Statistics',
          description: 'Highlights displayed in the 4-quadrant gold statistics grid.',
          fields: [
            {
              key: 'heroMetric',
              label: 'Hero Milestone',
              type: 'key_value_single',
              keyLabel: 'Value (e.g. 35+ Years)',
              valueLabel: 'Label (e.g. Of experience)',
              default: { value: '35+ Years', label: 'Of experience' }
            },
            {
              key: 'metrics',
              label: 'Grid Metrics (4 Boxes)',
              type: 'repeatable_list',
              itemTitleKey: 'label',
              subfields: [
                { key: 'value', label: 'Number / Metric', type: 'text', placeholder: 'e.g. 33+' },
                { key: 'label', label: 'Metric Label', type: 'text', placeholder: 'e.g. Completed projects' }
              ],
              default: [
                { value: '33+', label: 'Completed projects' },
                { value: '07', label: 'Cities' },
                { value: '01', label: 'Ongoing project' },
                { value: '96%', label: 'Customer retention' }
              ]
            }
          ]
        },
        {
          id: 'raftconServicesSec',
          title: 'Civil & Turnkey Services',
          description: 'Interactive capabilities cloud and scope statement.',
          fields: [
            {
              key: 'services',
              label: 'Services Cloud',
              type: 'chips',
              placeholder: 'Type service and press Enter (e.g. Industrial construction, Turnkey projects)'
            },
            {
              key: 'servicesSummary',
              label: 'Services Scope / Summary',
              type: 'textarea',
              placeholder: 'One team for architectural and structural design, RCC, masonry, electrical, plumbing, flooring and interiors.'
            }
          ]
        },
        {
          id: 'raftconProjectsSec',
          title: 'Landmark Projects Portfolio',
          description: 'Featured builds displayed in the project cards.',
          fields: [
            {
              key: 'projects',
              label: 'Showcase Projects',
              type: 'repeatable_list',
              itemTitleKey: 'name',
              subfields: [
                { key: 'name', label: 'Project Name', type: 'text', placeholder: 'e.g. Kataria Motors' },
                { key: 'meta', label: 'Location & Type', type: 'text', placeholder: 'e.g. Piplod, Surat · 2009' }
              ]
            }
          ]
        },
        {
          id: 'raftconCorporateSec',
          title: 'Safety Policy, Mission & Corporate Brochure Upload',
          description: 'Manage safety standards, mission statement, and drag-and-drop 18-page corporate brochure.',
          fields: [
            { key: 'safety', label: 'Safety Policy', type: 'textarea', placeholder: 'Safety is everyone\'s responsibility...' },
            { key: 'mission', label: 'Mission Statement', type: 'textarea', placeholder: 'A skilled workforce, updated technology...' },
            { key: 'footerQuote', label: 'Footer Tagline', type: 'text', placeholder: 'Lets make success stories together' },
            {
              key: 'brochureUrl',
              label: 'Official Corporate Brochure (PDF)',
              type: 'file_upload',
              fileKind: 'brochure',
              accept: '.pdf,application/pdf',
              help: 'Drag & drop updated PDF. Directly connected to the View Brochure button on profile.'
            }
          ]
        }
      ]
    },

    'atg-study-abroad': {
      id: 'atg-study-abroad',
      name: 'ATG Study Abroad',
      category: 'industry',
      badge: 'Design 18',
      headline: 'Global education consultancy profile with study destinations, test prep batches, free guides download, and guidance CTAs',
      coreFields: {
        company: { show: true, label: 'Consultancy name', placeholder: 'Across The Globe (ATG) Study Abroad', required: true },
        fullName: { show: true, label: 'Founder / Lead counselor', placeholder: 'Aamir Shaikh', required: true },
        designation: { show: true, label: 'Role / Designation', placeholder: 'Founder & Overseas Education Specialist' },
        description: { show: true, label: 'Consultancy mission & story', placeholder: 'Across The Globe helps students study abroad with admissions and visa support...' },
        avatar: { show: true, label: 'ATG brand logo / portrait', help: 'ATG brand emblem.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: true }
      },
      sections: [
        {
          id: 'atgIdentitySec',
          title: 'Consultancy Identity & Tagline',
          description: 'Tagline and story heading.',
          fields: [
            { key: 'tagline', label: 'Profile Tagline (Italicized)', type: 'text', placeholder: 'On a mission, with a vision' },
            { key: 'aboutTitle', label: 'About Section Title', type: 'text', placeholder: 'About ATG Study Abroad' },
            { key: 'aboutText', label: 'Detailed About Story', type: 'textarea', placeholder: 'Extended narrative of student successes and global university network' }
          ]
        },
        {
          id: 'atgMetricsSec',
          title: 'Key Performance Metrics (3 Columns)',
          description: 'Core milestones.',
          fields: [
            {
              key: 'metrics',
              label: 'Consultancy Metrics',
              type: 'stats_grid',
              default: [
                { num: '4,000+', label: 'Students guided' },
                { num: '5+', label: 'Study destinations' },
                { num: '5+', label: 'Test prep courses' }
              ]
            }
          ]
        },
        {
          id: 'atgGuidanceSec',
          title: 'Primary Guidance Action Buttons',
          description: 'Lime and dark guidance buttons.',
          fields: [
            { key: 'ctaPrimaryText', label: 'Primary Button Label', type: 'text', placeholder: 'Find out which country suits you' },
            { key: 'ctaPrimaryUrl', label: 'Primary Button URL (Optional)', type: 'text', placeholder: 'Leave empty for automated WhatsApp counselor link' },
            { key: 'ctaWhatsAppText', label: 'WhatsApp Button Label', type: 'text', placeholder: 'Chat on WhatsApp for instant guidance' },
            { key: 'ctaWhatsAppUrl', label: 'WhatsApp Button URL (Optional)', type: 'text', placeholder: 'Leave empty for direct counselor chat' }
          ]
        },
        {
          id: 'atgDestinationsSec',
          title: 'Study Abroad Destinations',
          description: 'Countries with flags, university admissions info, and direct apply link.',
          fields: [
            {
              key: 'destinations',
              label: 'Popular Countries',
              type: 'repeatable_list',
              itemTitleKey: 'country',
              subfields: [
                { key: 'country', label: 'Country Name', type: 'text', placeholder: 'e.g. United Kingdom' },
                { key: 'flag', label: 'Flag Emoji / Icon', type: 'text', placeholder: '🇬🇧' },
                { key: 'programs', label: 'Offered Intakes & Visa Info', type: 'text', placeholder: 'e.g. 1-Year Masters · 2-Year Post-Study Work Visa' },
                { key: 'link', label: 'Inquiry / Country Guide URL', type: 'text', placeholder: 'e.g. https://wa.me/...?text=UK' }
              ],
              default: [
                { country: 'United Kingdom', flag: '🇬🇧', programs: '1-Year Masters · 2-Yr Post-Study Work Visa' },
                { country: 'Australia', flag: '🇦🇺', programs: 'Regional PR Pathways · Top Global Universities' },
                { country: 'Canada', flag: '🇨🇦', programs: 'Affordable Diplomas & PGWP Opportunities' }
              ]
            }
          ]
        },
        {
          id: 'atgTestPrepSec',
          title: 'Test Preparation Batches',
          description: 'IELTS, PTE, TOEFL, GRE, GMAT batches and scoring goals.',
          fields: [
            {
              key: 'testPreps',
              label: 'Test Prep Programs',
              type: 'repeatable_list',
              itemTitleKey: 'exam',
              subfields: [
                { key: 'exam', label: 'Exam Name', type: 'text', placeholder: 'e.g. IELTS Academic' },
                { key: 'score', label: 'Target Band / Score', type: 'text', placeholder: 'e.g. Band 7.5+ Target' },
                { key: 'schedule', label: 'Batch Timings', type: 'text', placeholder: 'e.g. Morning & Evening Online/Offline Batches' },
                { key: 'link', label: 'Enroll / Demo Class Link', type: 'text', placeholder: 'https://wa.me/... or demo link' }
              ],
              default: [
                { exam: 'IELTS Academic', score: 'Band 7.5+ Target', schedule: 'Morning & Evening Batches' },
                { exam: 'PTE Academic', score: '79+ Score Goal', schedule: 'Fast-Track Weekend Batches' }
              ]
            }
          ]
        },
        {
          id: 'atgGuidesSec',
          title: 'Free Admissions Guides & Document Upload',
          description: 'Downloadable student checklists, visa guidelines, and university prospectuses.',
          fields: [
            {
              key: 'freeGuides',
              label: 'Downloadable Guides',
              type: 'repeatable_list',
              itemTitleKey: 'title',
              subfields: [
                { key: 'title', label: 'Guide Title', type: 'text', placeholder: 'e.g. UK Student Visa Checklist 2026' },
                { key: 'size', label: 'File Info', type: 'text', placeholder: 'e.g. PDF · 2.4 MB' },
                { key: 'downloadUrl', label: 'Guide Document (PDF Upload or Link)', type: 'file_upload', fileKind: 'document', accept: '.pdf,application/pdf', help: 'Upload student guide PDF.' }
              ],
              default: [
                { title: 'UK Student Visa Checklist 2026', size: 'PDF · 2.4 MB' },
                { title: 'Top 50 European Public Universities Guide', size: 'PDF · 3.8 MB' }
              ]
            }
          ]
        }
      ]
    },

    'spice-route': {
      id: 'spice-route',
      name: 'Spice Route Restaurant',
      category: 'industry',
      badge: 'Design 19',
      headline: 'Authentic Indian restaurant card with chef\'s signature dishes, drag-and-drop menu upload, table reservation, and dietary badges',
      coreFields: {
        company: { show: true, label: 'Restaurant name', placeholder: 'Spice Route', required: true },
        fullName: { show: true, label: 'Executive Chef / Host', placeholder: 'Master Chef Qureshi' },
        designation: { show: true, label: 'Dining style', placeholder: 'Authentic Gujarati & North Indian Cuisine' },
        description: { show: true, label: 'Restaurant story & culinary heritage', placeholder: 'Slow-cooked Gujarati and North Indian food, made fresh every day.' },
        avatar: { show: true, label: 'Restaurant logo / Emblem', help: 'Terracotta-framed restaurant badge.' },
        contacts: { phone: true, whatsapp: true, email: true, website: true, address: true },
        social: { instagram: true, linkedin: false }
      },
      sections: [
        {
          id: 'spiceIdentitySec',
          title: 'Restaurant Identity & Badges',
          description: 'Header text and status badges.',
          fields: [
            { key: 'overline', label: 'Overline Badge Text', type: 'text', placeholder: '— Family restaurant —', default: '— Family restaurant —' },
            { key: 'restaurantName', label: 'Display Restaurant Name', type: 'text', placeholder: 'Spice Route' },
            { key: 'tagline', label: 'Culinary Subtitle / Tagline', type: 'text', placeholder: 'Slow-cooked Gujarati and North Indian food, made fresh every day.' },
            {
              key: 'badges',
              label: 'Dining Badges',
              type: 'chips',
              placeholder: 'Type badge and press Enter (e.g. Open till 11 pm, ★ 4.5, Family seating)'
            }
          ]
        },
        {
          id: 'spiceMenuUploadSec',
          title: 'Full Menu Button & Drag-and-Drop Menu File Upload',
          description: 'Upload your complete menu document or PDF. When uploaded, the "View menu" button directly opens this file.',
          fields: [
            {
              key: 'menuFileUrl',
              label: 'Complete Restaurant Menu (PDF or High-Res Image)',
              type: 'file_upload',
              fileKind: 'menu',
              accept: '.pdf,image/*',
              help: 'Drag & drop your full food & drinks menu. Directly connects to the "View menu" button on the customer card.'
            }
          ]
        },
        {
          id: 'spiceSignaturesSec',
          title: 'Chef\'s Signatures (Live Menu Highlights)',
          description: 'Signature dishes displayed with dietary veg/non-veg indicator, description, and price.',
          fields: [
            { key: 'menuTitle', label: 'Menu Section Heading', type: 'text', placeholder: 'Chef\'s signatures', default: 'Chef\'s signatures' },
            {
              key: 'menuItems',
              label: 'Signature Dishes',
              type: 'repeatable_list',
              itemTitleKey: 'name',
              subfields: [
                { key: 'name', label: 'Dish Name', type: 'text', placeholder: 'e.g. Paneer Lababdar' },
                { key: 'desc', label: 'Preparation / Ingredients', type: 'text', placeholder: 'e.g. Creamy tomato gravy, house butter' },
                { key: 'price', label: 'Price (with symbol)', type: 'text', placeholder: 'e.g. ₹320' },
                { key: 'isVeg', label: 'Vegetarian Dish?', type: 'select', options: [{ label: 'Vegetarian (Green Dot)', value: 'true' }, { label: 'Non-Vegetarian (Brown Dot)', value: 'false' }], default: 'true' }
              ],
              default: [
                { name: 'Paneer Lababdar', desc: 'Creamy tomato gravy, house butter', price: '₹320', isVeg: 'true' },
                { name: 'Dal Tadka Special', desc: 'Smoked and finished with pure ghee', price: '₹220', isVeg: 'true' },
                { name: 'Chicken Dum Biryani', desc: 'Slow-cooked, served with raita', price: '₹360', isVeg: 'false' },
                { name: 'Kesar Phirni', desc: 'Saffron cardamom dessert, set in clay', price: '₹140', isVeg: 'true' }
              ]
            }
          ]
        },
        {
          id: 'spiceDiningSec',
          title: 'Dining Options & Amenities',
          description: 'Available seating and service styles.',
          fields: [
            { key: 'diningOptionsTitle', label: 'Amenities Section Title', type: 'text', placeholder: 'Dining options', default: 'Dining options' },
            {
              key: 'diningOptions',
              label: 'Amenities Chips',
              type: 'chips',
              placeholder: 'Type option and press Enter (e.g. Dine-in, Takeaway, Family seating, Valet parking)'
            }
          ]
        },
        {
          id: 'spiceHoursSec',
          title: 'Dining Hours & Booking Policy',
          description: 'Meal hours and reservation notice.',
          fields: [
            { key: 'hoursTitle', label: 'Hours Heading', type: 'text', placeholder: 'Opening hours', default: 'Opening hours' },
            {
              key: 'hoursList',
              label: 'Service Shifts',
              type: 'key_value_list',
              keyLabel: 'Shift (e.g. Lunch / Dinner)',
              valueLabel: 'Timings (e.g. 12 pm to 3 pm)',
              default: [
                { days: 'Lunch', time: '12 pm to 3 pm' },
                { days: 'Dinner', time: '7 pm to 11 pm' },
                { days: 'Saturday & Sunday', time: '12 pm to 11:30 pm' }
              ]
            },
            { key: 'hoursNotice', label: 'Reservation Notice', type: 'textarea', placeholder: 'Tables for six or more: please book a day ahead.' }
          ]
        },
        {
          id: 'spiceReviewsSec',
          title: 'Guest Reviews & Praise',
          description: 'Customer dining testimonials.',
          fields: [
            {
              key: 'reviews',
              label: 'Guest Quotes',
              type: 'repeatable_list',
              itemTitleKey: 'author',
              subfields: [
                { key: 'quote', label: 'Review Quote', type: 'textarea', placeholder: 'Food tastes like home. The dal tadka is unforgettable.' },
                { key: 'author', label: 'Guest Name / City', type: 'text', placeholder: 'e.g. Amit K., Food Critic' }
              ]
            }
          ]
        },
        {
          id: 'spiceActionsSec',
          title: 'Quick Actions 2x2 Grid',
          description: 'Customize the 4 prominent action tiles.',
          fields: [
            {
              key: 'quickActions',
              label: '2x2 Action Buttons',
              type: 'repeatable_list',
              itemTitleKey: 'label',
              subfields: [
                { key: 'label', label: 'Button Label', type: 'text', placeholder: 'e.g. Book a table' },
                { key: 'url', label: 'Action URL / Anchor', type: 'text', placeholder: 'e.g. #menu or WhatsApp link' }
              ]
            }
          ]
        }
      ]
    }
  };

  // Helper to resolve config by any ID or name
  function getDesignEditorConfig(rawIdOrName) {
    if (!rawIdOrName) return CONFIGS['mint-haven'];
    var clean = String(rawIdOrName).trim().toLowerCase();
    
    // Direct ID match
    if (CONFIGS[clean]) return CONFIGS[clean];

    // Name match
    var keys = Object.keys(CONFIGS);
    for (var i = 0; i < keys.length; i++) {
      if (CONFIGS[keys[i]].name.toLowerCase() === clean) {
        return CONFIGS[keys[i]];
      }
    }

    // Common aliases
    if (clean.includes('raftcon')) return CONFIGS['raftcon-luxury'];
    if (clean.includes('atg') || clean.includes('study')) return CONFIGS['atg-study-abroad'];
    if (clean.includes('spice')) return CONFIGS['spice-route'];
    if (clean.includes('roast')) return CONFIGS['roast-and-co'];
    if (clean.includes('skyline') || clean.includes('estate')) return CONFIGS['skyline'];
    if (clean.includes('atelier') || clean.includes('interior')) return CONFIGS['atelier'];
    if (clean.includes('care') || clean.includes('doctor') || clean.includes('medical')) return CONFIGS['care-plus'];
    if (clean.includes('bento')) return CONFIGS['bento-grid'];
    if (clean.includes('glass')) return CONFIGS['glass-aurora'];
    if (clean.includes('foil')) return CONFIGS['luxe-foil'];
    if (clean.includes('navy')) return CONFIGS['classic-navy'];
    if (clean.includes('mint-haven') || clean === 'mint') return CONFIGS['mint-haven'];
    if (clean.includes('fresh-mint')) return CONFIGS['fresh-mint'];
    if (clean.includes('bold-pop') || clean.includes('pop')) return CONFIGS['bold-pop'];
    if (clean.includes('noir') || clean.includes('gold')) return CONFIGS['noir-gold'];
    if (clean.includes('emerald') || clean.includes('ivory')) return CONFIGS['emerald-ivory'];
    if (clean.includes('neon') || clean.includes('pulse')) return CONFIGS['neon-pulse'];
    if (clean.includes('mono')) return CONFIGS['mono-studio'];
    if (clean.includes('evergreen')) return CONFIGS['evergreen'];

    return CONFIGS['mint-haven'];
  }

  var API = {
    CONFIGS: CONFIGS,
    getDesignEditorConfig: getDesignEditorConfig
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
  } else {
    global.DESIGN_EDITOR_REGISTRY = API;
  }
})(typeof window !== 'undefined' ? window : this);
