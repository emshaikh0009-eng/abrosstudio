'use client';

import React, { useState, useRef } from 'react';

export default function DigitalCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const card3DRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent flipping if user clicks on an action link (Call, WhatsApp, etc.)
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    setIsFlipped((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped || !card3DRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / (rect.height / 2)) * 7;
    const rotateY = (x / (rect.width / 2)) * 8;
    card3DRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (card3DRef.current) {
      card3DRef.current.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    }
  };

  return (
    <div
      className={`card-scene ${isFlipped ? 'flipped' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="button"
      aria-label="Interactive Business Card. Press Enter to flip."
    >
      <div
        ref={card3DRef}
        className="card-3d"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Face: Matte Black Metal Aesthetic */}
        <div className="card-face card-front">
          <div className="card-front-top">
            <div className="card-chip-brand">
              <div className="metal-smart-chip" aria-label="Smart NFC Contact Chip">
                <div className="chip-trace chip-trace-1" />
                <div className="chip-trace chip-trace-2" />
                <div className="chip-core" />
              </div>
            </div>
            <div className="card-nfc-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 10a12 12 0 0 1 16 0" />
                <path d="M7 13a8 8 0 0 1 10 0" />
                <path d="M10 16a4 4 0 0 1 4 0" />
              </svg>
              <span>NFC</span>
            </div>
          </div>

          <div className="card-front-center">
            <h3 className="card-holder-name">AMBROS STUDIO</h3>
            <span className="card-holder-title">Digital Member</span>
          </div>

          <div className="card-front-bottom">
            <span className="card-tagline-text">MATTE BLACK EDITION</span>
            <span className="card-metal-tag">NFC &bull; Solid Stainless Steel</span>
          </div>
        </div>

        {/* Back Face: Clear Information + Sharp Scannable QR Code */}
        <div className="card-face card-back">
          <div className="card-back-grid">
            <div className="card-back-info">
              <div className="card-back-person">
                <h4 className="card-back-name">Ambros Studio</h4>
                <span className="card-back-role">Creative &amp; Digital Team</span>
              </div>

              <div className="card-contact-lines">
                <div className="card-contact-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+91 99984 41519</span>
                </div>
                <div className="card-contact-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>ambrosstudio.z@gmail.com</span>
                </div>
                <div className="card-contact-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Althan, Surat, Gujarat</span>
                </div>
              </div>

              <div className="card-back-actions">
                <a
                  href="tel:+919998441519"
                  className="card-action-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Call</span>
                </a>
                <a
                  href="https://wa.me/919998441519"
                  className="card-action-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Clean Scannable QR Code */}
            <div className="card-back-qr">
              <div className="qr-code-box">
                <img src="/assets/contact-qr.svg" alt="Scan to Save Contact" />
              </div>
              <span className="qr-scan-label">Scan Contact</span>
              <span className="qr-scan-sub">Tap or scan to open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
