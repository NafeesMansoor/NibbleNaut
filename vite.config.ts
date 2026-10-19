import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { serviceWorker } from './tools/sw-plugin.ts';

// package.json is the single source of the app version: the game UI, sw.js and its cache name all use it.
const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

// Relative base so the static build runs from any folder or sub-path.
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [serviceWorker(version)],
  build: { target: 'es2020', sourcemap: false },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
