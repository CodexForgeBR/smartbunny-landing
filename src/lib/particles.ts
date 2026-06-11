import { reducedMotion, isDesktop } from './motion';

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  alpha: number;
}

/** Soft green dots drifting upward behind the hero. Skipped on mobile + reduced motion. */
export function setupParticles(canvas: HTMLCanvasElement): void {
  if (reducedMotion || !isDesktop()) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio, 1.5);
  let particles: Particle[] = [];
  let raf = 0;
  let running = false;

  function resize(): void {
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    particles = Array.from({ length: 55 }, () => spawn(true));
  }

  function spawn(anywhere = false): Particle {
    return {
      x: Math.random() * canvas.width,
      y: anywhere ? Math.random() * canvas.height : canvas.height + 10,
      r: (1 + Math.random() * 2.4) * dpr,
      speed: (0.15 + Math.random() * 0.4) * dpr,
      drift: (Math.random() - 0.5) * 0.2 * dpr,
      alpha: 0.12 + Math.random() * 0.4,
    };
  }

  function tick(): void {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10) particles[i] = spawn();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 226, 139, ${p.alpha})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  }

  function start(): void {
    if (!running) {
      running = true;
      raf = requestAnimationFrame(tick);
    }
  }

  function stop(): void {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(canvas);
}
