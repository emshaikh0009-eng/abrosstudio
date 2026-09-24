import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Our Team & Vision | Ambros Studio Surat',
  description:
    'Discover Ambros Studio in Surat, Gujarat. Learn about our multidisciplinary digital studio, commitment to craft, and dedicated team approach.',
};

export default function AboutPage() {
  return (
    <>
      {/* 1. About Hero Header — Deep Emerald */}
      <section className="hero section-emerald" style={{ paddingBottom: '40px' }}>
        <div className="container">
          <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="kicker">About Our Studio &amp; Vision</span>
            <h1 className="hero-title">
              The Story Behind Ambros Studio
            </h1>
            <p className="hero-desc" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Built from a simple conviction: ambitious businesses deserve the same visual prestige, rapid velocity, and high-converting digital polish as global luxury brands.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Studio Team & Philosophy Section — Warm Ivory Breathing Room */}
      <section className="section section-ivory" style={{ paddingTop: '60px', paddingBottom: '70px' }}>
        <div className="container">
          <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
            <span className="kicker">Our Mission &amp; Approach</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', lineHeight: 1.25, marginBottom: '20px' }}>
              &ldquo;Great digital design is not an expense. It is your business&rsquo;s most valuable asset.&rdquo;
            </h2>
            <p className="lead" style={{ color: 'var(--text-light-body)', marginBottom: '16px', maxWidth: '740px', margin: '0 auto 16px' }}>
              Ambros Studio was established to give ambitious businesses a dedicated creative and technical partner, replacing bloated agency bureaucracy and generic off-the-shelf templates with custom excellence.
            </p>
            <p style={{ color: 'var(--text-light-muted)', maxWidth: '740px', margin: '0 auto' }}>
              Our multidisciplinary team blends modern web engineering, strategic brand architecture, and performance-focused Meta advertising. Every project is crafted with deliberate purpose, rapid turnaround, and uncompromising attention to detail.
            </p>

            <div className="founder-stats-grid" style={{ margin: '36px auto 0', maxWidth: '720px' }}>
              <div className="stat-card" style={{ background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.1)' }}>
                <div className="stat-value" style={{ color: '#073D2E' }}>Bespoke</div>
                <div className="stat-label" style={{ color: '#5A655E' }}>Zero generic templates</div>
              </div>
              <div className="stat-card" style={{ background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.1)' }}>
                <div className="stat-value" style={{ color: '#073D2E' }}>7–14d</div>
                <div className="stat-label" style={{ color: '#5A655E' }}>Average website delivery</div>
              </div>
              <div className="stat-card" style={{ background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.1)' }}>
                <div className="stat-value" style={{ color: '#073D2E' }}>Surat</div>
                <div className="stat-label" style={{ color: '#5A655E' }}>Locally rooted &bull; Global standard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Studio Pillars — Soft Ivory */}
      <section className="section section-ivory-soft">
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
              <h3 className="value-title">Craft Over Volume</h3>
              <p className="value-text">
                We purposefully limit the number of active clients we take on simultaneously to ensure every project receives full creative focus.
              </p>
            </div>
            <div className="value-card">
              <h3 className="value-title">Direct Team Partnership</h3>
              <p className="value-text">
                No middle management or communication breakdown. You collaborate directly with our core creative team from strategy to deployment.
              </p>
            </div>
            <div className="value-card">
              <h3 className="value-title">Local Commerce Specialization</h3>
              <p className="value-text">
                We understand how Indian buyers discover and trust local brands: WhatsApp responsiveness, visual credibility, and mobile ease.
              </p>
            </div>
            <div className="value-card">
              <h3 className="value-title">Speed as a Feature</h3>
              <p className="value-text">
                Business moves fast. We build quickly and launch decisively so you can start converting new customers in weeks, not quarters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Studio Anchor / Final CTA — Near Black */}
      <section className="section section-black" style={{ paddingTop: '90px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="final-cta-card" style={{ background: '#111111', border: '1px solid rgba(215, 170, 74, 0.25)', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ maxWidth: '640px', width: '100%' }}>
              <span className="kicker">Headquartered in Surat</span>
              <h2 style={{ color: '#FFFFFF' }}>Let&rsquo;s Discuss Your Vision</h2>
              <p className="lead" style={{ margin: '14px 0 24px', color: '#9EAAA2' }}>
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
