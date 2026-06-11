import { ScrollTrigger, reducedMotion, isDesktop } from '../lib/motion';

/**
 * Pinned scroll story on desktop: steps highlight while the phone screen
 * cross-fades. On mobile/reduced-motion the steps simply stay visible.
 */
export function setupImportAi(): void {
  const section = document.querySelector<HTMLElement>('.import');
  const steps = [...document.querySelectorAll<HTMLElement>('.import__step')];
  const screens = [...document.querySelectorAll<HTMLElement>('.phone-frame__screens img')];
  if (!section || steps.length === 0) return;

  function activate(index: number): void {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === index));
    screens.forEach((s, i) => s.classList.toggle('is-active', i === index));
  }

  if (reducedMotion || !isDesktop()) {
    steps.forEach((s) => s.classList.add('is-active'));
    return;
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=180%',
    pin: true,
    scrub: true,
    onUpdate(self) {
      activate(Math.min(steps.length - 1, Math.floor(self.progress * steps.length)));
    },
  });
}
