import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/600.css';
import '@fontsource/maven-pro/500.css';
import '@fontsource/maven-pro/700.css';
import '@fontsource/maven-pro/900.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/sections/nav.css';
import './styles/sections/hero.css';
import './styles/sections/marquee.css';
import './styles/sections/bento.css';
import './styles/sections/import.css';
import './styles/sections/forecast.css';
import './styles/sections/goals.css';
import './styles/sections/security.css';
import './styles/sections/cta.css';

import Lenis from 'lenis';
import { gsap, ScrollTrigger, reducedMotion, setupReveals } from './lib/motion';
import { setupSplitText } from './lib/split-text';
import { setupParticles } from './lib/particles';
import { setupMarquee } from './lib/marquee';
import { setupNav } from './sections/nav';
import { setupHero } from './sections/hero';
import { setupImportAi } from './sections/import-ai';
import { setupForecast } from './sections/forecast';
import { setupGoals } from './sections/goals';

// smooth scroll, synced with ScrollTrigger
if (!reducedMotion) {
  const lenis = new Lenis({ duration: 1.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // exposed for tooling (screenshot/verification scripts drive scroll through Lenis)
  (window as Window & { __lenis?: Lenis }).__lenis = lenis;
}

setupNav();
setupSplitText();
setupReveals();
setupHero();
setupImportAi();
setupForecast();
setupGoals();

const particles = document.getElementById('particles') as HTMLCanvasElement | null;
if (particles) setupParticles(particles);

const marquee = document.getElementById('marquee');
if (marquee) setupMarquee(marquee);

window.addEventListener('load', () => ScrollTrigger.refresh());
