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
 * 3. Route-change aware: Re-runs on pathname change so page transitions animate smoothly.
 * 4. Failsafe timeout (1.5s): Automatically reveals any remaining elements to prevent
 *    permanent invisibility under any edge case.
 * 5. Respects prefers-reduced-motion via CSS.
 */
export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Signal that client JS is active
    document.documentElement.classList.add('js-loaded');

    const revealElements = document.querySelectorAll<HTMLElement>('.fade-in-up');
    if (revealElements.length === 0) return;

    // 2. Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('visible'));
      return;
    }

    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    // 3. Immediately reveal any elements already in or above the viewport
    const pendingElements: HTMLElement[] = [];
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= windowHeight * 0.92 && rect.bottom >= 0) {
        el.classList.add('visible');
      } else {
        pendingElements.push(el);
      }
    });

    // 4. Observe remaining elements
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    pendingElements.forEach((el) => observer.observe(el));

    // 5. Fail-safe timer: after 1.5s, reveal all remaining elements
    const safetyTimer = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.fade-in-up:not(.visible)').forEach((el) => {
        el.classList.add('visible');
      });
    }, 1500);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
