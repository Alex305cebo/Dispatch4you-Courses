import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { useLangStore } from './i18n/useT'
import { installFatalHandlers, showFatal } from './fatal'
import { installDevPreview } from './devPreview'

// Ставим перехватчики ПЕРВЫМ делом: всё, что упадёт ниже, должно быть видно
// на экране, а не только в консоли — на планшете её не открыть.
installFatalHandlers()

try {
  document.documentElement.lang = useLangStore.getState().lang
  installDevPreview()

  const root = document.getElementById('root')
  if (!root) throw new Error('#root is missing from index.html')

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  // Сюда попадаем, когда React даже не смонтировался: раньше это был просто
  // белый экран без единой подсказки о причине.
  showFatal('Приложение не смогло запуститься', e)
}
