'use client';

import React from 'react';

export default function FloatingWhatsApp() {
  const whatsappUrl =
    'https://wa.me/919998441519?text=Hi%20AmbrosStudio!%20%F0%9F%91%8B%20I%E2%80%99d%20like%20to%20know%20more%20about%20your%20services%20and%20discuss%20my%20requirements.';

  return (
    <aside aria-label="Quick WhatsApp Contact" className="wa-fixed-wrapper">
      <a
        href={whatsappUrl}
        className="wa-floating-btn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Ambros"
      >
        <span className="wa-pulse-ring" aria-hidden="true" />
        <svg
          className="wa-icon"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M12.031 2C6.516 2 2.031 6.484 2.031 12C2.031 13.91 2.568 15.698 3.504 17.218L2 22.75L7.697 21.282C9.096 22.052 10.518 22.467 12.031 22.467C17.546 22.467 22.031 17.983 22.031 12.467C22.031 6.951 17.546 2 12.031 2ZM17.29 16.32C17.07 16.94 16.198 17.47 15.526 17.618C15.068 17.717 14.471 17.795 12.455 16.96C9.882 15.892 8.219 13.284 8.09 13.114C7.965 12.944 7.051 11.731 7.051 10.477C7.051 9.223 7.692 8.614 7.927 8.358C8.161 8.102 8.435 8.04 8.638 8.04C8.841 8.04 9.044 8.044 9.216 8.053C9.399 8.062 9.537 8.026 9.693 8.4C9.882 8.857 10.34 9.972 10.395 10.089C10.457 10.206 10.512 10.354 10.426 10.518C10.34 10.682 10.278 10.761 10.153 10.909C10.028 11.057 9.895 11.237 9.778 11.37C9.645 11.518 9.505 11.674 9.661 11.939C9.817 12.204 10.356 13.087 11.153 13.797C12.184 14.717 13.02 15.014 13.293 15.146C13.566 15.279 13.738 15.247 13.894 15.068C14.05 14.888 14.558 14.295 14.745 14.03C14.933 13.765 15.128 13.804 15.355 13.889C15.589 13.975 16.839 14.592 17.097 14.724C17.355 14.857 17.527 14.92 17.589 15.029C17.652 15.138 17.652 15.669 17.432 16.29L17.29 16.32Z" />
        </svg>
        <span className="wa-cta-label">WhatsApp Ambros &rarr;</span>
      </a>
    </aside>
  );
}
