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

// Switches the global period selector to the current calendar month so
// month-scoped widgets (Gastos vs Orçamento) have data.
async function selectThisMonth(page) {
  const pill = page.getByText('Últimos 30 dias').first();
  if (!(await pill.count())) return;
  await pill.click();
  await page.waitForTimeout(600);
  await page.getByText('Este mês', { exact: true }).first().click();
  await page.waitForTimeout(400);
  const ok = page.getByRole('button', { name: 'OK' });
  if (await ok.count()) await ok.click();
  await page.waitForTimeout(4000);
  // park the cursor and reset scroll so the shot is clean and from the top.
  // The app scrolls inside its main panel, not the window.
  await page.mouse.move(5, 5);
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    for (const el of document.querySelectorAll('*')) {
      if (el.scrollTop > 0) el.scrollTop = 0;
    }
  });
  await page.waitForTimeout(1200);
}

// The test account has chat history, so /chat opens the last conversation.
// Start a new chat to reach the empty state with the suggested-prompt cards.
async function newChat(page) {
  const novoChat = page.getByRole('button', { name: /Novo chat/i }).first();
  if (await novoChat.count()) {
    await novoChat.click();
    await page.waitForTimeout(2000);
  }
  await page.getByText('Quanto eu já gastei este mês?').first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
}

const SHOTS = [
  { route: '/', name: 'dashboard', viewport: DESKTOP, settle: 6000, prepare: selectThisMonth },
  { route: '/chat', name: 'bunny-ia', viewport: DESKTOP, settle: 4000, prepare: newChat },
  { route: '/previsao', name: 'previsao', viewport: DESKTOP, settle: 5000 },
  { route: '/agendamentos', name: 'agendamentos', viewport: DESKTOP, settle: 5000 },
  { route: '/metas', name: 'metas', viewport: DESKTOP, settle: 4000 },
  { route: '/orcamentos', name: 'orcamentos', viewport: DESKTOP, settle: 12000 },
  { route: '/relatorios', name: 'relatorios', viewport: DESKTOP, settle: 5000 },
  { route: '/agendamentos', name: 'agendamentos-mobile', viewport: MOBILE, settle: 5000 },
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
    if (shot.prepare) await shot.prepare(page);
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
