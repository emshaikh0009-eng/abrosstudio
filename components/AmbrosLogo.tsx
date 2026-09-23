'use client';

import React from 'react';

interface AmbrosLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  height?: number;
  width?: number;
}

export default function AmbrosLogo({
  variant = 'light',
  className = '',
  height = 26,
}: AmbrosLogoProps) {
  // Variant 'light': for dark backgrounds (letters are warm ivory #F5F1E8, triangle is warm gold #D7AA4A)
  // Variant 'dark': for light/ivory backgrounds (letters are dark emerald #073D2E, triangle is warm gold #D7AA4A)
  const textColor = variant === 'light' ? '#F5F1E8' : '#073D2E';
  const goldColor = '#D7AA4A';

  // Proportions: viewBox 0 0 320 54
  // Exact geometric wordmark: A M B R O S
  return (
    <svg
      viewBox="0 0 320 54"
      height={height}
      className={`ambros-logo-svg ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', height: `${height}px`, width: 'auto' }}
      aria-label="AMBROS"
    >
      {/* Letter 'A' with central gold triangle */}
      <g id="letter-A">
        {/* Left and right outer diagonal chevron legs */}
        <path
          d="M24 2 L46 52 H34 L24 26 L14 52 H2 Z"
          fill={textColor}
        />
        {/* Signature Central Gold Triangle */}
        <polygon
          points="24,32 30.5,44 17.5,44"
          fill={goldColor}
        />
      </g>

      {/* Letter 'M' */}
      <g id="letter-M">
        <path
          d="M56 2 H67 L80 32 L93 2 H104 V52 H93 V18 L82.5 44 H77.5 L67 18 V52 H56 Z"
          fill={textColor}
        />
      </g>

      {/* Letter 'B' */}
      <g id="letter-B">
        <path
          d="M115 2 H142 C151 2 157 7 157 15 C157 21 153 25 146 26 C154 27 159 32 159 39 C159 47 152 52 143 52 H115 Z M127 12 V22 H140 C144 22 146 20 146 17 C146 14 144 12 140 12 Z M127 31 V42 H142 C146 42 148 40 148 36.5 C148 33 146 31 142 31 Z"
          fill={textColor}
        />
      </g>

      {/* Letter 'R' */}
      <g id="letter-R">
        <path
          d="M170 2 H197 C206 2 212 8 212 17 C212 24 207 29 199 30 L214 52 H200 L187 32 H182 V52 H170 Z M182 12 V23 H196 C199.5 23 201 21 201 17.5 C201 14 199.5 12 196 12 Z"
          fill={textColor}
        />
      </g>

      {/* Letter 'O' */}
      <g id="letter-O">
        <path
          d="M236 2 H262 C273 2 280 9 280 20 V34 C280 45 273 52 262 52 H236 C225 52 218 45 218 34 V20 C218 9 225 2 236 2 Z M268 21 C268 14 265 12 260 12 H238 C233 12 230 14 230 21 V33 C230 40 233 42 238 42 H260 C265 42 268 40 268 33 Z"
          fill={textColor}
        />
      </g>

      {/* Letter 'S' */}
      <g id="letter-S">
        <path
          d="M291 2 H316 V12 H295 C292 12 290 14 290 17 C290 20 292 22 296 23 L309 26 C317 28 320 33 320 40 C320 48 314 52 304 52 H280 V42 H304 C307 42 309 40 309 37 C309 34 307 32 303 31 L291 28 C283 26 280 21 280 14 C280 6 285 2 291 2 Z"
          fill={textColor}
        />
      </g>
    </svg>
  );
}
