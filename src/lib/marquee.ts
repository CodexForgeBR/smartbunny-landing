import { gsap, reducedMotion } from './motion';

/** Infinite horizontal loop; duplicated content + xPercent -50. Pauses off-screen. */
export function setupMarquee(track: HTMLElement): void {
  const row = track.querySelector<HTMLElement>('.marquee__row');
  if (!row) return;
  row.innerHTML += row.innerHTML; // duplicate for seamless wrap
  if (reducedMotion) return;

  const tween = gsap.to(row, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  new IntersectionObserver(([entry]) =>
    entry.isIntersecting ? tween.play() : tween.pause(),
  ).observe(track);
}
