import { createRequire } from 'node:module';
import { homedir } from 'node:os';

const require = createRequire(`${homedir()}/source/smartrabbit/package.json`);
const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:5173/SmartRabbit';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

let shown = 0;
page.on('response', async (r) => {
  if (r.status() >= 400 && shown < 3) {
    shown++;
    let body = '';
    try { body = (await r.text()).slice(0, 300); } catch {}
    console.log('HTTP', r.status(), r.url().slice(0, 120), '\n  BODY:', body);
  }
});
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200));
});

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const emailInput = page.locator('input[type="email"]');
if (await emailInput.count()) {
  await emailInput.fill('testuser@codexforge.com');
  await page.locator('input[type="password"]').fill('K6Test@2026SmartRabbit');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 30000 });
}
await page.waitForTimeout(10000);
console.log('URL now:', page.url());
await browser.close();
