'use client';

import React, { useState } from 'react';

export default function FounderPortrait() {
  const [isColor, setIsColor] = useState(false);

  return (
    <div
      className={`founder-portrait-frame fade-in-up ${isColor ? 'active' : ''}`}
      onClick={() => setIsColor((prev) => !prev)}
      tabIndex={0}
      role="button"
      aria-label="Toggle color effect on founder portrait"
      style={{ cursor: 'pointer' }}
    >
      <img
        src="/assets/anas-shaikh.jpg"
        alt="Anas Shaikh, Founder of AbrosStudio"
        className="founder-portrait-img"
        style={{
          filter: isColor ? 'grayscale(0%)' : undefined,
        }}
      />
      <div className="founder-caption-pill">
        <strong>Anas Shaikh</strong> &bull; Founder
      </div>
    </div>
  );
}
