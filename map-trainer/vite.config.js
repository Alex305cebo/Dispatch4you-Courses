import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// build: 2026-05-08
export default defineConfig({
  base: '/map-trainer/',
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
  },
  resolve: {
    alias: {
      // Фикс для react-simple-maps: prop-types использует CommonJS require()
      // который не поддерживается в Vite 8 + Rolldown без этого алиаса
      'prop-types': path.resolve('./node_modules/prop-types/index.js'),
    },
  },
  optimizeDeps: {
    include: ['react-simple-maps', 'prop-types'],
  },
})
