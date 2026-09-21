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

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-drawer ${isMobileOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link href="/" className="brand-logo" onClick={() => setIsMobileOpen(false)}>
            <img
              src="/assets/abros-logo-transparent.png"
              alt="AbrosStudio"
              className="brand-logo-img"
              style={{ height: '32px' }}
            />
          </Link>
          <button
            className="drawer-close"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            &times;
          </button>
        </div>

        <nav className="drawer-links">
          {navLinks.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`drawer-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="drawer-footer">
          {isDemoAllowed ? (
            <a
              href={demoWhatsAppUrl}
              className="btn btn-primary btn-block"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileOpen(false)}
            >
              <span>Book a Demo (WhatsApp)</span>
            </a>
          ) : (
            <Link
              href="/contact"
              className="btn btn-secondary btn-block"
              onClick={() => setIsMobileOpen(false)}
            >
              <span>Get in Touch</span>
            </Link>
          )}
          <div className="drawer-contact-info">
            <p>Direct WhatsApp: +91 99984 41519</p>
            <p>Surat, Gujarat, India</p>
          </div>
        </div>
      </div>
    </>
  );
}
