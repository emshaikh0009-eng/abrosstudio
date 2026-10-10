import React from 'react';

export default function WebsiteShowcaseVisual() {
  return (
    <div className="website-showcase-container">
      <div className="showcase-browser-window">
        {/* Browser Top Navigation Bar */}
        <div className="browser-chrome-bar">
          <div className="browser-traffic-lights" aria-hidden="true">
            <span className="window-dot dot-close" />
            <span className="window-dot dot-min" />
            <span className="window-dot dot-max" />
          </div>

          <div className="browser-tabs-group" aria-hidden="true">
            <div className="browser-tab active-tab">
              <span className="tab-favicon">⚡</span>
              <span className="tab-title">The Zaffran — Luxury Dining</span>
            </div>
          </div>

          <div className="browser-url-pill">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00C49F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="url-text">https://ambrosstudio.com/work/the-zaffran</span>
          </div>

          <div className="browser-actions-placeholder" aria-hidden="true">
            <span className="action-circle" />
          </div>
        </div>

        {/* Viewport Content */}
        <div className="showcase-viewport">
          <img
            src="/assets/project-restaurant.jpg"
            alt="Ambros Studio bespoke website design showcase for luxury dining client"
            className="showcase-main-img"
            loading="lazy"
          />

          {/* Floating Studio Quality Badges */}
          <div className="showcase-floating-badge badge-top-right">
            <div className="badge-pulse-dot" />
            <div>
              <span className="badge-stat">99 / 100</span>
              <span className="badge-label">Lighthouse Speed</span>
            </div>
          </div>

          <div className="showcase-floating-badge badge-bottom-left">
            <div className="badge-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <span className="badge-stat">Instant WhatsApp Booking</span>
              <span className="badge-label">Zero-friction lead conversion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
