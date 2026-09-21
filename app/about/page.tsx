import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Founder | Anas Shaikh — AbrosStudio Surat',
  description:
    'Learn about Anas Shaikh, founder of AbrosStudio in Surat, Gujarat. Discover our boutique agency philosophy, commitment to craft, and local business focus.',
};

export default function AboutPage() {
  return (
    <>
      {/* About Hero Header */}
      <section className="hero" style={{ paddingBottom: '40px' }}>
        <div className="container">
          <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="kicker">About Founder &amp; Vision</span>
            <h1 className="hero-title">
              The Story Behind AbrosStudio
            </h1>
            <p className="hero-desc" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Built from a simple conviction: local businesses deserve the same visual prestige, rapid velocity, and high-converting digital polish as global luxury brands.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Profile Section */}
      <section className="section" style={{ paddingTop: '20px' }}>
        <div className="container">
          <div className="founder-grid">
            <div className="founder-portrait-frame fade-in-up">
              <img
                src="/assets/anas-shaikh.jpg"
                alt="Anas Shaikh — Founder &amp; Lead Designer of AbrosStudio"
                className="founder-portrait-img"
              />
              <div className="founder-caption-pill">
                <strong>Anas Shaikh</strong> &bull; Founder &amp; Lead Designer
              </div>
            </div>

            <div className="founder-bio fade-in-up">
              <span className="kicker">Meet the Founder</span>
              <h2>&ldquo;Great digital design is not an expense. It is your business&rsquo;s most valuable asset.&rdquo;</h2>
              <p className="lead">
                I founded AbrosStudio in Surat to solve a persistent frustration I observed across Indian retail, hospitality, luxury, and professional service businesses.
              </p>
              <p>
                Too many ambitious local business owners were settling for generic, cookie-cutter WordPress themes, bloated agencies with junior account managers, or amateur social media agencies that deliver zero measurable revenue.
              </p>
              <p>
                AbrosStudio is structured intentionally as a high-touch boutique agency. When you work with us, you work directly with me. Every layout, every line of code, every Meta ad campaign, and every laser-engraved metal NFC card is inspected and crafted with deliberate purpose.
              </p>

              <div className="founder-stats-grid" style={{ margin: '32px 0' }}>
                <div className="stat-card">
                  <div className="stat-value">Bespoke</div>
                  <div className="stat-label">Zero generic templates</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">7–14d</div>
                  <div className="stat-label">Average website delivery</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">Surat</div>
                  <div className="stat-label">Locally rooted &bull; Global standard</div>
                </div>
              </div>

              <div>
                <Link href="/contact" className="btn btn-primary">
                  <span>Start a Conversation With Anas</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Studio Pillars */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="kicker">Our Operating Philosophy</span>
            <h2>Four Pillars That Define Our Work</h2>
            <p className="section-subtitle">
              We operate on clear principles designed to protect your time and maximize your business prestige.
            </p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">01</div>
              <h3 className="value-title">Craft Over Volume</h3>
              <p className="value-text">
                We purposefully limit the number of active clients we take on simultaneously to ensure every project receives full creative focus.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">02</div>
              <h3 className="value-title">Direct Founder Partnership</h3>
              <p className="value-text">
                No middle management or communication breakdown. You collaborate directly with Anas Shaikh from strategy to deployment.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">03</div>
              <h3 className="value-title">Local Commerce Specialization</h3>
              <p className="value-text">
                We understand how Indian buyers discover and trust local brands: WhatsApp responsiveness, visual credibility, and mobile ease.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">04</div>
              <h3 className="value-title">Speed as a Feature</h3>
              <p className="value-text">
                Business moves fast. We build quickly and launch decisively so you can start converting new customers in weeks, not quarters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Location & Contact Anchor */}
      <section className="section">
        <div className="container">
          <div className="final-cta-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ maxWidth: '640px', width: '100%' }}>
              <span className="kicker">Headquartered in Surat</span>
              <h2>Let&rsquo;s Discuss Your Vision</h2>
              <p className="lead" style={{ margin: '14px 0 24px' }}>
                Whether you run a luxury dining destination, medical practice, salon, or professional consultancy, we’re ready to build your digital brand.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/contact" className="btn btn-primary">
                  <span>Contact the Studio</span>
                </Link>
                <Link href="/work" className="btn btn-secondary">
                  <span>View Selected Work</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
