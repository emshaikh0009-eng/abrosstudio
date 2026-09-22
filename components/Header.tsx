'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileOpen(false);
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

  // CTA Rule: "Book a Demo" allowed strictly on Home (/) and Contact (/contact)
  const isDemoAllowed = pathname === '/' || pathname === '/contact';

  const demoWhatsAppUrl =
    'https://wa.me/919998441519?text=Hi%20AbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services%20and%20discuss%20my%20requirements.';

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`} id="siteHeader">
        <div className="container nav-container">
          <Link href="/" className="brand-logo" aria-label="AbrosStudio Home">
            <img
              src="/assets/abros-logo-transparent.png"
              alt="AbrosStudio — Crafted With Purpose"
              className="brand-logo-img"
            />
          </Link>

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

          <div className="header-cta-group">
            {isDemoAllowed ? (
              <a
                href={demoWhatsAppUrl}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Book a Demo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            ) : (
              <Link href="/contact" className="btn btn-secondary btn-sm">
                <span>Start a Project</span>
              </Link>
            )}
          </div>

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

      {/* Mobile Navigation Backdrop */}
      <div
        className={`mobile-nav-backdrop ${isMobileOpen ? 'open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Floating Sheet Modal */}
      <div
        className={`mobile-nav-card ${isMobileOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        <div className="mobile-nav-card-header">
          <Link href="/" className="brand-logo" onClick={() => setIsMobileOpen(false)} aria-label="AbrosStudio Home">
            <img
              src="/assets/abros-logo-transparent.png"
              alt="AbrosStudio"
              className="brand-logo-img"
              style={{ height: '32px' }}
            />
          </Link>
          <button
            className="mobile-nav-close-btn"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="mobile-nav-list" aria-label="Mobile Menu">
          {navLinks.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="mobile-nav-active-pill-badge">Active</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mobile-nav-footer">
          {isDemoAllowed ? (
            <a
              href={demoWhatsAppUrl}
              className="btn btn-primary mobile-nav-cta"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileOpen(false)}
            >
              <span>Book a Demo (WhatsApp)</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          ) : (
            <Link
              href="/contact"
              className="btn btn-primary mobile-nav-cta"
              onClick={() => setIsMobileOpen(false)}
            >
              <span>Get in Touch</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          )}

          <div className="mobile-nav-meta">
            <p>Direct WhatsApp: +91 99984 41519</p>
            <p>Surat, Gujarat &bull; Dedicated Support</p>
          </div>
        </div>
      </div>
    </>
  );
}
