import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Client-side only. No proxy, no server env, no secrets — by design.
export default defineConfig({
  plugins: [react()],
});
