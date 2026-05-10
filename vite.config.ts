import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      // Redirect Node.js built-ins to ESM shims
      events: path.resolve(__dirname, 'src/lib/shims/events.js'),
      'inherits': path.resolve(__dirname, 'src/lib/shims/inherits.js'),
      'util': path.resolve(__dirname, 'src/lib/shims/util.js'),
      'stream': path.resolve(__dirname, 'src/lib/shims/stream.js'),
      'buffer': path.resolve(__dirname, 'src/lib/shims/buffer.js'),
      'elliptic': path.resolve(__dirname, 'src/lib/shims/elliptic.js'),
    },
  },
  optimizeDeps: {
    exclude: [
      // Exclude packages that import Node.js built-ins
      '@ledgerhq/hw-transport',
      '@ledgerhq/errors',
      '@ledgerhq/logs',
      '@ledgerhq/hw-transport-webhid',
      'elliptic',
    ],
  },
  define: {
    // Fix for packages that check for process.env
    'process.env': {},
    global: 'globalThis',
  },
})
