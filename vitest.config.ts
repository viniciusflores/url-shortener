import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 5000,
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
      // {
      //   test: {
      //     name: 'controllers',
      //     include: ['tests/controller/**/*.{test,spec}.ts'],
      //   },
      // },
    ],

    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
    },
    exclude: [
      'node_modules',
      'dist',
      'e2e',
      'tests/__mock__',
      'tests/controllers/**/*.{test,spec}.ts',
    ],
  },
});
