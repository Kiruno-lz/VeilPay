import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Node.js built-in polyfills via npm packages
      buffer: 'buffer/',
      events: 'events',
      stream: 'stream-browserify',
      util: 'util',
      inherits: 'inherits/inherits_browser.js',
      // Fallback to custom shims for ledgerhq packages
      'elliptic': path.resolve(__dirname, 'src/lib/shims/elliptic.js'),
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
    exclude: [
      // Exclude packages that import Node.js built-ins
      '@ledgerhq/hw-transport',
      '@ledgerhq/errors',
      '@ledgerhq/logs',
      '@ledgerhq/hw-transport-webhid',
      'elliptic',
    ],
  },
  server: {
    port: 5173,
  },
})
