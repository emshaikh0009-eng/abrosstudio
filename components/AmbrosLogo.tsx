'use client';

import React from 'react';

interface AmbrosLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  height?: number;
  width?: number;
  alt?: string;
}

export default function AmbrosLogo({
  variant = 'light',
  className = '',
  height = 32,
  alt = 'Ambros Studio - Crafted with Purpose',
}: AmbrosLogoProps) {
  // Variant 'light': for dark backgrounds (ivory lettering #F5F1E8, gold triangle, emerald line)
  // Variant 'dark': for light backgrounds (black lettering, gold triangle, emerald line)
  const src = variant === 'light' ? '/assets/ambros-logo-light.png' : '/assets/ambros-logo.png';

  return (
    <img
      src={src}
      alt={alt}
      height={height}
      className={`ambros-logo-img ${className}`}
      style={{
        display: 'block',
        height: `${height}px`,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
      }}
    />
  );
}
