// Captures SmartRabbit app screenshots for the landing page.
// Borrows playwright from the smartrabbit app's node_modules.
//   node ~/source/smartbunny-landing/scripts/capture-screens.mjs
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';

const require = createRequire(`${homedir()}/source/smartrabbit/package.json`);
const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:5173/SmartRabbit';
const OUT = new URL('../src/assets/screens/raw/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const EMAIL = 'testuser@codexforge.com';
const PASSWORD = 'K6Test@2026SmartRabbit';

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const SHOTS = [
  { route: '/', name: 'dashboard', viewport: DESKTOP, settle: 6000 },
  { route: '/previsao', name: 'previsao', viewport: DESKTOP, settle: 5000 },
  { route: '/simulacao', name: 'simulacao', viewport: DESKTOP, settle: 5000 },
  { route: '/metas', name: 'metas', viewport: DESKTOP, settle: 4000 },
  { route: '/orcamentos', name: 'orcamentos', viewport: DESKTOP, settle: 12000 },
  { route: '/relatorios', name: 'relatorios', viewport: DESKTOP, settle: 5000 },
  { route: '/transacoes', name: 'transacoes', viewport: DESKTOP, settle: 4000 },
  { route: '/importacoes', name: 'importacoes-mobile', viewport: MOBILE, settle: 4000 },
  { route: '/transacoes', name: 'transacoes-mobile', viewport: MOBILE, settle: 4000 },
  { route: '/metas', name: 'metas-mobile', viewport: MOBILE, settle: 4000 },
  { route: '/', name: 'dashboard-mobile', viewport: MOBILE, settle: 6000 },
];

const browser = await chromium.launch();

async function login(page) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.count()) {
    await emailInput.fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 30000 });
    await page.waitForLoadState('networkidle');
  }
}

// One context per viewport, login once each, reuse session within it.
for (const viewport of [DESKTOP, MOBILE]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await login(page);
  for (const shot of SHOTS.filter((s) => s.viewport === viewport)) {
    await page.goto(`${BASE}${shot.route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(shot.settle);
    if (viewport === MOBILE) {
      // close the overlay sidebar drawer if it is open
      await page.keyboard.press('Escape');
      const collapse = page.locator('button:has(svg.lucide-chevron-left)').first();
      if (await collapse.count()) await collapse.click().catch(() => {});
      await page.waitForTimeout(800);
    }
    // hide floating dev/debug FABs pinned to the bottom-right corner
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed') continue;
        const r = el.getBoundingClientRect();
        const nearRight = window.innerWidth - r.right < 120;
        const nearBottom = window.innerHeight - r.bottom < 120;
        const small = r.width < 120 && r.height < 120;
        if (nearRight && nearBottom && small) el.style.display = 'none';
      }
    });
    await page.waitForTimeout(200);
    const path = `${OUT}${shot.name}.png`;
    await page.screenshot({ path });
    console.log(`captured ${shot.name} -> ${path}`);
  }
  await context.close();
}

await browser.close();
console.log('done');
