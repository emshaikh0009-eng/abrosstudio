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
    <div className="testimonials-slider">
      <div className="slider-wrapper">
        <div
          className="testimonials-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: 'transform 0.5s ease-in-out' }}
        >
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-slide">
              <div className="stars-row">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg
                    key={i}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="star-icon"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="client-author">
                <img src={t.avatar} alt={t.name} className="client-avatar" />
                <div className="client-meta">
                  <h4 className="client-name">{t.name}</h4>
                  <span
                    className="client-role"
                    dangerouslySetInnerHTML={{ __html: t.role }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="slider-controls">
        <button
          className="slider-prev"
          onClick={handlePrev}
          aria-label="Previous review"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="slider-dots">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          className="slider-next"
          onClick={handleNext}
          aria-label="Next review"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
