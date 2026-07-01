// GA4 consent gate (LGPD).
//
// The gtag loader and Consent Mode v2 defaults live inline in each page's <head>,
// where analytics_storage starts as 'denied'. This module shows a pt-BR consent
// banner and, on acceptance, upgrades consent so GA4 may store its cookies.
// Choice is remembered in localStorage, so the banner only appears once.

declare global {
  // gtag is defined by the inline snippet in <head>.
  function gtag(...args: unknown[]): void;
}

const STORAGE_KEY = 'sb-consent';
type Consent = 'granted' | 'denied';

function grant(): void {
  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });
}

function store(value: Consent): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage may be unavailable (private mode); consent then simply isn't remembered.
  }
}

function read(): Consent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

function injectStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    .sb-consent {
      position: fixed;
      left: max(16px, env(safe-area-inset-left));
      right: max(16px, env(safe-area-inset-right));
      bottom: max(16px, env(safe-area-inset-bottom));
      z-index: 9999;
      margin-inline: auto;
      max-width: 640px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 14px 18px;
      padding: 18px 20px;
      background: var(--bg-raise, #0b1b10);
      color: var(--text, #eef6ef);
      border: 1px solid rgba(139, 226, 139, 0.22);
      border-radius: var(--radius, 18px);
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
      font-family: var(--font-body, 'Noto Sans', system-ui, sans-serif);
      transform: translateY(8px);
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .sb-consent.is-in { transform: translateY(0); opacity: 1; }
    .sb-consent__text {
      flex: 1 1 260px;
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--text-muted, #9db5a3);
    }
    .sb-consent__text a { color: var(--green-light, #8be28b); }
    .sb-consent__actions { display: flex; gap: 10px; flex: 0 0 auto; }
    .sb-consent__btn {
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      border-radius: 999px;
      padding: 9px 18px;
      border: 1px solid transparent;
      transition: filter 0.15s ease, background 0.15s ease;
    }
    .sb-consent__btn--accept { background: var(--green, #5cb85c); color: #06210c; }
    .sb-consent__btn--accept:hover { filter: brightness(1.06); }
    .sb-consent__btn--reject {
      background: transparent;
      color: var(--text, #eef6ef);
      border-color: rgba(157, 181, 163, 0.4);
    }
    .sb-consent__btn--reject:hover { background: rgba(157, 181, 163, 0.12); }
    @media (prefers-reduced-motion: reduce) {
      .sb-consent { transition: none; transform: none; }
    }
  `;
  document.head.appendChild(style);
}

function showBanner(): void {
  injectStyles();

  const banner = document.createElement('div');
  banner.className = 'sb-consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Aviso de cookies');
  banner.innerHTML = `
    <p class="sb-consent__text">
      Usamos cookies só para entender como o site é usado e melhorá-lo.
      Nada é vendido nem usado para publicidade.
    </p>
    <div class="sb-consent__actions">
      <button type="button" class="sb-consent__btn sb-consent__btn--reject" data-consent="denied">Recusar</button>
      <button type="button" class="sb-consent__btn sb-consent__btn--accept" data-consent="granted">Aceitar</button>
    </div>
  `;

  const dismiss = (choice: Consent) => {
    store(choice);
    if (choice === 'granted') grant();
    banner.classList.remove('is-in');
    banner.addEventListener('transitionend', () => banner.remove(), { once: true });
    // Fallback in case the transition doesn't fire (reduced motion, etc.).
    setTimeout(() => banner.remove(), 400);
  };

  for (const button of banner.querySelectorAll<HTMLButtonElement>('[data-consent]')) {
    button.addEventListener('click', () => dismiss(button.dataset.consent as Consent));
  }

  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('is-in'));
}

function init(): void {
  const choice = read();
  if (choice === 'granted') {
    grant();
  } else if (choice === null) {
    showBanner();
  }
  // 'denied' → leave the Consent Mode default in place.
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
