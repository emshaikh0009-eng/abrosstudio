'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollObserver component for smooth scroll reveal animations.
 * 
 * Features:
 * 1. Zero-invisible-content guarantee: Elements are visible by default in SSR / no-JS.
 *    Only after mounting does it add `js-loaded` to <html>.
 * 2. Instant reveal for above-the-fold elements: Anything already in or near the viewport
 *    gets .visible immediately without flashing invisible.
 * 3. Dual-mode detection: IntersectionObserver + passive scroll handler ensures even rapid
 *    fling scrolling on mobile never leaves an element invisible.
 * 4. Route-change aware: Re-runs on pathname change so page transitions animate smoothly.
 * 5. Respects prefers-reduced-motion via CSS.
 */
export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Signal that client JS is active
    document.documentElement.classList.add('js-loaded');

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>('.fade-in-up, .fade-in-scale')
    );
    if (revealElements.length === 0) return;

    const reveal = (el: HTMLElement) => {
      el.classList.add('visible');
      el.removeAttribute('data-scroll-reveal');
    };

    // 2. Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(reveal);
      return;
    }

    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    // 3. Elements already in, above, or near viewport become immediately visible
    const pendingElements: HTMLElement[] = [];
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= windowHeight * 0.92) {
        reveal(el);
      } else {
        el.setAttribute('data-scroll-reveal', 'pending');
        pendingElements.push(el);
      }
    });

    if (pendingElements.length === 0) return;

    // 4. IntersectionObserver for smooth entrance
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight + 80) {
            const target = entry.target as HTMLElement;
            reveal(target);
            obs.unobserve(target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '200px 0px 80px 0px',
      }
    );

    pendingElements.forEach((el) => observer.observe(el));

    // 5. Passive scroll listener failsafe so rapid scrolling or fling never leaves an element invisible
    const handleScroll = () => {
      const vh = window.innerHeight;
      let remaining = 0;
      pendingElements.forEach((el) => {
        if (el.classList.contains('visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh + 80) {
          reveal(el);
          observer.unobserve(el);
        } else {
          remaining++;
        }
      });
      if (remaining === 0) {
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  return null;
}
