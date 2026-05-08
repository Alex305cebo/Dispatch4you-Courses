import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/map-trainer/',
  plugins: [react()],
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
