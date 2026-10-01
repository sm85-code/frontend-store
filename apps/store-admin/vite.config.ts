import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  server: {
    host: '0.0.0.0',
    port: 3001,
    allowedHosts: true,
    // Leave VITE_BACKEND_URL empty in dev: the browser then talks to this origin and Vite
    // forwards /api to the backend, keeping the auth cookie same-origin.
    proxy: { '/api': { target: process.env.DEV_PROXY_TARGET ?? 'http://localhost:8000', changeOrigin: true } },
  },
  build: { sourcemap: true },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'], css: false },
})
