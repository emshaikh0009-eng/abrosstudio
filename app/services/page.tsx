import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import NfcDualTrack from '@/components/NfcDualTrack';

export const metadata: Metadata = {
  title: 'Services | Custom Websites, Meta Ads & Metal NFC Cards | Ambros Studio',
  description:
    'Explore Ambros Studio’s core capabilities: custom high-performance business websites, targeted Meta ad campaigns, and luxury metal NFC business cards in Surat, Gujarat.',
};

export default function ServicesPage() {
  return (
    <>
      {/* Service 01: Website Designing — Deep Emerald */}
      <section className="section section-emerald" id="webDesign" style={{ paddingTop: '50px' }}>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content fade-in-up">
              <span className="kicker">High-Converting Digital Presence</span>
              <h2>Professional Website Designing</h2>
              <p className="hero-desc">
                Your website is the single most critical asset for winning high-ticket clients. We design bespoke, lightning-fast websites that communicate prestige from the first second of arrival.
              </p>

              <div className="service-features-grid">
                <div className="service-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '1rem' }}>Mobile-First Precision</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Over 85% of web traffic arrives on mobile. Every layout is calibrated for smooth scrolling and thumb interaction.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '1rem' }}>WhatsApp Native Inquiries</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Direct inquiry funnels connected to WhatsApp ensure zero friction between discovery and direct customer conversation.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '1rem' }}>Local SEO &amp; Schema</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Engineered with structured microdata to rank locally on Google Maps and search results across your target city.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '1rem' }}>Sub-Second Performance</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Clean vanilla architectures without heavy plugins, delivering near-perfect Google Lighthouse performance scores.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <Link href="/contact" className="btn btn-secondary">
                  <span>Inquire About Website Build</span>
                </Link>
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
                </div>
                <div className="frame-body">
                  <img src="/assets/project-restaurant.jpg" alt="Custom Website Deliverable" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service 02: Meta Ads — Warm Ivory */}
      <section className="section section-ivory" id="leadGen">
        <div className="container">
          <div className="hero-grid" style={{ direction: 'rtl' }}>
            <div className="hero-content fade-in-up" style={{ direction: 'ltr' }}>
              <span className="kicker">Predictable Customer Acquisition</span>
              <h2>Targeted Meta Ad Campaigns</h2>
              <p className="hero-desc" style={{ color: 'var(--text-light-muted)' }}>
                Stop wasting budget on boosting posts with zero accountability. We architect laser-targeted Instagram and Facebook advertising systems that direct qualified local buyers straight to your phone.
              </p>

              <div className="service-features-grid">
                <div className="service-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1rem' }}>Hyper-Local Geo Targeting</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
                    Pinpoint campaigns around specific upscale neighborhoods, pin codes, and demographics in your target region.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1rem' }}>High-Converting Creatives</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
                    Professional studio creatives and video reels crafted with compelling hooks that command immediate attention.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1rem' }}>Click-to-WhatsApp Routing</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
                    Prospects jump straight from their Instagram feed into an active WhatsApp chat with pre-filled context ready to convert.
                  </p>
                </div>
                <div className="service-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: '#073D2E', marginBottom: '8px', fontSize: '1rem' }}>Continuous Optimization</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)', margin: 0 }}>
                    Constant A/B testing of angles, hooks, and audiences to drive down cost-per-lead and scale winning campaigns.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <Link href="/contact" className="btn btn-secondary">
                  <span>Discuss Ad Campaigns</span>
                </Link>
              </div>
            </div>

            <div className="hero-visual fade-in-up" style={{ direction: 'ltr' }}>
              <div className="hero-showcase-frame">
                <div className="frame-header">
                  <div className="frame-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                </div>
                <div className="frame-body">
                  <img src="/assets/project-salon.jpg" alt="Meta Ads Creative Deliverable" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service 03: Digital Visiting Card — Soft Ivory */}
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

              <div className="service-features-grid" style={{ marginTop: '24px' }}>
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

              <div style={{ marginTop: '24px' }}>
                <Link href="/contact" className="btn btn-secondary">
                  <span>Inquire About Digital Visiting Cards</span>
                </Link>
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
                </div>
                <div className="frame-body">
                  <img src="/assets/project-gym.jpg" alt="Metal NFC Card Showcase" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Principles Section — Deep Emerald */}
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
                You communicate directly with founder Anas Shaikh throughout the entire engagement, not junior interns.
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

      {/* Final Conversion Moment — Near Black */}
      <section className="section section-black" style={{ paddingTop: '80px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="final-cta-card" style={{ background: '#111111', border: '1px solid rgba(215, 170, 74, 0.25)', textAlign: 'center' }}>
            <span className="kicker">Ready to Start?</span>
            <h2 style={{ color: '#FFFFFF' }}>Take Your Business Digital Presence to the Highest Level</h2>
            <p className="lead" style={{ maxWidth: '640px', margin: '14px auto 32px', color: '#9EAAA2' }}>
              Speak directly with founder Anas Shaikh on WhatsApp to review your requirements, timeline, and custom quotation.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <a
                href="https://wa.me/919998441519?text=Hi%20AmbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20to%20discuss%20my%20service%20requirements."
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Chat on WhatsApp</span>
              </a>
              <Link href="/contact" className="btn btn-secondary">
                <span>View Contact Details</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
