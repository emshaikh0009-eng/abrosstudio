'use client';

import React, { useState, useEffect } from 'react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'AbrosStudio completely transformed how our restaurant looks online. We used to struggle getting reservations on weekdays; now our WhatsApp booking button is pinging every evening. Anas understood our vision from day one.',
    name: 'Rajesh Patel',
    role: 'Owner, Zaika Gourmet Dining &bull; Surat',
    avatar: '/assets/avatar-rajesh.jpg',
    rating: 5,
  },
  {
    quote:
      'Our new brand identity and digital cards make us look like an international luxury salon. When clients tap our metal card on their phone at events, their immediate reaction is pure awe. Worth every rupee.',
    name: 'Priya Sharma',
    role: 'Founder, Aura Salon & Studio &bull; Surat',
    avatar: '/assets/avatar-priya.jpg',
    rating: 5,
  },
  {
    quote:
      'Fast turnaround, zero fluff, and pristine attention to design aesthetics. Anas delivered our luxury property portfolio site within 10 days. The WhatsApp inquiry integration has given us our highest lead conversion to date.',
    name: 'Vikram Desai',
    role: 'MD, PrimeHabitat Residences &bull; Gujarat',
    avatar: '/assets/avatar-vikram.jpg',
    rating: 5,
  },
];

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div className="testimonials-wrapper">
      <div className="testimonials-slider-container">
        <div
          className="testimonials-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-slide">
              <div className="quote-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-author-row">
                <div className="testimonial-avatar">
                  <img src={t.avatar} alt={t.name} />
                </div>
                <div className="testimonial-author-meta">
                  <span className="author-name">{t.name}</span>
                  <span className="author-business" dangerouslySetInnerHTML={{ __html: t.role }} />
                  <span className="author-location">Surat, Gujarat</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="slider-controls">
        <div className="slider-dots">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>
        <div className="slider-arrows">
          <button
            className="slider-arrow-btn slider-prev"
            onClick={handlePrev}
            aria-label="Previous review"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="slider-arrow-btn slider-next"
            onClick={handleNext}
            aria-label="Next review"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
