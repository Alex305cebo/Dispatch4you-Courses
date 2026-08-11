import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { brokerApi } from './server/devProxy'

export default defineConfig(({ mode }) => {
  // Читаем .env.local БЕЗ префикса VITE_ — эти значения остаются на дев-сервере
  // и не попадают в бандл. Всё, что уходит в браузер, обязано начинаться с VITE_,
  // и ключей среди этого нет по построению.
  const env = loadEnv(mode, process.cwd(), '')

  // Отпечаток сборки виден на экране списка звонков: «ты точно обновил
  // страницу?» решается взглядом, а не перепиской.
  const buildId = new Date().toISOString().slice(0, 16).replace('T', ' ')

  return {
    // Приложение живёт в подпапке сайта, а не в корне домена.
    base: '/broker-call/',
    define: { __BUILD_ID__: JSON.stringify(buildId) },
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
      // server/ тоже под тестами: там живут ключи и контракт ручек, который на
      // боевом сайте повторяет PHP. Ломается он в местах, невидимых глазами.
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'server/**/*.test.ts'],
    },
  }
})
