import { gsap, reducedMotion } from '../lib/motion';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function setupForecast(): void {
  // animated BRL counters
  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    const target = Number(el.dataset.count);
    if (reducedMotion) {
      el.textContent = brl.format(target);
      continue;
    }
    const state = { value: 0 };
    gsap.to(state, {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = brl.format(state.value)),
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  }

}
