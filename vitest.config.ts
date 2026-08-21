// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    testTimeout: 5000,
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
    exclude: ['node_modules', 'dist', 'e2e', 'tests/__mock__'],
    projects: [
      {
        test: {
          name: 'services',
          include: ['tests/services/**/*.{test,spec}.ts'],
        },
      },
      {
        test: {
          name: 'lib',
          include: ['tests/lib/**/*.{test,spec}.ts'],
        },
      },
      {
        test: {
          name: 'middlewares',
          include: ['tests/middlewares/**/*.{test,spec}.ts'],
        },
      },
      {
        test: {
          name: 'controllers',
          include: ['tests/controllers/**/*.{test,spec}.ts'],
          setupFiles: ['./tests/setup-db.ts'],
          fileParallelism: false,
          testTimeout: 10000,
        },
      },
    ],
  },
});
