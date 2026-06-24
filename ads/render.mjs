import pw from '/Users/bccs/source/smartrabbit/node_modules/.pnpm/@playwright+test@1.58.2/node_modules/@playwright/test/index.js';
const { chromium } = pw;
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));
const b64 = (f) => readFileSync(join(DIR, f), 'utf8').trim();

const f900 = b64('_f900.b64');
const f800 = b64('_f800.b64');
const f700 = b64('_f700.b64');
const f500 = b64('_f500.b64');
const mascot = b64('_mascot.b64');

/* ----- shared asset markup ----- */
const LOGO = `<svg viewBox="0 0 36 36"><g transform="translate(6,6)" fill="#fff">
  <path d="M4 7.54V3c0-.27-.11-.52-.29-.71a1 1 0 0 0-.61-.28L3 2c-.27 0-.52.11-.71.29S2 2.73 2 3v3a1 1 0 1 1-2 0V3C0 2.2.32 1.44.88.88A3 3 0 0 1 3 0l.3.01c.69.07 1.33.38 1.82.87C5.68 1.44 6 2.2 6 3v4.54a1 1 0 1 1-2 0z" transform="translate(15 1)"/>
  <path d="M0 14.98c0-2.12.84-4.16 2.34-5.66a8 8 0 0 1 3.69-2.1L3.89 5.09a3 3 0 0 1-.64-1.9 2.97 2.97 0 0 1 .64-1.9A2.97 2.97 0 0 1 6 0l.29.01c.29.03.58.1.85.21.36.15.69.37.97.65L11.22 3.99c3.75.12 6.78 3.22 6.78 7v1a3 3 0 0 1-3 3h-1c-.53 0-1.04.21-1.41.59-.38.37-.59.88-.59 1.41a1 1 0 1 1-2 0c0-1.06.42-2.08 1.17-2.83s1.77-1.17 2.83-1.17h1c.27 0 .52-.11.71-.29s.29-.44.29-.71v-1c0-2.75-2.25-5-5-5h-.2a1 1 0 0 1-.71-.29L6.69 2.29a.97.97 0 0 0-.32-.21A.97.97 0 0 0 6 2c-.26 0-.51.1-.69.29-.18.18-.29.43-.29.69 0 .13.03.26.07.38.05.12.12.23.21.32l3.6 3.6c.29.29.37.72.22 1.09a1 1 0 0 1-.92.61H8c-1.6 0-3.12.63-4.24 1.76A6 6 0 0 0 2 14.98c0 .8.32 1.56.88 2.12s1.32.88 2.12.88h8l.1.01a1 1 0 0 1-.1 1.99H5c-1.33 0-2.6-.53-3.54-1.46A5 5 0 0 1 0 14.98z" transform="translate(5 2.02)"/>
  <path d="M3.68.01a4.2 4.2 0 0 1 2.2.46c.59.31 1.09.76 1.45 1.32l.15.24.05.09c.2.46.03 1.02-.42 1.27s-1.02.12-1.31-.29l-.05-.09-.08-.12a2.3 2.3 0 0 0-.86-.81 2.3 2.3 0 0 0-1.1-.23 2.3 2.3 0 0 0-1.05.4 2.3 2.3 0 0 0-.67.9 2.3 2.3 0 0 0-.08 1.12c.08.37.26.71.53.98s.61.46.98.55c.37.08.76.06 1.12-.07.52-.19 1.09.08 1.28.6.18.52-.09 1.09-.61 1.28a4.3 4.3 0 0 1-2.24.14 4.3 4.3 0 0 1-1.96-1.09A4.3 4.3 0 0 1 .09 4.84 4.3 4.3 0 0 1 .25 2.61 4.3 4.3 0 0 1 1.59.81 4.3 4.3 0 0 1 3.68.01z" transform="translate(1 10)"/>
  <circle cx="18" cy="12" r="1"/>
  <path d="M1.29.01a4.2 4.2 0 0 1 1.89.63 4.3 4.3 0 0 1 1.49 1.72c.32.71.42 1.49.3 2.25a4.3 4.3 0 0 1-1.13 2.05c-.37.42-1 .45-1.41.08s-.45-1-.08-1.41c.26-.29.42-.65.49-1.03a2.3 2.3 0 0 0-.15-1.23 2.3 2.3 0 0 0-.74-.94 2.3 2.3 0 0 0-.95-.31L1 2l-.1-.01A1 1 0 0 1 1 0l.29.01z" transform="translate(12 15)"/>
</g></svg>`;

const CHART = `<svg class="chart" viewBox="0 0 1000 300" preserveAspectRatio="none">
  <defs>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cb85c" stop-opacity=".40"/><stop offset="1" stop-color="#5cb85c" stop-opacity="0"/></linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5cb85c"/><stop offset="1" stop-color="#8be28b"/></linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <g stroke="rgba(139,226,139,.10)" stroke-width="1"><line x1="0" y1="70" x2="1000" y2="70"/><line x1="0" y1="150" x2="1000" y2="150"/><line x1="0" y1="230" x2="1000" y2="230"/></g>
  <path d="M30,210 L190,196 L350,205 L520,168 L620,150 L740,112 L860,78 L970,44 L970,290 L30,290 Z" fill="url(#area)"/>
  <line x1="520" y1="20" x2="520" y2="290" stroke="rgba(239,246,239,.28)" stroke-width="2" stroke-dasharray="4 7"/>
  <text x="512" y="282" text-anchor="end" fill="#9db5a3" font-size="20" font-weight="700" font-family="Maven Pro">hoje</text>
  <path d="M30,210 L190,196 L350,205 L520,168" fill="none" stroke="url(#line)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M520,168 L620,150 L740,112 L860,78 L970,44" fill="none" stroke="#8be28b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 14" filter="url(#glow)"/>
  <circle cx="520" cy="168" r="9" fill="#07120a" stroke="#5cb85c" stroke-width="5"/>
  <circle cx="970" cy="44" r="12" fill="#8be28b" filter="url(#glow)"/>
</svg>`;

const STATS = `<div class="stats">
  <div class="stat"><div class="s-lbl">Saldo hoje</div><div class="s-val">R$ 30.833</div></div>
  <div class="stat stat--accent"><div class="s-lbl">Previsto em dezembro</div><div class="s-val">R$ 64.392<span class="up">&#9650;</span></div></div>
</div>`;

const FONTS = `
@font-face{font-family:'Maven Pro';font-weight:900;font-display:block;src:url(data:font/woff2;base64,${f900}) format('woff2')}
@font-face{font-family:'Maven Pro';font-weight:800;font-display:block;src:url(data:font/woff2;base64,${f800}) format('woff2')}
@font-face{font-family:'Maven Pro';font-weight:700;font-display:block;src:url(data:font/woff2;base64,${f700}) format('woff2')}
@font-face{font-family:'Maven Pro';font-weight:500;font-display:block;src:url(data:font/woff2;base64,${f500}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
.stage{position:relative;overflow:hidden;font-family:'Maven Pro',sans-serif;color:#eef6ef;
  background:radial-gradient(120% 70% at 80% -8%, rgba(92,184,92,.30), transparent 60%),
    radial-gradient(90% 60% at -10% 30%, rgba(47,122,245,.14), transparent 55%),
    linear-gradient(160deg,#0a1a0f 0%,#07120a 55%,#060f08 100%);}
.stage::after{content:"";position:absolute;inset:0;background:radial-gradient(130% 100% at 50% 40%, transparent 55%, rgba(0,0,0,.45));pointer-events:none}
.brand{display:flex;align-items:center;gap:16px;position:relative;z-index:2}
.logo{border-radius:15px;background:#5cb85c;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(92,184,92,.45)}
.logo svg{width:64%;height:64%}
.word{font-weight:800;letter-spacing:-.5px}
.word em{font-style:normal;font-weight:800;color:#8be28b}
.tag{margin-left:auto;font-weight:700;color:#bcd6c3;background:rgba(139,226,139,.10);border:1px solid rgba(139,226,139,.22);border-radius:999px}
.head{font-weight:900;line-height:.98;letter-spacing:-2.5px;position:relative;z-index:2}
.head .hl{background:linear-gradient(100deg,#8be28b,#5cb85c 60%,#3fae5a);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{font-weight:500;line-height:1.4;color:#aec6b6;position:relative;z-index:2}
.sub b{color:#eef6ef;font-weight:700}
.card{background:linear-gradient(180deg,rgba(14,32,20,.92),rgba(8,20,12,.92));border:1px solid rgba(139,226,139,.20);border-radius:28px;
  box-shadow:0 40px 90px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);position:relative;z-index:2}
.card__top{display:flex;align-items:center;justify-content:space-between}
.card__lbl{font-weight:700;color:#cfe6d6}
.card__url{font-weight:700;color:#7f9c88;background:rgba(255,255,255,.04);border:1px solid rgba(139,226,139,.14);border-radius:999px}
.chart{width:100%;display:block}
.stats{display:flex}
.stat{flex:1;background:rgba(255,255,255,.03);border:1px solid rgba(139,226,139,.12);border-radius:16px}
.stat--accent{background:linear-gradient(180deg,rgba(92,184,92,.16),rgba(92,184,92,.04));border-color:rgba(92,184,92,.4)}
.stat .s-lbl{font-weight:700;color:#9db5a3}
.stat .s-val{font-weight:900;letter-spacing:-1px}
.stat--accent .s-val{color:#8be28b}
.s-val .up{vertical-align:middle;margin-left:8px;color:#8be28b}
.btn{font-weight:800;color:#06210d;background:linear-gradient(180deg,#8be28b,#5cb85c);border-radius:18px;box-shadow:0 16px 40px rgba(92,184,92,.45);white-space:nowrap}
.cta__site{font-weight:700;color:#cfe6d6}
.cta__site span{display:block;font-weight:500;color:#7f9c88;margin-top:2px}
.mascot{position:absolute;filter:drop-shadow(0 24px 50px rgba(0,0,0,.55));z-index:3}`;

/* ----- column layout: square / 4x5 / 9x16 ----- */
function columnHTML(c) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${FONTS}
  html,body{width:${c.w}px;height:${c.h}px}
  .stage{width:${c.w}px;height:${c.h}px;display:flex;flex-direction:column;padding:${c.pad}px}
  .logo{width:${c.logo}px;height:${c.logo}px}
  .word{font-size:${c.word}px}
  .tag{font-size:${c.tag}px;padding:${Math.round(c.tag*0.55)}px ${c.tag}px}
  .head{font-size:${c.hl}px;margin-top:${c.gap1}px}
  .sub{font-size:${c.sub}px;margin-top:${Math.round(c.gap1*0.5)}px;max-width:${c.subMax}px}
  .card{margin-top:${c.gap2}px;padding:${c.cardPad}px}
  .card__lbl{font-size:${c.cardLbl}px}
  .card__url{font-size:${Math.round(c.cardLbl*0.8)}px;padding:7px 16px}
  .card__top{margin-bottom:14px}
  .chart{height:${c.chartH}px}
  .stats{gap:18px;margin-top:18px;width:${c.statsW}px}
  .stat{padding:16px 20px}
  .stat .s-lbl{font-size:${Math.round(c.statVal*0.45)}px}
  .stat .s-val{font-size:${c.statVal}px;margin-top:2px}
  .s-val .up{font-size:${Math.round(c.statVal*0.6)}px}
  .cta{margin-top:${c.ctaTop};display:flex;align-items:center;gap:28px;position:relative;z-index:4}
  .btn{font-size:${c.btn}px;padding:${Math.round(c.btn*0.76)}px ${Math.round(c.btn*1.35)}px}
  .cta__site{font-size:${Math.round(c.btn*0.76)}px}
  .cta__site span{font-size:${Math.round(c.btn*0.58)}px}
  .mascot{width:${c.mascotW}px;bottom:${c.mascotB}px;${c.mascotCenter ? 'left:50%;transform:translateX(-50%)' : `right:${c.mascotR}px`}}
  </style></head><body><div class="stage">
    <div class="brand"><span class="logo">${LOGO}</span><span class="word"><b>Smart</b><em>Bunny</em></span><span class="tag">&#127463;&#127479; Finan&ccedil;as pessoais</span></div>
    <h1 class="head">Veja o <span class="hl">futuro</span> do seu dinheiro.</h1>
    <p class="sub">Sua previs&atilde;o de saldo &eacute; constru&iacute;da a partir das suas transa&ccedil;&otilde;es reais, agendamentos e faturas &mdash; <b>antes de ele acontecer.</b></p>
    <div class="card">
      <div class="card__top"><span class="card__lbl">Previs&atilde;o de saldo</span><span class="card__url">app.smartbunny.com.br/previsao</span></div>
      ${CHART}${STATS}
    </div>
    <div class="cta"><span class="btn">Criar conta gr&aacute;tis</span><span class="cta__site">www.smartbunny.com.br<span>Comece em minutos &middot; Feito para o Brasil</span></span></div>
    <img class="mascot" src="data:image/png;base64,${mascot}" alt="">
  </div></body></html>`;
}

/* ----- wide layout: 1.91:1 ----- */
function wideHTML(c) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${FONTS}
  html,body{width:${c.w}px;height:${c.h}px}
  .stage{width:${c.w}px;height:${c.h}px;display:flex;align-items:stretch;padding:56px 60px;gap:48px}
  .col-l{flex:1;display:flex;flex-direction:column;min-width:0}
  .col-r{width:560px;display:flex;flex-direction:column;justify-content:center;position:relative}
  .logo{width:52px;height:52px}
  .word{font-size:30px}
  .head{font-size:62px;margin-top:26px}
  .sub{font-size:23px;margin-top:18px;max-width:560px}
  .cta{margin-top:auto;display:flex;align-items:center;gap:24px;position:relative;z-index:4}
  .btn{font-size:28px;padding:20px 38px}
  .cta__site{font-size:21px}.cta__site span{font-size:16px}
  .card{padding:24px 28px}
  .card__lbl{font-size:20px}.card__url{font-size:15px;padding:6px 13px}
  .card__top{margin-bottom:12px}
  .chart{height:210px}
  .stats{gap:14px;margin-top:14px}
  .stat{padding:12px 16px}
  .stat .s-lbl{font-size:15px}.stat .s-val{font-size:30px;margin-top:2px}.s-val .up{font-size:18px}
  .mascot{width:122px;left:-78px;bottom:-16px}
  </style></head><body><div class="stage">
    <div class="col-l">
      <div class="brand"><span class="logo">${LOGO}</span><span class="word"><b>Smart</b><em>Bunny</em></span></div>
      <h1 class="head">Veja o <span class="hl">futuro</span> do seu dinheiro.</h1>
      <p class="sub">Sua previs&atilde;o de saldo, a partir das suas transa&ccedil;&otilde;es reais &mdash; <b>antes de ele acontecer.</b></p>
      <div class="cta"><span class="btn">Criar conta gr&aacute;tis</span><span class="cta__site">www.smartbunny.com.br<span>Feito para o Brasil</span></span></div>
    </div>
    <div class="col-r">
      <div class="card">
        <div class="card__top"><span class="card__lbl">Previs&atilde;o de saldo</span><span class="card__url">app.smartbunny.com.br</span></div>
        ${CHART}${STATS}
      </div>
    </div>
  </div></body></html>`;
}

const FORMATS = [
  { file: 'smartbunny-ig-1x1.png', kind: 'col', w: 1080, h: 1080,
    pad: 60, logo: 56, word: 33, tag: 19, hl: 72, gap1: 36, sub: 25, subMax: 760,
    gap2: 28, cardPad: 30, cardLbl: 22, chartH: 200, statsW: 600, statVal: 36,
    ctaTop: 'auto', btn: 30, mascotW: 230, mascotR: 30, mascotB: 122 },
  { file: 'smartbunny-ig-4x5.png', kind: 'col', w: 1080, h: 1350,
    pad: 74, logo: 64, word: 38, tag: 21, hl: 96, gap1: 56, sub: 30, subMax: 780,
    gap2: 34, cardPad: 34, cardLbl: 24, chartH: 300, statsW: 610, statVal: 40,
    ctaTop: 'auto', btn: 34, mascotW: 290, mascotR: 40, mascotB: 150 },
  { file: 'smartbunny-ig-9x16.png', kind: 'col', w: 1080, h: 1920,
    pad: 80, logo: 66, word: 40, tag: 23, hl: 108, gap1: 80, sub: 33, subMax: 880,
    gap2: 56, cardPad: 38, cardLbl: 26, chartH: 360, statsW: 920, statVal: 46,
    ctaTop: 'auto', btn: 38, mascotW: 300, mascotB: 220, mascotCenter: true },
  { file: 'smartbunny-ig-1.91x1.png', kind: 'wide', w: 1200, h: 628 },
];

const browser = await chromium.launch();
for (const c of FORMATS) {
  const html = c.kind === 'wide' ? wideHTML(c) : columnHTML(c);
  const page = await browser.newPage({ viewport: { width: c.w, height: c.h }, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(DIR, c.file), clip: { x: 0, y: 0, width: c.w, height: c.h } });
  await page.close();
  console.log('rendered', c.file);
}
await browser.close();
console.log('done');
