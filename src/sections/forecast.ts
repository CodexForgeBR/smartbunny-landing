import { gsap, ScrollTrigger, reducedMotion } from '../lib/motion';

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

  // self-drawing projection line + what-if branch over the screenshot
  const path = document.querySelector<SVGPathElement>('#forecast-path');
  const branch = document.querySelector<SVGPathElement>('#forecast-branch');
  if (!path || !branch) return;

  const pathLen = path.getTotalLength();
  const branchLen = branch.getTotalLength();

  if (reducedMotion) return; // strokes stay visible as authored

  gsap.set(path, { strokeDasharray: pathLen, strokeDashoffset: pathLen });
  gsap.set(branch, { strokeDasharray: `10 10`, strokeDashoffset: branchLen, opacity: 0 });

  ScrollTrigger.create({
    trigger: '.forecast__shot',
    start: 'top 75%',
    end: 'bottom 55%',
    scrub: 1,
    onUpdate(self) {
      gsap.set(path, { strokeDashoffset: pathLen * (1 - self.progress) });
      if (self.progress > 0.6) {
        const p = (self.progress - 0.6) / 0.4;
        gsap.set(branch, { opacity: 1, strokeDashoffset: branchLen * (1 - p) });
      } else {
        gsap.set(branch, { opacity: 0 });
      }
    },
  });
}
