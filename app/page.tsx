import React from 'react';
import Link from 'next/link';
import DigitalCard from '@/components/DigitalCard';
import NfcDualTrack from '@/components/NfcDualTrack';
import TestimonialSlider from '@/components/TestimonialSlider';

export default function HomePage() {
  const demoWhatsAppUrl =
    'https://wa.me/919998441519?text=Hi%20AmbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services%20and%20discuss%20my%20requirements.';

  return (
    <>
      {/* 1. HERO SECTION — Deep Emerald Authority */}
      <section className="hero section-emerald">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="badge-wrapper">
                <span className="badge-pill">
                  <span className="badge-pulse" />
                  Premium Digital Agency
                </span>
              </div>

              <h1 className="hero-title">
                Build Your Professional{' '}
                <span className="text-gold">Website Now</span>
              </h1>

              <p className="hero-desc">
                We craft bespoke, high-converting websites, targeted Meta ad campaigns, and luxury metal NFC business cards<span className="desktop-only-copy"> for ambitious businesses that refuse to look average</span>.
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
                  <span>Zero Bloatware</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-showcase-frame">
                <div className="frame-header">
                  <div className="frame-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <div className="frame-url">ambrosstudio.com/client-showcase</div>
                </div>
                <div className="frame-body">
                  <img
                    src="/assets/project-restaurant.jpg"
                    alt="Zaika Gourmet Dining Concept by Ambros Studio"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES OVERVIEW — Warm Ivory Breathing Space */}
      <section className="section section-ivory" id="servicesOverview">
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
              <div className="service-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="service-title">Professional Website Designing</h3>
              <p className="service-text">
                Bespoke websites hand-crafted to establish instant authority. Ultra-fast page speeds, mobile-first responsiveness, and direct WhatsApp lead capture funnels.
              </p>
              <Link href="/services#webDesign" className="service-link">
                <span>Discover Web Services &rarr;</span>
              </Link>
            </div>

            <div className="service-card">
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

            <div className="service-card">
              <div className="service-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="17" y2="8" />
                  <line x1="7" y1="12" x2="13" y2="12" />
                </svg>
              </div>
              <h3 className="service-title">Digital Visiting Card</h3>
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

      {/* 3. WHY IT MATTERS — Deep Emerald Editorial Statement */}
      <section className="section section-emerald" id="whyItMatters">
        <div className="container">
          <div className="section-header" style={{ maxWidth: '820px' }}>
            <span className="kicker">Why It Matters</span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)', lineHeight: 1.15 }}>
              Local buyers judge you before they call you
            </h2>
            <p className="section-subtitle">
              Consumers judge your business within seconds of searching online. A high-grade digital presence converts casual searches into footfall and qualified inquiries.
            </p>
          </div>

          <div className="why-pillars-grid">
            <div className="why-pillar-item">
              <h4>First impressions form fast</h4>
              <p>
                Most visitors decide whether a business looks credible within seconds of landing on a site &mdash; before reading a single word of copy.
              </p>
            </div>

            <div className="why-pillar-item">
              <h4>Mobile is the default</h4>
              <p>
                The vast majority of local searches happen on a smartphone. We design so calling or messaging takes just one tap, not three.
              </p>
            </div>

            <div className="why-pillar-item">
              <h4>Ads that reach real buyers</h4>
              <p>
                We target people physically present near your business, so marketing expenditure converts into real-world footfall rather than vanity impressions.
              </p>
            </div>

            <div className="why-pillar-item">
              <h4>A card that doesn&rsquo;t get lost</h4>
              <p>
                Paper cards end up forgotten in drawers. A digital metal profile stays permanently saved in contacts along with your portfolio and links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SAMPLE WORK — Soft Ivory Gallery Showcase */}
      <section className="section section-ivory-soft" id="selectedWork">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Sample Work</span>
            <h2>Design concepts across Indian retail &amp; hospitality</h2>
            <p className="section-subtitle">
              These are studio-built sample concepts used to demonstrate our design range, not live client engagements. Ask us for references from active projects.
            </p>
          </div>

          <div className="portfolio-grid">
            <Link href="/work" className="portfolio-card">
              <div className="portfolio-img-wrap">
                <img src="/assets/project-restaurant.jpg" alt="Zaika Gourmet Dining Concept" />
                <div className="portfolio-badge-pill">Hospitality &bull; Concept</div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-cat">Custom Website &bull; Concept</span>
                <h3 className="portfolio-title">Zaika Gourmet Dining</h3>
                <p className="portfolio-desc">Fine dining contemporary Indian cuisine website with interactive menu &amp; instant WhatsApp table reservations.</p>
                <div className="portfolio-view-link">
                  <span>View Concept Project &rarr;</span>
                </div>
              </div>
            </Link>

            <Link href="/work" className="portfolio-card">
              <div className="portfolio-img-wrap">
                <img src="/assets/project-salon.jpg" alt="Aura Hair & Skin Studio Concept" />
                <div className="portfolio-badge-pill">Luxury Aesthetics &bull; Concept</div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-cat">Brand Identity &bull; Concept</span>
                <h3 className="portfolio-title">Aura Hair &amp; Skin Studio</h3>
                <p className="portfolio-desc">High-end salon visual branding, service menu architecture, and digital booking touchpoints in gold &amp; emerald.</p>
                <div className="portfolio-view-link">
                  <span>View Concept Project &rarr;</span>
                </div>
              </div>
            </Link>

            <Link href="/work" className="portfolio-card">
              <div className="portfolio-img-wrap">
                <img src="/assets/project-estate.jpg" alt="PrimeHabitat Residences Concept" />
                <div className="portfolio-badge-pill">Real Estate &bull; Concept</div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-cat">Web Portal &bull; Concept</span>
                <h3 className="portfolio-title">PrimeHabitat Residences</h3>
                <p className="portfolio-desc">Architectural residential development showcase with brochure downloads and direct sales desk routing.</p>
                <div className="portfolio-view-link">
                  <span>View Concept Project &rarr;</span>
                </div>
              </div>
            </Link>

            <Link href="/work" className="portfolio-card">
              <div className="portfolio-img-wrap">
                <img src="/assets/project-gym.jpg" alt="IronForge Fitness Studio Concept" />
                <div className="portfolio-badge-pill">Smart Networking &bull; Concept</div>
              </div>
              <div className="portfolio-info">
                <span className="portfolio-cat">NFC System &bull; Concept</span>
                <h3 className="portfolio-title">IronForge Fitness Studio</h3>
                <p className="portfolio-desc">Laser-engraved matte metal NFC cards connecting clients directly to personal trainer profiles and class bookings.</p>
                <div className="portfolio-view-link">
                  <span>View Concept Project &rarr;</span>
                </div>
              </div>
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/work" className="btn btn-secondary">
              <span>Explore All Studio Concepts &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SMART CONTACTLESS NETWORKING — Warm Ivory Physical Product Presentation */}
      <section className="section section-ivory card-feature-section" id="digitalCardFeature">
        <div className="container">
          <div className="card-showcase-grid">
            <div className="card-explainer">
              <span className="kicker">Smart Contactless Networking</span>
              <h2>Physical Metal NFC Card + Digital Profile</h2>
              <p className="lead" style={{ color: 'var(--text-light-muted)' }}>
                Ambros Studio delivers both premium laser-engraved metal NFC cards for in-person authority, and instantly shareable digital profile links for any device.
              </p>

              {/* Dual Pathways Component */}
              <NfcDualTrack />

              <div style={{ marginTop: '24px' }}>
                <Link href="/services#digitalCards" className="btn btn-secondary">
                  <span>Explore Metal NFC Solutions</span>
                </Link>
              </div>
            </div>

            {/* The 3D Interactive Card Scene */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <DigitalCard />
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE STUDIO STANDARD (PROCESS) — Soft Ivory */}
      <section className="section section-ivory-soft" id="process">
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
              <h3 className="process-title">Discovery &amp; Strategy</h3>
              <p className="process-text">
                We analyze your business model, target clientele, competitors in your market, and the exact conversion action you want visitors to take.
              </p>
            </div>

            <div className="process-card">
              <h3 className="process-title">Bespoke Design</h3>
              <p className="process-text">
                We craft custom visual layouts with intentional typography, whitespace, and art direction. Zero generic templates.
              </p>
            </div>

            <div className="process-card">
              <h3 className="process-title">High-Performance Build</h3>
              <p className="process-text">
                We develop clean, production-ready code with responsive precision, rapid page load optimization, and seamless WhatsApp integration.
              </p>
            </div>

            <div className="process-card">
              <h3 className="process-title">Launch &amp; Scale</h3>
              <p className="process-text">
                We deploy your digital assets, configure domain DNS, launch targeted Meta ad campaigns, and deliver your custom metal NFC cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CLIENT FEEDBACK — Warm Ivory */}
      <section className="section section-ivory" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Client Feedback</span>
            <h2>What Business Leaders Say</h2>
            <p className="section-subtitle">
              Observations from entrepreneurs who elevated their digital brand with AmbrosStudio.
            </p>
          </div>

          <TestimonialSlider />
        </div>
      </section>

      {/* 8. FINAL CONVERSION MOMENT — Near Black High-Contrast Finish */}
      <section className="section section-black" id="finalCta" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container">
          <div className="final-cta-card" style={{ background: '#111111', border: '1px solid rgba(215, 170, 74, 0.25)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <span className="kicker">Ready to Elevate?</span>
            <h2 style={{ color: '#FFFFFF' }}>Transform How Customers Perceive Your Brand</h2>
            <p className="lead" style={{ maxWidth: '640px', margin: '14px auto 32px', color: '#9EAAA2' }}>
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
