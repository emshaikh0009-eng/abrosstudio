import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import PortfolioGallery from '@/components/PortfolioGallery';

export const metadata: Metadata = {
  title: 'Selected Work & Concept Showcases | Ambros Studio',
  description:
    'Browse our curated portfolio of concept showcases: custom websites, brand identities, and metal NFC cards for Indian retail, hospitality, luxury, and professional services.',
};

export default function WorkPage() {
  return (
    <>
      {/* 1. Work Hero Header — Deep Emerald */}
      <section className="hero section-emerald" style={{ paddingBottom: '30px' }}>
        <div className="container">
          <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="kicker">Selected Projects &bull; Concept Showcases</span>
            <h1 className="hero-title">
              Selected Work &amp; Concept Portfolio
            </h1>
            <p className="hero-desc" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Explore how our curated digital design system, high-velocity development, and metal NFC technology elevate businesses across diverse industries.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Portfolio Gallery Section — Soft Ivory */}
      <section className="section section-ivory-soft" style={{ paddingTop: '50px', paddingBottom: '70px' }}>
        <div className="container">
          <PortfolioGallery />
        </div>
      </section>

      {/* 3. Work Inquiry CTA — Near Black */}
      <section className="section section-black" style={{ paddingTop: '80px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="final-cta-card" style={{ background: '#111111', border: '1px solid rgba(215, 170, 74, 0.25)', textAlign: 'center' }}>
            <span className="kicker">Inspired by These Concepts?</span>
            <h2 style={{ color: '#FFFFFF' }}>We Can Build Something Extraordinary For Your Business</h2>
            <p className="lead" style={{ maxWidth: '640px', margin: '14px auto 32px', color: '#9EAAA2' }}>
              Every concept showcased above can be tailored and deployed for your brand within 7 to 14 days.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link href="/contact" className="btn btn-primary">
                <span>Start Your Project Inquiry</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link href="/services" className="btn btn-secondary">
                <span>Review Core Capabilities</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
