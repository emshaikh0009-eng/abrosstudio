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


    </>
  );
}
