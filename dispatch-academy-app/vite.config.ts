import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dispatch-academy-app/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          state: ['zustand'],
          animation: ['framer-motion'],
          // firebase/firestore is intentionally NOT listed here so it can be
          // code-split and loaded lazily only when sync/leaderboard runs.
          firebase: ['firebase/app', 'firebase/auth'],
          pdf: ['jspdf'],
        },
      },
    },
    target: 'esnext',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
