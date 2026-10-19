import { defineConfig } from 'vitest/config';

// Balance simulation: a greedy bot plays many headless games per reward tier and prints
// score / max size / survival time / tier, plus what killed it. Run with `npm run balance`.
export default defineConfig({
  test: { environment: 'node', include: ['tools/**/*.test.ts'], testTimeout: 300000 },
});
