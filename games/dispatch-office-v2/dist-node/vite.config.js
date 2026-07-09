import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// Production deploy path: dispatch4you.com/game2/
// Dev server runs on port 3001 to not conflict with map-trainer (3000)
export default defineConfig({
    base: '/game2/',
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3001,
        open: false,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
    },
});
