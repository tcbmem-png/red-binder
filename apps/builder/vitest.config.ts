import { defineConfig } from 'vitest/config';

// Vitest runs through Vite, so the templates' `?raw` imports resolve here just like in the app.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
