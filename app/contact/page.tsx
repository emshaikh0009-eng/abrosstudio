import React from 'react';
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Studio | Book a Demo | Ambros Studio Surat',
  description:
    'Get in touch with Ambros Studio in Surat, Gujarat. Discuss custom web design, Meta ad campaigns, or digital metal NFC business cards with our team.',
};

export default function ContactPage() {
  const demoWhatsAppUrl =
    'https://wa.me/919998441519?text=Hi%20AmbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services%20and%20discuss%20my%20requirements.';

  return (
    <>
      {/* 1. Contact Hero Header — Deep Emerald */}
      <section className="hero section-emerald" style={{ paddingBottom: '30px' }}>
        <div className="container">
          <div className="section-header" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="kicker">Direct Studio Consultation</span>
            <h1 className="hero-title">
              Let&rsquo;s Build Your Brand’s Digital Authority
            </h1>
            <p className="hero-desc" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Whether you need a high-converting website, high-impact Meta ad campaigns, or luxury metal NFC business cards, we are ready to assist.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Contact Section — Warm Ivory */}
      <section className="section section-ivory" style={{ paddingTop: '50px', paddingBottom: '70px' }}>
        <div className="container">
          <div className="contact-layout-grid">
            {/* Direct Contact Info & Map Card */}
            <div className="contact-info-col fade-in-up">
              <span className="kicker">Studio Headquarters</span>
              <h2>Speak Directly With Our Team</h2>
              <p className="lead" style={{ marginBottom: '28px', color: 'var(--text-light-muted)' }}>
                We believe in direct, candid communication. Message us on WhatsApp or submit your details to schedule a personal project walk-through.
              </p>

              <div className="contact-cards-stack">
                <div className="service-card contact-method-card" style={{ background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="nfc-track-icon" style={{ background: '#073D2E', color: 'var(--color-gold)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ color: '#073D2E', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Direct Phone &amp; WhatsApp</h4>
                      <a href="tel:+919998441519" style={{ color: '#073D2E', fontSize: '1.05rem', fontWeight: 700, wordBreak: 'break-word' }}>+91 99984 41519</a>
                    </div>
                  </div>
                </div>

                <div className="service-card contact-method-card" style={{ background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="nfc-track-icon" style={{ background: '#073D2E', color: 'var(--color-gold)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ color: '#073D2E', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Inquiries</h4>
                      <a href="mailto:ambrosstudio.z@gmail.com" style={{ color: '#073D2E', fontSize: '1.05rem', fontWeight: 700, wordBreak: 'break-all', overflowWrap: 'anywhere' }}>ambrosstudio.z@gmail.com</a>
                    </div>
                  </div>
                </div>

                <div className="service-card contact-method-card" style={{ background: '#FFFFFF', border: '1px solid rgba(7, 61, 46, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="nfc-track-icon" style={{ background: '#073D2E', color: 'var(--color-gold)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ color: '#073D2E', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Studio Address</h4>
                      <p style={{ color: '#2C3531', fontSize: '0.95rem', fontWeight: 600, margin: 0, wordBreak: 'break-word' }}>
                        VIP Gallaria, Althan, Surat, Gujarat 395017
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book a Demo CTA */}
              <div style={{ marginTop: '28px' }}>
                <a
                  href={demoWhatsAppUrl}
                  className="btn btn-primary btn-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Book a Demo (Instant WhatsApp)</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Map Container */}
              <div className="map-frame-box" style={{ marginTop: '24px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(7, 61, 46, 0.15)', height: '220px' }}>
                <iframe
                  title="AmbrosStudio Surat Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14884.287848604724!2d72.79836371285408!3d21.14954483783935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e0e56d7825d%3A0xe54d922a96a3cfbf!2sAlthan%2C%20Surat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="fade-in-up">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Frequently Asked Questions — Soft Ivory */}
      <section className="section section-ivory-soft">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Common Questions</span>
            <h2>Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Clear answers to help you understand how we work and what to expect.
            </p>
          </div>

          <div className="contact-faq-grid">
            <div className="service-card faq-card">
              <h4 style={{ color: '#073D2E', marginBottom: '10px', fontSize: '1.05rem' }}>
                How fast can our website go live?
              </h4>
              <p style={{ color: 'var(--text-light-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Most bespoke websites are designed, coded, and deployed live within 7 to 14 business days from content receipt.
              </p>
            </div>

            <div className="service-card faq-card">
              <h4 style={{ color: '#073D2E', marginBottom: '10px', fontSize: '1.05rem' }}>
                What makes Ambros Studio different?
              </h4>
              <p style={{ color: 'var(--text-light-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                You collaborate directly with our core dedicated team. Zero outsourced layers, zero off-the-shelf templates, and high velocity.
              </p>
            </div>

            <div className="service-card faq-card">
              <h4 style={{ color: '#073D2E', marginBottom: '10px', fontSize: '1.05rem' }}>
                How do metal NFC cards work?
              </h4>
              <p style={{ color: 'var(--text-light-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Tap the card on any NFC-compatible smartphone to open your verified profile instantly. A crisp back QR code is also provided for universal scanning.
              </p>
            </div>

            <div className="service-card faq-card">
              <h4 style={{ color: '#073D2E', marginBottom: '10px', fontSize: '1.05rem' }}>
                Do you manage Meta ads ongoing?
              </h4>
              <p style={{ color: 'var(--text-light-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Yes, we offer ongoing management including continuous creative testing, audience optimization, and direct WhatsApp lead tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
