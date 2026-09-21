'use client';

import React, { useState } from 'react';

interface Project {
  id: string;
  category: 'websites' | 'brand' | 'cards';
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  challenge: string;
  solution: string;
  deliverables: string[];
  tech: string[];
}

const projects: Project[] = [
  {
    id: 'zaika',
    category: 'websites',
    title: 'Zaika Gourmet Dining',
    subtitle: 'Fine dining contemporary Indian cuisine restaurant website.',
    image: '/assets/project-restaurant.jpg',
    badge: 'Custom Website Concept',
    challenge: 'Local diners couldn’t view real-time reservation availability or high-res menus on mobile devices.',
    solution: 'Engineered an ultra-fast, responsive menu and direct WhatsApp table booking integration.',
    deliverables: ['Responsive Web Design', 'Interactive Digital Menu', 'WhatsApp Table Booking', 'Local SEO & Maps'],
    tech: ['Next.js', 'Emerald Prestige UI', 'WhatsApp API', 'Schema.org'],
  },
  {
    id: 'aura',
    category: 'brand',
    title: 'Aura Hair & Skin Studio',
    subtitle: 'Luxury aesthetic salon & wellness brand visual identity.',
    image: '/assets/project-salon.jpg',
    badge: 'Brand Identity Concept',
    challenge: 'Existing branding felt generic and failed to attract premium bridal & skin therapy clients.',
    solution: 'Curated a bespoke gold & emerald palette, editorial typography, and high-converting service catalog.',
    deliverables: ['Logo & Visual Guidelines', 'Service Menu Cards', 'Instagram Brand Kit', 'Appointment Booking Flow'],
    tech: ['Brand Architecture', 'Figma', 'Typography System'],
  },
  {
    id: 'primehabitat',
    category: 'websites',
    title: 'PrimeHabitat Residences',
    subtitle: 'Luxury residential property & architectural developments.',
    image: '/assets/project-estate.jpg',
    badge: 'Real Estate Portal',
    challenge: 'Home buyers had low engagement on standard listing portals without immersive floorplans.',
    solution: 'Designed an editorial gallery showcase with instant brochure download and WhatsApp agent inquiry.',
    deliverables: ['Project Showcase Web', 'Digital Brochure PDFs', 'Lead Capture Funnel', 'Virtual Tour Embeds'],
    tech: ['Next.js', 'Fluid CSS Grid', 'CRM Webhook'],
  },
  {
    id: 'drmehta',
    category: 'websites',
    title: 'Dr. Mehta Dental Care',
    subtitle: 'State-of-the-art multispeciality dental clinic.',
    image: '/assets/project-clinic.jpg',
    badge: 'Healthcare Website',
    challenge: 'Patients struggled to identify dental procedures and book suitable appointment slots.',
    solution: 'Crafted a calming, trust-building patient portal with procedure explainers and doctor credentials.',
    deliverables: ['Clinic Patient Website', 'Doctor Credentials Matrix', 'One-Click Consultation Booking', 'Google Maps Optimization'],
    tech: ['HIPAA-conscious UI', 'Fast CDN', 'Meta Ads Integration'],
  },
  {
    id: 'ironforge',
    category: 'cards',
    title: 'IronForge Fitness Studio',
    subtitle: 'Elite personal training gym & athletic performance center.',
    image: '/assets/project-gym.jpg',
    badge: 'Metal NFC & Profile',
    challenge: 'Trainers kept handing out paper cards that clients lost within days.',
    solution: 'Supplied engraved matte-black metal NFC cards with an instant digital booking profile.',
    deliverables: ['Laser Engraved Metal NFC Cards', 'Trainer Digital Profiles', 'Trial Class Booking Link', 'Trainer Roster Sync'],
    tech: ['NFC Tag 215', 'Dynamic Profile URL', 'Contact vCard'],
  },
  {
    id: 'zari',
    category: 'brand',
    title: 'Zari Thread & Couture',
    subtitle: 'Bespoke bridal wear & handcrafted textile boutique.',
    image: '/assets/project-fashion.jpg',
    badge: 'Luxury Branding',
    challenge: 'Lacked a cohesive premium brand language for high-ticket bridal consultations.',
    solution: 'Created royal heritage typography, custom packaging collateral, and an invitation-only landing page.',
    deliverables: ['Bespoke Logo Mark', 'Packaging & Tag System', 'Private Consultation Page', 'Social Ads Creative'],
    tech: ['Vector Crafting', 'Next.js', 'Editorial Layouts'],
  },
  {
    id: 'apex',
    category: 'cards',
    title: 'Apex Financial Advisory',
    subtitle: 'Wealth management & tax compliance consultancy.',
    image: '/assets/project-consultant.jpg',
    badge: 'Executive Metal NFC',
    challenge: 'Financial partners needed to project authority instantly during high-stakes client meetings.',
    solution: 'Deployed luxury gold-finish metal NFC business cards synced to verified portfolio profiles.',
    deliverables: ['Executive Gold NFC Cards', 'Encrypted vCard Download', 'Meeting Schedule Direct Link', 'Analytics Tracking'],
    tech: ['Hardware NFC Tag', 'Dynamic Web App', 'vCard Protocol'],
  },
  {
    id: 'sparkclean',
    category: 'websites',
    title: 'SparkClean Solutions',
    subtitle: 'Commercial facility management & hygiene services.',
    image: '/assets/project-cleaning.jpg',
    badge: 'Lead Generation Web',
    challenge: 'Corporate clients needed customized quote estimates before scheduling cleaning audits.',
    solution: 'Built an interactive quote estimator funnel that routes qualified leads directly to the sales desk.',
    deliverables: ['Instant Quote Estimator', 'Commercial Service Pages', 'Google Local Map Prominence', 'Trust & Insurance Badges'],
    tech: ['Next.js App Router', 'Lead Validation', 'Instant WhatsApp Alert'],
  },
];

export default function PortfolioGallery({ initialCategory = 'all' }: { initialCategory?: string }) {
  const [activeFilter, setActiveFilter] = useState<string>(initialCategory);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <div>
      {/* Category Filter Bar */}
      <div className="work-filter-bar">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Concepts ({projects.length})
        </button>
        <button
          className={`filter-btn ${activeFilter === 'websites' ? 'active' : ''}`}
          onClick={() => setActiveFilter('websites')}
        >
          Custom Websites
        </button>
        <button
          className={`filter-btn ${activeFilter === 'brand' ? 'active' : ''}`}
          onClick={() => setActiveFilter('brand')}
        >
          Brand Identity
        </button>
        <button
          className={`filter-btn ${activeFilter === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveFilter('cards')}
        >
          Digital + NFC Cards
        </button>
      </div>

      {/* Projects Grid */}
      <div className="portfolio-grid">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="portfolio-card fade-in-up"
            onClick={() => setSelectedProject(project)}
          >
            <div className="portfolio-img-wrap">
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="portfolio-badge-pill">{project.badge}</div>
            </div>
            <div className="portfolio-info">
              <span className="portfolio-cat">Concept Showcase &bull; AbrosStudio</span>
              <h3 className="portfolio-title">{project.title}</h3>
              <p className="portfolio-desc">{project.subtitle}</p>
              <div className="portfolio-view-link">
                <span>Explore Concept</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Project Detail Modal */}
      {selectedProject && (
        <div
          className="modal-backdrop active"
          onClick={() => setSelectedProject(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalProjectTitle"
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setSelectedProject(null)}
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="modal-visual-frame">
              <img src={selectedProject.image} alt={selectedProject.title} />
            </div>

            <div className="modal-content-body">
              <div className="modal-tag">{selectedProject.badge}</div>
              <h3 className="modal-title" id="modalProjectTitle">{selectedProject.title}</h3>
              <p className="modal-desc">{selectedProject.subtitle}</p>

              <div className="modal-meta-grid">
                <div className="modal-meta-box">
                  <h5>Client Challenge</h5>
                  <p>{selectedProject.challenge}</p>
                </div>
                <div className="modal-meta-box">
                  <h5>Strategic Solution</h5>
                  <p>{selectedProject.solution}</p>
                </div>
              </div>

              <div className="modal-deliverables">
                <h5>Key Deliverables</h5>
                <ul>
                  {selectedProject.deliverables.map((item, idx) => (
                    <li key={idx}>
                      <span className="check">&check;</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="modal-tech-stack" style={{ marginTop: '24px' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                  Execution Capabilities
                </h5>
                <div className="tech-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProject.tech.map((tag, idx) => (
                    <span
                      key={idx}
                      className="tech-tag"
                      style={{
                        padding: '4px 12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-actions-bar" style={{ marginTop: '28px' }}>
                <a
                  href="https://wa.me/919998441519?text=Hi%20AbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99m%20interested%20in%20a%20concept%20similar%20to%20your%20showcase."
                  className="btn btn-primary btn-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Inquire About Similar Project</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
