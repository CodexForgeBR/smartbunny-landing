# SmartBunny Landing — project guide

Marketing landing page for SmartBunny (the consumer brand of the SmartRabbit app).
Static site: Vite + TypeScript + vanilla CSS, GSAP/Lenis for scroll animation. pt-BR copy.

## Screenshots — always captured, never requested from the user

The product screenshots in feature sections come from the real SmartRabbit app via a
script in this repo. **Do not ask the user to provide or capture screenshots** — run the
pipeline yourself.

Pipeline:
1. Add a route to the `SHOTS` array in `scripts/capture-screens.mjs`
   (e.g. `{ route: '/investimentos', name: 'investimentos', viewport: DESKTOP, settle: 5000 }`).
2. Start the SmartRabbit dev server so it's reachable at `http://localhost:5173/SmartRabbit`
   (run `npm run dev` in `~/source/smartrabbit`). The capture script logs in with the built-in
   test account and borrows Playwright from `~/source/smartrabbit/node_modules`.
3. `node scripts/capture-screens.mjs` → writes raw PNGs to `src/assets/screens/raw/`.
4. `npm run optimize-images` → produces optimized WebPs in `src/assets/screens/`
   (1880px wide desktop @ q80; mobile shots `*-mobile` → 780px @ q78).

Raw PNGs live in `src/assets/screens/raw/`; the committed WebPs that the HTML references
live in `src/assets/screens/`.

**iOS screenshots** (`ios-*-mobile.*`, `ios-*-ipad.*`) are NOT captured by the pipeline — they
come from the native app's App Store marketing shots at
`~/source/smartbunny.ios/docs/app-store/screenshots/{iphone-69,ipad-13}/`, copied into
`src/assets/screens/raw/` as `ios-<name>-mobile.png` (iPhone → 780px rule) or
`ios-<name>-ipad.png` (iPad → 1400px rule) and shown inside the CSS `.phone-frame` /
`.phone-frame--ipad` (`src/styles/phone-frame.css`). iOS frames are the default visual for
feature sections; browser-frame web shots are used only where no iOS capture exists.

## App Store link

All "Baixar na App Store" badges carry `data-appstore`; their href is set from the single
constant `APP_STORE_URL` in `src/lib/app-store.ts` (HTML hrefs in `index.html` and the
JSON-LD `installUrl` carry the same URL as a no-JS fallback — keep all in sync if the
listing URL ever changes). Live listing: id6794168721.

## Adding a feature section

Reuse the existing two-column `.agenda__layout` pattern (copy on the left, a `.browser-frame`
screenshot on the right). Reference sections: Bunny IA and Investimentos in `index.html`.

Steps:
1. Add the `<section>` markup in `index.html` (use `data-reveal` / `data-split` for animations)
   and a nav link in `<nav class="nav__links">`.
2. Add a small per-section CSS file in `src/styles/sections/` (most sections only need a few
   extra rules — the layout comes from `.agenda__layout`) and register it in `src/main.ts`.
3. Capture/optimize the screenshot via the pipeline above.

Copy is pt-BR, concise, warm: eyebrow → title → subtitle → 3 capability "steps" → optional chips.

## Common commands
- `npm run dev` — local dev server
- `npm run build` — `tsc` typecheck + Vite build
- `npm run optimize-images` — regenerate WebPs from `src/assets/screens/raw/`
