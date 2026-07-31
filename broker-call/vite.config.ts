import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { brokerApi } from './server/devProxy'

export default defineConfig(({ mode }) => {
  // Читаем .env.local БЕЗ префикса VITE_ — эти значения остаются на дев-сервере
  // и не попадают в бандл. Всё, что уходит в браузер, обязано начинаться с VITE_,
  // и ключей среди этого нет по построению.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), brokerApi(env)],
    server: { port: 5180, host: true },
    // vad-web тянет .onnx и wasm — их нельзя инлайнить
    assetsInclude: ['**/*.onnx'],
    optimizeDeps: { exclude: ['onnxruntime-web'] },
    build: {
      target: 'esnext',
      sourcemap: true,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
  }
})
