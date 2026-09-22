'use client';

import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Professional Website Designing',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in your name and WhatsApp number.');
      return;
    }

    const text = encodeURIComponent(
      `Hello AbrosStudio! 👋\n\nI’d like to discuss a project with you:\n• Name: ${formData.name}\n• Phone: ${formData.phone}\n• Email: ${formData.email || 'N/A'}\n• Service: ${formData.service}\n• Details: ${formData.message || 'I would like to discuss my requirements.'}`
    );

    const whatsappUrl = `https://wa.me/919998441519?text=${text}`;
    setIsSubmitted(true);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="contact-form-card">
      <div className="form-card-header">
        <span className="kicker">Direct Inquiry</span>
        <h3>Start a Conversation</h3>
        <p className="form-subtext">
          Tell us about your business goals. We respond on WhatsApp within a few hours.
        </p>
      </div>

      {isSubmitted ? (
        <div style={{ textAlign: 'center', padding: '36px 16px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(251, 191, 2, 0.15)',
              color: 'var(--color-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              fontSize: '1.8rem',
            }}
          >
            &#10003;
          </div>
          <h4 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>
            Inquiry Dispatched to WhatsApp!
          </h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '22px' }}>
            We have opened your inquiry directly in WhatsApp. You can also message Anas Shaikh directly at +91 99984 41519.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsSubmitted(false)}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="studio-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. Rajesh Patel"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">WhatsApp / Phone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="+91 98765 43210"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@company.com"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="service" className="form-label">Primary Requirement</label>
              <select
                id="service"
                name="service"
                className="form-input form-select"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              >
                <option value="Professional Website Designing">Professional Website Designing</option>
                <option value="Targeted Meta Ad Campaigns">Targeted Meta Ad Campaigns</option>
                <option value="Digital Visiting Card">Digital Visiting Card</option>
                <option value="Complete Brand Identity Suite">Complete Brand Identity Suite</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">Tell Us About Your Project</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="What are your goals, current challenges, or timeline?"
              className="form-input"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            <span>Send WhatsApp Inquiry</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
