// Service worker

// Gemini calls run here, not in the content script — DAT's CSP can't block them.
// The user's own free key (popup → Settings). Each model has its own daily
// free-tier quota, so on 429 we just move down the list.
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'gemini') return;
  (async () => {
    const { settings = {} } = await chrome.storage.sync.get('settings');
    const key = (settings.geminiKey || '').trim();
    if (!key) { sendResponse({ error: 'NO_KEY' }); return; }

    let lastErr = 'Gemini недоступен';
    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // no maxOutputTokens: 2.5-flash spends thinking tokens from that
            // budget and a small limit returns an EMPTY answer with no error
            body: JSON.stringify({ contents: [{ parts: msg.parts }] })
          }
        );
        const j = await res.json().catch(() => ({}));
        if (res.status === 429) { lastErr = 'дневная квота Gemini исчерпана'; continue; }
        if (!res.ok) { lastErr = j.error?.message || ('HTTP ' + res.status); continue; }
        const text = (j.candidates?.[0]?.content?.parts || [])
          .map(p => p.text || '').join('').trim();
        if (text) { sendResponse({ text }); return; }
        lastErr = 'пустой ответ модели';
      } catch (e) { lastErr = e.message; }
    }
    sendResponse({ error: lastErr });
  })();
  return true; // keep the channel open for async sendResponse
});

console.log('[D4Y] background ready');
