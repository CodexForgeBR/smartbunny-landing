// Logs into SmartRabbit as the test user and prints the Cognito access token + sub.
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { writeFileSync } from 'node:fs';

const require = createRequire(`${homedir()}/source/smartrabbit/package.json`);
const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:5173/SmartRabbit';
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
const emailInput = page.locator('input[type="email"]');
if (await emailInput.count()) {
  await emailInput.fill('testuser@codexforge.com');
  await page.locator('input[type="password"]').fill('K6Test@2026SmartRabbit');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 30000 });
}
await page.waitForTimeout(2000);

const token = await page.evaluate(() => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('accessToken')) return localStorage.getItem(key);
  }
  return null;
});
await browser.close();

if (!token) {
  console.error('no access token found in localStorage');
  process.exit(1);
}
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
writeFileSync('/tmp/sb-token.txt', token);
console.log('sub:', payload.sub);
console.log('username:', payload.username);
console.log('scope:', payload.scope);
console.log('exp:', new Date(payload.exp * 1000).toISOString());
console.log('token written to /tmp/sb-token.txt');
