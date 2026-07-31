/**
 * Видимое падение.
 *
 * Пока приложение падало молча, каждая поломка выглядела одинаково — белый
 * экран — и причину приходилось выводить чтением исходников вместо чтения
 * сообщения. Здесь ошибка выводится прямо в DOM, без React: она обязана быть
 * видна даже тогда, когда React не смонтировался.
 *
 * Текст можно выделить и переслать — на планшете консоль не откроешь.
 */

const STYLE = `
  position:fixed; inset:0; z-index:99999; overflow:auto;
  background:#07090c; color:#eceef1;
  font:14px/1.6 ui-sans-serif,-apple-system,'Segoe UI',Roboto,sans-serif;
  padding:24px; -webkit-user-select:text; user-select:text;
`

let shown = false

export function showFatal(what: string, detail: unknown): void {
  // Первая ошибка обычно и есть причина; следующие — её последствия.
  if (shown) return
  shown = true

  const message =
    detail instanceof Error
      ? `${detail.name}: ${detail.message}\n\n${detail.stack ?? ''}`
      : String(detail)

  const box = document.createElement('div')
  box.setAttribute('style', STYLE)
  box.innerHTML = `
    <div style="max-width:680px;margin:0 auto;display:grid;gap:16px">
      <div style="font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#d97757">
        Broker Call — сбой при запуске
      </div>
      <div style="font-size:15px;color:#a8b0ba">
        ${escapeHtml(what)}. Выделите текст ниже и пришлите его — в нём причина.
      </div>
      <pre style="white-space:pre-wrap;overflow-wrap:anywhere;background:#0d1116;
                  border:1px solid rgba(255,255,255,.13);border-radius:10px;
                  padding:16px;font:12px/1.5 ui-monospace,Menlo,monospace;
                  color:#eceef1;margin:0"></pre>
      <div style="font-size:12px;color:#6b7580">
        Сборка ${escapeHtml(BUILD_ID)} · ${escapeHtml(navigator.userAgent)}
      </div>
    </div>
  `
  const pre = box.querySelector('pre')
  if (pre) pre.textContent = message // textContent, а не innerHTML: текст ошибки не наш
  document.body.appendChild(box)
}

/** Ловим и то, что летит мимо React: обработчики событий, промисы, аудио. */
export function installFatalHandlers(): void {
  window.addEventListener('error', (e) => {
    showFatal('Ошибка при выполнении', e.error ?? e.message)
  })
  window.addEventListener('unhandledrejection', (e) => {
    showFatal('Необработанный сбой', e.reason)
  })
}

/**
 * Идентификатор сборки. Печатается на экране списка звонков, чтобы вопрос
 * «а ты точно обновил страницу» решался взглядом, а не догадками.
 */
export const BUILD_ID = __BUILD_ID__

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  )
}
