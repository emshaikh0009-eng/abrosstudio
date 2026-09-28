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
      {/* 1. HERO SECTION — Full-Bleed Cinematic Studio Campaign */}
      <section className="hero hero-cinematic" id="hero">
        <div className="hero-cinematic-backdrop" aria-hidden="true">
          <picture className="hero-cinematic-picture">
            <source media="(max-width: 768px)" srcSet="/assets/hero-cinematic-bg-mobile.jpg" />
            <img
              src="/assets/hero-cinematic-bg-desktop.jpg"
              alt="Ambros Studio creative workspace with laptop displaying luxury digital brand"
              className="hero-cinematic-img"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className="hero-cinematic-scrim" />
        </div>

        <div className="container hero-cinematic-container">
          <div className="hero-cinematic-content fade-in-up">
            <h1 className="hero-cinematic-headline">
              Build a professional<br />
              website <span className="hero-accent-word">now</span>
            </h1>

            <p className="hero-cinematic-sub">
              Modern websites and digital experiences<br className="desktop-br" />
              for local businesses.
            </p>

            <div className="hero-cinematic-actions">
              <a
                href={demoWhatsAppUrl}
                className="btn btn-cinematic-cta"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Book a Demo</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES OVERVIEW — Essential Studio Capabilities */}
      <section className="section section-ivory" id="servicesOverview">
        <div className="container">
          <div className="section-header fade-in-up">
            <span className="kicker">Core Studio Capabilities</span>
            <h2>Everything Your Brand Needs to Dominate Online</h2>
            <p className="section-subtitle">
              We focus strictly on the digital touchpoints that generate measurable prestige, trust, and paying inquiries for your business.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card fade-in-up stagger-1">
              <div className="service-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="service-title">Website Design &amp; Development</h3>
              <p className="service-text">
                Bespoke, ultra-fast websites hand-crafted to establish instant authority and drive direct customer inquiries.
              </p>
              <Link href="/services#webDesign" className="service-link">
                <span>Discover Web Services &rarr;</span>
              </Link>
            </div>

            <div className="service-card fade-in-up stagger-2">
              <div className="service-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 4.24 4.24" />
                  <path d="m14.83 9.17 4.24-4.24" />
                  <path d="m14.83 14.83 4.24 4.24" />
                  <path d="m9.17 14.83-4.24 4.24" />
                </svg>
              </div>
              <h3 className="service-title">Digital Ads / Meta Ads</h3>
              <p className="service-text">
                Laser-focused Instagram &amp; Facebook advertising engineered to bring local buyers directly to your business.
              </p>
              <Link href="/services#leadGen" className="service-link">
                <span>Discover Meta Ad Systems &rarr;</span>
              </Link>
            </div>

            <div className="service-card fade-in-up stagger-3">
              <div className="service-icon-box">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="7" y1="8" x2="17" y2="8" />
                  <line x1="7" y1="12" x2="13" y2="12" />
                </svg>
              </div>
              <h3 className="service-title">Digital Business Cards</h3>
              <p className="service-text">
                <span className="desktop-only-copy">Leave traditional paper cards in the past. </span>Luxury engraved metal NFC cards paired with dynamic digital web profiles to share your contact with one tap.
              </p>
              <Link href="/services#digitalCards" className="service-link">
                <span>Discover Card Solutions &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST / VALUE — 3-Pillar Authority (Mobile Only) */}
      <section className="section section-trust mobile-only-section" id="trustSection">
        <div className="container">
          <div className="trust-strip-header fade-in-up">
            <span className="kicker">Why Ambros Studio</span>
            <h2>Built With Precision, Engineered for Results</h2>
          </div>

          <div className="trust-strip-grid">
            <div className="trust-strip-card fade-in-up stagger-1">
              <div className="trust-strip-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <div className="trust-strip-content">
                <h4 className="trust-strip-title">Modern &amp; Responsive</h4>
                <p className="trust-strip-text">
                  Seamlessly optimized for every smartphone, tablet, and desktop display.
                </p>
              </div>
            </div>

            <div className="trust-strip-card fade-in-up stagger-2">
              <div className="trust-strip-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="trust-strip-content">
                <h4 className="trust-strip-title">Professional Design</h4>
                <p className="trust-strip-text">
                  Bespoke art direction, intentional typography, and distinctive visual prestige.
                </p>
              </div>
            </div>

            <div className="trust-strip-card fade-in-up stagger-3">
              <div className="trust-strip-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="trust-strip-content">
                <h4 className="trust-strip-title">Built for Local Businesses</h4>
                <p className="trust-strip-text">
                  Frictionless WhatsApp lead capture funnels designed for real-world growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY IT MATTERS — Deep Emerald Editorial Statement (Desktop Only) */}
      <section className="section section-emerald desktop-only-section" id="whyItMatters">
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

      {/* 5. SAMPLE WORK — Soft Ivory Gallery Showcase (Desktop Only) */}
      <section className="section section-ivory-soft desktop-only-section" id="selectedWork">
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

      {/* 6. SMART CONTACTLESS NETWORKING (Desktop Only) */}
      <section className="section section-ivory card-feature-section desktop-only-section" id="digitalCardFeature">
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

      {/* 7. THE STUDIO STANDARD (PROCESS) (Desktop Only) */}
      <section className="section section-ivory-soft desktop-only-section" id="process">
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

      {/* 8. CLIENT FEEDBACK (Desktop Only) */}
      <section className="section section-ivory desktop-only-section" id="testimonials">
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

      {/* 9. FINAL CONVERSION MOMENT — High-Contrast Finish */}
      <section className="section section-black" id="finalCta">
        <div className="container">
          <div className="final-cta-card fade-in-up">
            <span className="kicker desktop-only-copy">Ready to Elevate?</span>
            <h2>
              <span className="desktop-only-copy">Transform How Customers Perceive Your Brand</span>
              <span className="mobile-only-copy">Ready to build a professional online presence?</span>
            </h2>
            <p className="lead final-cta-desc desktop-only-copy">
              Schedule a direct consultation with the Ambros Studio team to explore how a custom website, Meta ad campaign, or metal NFC cards can elevate your business.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <a
                href={demoWhatsAppUrl}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="desktop-only-copy">Book a Demo (WhatsApp)</span>
                <span className="mobile-only-copy">Book a Demo</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <Link href="/contact" className="btn btn-secondary desktop-only">
                <span>View Contact Information</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
