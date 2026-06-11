import { gsap, ScrollTrigger, reducedMotion, isDesktop } from '../lib/motion';

export function setupHero(): void {
  if (reducedMotion) return;

  // mascot gentle float
  gsap.to('.hero__mascot', {
    y: -14,
    rotation: 2,
    duration: 2.6,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  // dashboard frame un-tilts and settles as you scroll
  const frame = document.querySelector('.hero__shot .browser-frame');
  if (frame && isDesktop()) {
    gsap.to(frame, {
      rotateX: 0,
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero__shot',
        start: 'top 85%',
        end: 'top 30%',
        scrub: 1,
      },
    });
  }

  // glow parallax
  gsap.to('.hero__glow', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // magnetic primary CTAs (desktop pointer only)
  if (isDesktop() && matchMedia('(pointer: fine)').matches) {
    for (const btn of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - r.left - r.width / 2) * 0.25,
          y: (e.clientY - r.top - r.height / 2) * 0.35,
          duration: 0.3,
        });
      });
      btn.addEventListener('pointerleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.5)' });
      });
    }
  }

  ScrollTrigger.refresh();
}
