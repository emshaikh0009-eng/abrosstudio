'use client';

import React, { useState } from 'react';

interface ServiceAccordionItemProps {
  buttonLabel?: string;
  children: React.ReactNode;
}

export default function ServiceAccordionItem({
  buttonLabel = 'View Details',
  children,
}: ServiceAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`service-accordion-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="service-accordion-toggle-wrap">
        <button
          type="button"
          className="service-accordion-btn"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          <span>{isOpen ? 'Hide Details' : buttonLabel}</span>
          <svg
            className={`service-accordion-chevron ${isOpen ? 'rotate' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className={`service-accordion-content ${isOpen ? 'expanded' : 'collapsed'}`}>
        <div className="service-accordion-inner">{children}</div>
      </div>
    </div>
  );
}
