import { defineConfig } from 'vitest/config';

// Relative base so the static build runs from any folder or sub-path.
export default defineConfig({
  base: './',
  build: { target: 'es2020', sourcemap: false },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
