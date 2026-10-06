'use client';

import { useEffect } from 'react';

/**
 * FOON viewport guard.
 * Width is intentionally based on the layout viewport (clientWidth), which stays
 * stable while iOS animates the software keyboard. visualViewport is used only
 * for usable height so keyboard animation cannot make the page wobble sideways.
 */
export function ViewportStabilityGuard() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let focusTimer = 0;

    const stabilize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const viewport = window.visualViewport;
        const width = root.clientWidth;
        const height = Math.round(viewport?.height ?? window.innerHeight);
        root.style.setProperty('--foon-layout-width', width + 'px');
        root.style.setProperty('--foon-visual-height', height + 'px');
        const overflow = root.scrollWidth - width;
        root.toggleAttribute('data-foon-overflow', overflow > 1);
        if (overflow > 1) {
          // Self-heal accidental horizontal document drift without touching
          // intentional nested scrollers such as category strips.
          if (window.scrollX !== 0) window.scrollTo({ left: 0, top: window.scrollY, behavior: 'auto' });
        }
      });
    };

    const keepFocusedControlVisible = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        // Vertical correction only. Avoid smooth/inline scrolling: on iOS those
        // animations can create a visible horizontal shake during keyboard entry.
        const vv = window.visualViewport;
        const rect = target.getBoundingClientRect();
        const top = vv?.offsetTop ?? 0;
        const bottom = top + (vv?.height ?? window.innerHeight);
        if (rect.bottom > bottom - 24 || rect.top < top + 24) {
          target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
        }
        stabilize();
      }, 260);
    };

    stabilize();
    window.addEventListener('resize', stabilize, { passive: true });
    window.addEventListener('orientationchange', stabilize, { passive: true });
    window.visualViewport?.addEventListener('resize', stabilize, { passive: true });
    document.addEventListener('focusin', keepFocusedControlVisible);

    const observer = new ResizeObserver(stabilize);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(focusTimer);
      observer.disconnect();
      window.removeEventListener('resize', stabilize);
      window.removeEventListener('orientationchange', stabilize);
      window.visualViewport?.removeEventListener('resize', stabilize);
      document.removeEventListener('focusin', keepFocusedControlVisible);
    };
  }, []);

  return null;
}
