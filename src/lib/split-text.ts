import { gsap, reducedMotion } from './motion';

/**
 * Splits [data-split] headlines into word spans and animates them in on scroll.
 * Keeps the original text accessible via aria-label on the parent.
 */
export function setupSplitText(): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-split]')) {
    const text = el.textContent?.trim() ?? '';
    if (!text || reducedMotion) continue;

    el.setAttribute('aria-label', text);
    el.innerHTML = text
      .split(/\s+/)
      .map((word) => `<span class="word" aria-hidden="true"><span>${word}</span></span>`)
      .join(' ');

    gsap.from(el.querySelectorAll('.word > span'), {
      yPercent: 110,
      duration: 0.85,
      ease: 'power4.out',
      stagger: 0.055,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  }
}
