import React from 'react';
import Link from 'next/link';
import DigitalCard from '@/components/DigitalCard';
import NfcDualTrack from '@/components/NfcDualTrack';
import TestimonialSlider from '@/components/TestimonialSlider';

export default function HomePage() {
  const demoWhatsAppUrl =
    'https://wa.me/919998441519?text=Hi%20AbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services%20and%20discuss%20my%20requirements.';

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content fade-in-up">
              <div className="badge-wrapper">
                <span className="badge-pill">
                  <span className="badge-pulse" />
                  Premium Digital Agency &bull; Surat, Gujarat
                </span>
              </div>

              <h1 className="hero-title">
                Crafted With Purpose.{' '}
                <span className="text-gradient">Built to Win Customers.</span>
              </h1>

              <p className="hero-desc">
                We craft bespoke, high-converting websites, targeted Meta ad campaigns, and luxury metal NFC business cards for ambitious Indian businesses that refuse to look average.
              </p>

              <div className="hero-actions">
                <a
                  href={demoWhatsAppUrl}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Book a Demo (WhatsApp)</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
                <Link href="/work" className="btn btn-secondary">
                  <span>Explore Selected Work</span>
                </Link>
              </div>

              <div className="hero-trust-bar">
                <div className="trust-item">
                  <span className="trust-icon">&#10003;</span>
                  <span>7–14 Day Delivery</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">&#10003;</span>
                  <span>Direct Founder Access</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">&#10003;</span>
                  <span>Zero Bloatware</span>
                </div>
              </div>
            </div>

            <div className="hero-visual fade-in-up">
              <div className="hero-showcase-frame">
                <div className="frame-header">
                  <div className="frame-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <div className="frame-url">abrosstudio.com/client-showcase</div>
                </div>
                <div className="frame-body">
                  <img
                    src="/assets/project-restaurant.jpg"
                    alt="Zaika Gourmet Dining Concept by AbrosStudio"
                  />
                </div>
              </div>

              <div className="floating-chip chip-1">
                <div className="chip-icon">⚡</div>
                <div className="chip-text">
                  <span className="chip-title">Ultra-Fast Load</span>
                  <span className="chip-sub">Score 99/100</span>
                </div>
              </div>

              <div className="floating-chip chip-2">
                <div className="chip-icon">💎</div>
                <div className="chip-text">
                  <span className="chip-title">Emerald Prestige</span>
                  <span className="chip-sub">Bespoke Aesthetic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Grid */}
      <section className="section" id="servicesOverview">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Core Studio Capabilities</span>
            <h2>Everything Your Brand Needs to Dominate Online</h2>
            <p className="section-subtitle">
              We focus strictly on the digital touchpoints that generate measurable prestige, trust, and paying inquiries for your business.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <span className="service-number">01</span>
              <div className="service-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="service-title">Custom Business Websites</h3>
              <p className="service-text">
                Bespoke websites hand-crafted to establish instant authority. Ultra-fast page speeds, mobile-first responsiveness, and direct WhatsApp lead capture funnels.
              </p>
              <Link href="/services#webDesign" className="service-link">
                <span>Discover Web Services &rarr;</span>
              </Link>
            </div>

            <div className="service-card">
              <span className="service-number">02</span>
              <div className="service-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 4.24 4.24" />
                  <path d="m14.83 9.17 4.24-4.24" />
                  <path d="m14.83 14.83 4.24 4.24" />
                  <path d="m9.17 14.83-4.24 4.24" />
                </svg>
              </div>
              <h3 className="service-title">Targeted Meta Ad Campaigns</h3>
              <p className="service-text">
                Laser-focused Instagram &amp; Facebook advertising tailored for local Indian business markets. Proven creatives, localized copy, and zero ad spend waste.
              </p>
              <Link href="/services#leadGen" className="service-link">
                <span>Discover Meta Ad Systems &rarr;</span>
              </Link>
            </div>

            <div className="service-card highlight-card">
              <span className="service-number">03</span>
              <div className="service-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="17" y2="8" />
                  <line x1="7" y1="12" x2="13" y2="12" />
                </svg>
              </div>
              <h3 className="service-title">Metal NFC &amp; Digital Cards</h3>
              <p className="service-text">
                Leave traditional paper cards in the past. Luxury engraved metal NFC cards paired with dynamic digital web profiles to share your contact with one tap.
              </p>
              <Link href="/services#digitalCards" className="service-link">
                <span>Discover Card Solutions &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contactless Networking: Dual NFC + 3D Interactive Card */}
      <section className="section card-feature-section" id="digitalCardFeature">
        <div className="container">
          <div className="card-showcase-grid">
            <div className="card-explainer fade-in-up">
              <span className="kicker">Smart Contactless Networking</span>
              <h2>Physical Metal NFC Card + Digital Profile</h2>
              <p className="lead">
                AbrosStudio offers both premium laser-engraved metal NFC cards for in-person authority, and instantly shareable digital profile links for any device.
              </p>

              {/* Dual Pathways Component */}
              <NfcDualTrack />

              <div>
                <Link href="/services#digitalCards" className="btn btn-secondary">
                  <span>Explore Metal NFC &amp; Digital Cards</span>
                </Link>
              </div>
            </div>

            {/* The 3D Interactive Card Scene */}
            <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <DigitalCard />
            </div>
          </div>
        </div>
      </section>

      {/* Selected Work Highlights */}
      <section className="section" id="selectedWork">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Demonstrated Excellence</span>
            <h2>Concept Projects &amp; Visual Showcases</h2>
            <p className="section-subtitle">
              Explore how we apply our Emerald Prestige design philosophy across diverse Indian retail, hospitality, luxury, and professional services.
            </p>
          </div>

          <div className="portfolio-grid">
            <div className="portfolio-card fade-in-up">
              <div className="portfolio-img-wrap">
                <img src="/assets/project-restaurant.jpg" alt="Zaika Gourmet Dining" />
                <div className="portfolio-badge-pill">Hospitality &amp; Dining</div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-cat">Custom Website &bull; Concept</span>
                <h3 className="portfolio-title">Zaika Gourmet Dining</h3>
                <p className="portfolio-desc">Fine dining contemporary Indian cuisine website with interactive menu &amp; instant WhatsApp table reservations.</p>
                <Link href="/work" className="portfolio-view-link">
                  <span>View Concept Project &rarr;</span>
                </Link>
              </div>
            </div>

            <div className="portfolio-card fade-in-up">
              <div className="portfolio-img-wrap">
                <img src="/assets/project-salon.jpg" alt="Aura Hair & Skin Studio" />
                <div className="portfolio-badge-pill">Luxury Aesthetics</div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-cat">Brand Identity &bull; Concept</span>
                <h3 className="portfolio-title">Aura Hair &amp; Skin Studio</h3>
                <p className="portfolio-desc">High-end salon visual branding, service menu architecture, and digital booking touchpoints in gold &amp; emerald.</p>
                <Link href="/work" className="portfolio-view-link">
                  <span>View Concept Project &rarr;</span>
                </Link>
              </div>
            </div>

            <div className="portfolio-card fade-in-up">
              <div className="portfolio-img-wrap">
                <img src="/assets/project-estate.jpg" alt="PrimeHabitat Residences" />
                <div className="portfolio-badge-pill">Real Estate &bull; Gujarat</div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-cat">Web Portal &bull; Concept</span>
                <h3 className="portfolio-title">PrimeHabitat Residences</h3>
                <p className="portfolio-desc">Architectural residential development showcase with brochure downloads and direct sales desk routing.</p>
                <Link href="/work" className="portfolio-view-link">
                  <span>View Concept Project &rarr;</span>
                </Link>
              </div>
            </div>

            <div className="portfolio-card fade-in-up">
              <div className="portfolio-img-wrap">
                <img src="/assets/project-gym.jpg" alt="IronForge Fitness Studio" />
                <div className="portfolio-badge-pill">Metal NFC System</div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-cat">Smart Networking &bull; Concept</span>
                <h3 className="portfolio-title">IronForge Fitness Studio</h3>
                <p className="portfolio-desc">Laser-engraved matte metal NFC cards connecting clients directly to personal trainer profiles and class bookings.</p>
                <Link href="/work" className="portfolio-view-link">
                  <span>View Concept Project &rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/work" className="btn btn-secondary">
              <span>View All 8 Concept Case Studies &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The Studio Standard (4-Step Process) */}
      <section className="section" id="process">
        <div className="container">
          <div className="section-header">
            <span className="kicker">How We Deliver</span>
            <h2>The Studio Standard: 4 Phases to Prestige</h2>
            <p className="section-subtitle">
              A transparent, structured workflow engineered for velocity, zero ambiguity, and flawless execution.
            </p>
          </div>

          <div className="process-grid">
            <div className="process-card">
              <div className="process-step-num">Phase 01</div>
              <h3 className="process-title">Discovery &amp; Strategy</h3>
              <p className="process-text">
                We analyze your business model, target clientele, competitors in your market, and the exact conversion action you want visitors to take.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">Phase 02</div>
              <h3 className="process-title">Bespoke Design</h3>
              <p className="process-text">
                We craft custom visual layouts using our curated Emerald Prestige aesthetic. Zero templates, zero off-the-shelf themes.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">Phase 03</div>
              <h3 className="process-title">High-Performance Build</h3>
              <p className="process-text">
                We develop clean, production-ready code with responsive precision, rapid page load optimization, and seamless WhatsApp integration.
              </p>
            </div>

            <div className="process-card">
              <div className="process-step-num">Phase 04</div>
              <h3 className="process-title">Launch &amp; Scale</h3>
              <p className="process-text">
                We deploy your digital assets, configure domain DNS, launch targeted Meta ad campaigns, and deliver your custom metal NFC cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Feedback Slider */}
      <section className="section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Client Confidence</span>
            <h2>What Local Business Owners Say</h2>
            <p className="section-subtitle">
              Feedback from business leaders who partnered with AbrosStudio to elevate their digital brand image.
            </p>
          </div>

          <TestimonialSlider />
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="final-cta-card">
            <span className="kicker">Ready to Stand Out?</span>
            <h2>Transform How Customers Perceive Your Brand</h2>
            <p className="lead" style={{ maxWidth: '640px', margin: '14px auto 32px' }}>
              Schedule a direct consultation with founder Anas Shaikh to explore how a custom website, Meta ad campaign, or metal NFC cards can elevate your business.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <a
                href={demoWhatsAppUrl}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Book a Demo (WhatsApp)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <Link href="/contact" className="btn btn-secondary">
                <span>View Contact Information</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
