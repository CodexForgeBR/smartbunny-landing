import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isDesktop = () => window.matchMedia('(min-width: 769px)').matches;

export { gsap, ScrollTrigger };

/** Simple fade-up reveal for [data-reveal] elements, skipped under reduced motion. */
export function setupReveals(): void {
  if (reducedMotion) return;
  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  }
}
