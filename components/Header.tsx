'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AmbrosLogo from './AmbrosLogo';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // At the very top of the page: show normally
        if (currentY <= 30) {
          setIsScrolled(false);
          setIsNavHidden(false);
        } else {
          setIsScrolled(true);
          // Only auto-hide/show when mobile menu is closed
          if (!isMobileOpen) {
            const delta = currentY - lastY;
            if (delta > 8) {
              // Scrolling DOWN -> hide header
              setIsNavHidden(true);
            } else if (delta < -8) {
              // Scrolling UP -> show header
              setIsNavHidden(false);
            }
          }
        }
        lastY = currentY;
        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileOpen]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileOpen(false);
    setIsNavHidden(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/work', label: 'Work' },
    { href: '/contact', label: 'Contact' },
  ];

  // CTA Rule: Strictly NO CTA/inquiry button on About and Work pages per user instructions
  const isCtaAllowedOnPage = pathname !== '/about' && pathname !== '/work';

  const demoWhatsAppUrl =
    'https://wa.me/919157778915?text=Hi%20AmbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services%20and%20discuss%20my%20requirements.';

  return (
    <>
      <header
        className={`site-header ${isScrolled ? 'scrolled' : ''} ${isNavHidden ? 'nav-hidden' : ''}`}
        id="siteHeader"
      >
        <div className="container nav-container">
          <Link href="/" className="brand-logo" aria-label="Ambros Studio Home">
            <AmbrosLogo variant="light" height={34} />
          </Link>

          {/* Desktop Navigation (Unchanged layout & typography) */}
          <nav className="nav-links" aria-label="Primary Navigation">
            {navLinks.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Header CTA — Hidden on About & Work pages */}
          <div className="header-cta-group">
            {isCtaAllowedOnPage && (
              <a
                href={demoWhatsAppUrl}
                className="btn btn-primary btn-sm header-book-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Book a Demo &rarr;</span>
              </a>
            )}
          </div>

          {/* Mobile & Tablet Navigation Toggle */}
          <button
            className={`mobile-toggle ${isMobileOpen ? 'active' : ''}`}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileOpen}
            onClick={() => setIsMobileOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* ===================================================================
          Mobile & Tablet Navigation Menu — Home Hero Aesthetic Treatment
          =================================================================== */}
      <div
        className={`hero-nav-backdrop ${isMobileOpen ? 'open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`hero-nav-panel ${isMobileOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile and Tablet Navigation Menu"
      >
        {/* Panel Header */}
        <div className="hero-nav-header">
          <Link
            href="/"
            className="brand-logo"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Ambros Studio Home"
          >
            <AmbrosLogo variant="light" height={30} />
          </Link>
          <button
            className="hero-nav-close"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Panel Navigation List — High Typography / Home Hero Visual Language */}
        <nav className="hero-nav-links" aria-label="Mobile Menu Links">
          {navLinks.map((item, index) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`hero-nav-link-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <div className="hero-nav-link-title-row">
                  <span className="hero-nav-index">0{index + 1}</span>
                  <span className="hero-nav-label">{item.label}</span>
                </div>
                {isActive ? (
                  <span className="hero-nav-active-dot" aria-label="Current page" />
                ) : (
                  <svg className="hero-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Panel Footer */}
        <div className="hero-nav-footer">
          {isCtaAllowedOnPage && (
            <div className="hero-nav-action-wrap">
              <a
                href={demoWhatsAppUrl}
                className="btn btn-cinematic-cta hero-nav-cta-btn"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileOpen(false)}
              >
                <span>Book a Demo</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          )}

          <div className="hero-nav-meta">
            <p className="hero-nav-meta-line">Surat, Gujarat &bull; Dedicated Support</p>
            <p className="hero-nav-meta-brand">Ambros Studio &bull; Crafted with Purpose</p>
          </div>
        </div>
      </div>
    </>
  );
}
