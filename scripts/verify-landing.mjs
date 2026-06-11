// Visual verification of the landing page: full-page shots at desktop + mobile,
// console errors, failed requests, and horizontal-overflow check.
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { mkdirSync } from 'node:fs';

const require = createRequire(`${homedir()}/source/smartrabbit/package.json`);
const { chromium } = require('@playwright/test');

const URL = process.argv[2] ?? 'http://localhost:5180/smartbunny-landing/';
const OUT = '/tmp/sb-verify';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const [label, viewport] of [
  ['desktop', { width: 1440, height: 900 }],
  ['tablet', { width: 768, height: 1024 }],
  ['mobile', { width: 375, height: 667 }],
]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  const failed = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
  page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // scroll to bottom in steps so lazy images + scroll triggers fire.
  // Lenis owns the scroll position when active, so drive it through its API.
  await page.evaluate(async () => {
    const lenis = window.__lenis;
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  const overflow = await page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, 0),
  );
  await page.screenshot({ path: `${OUT}/${label}-full.png`, fullPage: true });
  console.log(`${label}: hOverflow=${overflow}px errors=${errors.length} failed=${failed.length}`);
  for (const e of errors.slice(0, 5)) console.log('  console:', e);
  for (const f of failed.slice(0, 5)) console.log('  failed:', f);
  await context.close();
}
// reduced-motion pass: everything must be visible without any scroll animation
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const hidden = await page.evaluate(() => {
    const sels = ['[data-reveal]', '[data-split]', '.bento__card', '.stat', '.security__card'];
    let count = 0;
    for (const sel of sels) {
      for (const el of document.querySelectorAll(sel)) {
        const cs = getComputedStyle(el);
        if (Number(cs.opacity) < 0.9 || cs.visibility === 'hidden') count++;
      }
    }
    return count;
  });
  await page.screenshot({ path: `${OUT}/reduced-motion.png`, fullPage: true });
  console.log(`reduced-motion: hidden elements = ${hidden} (must be 0)`);
  await context.close();
}

await browser.close();
console.log('shots in', OUT);
