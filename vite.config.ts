import { defineConfig } from 'vite';

export default defineConfig({
  base: '/smartbunny-landing/',
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
  },
});
