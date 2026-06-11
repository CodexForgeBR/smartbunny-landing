// Converts raw screenshots and brand PNGs to webp at sensible sizes.
// Run: npm run optimize-images (from the repo root)
import sharp from 'sharp';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const RAW = join(root, 'src/assets/screens/raw');
const OUT = join(root, 'src/assets/screens');
const BRAND = join(root, 'src/assets/brand');
mkdirSync(OUT, { recursive: true });

async function convert(src, dest, { width, quality = 80 } = {}) {
  let img = sharp(src);
  if (width) img = img.resize({ width, withoutEnlargement: true });
  await img.webp({ quality }).toFile(dest);
  const kb = (statSync(dest).size / 1024).toFixed(0);
  console.log(`${dest.replace(root + '/', '')} ${kb}KB`);
}

for (const f of readdirSync(RAW).filter((f) => f.endsWith('.png'))) {
  const name = f.replace('.png', '.webp');
  const isMobile = f.includes('-mobile');
  await convert(join(RAW, f), join(OUT, name), { width: isMobile ? 780 : 1880, quality: isMobile ? 78 : 80 });
}

for (const f of ['smartbunny-wordmark.png', 'login-logo-mascot.png', 'mascot-card.png']) {
  await convert(join(BRAND, f), join(BRAND, f.replace('.png', '.webp')), { width: 900, quality: 85 });
}
console.log('done');
