import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
    },
    exclude: ['node_modules', 'dist', 'e2e'],
  },
});
