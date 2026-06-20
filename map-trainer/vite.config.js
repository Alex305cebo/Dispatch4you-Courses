import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// build: 2026-06-20
// base '/' — для локального dev и preview
// для продакшн деплоя на /map-trainer/ используй: vite build --base=/map-trainer/
export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production' && command === 'build';
  const isPreview = command === 'preview';

  return {
    base: isProd ? '/map-trainer/' : '/',
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      host: 'localhost',
    },
    preview: {
      port: 4173,
      open: true,
    },
    resolve: {
      alias: {
        'prop-types': path.resolve('./node_modules/prop-types/index.js'),
      },
    },
    optimizeDeps: {
      include: ['react-simple-maps', 'prop-types'],
    },
  };
})
