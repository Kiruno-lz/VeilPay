import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: 'buffer/',
      events: 'events',
      stream: 'stream-browserify',
      util: 'util',
      inherits: 'inherits/inherits_browser.js',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {
      NODE_ENV: '"production"',
    },
    'process.browser': true,
    Buffer: ['buffer', 'Buffer'],
  },
  optimizeDeps: {
    include: ['buffer', 'events', 'inherits'],
  },
  server: {
    port: 5173,
  },
})
