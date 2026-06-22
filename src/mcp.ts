import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/600.css';
import '@fontsource/maven-pro/500.css';
import '@fontsource/maven-pro/700.css';
import '@fontsource/maven-pro/900.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/mcp.css';

// Copy-to-clipboard for the MCP endpoint URL.
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  button.addEventListener('click', async () => {
    const value = button.getAttribute('data-copy') ?? '';
    const original = button.textContent ?? 'Copiar';
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = 'Copiado!';
      button.classList.add('is-copied');
    } catch {
      button.textContent = 'Copie manualmente';
    }
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove('is-copied');
    }, 1800);
  });
}
