'use client';

import { useEffect } from 'react';

/**
 * Last-line viewport guard.
 * CSS remains the source of truth; this catches regressions from future
 * templates/components and keeps focused controls visible above mobile keyboards.
 */
export function ViewportStabilityGuard() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    const stabilize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const viewport = window.visualViewport;
        const width = Math.round(viewport?.width ?? root.clientWidth);
        const height = Math.round(viewport?.height ?? window.innerHeight);
        root.style.setProperty('--foon-visual-width', width + 'px');
        root.style.setProperty('--foon-visual-height', height + 'px');

        // Do not mask intentional component scrollers; only flag document overflow.
        const overflow = Math.max(0, root.scrollWidth - root.clientWidth);
        root.toggleAttribute('data-foon-overflow', overflow > 1);
      });
    };

    const keepFocusedControlVisible = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
      window.setTimeout(() => {
        target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
        stabilize();
      }, 180);
    };

    stabilize();
    window.addEventListener('resize', stabilize, { passive: true });
    window.addEventListener('orientationchange', stabilize, { passive: true });
    window.visualViewport?.addEventListener('resize', stabilize, { passive: true });
    window.visualViewport?.addEventListener('scroll', stabilize, { passive: true });
    document.addEventListener('focusin', keepFocusedControlVisible);

    const observer = new ResizeObserver(stabilize);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', stabilize);
      window.removeEventListener('orientationchange', stabilize);
      window.visualViewport?.removeEventListener('resize', stabilize);
      window.visualViewport?.removeEventListener('scroll', stabilize);
      document.removeEventListener('focusin', keepFocusedControlVisible);
    };
  }, []);

  return null;
}
