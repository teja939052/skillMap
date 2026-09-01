import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@skill-map/contracts': path.resolve(__dirname, '../../packages/contracts/src'),
      '@skill-map/config': path.resolve(__dirname, '../../packages/config/src'),
      '@skill-map/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
});
