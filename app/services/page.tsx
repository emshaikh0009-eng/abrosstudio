import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import NfcDualTrack from '@/components/NfcDualTrack';
import WebsiteShowcaseVisual from '@/components/WebsiteShowcaseVisual';
import MetaAdsVisual from '@/components/MetaAdsVisual';
import ServiceAccordionItem from '@/components/ServiceAccordionItem';

export const metadata: Metadata = {
  title: 'Services | Custom Websites, Meta Ads & Metal NFC Cards | Ambros Studio',
  description:
    'Explore Ambros Studio’s core capabilities: custom high-performance business websites, targeted Meta ad campaigns, and luxury metal NFC business cards in Surat, Gujarat.',
};

export default function ServicesPage() {
  const demoWhatsAppUrl =
    'https://wa.me/919998441519?text=Hi%20AmbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services%20and%20discuss%20my%20requirements.';

  return (
    <>
      {/* =====================================================================
          SERVICE 01: PROFESSIONAL WEBSITE DESIGNING — Deep Emerald
          Large, commanding digital studio showcase composition
          ===================================================================== */}
      <section className="hero section-emerald service-showcase-section" id="webDesign">
        <div className="container">
          <div className="service-showcase-header fade-in-up">
            <span className="kicker">High-Converting Digital Presence</span>
            <h1 className="service-section-title">Professional Website Designing</h1>
            <p className="service-section-lead">
              Your website is the single most critical asset for winning high-ticket clients. We engineer bespoke, lightning-fast digital flagships that communicate prestige from the first second of arrival.
            </p>
          </div>

          {/* Large Scale Professional Website Showcase Visual */}
          <div className="service-visual-stage fade-in-up">
            <WebsiteShowcaseVisual />
          </div>

          {/* Service Capabilities (Always open on desktop, collapsible on mobile) */}
          <div className="service-details-wrapper fade-in-up">
            <ServiceAccordionItem buttonLabel="View Detailed Specifications">
              <div className="service-features-grid">
                <div className="service-card" style={{ padding: '22px 20px' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '1.02rem' }}>
                    Mobile-First Precision
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
                    Over 85% of customer traffic arrives on mobile. Every layout is calibrated for smooth scrolling, zero horizontal overflow, and tactile thumb interaction.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '22px 20px' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '1.02rem' }}>
                    WhatsApp Native Inquiries
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
                    Direct inquiry funnels connected to WhatsApp ensure zero friction between discovery and immediate customer conversation with pre-filled context.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '22px 20px' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '1.02rem' }}>
                    Local SEO &amp; Schema
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
                    Engineered with structured microdata to rank locally on Google Maps and search results across Surat, Gujarat, and your primary target markets.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '22px 20px' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '1.02rem' }}>
                    Sub-Second Performance
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
                    Clean bespoke architectures without heavy third-party plugins, delivering near-perfect Google Lighthouse performance and sub-second page loads.
                  </p>
                </div>
              </div>
            </ServiceAccordionItem>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SERVICE 02: TARGETED META AD CAMPAIGNS — Warm Ivory
          Performance marketing & campaign analytics showcase
          ===================================================================== */}
      <section className="section section-ivory service-showcase-section" id="leadGen">
        <div className="container">
          <div className="service-showcase-header fade-in-up" style={{ color: 'var(--text-light-body)' }}>
            <span className="kicker">Predictable Customer Acquisition</span>
            <h2 className="service-section-title" style={{ color: '#073D2E' }}>
              Targeted Meta Ad Campaigns
            </h2>
            <p className="service-section-lead" style={{ color: 'var(--text-light-muted)' }}>
              Stop wasting budget on boosting posts with zero accountability. We architect laser-targeted Instagram and Facebook advertising systems that direct qualified local buyers straight to your phone.
            </p>
          </div>

          {/* High-Fidelity Performance Analytics & Metrics Dashboard Visual */}
          <div className="service-visual-stage fade-in-up">
            <MetaAdsVisual />
          </div>

          {/* Service Capabilities (Always open on desktop, collapsible on mobile) */}
          <div className="service-details-wrapper fade-in-up">
            <ServiceAccordionItem buttonLabel="View Campaign Strategy">
              <div className="service-features-grid">
                <div className="service-card" style={{ padding: '22px 20px', background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.12)' }}>
                  <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1.02rem' }}>
                    Hyper-Local Geo Targeting
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-light-muted)', margin: 0, lineHeight: 1.6 }}>
                    Pinpoint campaigns around specific upscale neighborhoods, pin codes, and demographics across your primary market to minimize ad waste.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '22px 20px', background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.12)' }}>
                  <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1.02rem' }}>
                    High-Converting Creatives
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-light-muted)', margin: 0, lineHeight: 1.6 }}>
                    Professional studio creatives and video reels crafted with compelling hooks that command immediate thumb-stopping attention.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '22px 20px', background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.12)' }}>
                  <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1.02rem' }}>
                    Click-to-WhatsApp Funnels
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-light-muted)', margin: 0, lineHeight: 1.6 }}>
                    Prospects jump directly from their Instagram feed into an active WhatsApp chat with pre-filled context ready to convert immediately.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '22px 20px', background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.12)' }}>
                  <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1.02rem' }}>
                    Continuous Data Optimization
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-light-muted)', margin: 0, lineHeight: 1.6 }}>
                    Constant A/B testing of angles, hooks, and audiences to steadily drive down cost-per-lead and scale winning ad sets with measurable ROAS.
                  </p>
                </div>
              </div>
            </ServiceAccordionItem>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SERVICE 03: DIGITAL VISITING CARD — Soft Ivory
          Structure & Visual Preserved per instruction
          ===================================================================== */}
      <section className="section section-ivory-soft" id="digitalCards">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content fade-in-up">
              <span className="kicker">Modern Contactless Networking</span>
              <h2>Digital Visiting Card</h2>
              <p className="hero-desc" style={{ color: 'var(--text-light-muted)' }}>
                Ambros Studio provides two complementary solutions: luxury physical metal NFC cards for high-impact in-person networking, and a universal digital web profile you can share anywhere.
              </p>

              {/* Dual Pathways Component */}
              <NfcDualTrack />

              {/* Collapsible on mobile for vertical space */}
              <div style={{ width: '100%', marginTop: '20px' }}>
                <ServiceAccordionItem buttonLabel="View Card Features">
                  <div className="service-features-grid">
                    <div className="service-card" style={{ padding: '20px' }}>
                      <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1rem' }}>Engraved Matte Metal</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
                        Crafted from solid stainless steel with precision laser engraving. Weighted, cold to the touch, and built to impress.
                      </p>
                    </div>
                    <div className="service-card" style={{ padding: '20px' }}>
                      <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1rem' }}>Universal Tap Sharing</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
                        Tap on an NFC-compatible smartphone to instantly pop open your verified profile without requiring any special app.
                      </p>
                    </div>
                    <div className="service-card" style={{ padding: '20px' }}>
                      <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1rem' }}>Scannable QR Code</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
                        High-contrast scannable QR code on the back ensures compatibility with any camera-equipped smartphone.
                      </p>
                    </div>
                    <div className="service-card" style={{ padding: '20px' }}>
                      <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1rem' }}>Dynamic Profile Updates</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
                        Update your phone number, social links, or portfolio at any time without having to re-order a new physical card.
                      </p>
                    </div>
                  </div>
                </ServiceAccordionItem>
              </div>
            </div>

            <div className="hero-visual fade-in-up">
              <div className="card-photo-showcase">
                <img
                  src="/assets/ambros-digital-card-showcase.jpg"
                  alt="Ambros Studio Physical Metal NFC &amp; Digital Visiting Card in hand"
                  className="card-showcase-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          Studio Principles Section — Deep Emerald
          ===================================================================== */}
      <section className="section section-emerald">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Uncompromising Quality</span>
            <h2>Every Ambros Studio Deliverable Adheres to 4 Principles</h2>
            <p className="section-subtitle">
              We never compromise on the technical and visual integrity of what we put out.
            </p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <h3 className="value-title">Visual Distinction</h3>
              <p className="value-text">
                Your business should look instantly recognizable and noticeably superior to competitors in your city.
              </p>
            </div>
            <div className="value-card">
              <h3 className="value-title">Velocity &amp; Precision</h3>
              <p className="value-text">
                We deliver complete custom websites in 7 to 14 days without endless revision cycles or missed deadlines.
              </p>
            </div>
            <div className="value-card">
              <h3 className="value-title">Conversion Focus</h3>
              <p className="value-text">
                Every layout is purposefully designed to drive visitors directly to WhatsApp, phone calls, or scheduled meetings.
              </p>
            </div>
            <div className="value-card">
              <h3 className="value-title">Direct Accountability</h3>
              <p className="value-text">
                You communicate directly with our core dedicated team throughout the entire engagement, ensuring seamless alignment and rapid execution.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/work" className="btn btn-secondary">
              <span>View Concept Projects &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          Final Conversion Moment — Near Black
          Mandated Location 2 for Book a Demo / Inquiry CTA
          ===================================================================== */}
      <section className="section section-black" id="finalCta" style={{ paddingTop: '80px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="final-cta-card" style={{ background: '#111111', border: '1px solid rgba(215, 170, 74, 0.25)', textAlign: 'center' }}>
            <span className="kicker">Ready to Start?</span>
            <h2 style={{ color: '#FFFFFF' }}>Take Your Business Digital Presence to the Highest Level</h2>
            <p className="lead" style={{ maxWidth: '640px', margin: '14px auto 32px', color: '#9EAAA2' }}>
              Connect directly with our team on WhatsApp to review your requirements, timeline, and custom quotation.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <a
                href={demoWhatsAppUrl}
                className="btn btn-primary btn-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Book a Demo (WhatsApp)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <Link href="/contact" className="btn btn-secondary btn-lg">
                <span>View Contact Details</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
