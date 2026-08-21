// Single source of truth for the App Store listing URL.
export const APP_STORE_URL =
  'https://apps.apple.com/br/app/smartbunny-finan%C3%A7as-pessoais/id6794168721';

// Keeps every badge link in sync — HTML anchors carry the same href as a
// no-JS fallback, but this constant is the only place that needs the swap.
export function setupAppStoreLinks(): void {
  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-appstore]')) {
    a.href = APP_STORE_URL;
  }
}
