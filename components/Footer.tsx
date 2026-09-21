import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          <div className="footer-brand-col">
            <Link href="/" className="brand-logo" aria-label="AbrosStudio Home">
              <img
                src="/assets/abros-logo-transparent.png"
                alt="AbrosStudio — Crafted With Purpose"
                className="brand-logo-img"
                style={{ height: '44px', marginBottom: '12px' }}
              />
            </Link>
            <p className="footer-brand-desc">
              A boutique digital agency founded by Anas Shaikh, helping ambitious local businesses look professional and win customers online.
            </p>
            <div className="social-links-bar" style={{ border: 'none', paddingTop: 0, marginTop: 0 }}>
              <a
                href="https://www.instagram.com/ambros.studio"
                className="social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AbrosStudio on Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/p/1HrAAE5Yjf/"
                className="social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AbrosStudio on Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://x.com/AnasSha84485493"
                className="social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AbrosStudio on X"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Studio Navigation</h4>
            <ul className="footer-links-list">
              <li><Link href="/" className="footer-link">Home</Link></li>
              <li><Link href="/services" className="footer-link">Services</Link></li>
              <li><Link href="/about" className="footer-link">About Founder</Link></li>
              <li><Link href="/work" className="footer-link">Selected Work</Link></li>
              <li><Link href="/contact" className="footer-link">Contact Studio</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Core Capabilities</h4>
            <ul className="footer-links-list">
              <li><Link href="/services#webDesign" className="footer-link">Custom Business Websites</Link></li>
              <li><Link href="/services#leadGen" className="footer-link">Targeted Meta Ad Campaigns</Link></li>
              <li><Link href="/services#digitalCards" className="footer-link">Digital + Metal NFC Cards</Link></li>
              <li><Link href="/services" className="footer-link">Local SEO &amp; Maps</Link></li>
              <li><Link href="/services" className="footer-link">Brand Identity Systems</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Direct Contact</h4>
            <div className="footer-contact-items">
              <p className="footer-contact-line">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <a href="tel:+919998441519">+91 99984 41519</a>
              </p>
              <p className="footer-contact-line">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <a href="mailto:ambrosstudio.z@gmail.com">ambrosstudio.z@gmail.com</a>
              </p>
              <p className="footer-contact-line">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>VIP Gallaria, Althan, Surat, Gujarat 395017</span>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>&copy; {new Date().getFullYear()} AbrosStudio. All rights reserved. Crafted with Purpose by Anas Shaikh.</p>
          <div className="footer-bottom-links">
            <span style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
              Surat, Gujarat &bull; Fast Turnaround &bull; Dedicated Support
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
