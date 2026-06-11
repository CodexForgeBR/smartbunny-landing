import { gsap, reducedMotion } from '../lib/motion';

const RING_CIRCUMFERENCE = 326.7;
const RING_TARGET = 0.62;

export function setupGoals(): void {
  const ring = document.querySelector<SVGCircleElement>('#goal-ring');
  const ringCount = document.querySelector<HTMLElement>('[data-ring-count]');
  const bars = document.querySelectorAll<HTMLElement>('.goals__bars .bar i');

  if (reducedMotion) {
    if (ring) ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - RING_TARGET));
    if (ringCount) ringCount.textContent = String(Math.round(RING_TARGET * 100));
    bars.forEach((b) => (b.style.transform = 'scaleX(1)'));
    return;
  }

  if (ring && ringCount) {
    const state = { p: 0 };
    gsap.to(state, {
      p: RING_TARGET,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate() {
        ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - state.p));
        ringCount.textContent = String(Math.round(state.p * 100));
      },
      scrollTrigger: { trigger: ring, start: 'top 85%' },
    });
  }

  gsap.to(bars, {
    scaleX: 1,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: { trigger: '.goals__bars', start: 'top 85%' },
  });
}
