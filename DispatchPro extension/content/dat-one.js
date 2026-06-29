// D4Y — DAT One content script

const PANEL_ID = 'dispatchpro-panel';

const DEFAULT_SETTINGS = {
  companyName: '',
  dispatcherName: '',
  companyPhone: '',
  mcNumber: '',
  minRpm: 2.0
};

const DEFAULT_TEMPLATE = `Subject: CHECKING YOUR LOAD - {{origin}} to {{dest}}

Hello,

Could you please provide more details for the following load?

Reference Number: {{ref_id}}
Origin: {{origin}}
Destination: {{dest}}
Truck Location: {{deadhead}}
Trip: {{miles}} mi + {{dho}} mi DH = {{total_miles}} mi total
Rate: {{rate_info}}

Could you also confirm the commodity and the best available rate for this shipment?

Thank you`;

// Live state — panel is built ONCE, only data is refreshed
let currentData = { origin:'', dest:'', miles:0, rate:0, rpm:0, mc:'', email:'', phone:'', refId:'', deadhead:'' };
let currentSettings = DEFAULT_SETTINGS;
let currentTemplate = DEFAULT_TEMPLATE;

// Read the truck's current location from the Origin search field
function getDeadheadCity() {
  const inputs = [...document.querySelectorAll('input[type="text"], input:not([type])')];
  const match = inputs.find(el => /^[A-Z][A-Za-z\s\.]+,\s*[A-Z]{2}$/.test((el.value || '').trim()));
  return match ? match.value.trim() : '';
}

function parseLoad() {
  const text = document.body.innerText;

  // ponytail: [\s\S]{0,30}? covers any separator including SVG icons that render as whitespace
  const routeMatch = text.match(/([A-Z][A-Za-z]+(?:\s[A-Za-z]+)*,\s*[A-Z]{2})[\s\S]{0,30}?([A-Z][A-Za-z]+(?:\s[A-Za-z]+)*,\s*[A-Z]{2})\s+(\d{2,4})\s*mi/);
  const origin = routeMatch ? routeMatch[1].trim() : '';
  const dest   = routeMatch ? routeMatch[2].trim() : '';
  const miles  = routeMatch ? parseInt(routeMatch[3]) : 0;

  const rpmExplicit = text.match(/\$(\d+\.\d+)\s*\/\s*mi\b/);
  const rpmLabel    = text.match(/Rate\s*\/\s*mile[\s\S]{0,10}?\$([\d.]+)/i);
  // "Total" may be on its own line, amount on next line: "Total\n$1,800" or "Total $1,800"
  const totalRate   = text.match(/\bTotal[\s\r\n]+\$?([\d,]{3,})/i) ||
                      text.match(/\bTotal\s*\$?([\d,]{3,})/i);

  let rate = totalRate ? parseInt(totalRate[1].replace(/,/g, '')) : 0;
  let rpm  = 0;
  if (rpmLabel)    rpm = parseFloat(rpmLabel[1]);
  else if (rpmExplicit) rpm = parseFloat(rpmExplicit[1]);
  else if (miles > 0 && rate > 0) rpm = rate / miles;

  const mcMatch  = text.match(/MC#?\s*(\d{5,7})/i);
  const mc       = mcMatch ? mcMatch[1] : '';

  const emailEl  = document.querySelector('a[href^="mailto:"]');
  const emailTxt = text.match(/[\w.+]+@[\w.]+\.[a-z]{2,}/i);
  const email    = emailEl ? emailEl.href.replace('mailto:', '') : (emailTxt ? emailTxt[0] : '');

  const phoneMatch = text.match(/\(?\d{3}\)?[\s\-\.]\d{3}[\s\-\.]\d{4}/);
  const phone    = phoneMatch ? phoneMatch[0] : '';

  const refMatch = text.match(/Reference\s*ID\s*[:\s]*(\d+)/i);
  const refId    = refMatch ? refMatch[1] : '';

  const deadhead = getDeadheadCity();

  // DH only via getDhoFromListRow() — body text spans all loads and gives wrong value
  const dho = 0;

  const spotMatch = text.match(/SPOT\s+RATE[\s\S]{0,400}?\(\$(\d+\.\d+)\/mi\)/i);
  const spotRpm = spotMatch ? parseFloat(spotMatch[1]) : 0;

  return { origin, dest, miles, rate, rpm, mc, email, phone, refId, deadhead, dho, spotRpm };
}

function hasLoadDetail(text) {
  return /[A-Z][A-Za-z]+(?:\s[A-Za-z]+)*,\s*[A-Z]{2}[\s\S]{0,30}?[A-Z][A-Za-z]+(?:\s[A-Za-z]+)*,\s*[A-Z]{2}\s+\d{2,4}\s*mi/.test(text);
}

function rpmColor(rpm, minRpm) {
  return rpm >= minRpm ? '#22c55e' : '#f97316';
}

function fillTemplate(template, data, settings) {
  const dho        = data.dho || 0;
  const totalMiles = (data.miles || 0) + dho;
  // Build combined rate string: "$1,800 ($8.61/mi)" or "$8.61/mi" or "—"
  const rateInfo = data.rate > 0
    ? `$${data.rate.toLocaleString()}` + (data.rpm > 0 ? ` ($${data.rpm.toFixed(2)}/mi)` : '')
    : (data.rpm > 0 ? `$${data.rpm.toFixed(2)}/mi` : '—');
  return template
    .replace(/{{origin}}/g, data.origin || '—')
    .replace(/{{dest}}/g, data.dest || '—')
    .replace(/{{miles}}/g, data.miles || '—')
    .replace(/{{dho}}/g, dho || '—')
    .replace(/{{total_miles}}/g, totalMiles || '—')
    .replace(/{{rate_info}}/g, rateInfo)
    .replace(/{{rate}}/g, data.rate ? `$${data.rate.toLocaleString()}` : '—')
    .replace(/{{rpm}}/g, data.rpm ? `$${data.rpm.toFixed(2)}/mi` : '—')
    .replace(/{{mc}}/g, data.mc || '—')
    .replace(/{{ref_id}}/g, data.refId || '—')
    .replace(/{{broker_email}}/g, data.email || '—')
    .replace(/{{deadhead}}/g, data.deadhead || '—')
    .replace(/{{company_name}}/g, settings.companyName)
    .replace(/{{dispatcher_name}}/g, settings.dispatcherName)
    .replace(/{{company_phone}}/g, settings.companyPhone);
}

// Build the panel skeleton ONCE — no data inside, filled later by refreshData()
function buildPanel() {
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="dp-tab" id="dp-tab">D<br>4<br>Y</div>
    <div class="dp-header">
      <span class="dp-title">Dispatch4You</span>
      <button class="dp-refresh" id="dp-refresh" title="Refresh">↻</button>
      <button class="dp-close" id="dp-close">✕</button>
    </div>
    <div class="dp-body">
      <div class="dp-route" id="dp-route">—</div>
      <div class="dp-row"><span class="dp-label">Origin</span><span class="dp-val" id="dp-v-origin">—</span></div>
      <div class="dp-row"><span class="dp-label">Destination</span><span class="dp-val" id="dp-v-dest">—</span></div>
      <div class="dp-row"><span class="dp-label">Miles</span><span class="dp-val" id="dp-v-miles">—</span></div>
      <div class="dp-row"><span class="dp-label">Rate</span><span class="dp-val" id="dp-v-rate">—</span></div>
      <div class="dp-row"><span class="dp-label">RPM</span><span class="dp-val dp-rpm" id="dp-v-rpm">—</span></div>
      <div class="dp-row"><span class="dp-label">Ref ID</span><span class="dp-val" id="dp-v-ref">—</span></div>
      <div class="dp-row"><span class="dp-label">MC#</span><span class="dp-val" id="dp-v-mc">—</span></div>
      <div class="dp-row"><span class="dp-label">Phone</span><span class="dp-val" id="dp-v-phone">—</span></div>
      <div class="dp-row"><span class="dp-label">Email</span><span class="dp-val dp-email" id="dp-v-email">—</span></div>
      <div class="dp-actions">
        <button class="dp-btn" id="dp-email">✉ Email</button>
        <button class="dp-btn" id="dp-maps">🗺 Google Maps</button>
        <button class="dp-btn" id="dp-fmcsa">🔍 FMCSA</button>
        <button class="dp-btn" id="dp-c411">💳 Credit</button>
      </div>
      <button class="dp-mic" id="dp-mic">🎤 Voice</button>
      <div class="dp-voice-panel" id="dp-voice-panel">
        <div class="dp-voice-header">
          <span class="dp-voice-status" id="dp-mic-status"></span>
          <button class="dp-voice-lang" id="dp-voice-lang">🇷🇺 RU</button>
          <button class="dp-voice-close" id="dp-voice-close">✕</button>
        </div>
        <textarea class="dp-voice-text" id="dp-voice-main" placeholder="..."></textarea>
        <button class="dp-voice-copy" id="dp-copy">📋 Copy Load Info</button>
      </div>
    </div>
  `;
  return panel;
}

// Refresh only the text values — panel structure & voice state stay intact
function refreshData(data) {
  currentData = data;
  const $ = id => document.getElementById(id);
  if (!$('dp-route')) return;

  const minRpm = parseFloat(currentSettings.minRpm) || 2.0;
  const routeLabel = data.deadhead
    ? `${data.deadhead} → ${data.origin} → ${data.dest}`
    : `${data.origin} → ${data.dest}`;

  $('dp-route').textContent       = data.origin || data.dest ? routeLabel : '—';
  $('dp-v-origin').textContent    = data.origin || '—';
  $('dp-v-dest').textContent      = data.dest || '—';
  $('dp-v-miles').textContent     = data.miles ? data.miles + ' mi' : '—';
  $('dp-v-rate').textContent      = data.rate ? '$' + data.rate.toLocaleString() : '—';
  $('dp-v-ref').textContent       = data.refId || '—';
  $('dp-v-mc').textContent        = data.mc || '—';
  $('dp-v-phone').textContent     = data.phone || '—';
  $('dp-v-email').textContent     = data.email || '—';

  const rpmEl = $('dp-v-rpm');
  rpmEl.textContent = data.rpm ? '$' + data.rpm.toFixed(2) + '/mi' : '—';
  rpmEl.style.color = rpmColor(data.rpm, minRpm);
  rpmEl.style.fontWeight = '700';
}

// Wire all event handlers ONCE — handlers read live currentData
function attachActions(panel) {
  const savedTop = parseInt(localStorage.getItem('dp-top')) || 60;
  panel.style.top = savedTop + 'px';
  panel.classList.toggle('dp-tab-flipped', savedTop > window.innerHeight / 2);

  // Drag tab vertically
  const tab = panel.querySelector('#dp-tab');
  let dragStartY, panelStartTop, moved = false;
  tab.addEventListener('mousedown', e => {
    dragStartY = e.clientY;
    panelStartTop = parseInt(panel.style.top) || 60;
    moved = false;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (dragStartY === undefined) return;
    const delta = e.clientY - dragStartY;
    if (Math.abs(delta) < 4) return;
    moved = true;
    const newTop = Math.max(0, Math.min(window.innerHeight - 80, panelStartTop + delta));
    panel.style.top = newTop + 'px';
    panel.classList.toggle('dp-tab-flipped', newTop > window.innerHeight / 2);
  });
  document.addEventListener('mouseup', () => {
    if (moved) localStorage.setItem('dp-top', panel.style.top);
    dragStartY = undefined;
  });

  const toggle = () => panel.classList.toggle('dp-open');
  tab.addEventListener('click', () => { if (!moved) toggle(); });
  panel.querySelector('#dp-close').addEventListener('click', toggle);
  panel.querySelector('#dp-refresh').addEventListener('click', () => refreshData(parseLoad()));

  panel.querySelector('#dp-email').addEventListener('click', () => {
    const d = currentData;
    if (!d.email) return;
    const lines    = fillTemplate(currentTemplate, d, currentSettings).split('\n');
    const subject  = lines[0].replace(/^Subject:\s*/i, '');
    const bodyText = lines.slice(2).join('\n');
    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(d.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`, '_blank');
  });

  panel.querySelector('#dp-maps').addEventListener('click', () => {
    const d = currentData;
    if (!d.origin || !d.dest) return;
    const stops = [d.deadhead, d.origin, d.dest].filter(Boolean).map(encodeURIComponent);
    window.open(`https://www.google.com/maps/dir/${stops.join('/')}`, '_blank');
  });

  panel.querySelector('#dp-fmcsa').addEventListener('click', () => {
    if (!currentData.mc) return;
    window.open(`https://li-public.fmcsa.dot.gov/LIVIEW/pkg_carrquery.prc_carrlist?pn_dotno=&pf_prefix=MC&pf_docket_number=${currentData.mc}&pf_state=&pf_company_name=&pf_first_name=&pf_last_name=&pf_doing_bus_as=&pf_zip_code=&pf_start=1`, '_blank');
  });

  panel.querySelector('#dp-c411').addEventListener('click', () => {
    if (!currentData.mc) return;
    window.open(`https://www.carrier411.com/brokerSearch.cfm?search=MC&q=${currentData.mc}`, '_blank');
  });

  attachVoice(panel);
}

// Groq API key lives server-side (above web root). All calls go through our
// proxy on the site, so no secret ships inside the extension.
const GROQ_PROXY = 'https://dispatch4you.com/api/groq.php?path=';

function attachVoice(panel) {
  const micBtn     = panel.querySelector('#dp-mic');
  const micStatus  = panel.querySelector('#dp-mic-status');
  const voicePanel = panel.querySelector('#dp-voice-panel');
  const mainArea   = panel.querySelector('#dp-voice-main');

  panel.querySelector('#dp-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(mainArea.value);
  });

  // Close voice panel
  panel.querySelector('#dp-voice-close').addEventListener('click', () => {
    voicePanel.classList.remove('dp-voice-open');
    mainArea.value = '';
    micStatus.textContent = '';
  });

  // Language toggle
  const langBtn = panel.querySelector('#dp-voice-lang');
  let voiceLang = 'ru-RU';
  langBtn.addEventListener('click', () => {
    voiceLang = voiceLang === 'ru-RU' ? 'en-US' : 'ru-RU';
    langBtn.textContent = voiceLang === 'ru-RU' ? '🇷🇺 RU' : '🇺🇸 EN';
  });

  // Web Speech for real-time interim display
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let interim = null;
  if (SR) {
    interim = new SR();
    interim.continuous = true;
    interim.interimResults = true;
    interim.onresult = (e) => {
      let txt = '';
      for (let i = 0; i < e.results.length; i++)
        txt += e.results[i][0].transcript;
      mainArea.value = txt;
    };
    interim.onerror = () => {};
  }

  let mediaRecorder, chunks = [], recording = false;

  micBtn.addEventListener('click', async () => {
    if (recording) {
      recording = false;
      mediaRecorder?.stop();
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      voicePanel.classList.add('dp-voice-open');
      micStatus.textContent = '❌ Нет доступа к микрофону';
      return;
    }

    recording = true;
    voicePanel.classList.add('dp-voice-open');
    mainArea.value = '';
    chunks = [];
    micBtn.textContent = '⏹ Стоп';
    micStatus.textContent = '🔴 Говори...';

    // Start interim real-time display
    if (interim) {
      interim.lang = voiceLang;
      try { interim.start(); } catch {}
    }

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('dataavailable', e => {
      if (e.data?.size > 0) chunks.push(e.data);
    });

    mediaRecorder.addEventListener('stop', async () => {
      stream.getTracks().forEach(t => t.stop());
      try { interim?.stop(); } catch {}
      micBtn.textContent = '🎤 Voice';

      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      if (blob.size < 1000) {
        micStatus.textContent = '⚠️ Слишком коротко';
        return;
      }

      micStatus.textContent = '⏳ Распознавание...';
      try {
        const form = new FormData();
        form.append('file', blob, 'audio.webm');
        form.append('model', 'whisper-large-v3-turbo');
        form.append('response_format', 'text');
        form.append('language', voiceLang.split('-')[0]); // 'ru' or 'en'
        const res = await fetch(GROQ_PROXY + 'audio/transcriptions', {
          method: 'POST',
          body: form
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text.slice(0, 120));
        mainArea.value = text.trim();
        micStatus.textContent = '✅ Готово';
      } catch (err) {
        micStatus.textContent = '❌ ' + err.message;
        console.error('[D4Y voice]', err);
      }
    });

    mediaRecorder.start(250);
  });
}

// Top banner shown ABOVE the expanded load: 3 columns (map / verdict / dictation).
function buildTopBanner(data) {
  const origin = data.origin || '';
  const dest   = data.dest || '';
  const truck  = data.truck || '';

  // Ordered stops for the route: truck location → pickup → delivery.
  const stops = [];
  if (truck && truck !== origin) stops.push({ label: 'Truck', q: truck, color: '#64748b' });
  if (origin) stops.push({ label: 'Pickup', q: origin, color: '#1d4ed8' });
  if (dest)   stops.push({ label: 'Delivery', q: dest, color: '#e11d48' });

  const verdictHtml = buildVerdict(data);

  // Always starts collapsed (one line); expands on click.
  const collapsed = true;

  // At-a-glance summary on the collapsed bar.
  // RPM = rate ÷ miles, computed from the very numbers shown (parsed data.rpm was unreliable).
  const barRpm = (data.rate && data.miles) ? data.rate / data.miles : 0;
  const sum = [`${origin || '—'} → ${dest || '—'}`];
  if (data.miles) sum.push(`${data.miles.toLocaleString()} mi`);
  if (data.rate)  sum.push(`$${data.rate.toLocaleString()}${barRpm ? ` ($${barRpm.toFixed(2)}/mi)` : ''}`);
  const v = laneVerdictShort(data);
  if (v) sum.push(v);
  const summary = '📋 ' + sum.join('  ·  ');

  const panel = document.createElement('div');
  panel.className = 'dp-banner' + (collapsed ? ' dp-collapsed' : '');
  panel.innerHTML = `
    <div class="dp-banner-bar" title="Нажми, чтобы развернуть/свернуть">
      <span class="dp-banner-title">${summary}</span>
      <button class="dp-banner-toggle" type="button" aria-label="Свернуть/развернуть"></button>
    </div>

    <div class="dp-banner-body">
      <div class="dp-sec dp-sec-map">
        <div class="dp-map-wrap">${stops.length
          ? ''
          : '<div class="dp-sec-empty">Нет адресов груза</div>'}</div>
      </div>

      <div class="dp-sec dp-sec-verdict">
        <div class="dp-sec-hd">📊 Вердикт по лейну</div>
        ${verdictHtml}
      </div>

      <div class="dp-sec dp-sec-voice">
        <div class="dp-sec-hd">
          <span class="dp-v2-title">🎤 Диктовка</span>
          <span class="dp-v2-status"></span>
        </div>
        <div class="dp-v2-bar">
          <button class="dp-v2-btn dp-v2-mic" type="button">🎤 Запись</button>
          <button class="dp-v2-btn dp-v2-tr" type="button">🌐 Перевести</button>
        </div>
        <div class="dp-v2-field">
          <textarea class="dp-v2-area" placeholder=" "></textarea>
          <div class="dp-v2-hint">
            <div class="dp-v2-hint-title">✨ Как пользоваться</div>
            <div class="dp-v2-hint-row"><span>🎤</span> Нажми <b>«Запись»</b> и говори — на русском или английском, язык определится сам.</div>
            <div class="dp-v2-hint-row"><span>⏹</span> Нажми <b>«Стоп»</b> — текст распознается и появится здесь.</div>
            <div class="dp-v2-hint-row"><span>🌐</span> <b>«Перевести»</b> — автоматически переведёт RU ⇄ EN.</div>
            <div class="dp-v2-hint-row"><span>✏️</span> Можно печатать и править текст вручную.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Click anywhere on the bar toggles; the button shows a clear, explicit state.
  const bar = panel.querySelector('.dp-banner-bar');
  const toggle = panel.querySelector('.dp-banner-toggle');
  const syncToggle = () => {
    toggle.innerHTML = panel.classList.contains('dp-collapsed') ? 'Открыть ▾' : '✕ Свернуть';
  };
  syncToggle();
  bar.addEventListener('click', () => {
    panel.classList.toggle('dp-collapsed');
    syncToggle();
  });

  if (stops.length) mountRouteMap(panel.querySelector('.dp-map-wrap'), stops);

  wireSectionVoice(panel);
  return panel;
}

// Clean Leaflet route map (LoadConnect-style: OSM tiles, no Google chrome).
// Rendered inside a sandboxed iframe so it bypasses DAT's CSP and loads Leaflet
// from CDN with its own origin. Geocodes via Nominatim, routes via public OSRM.
function mountRouteMap(wrap, stops) {
  if (!wrap) return;
  const iframe = document.createElement('iframe');
  iframe.className = 'dp-map-frame';
  iframe.setAttribute('sandbox', 'allow-scripts allow-popups');
  iframe.srcdoc = mapSrcdoc(stops);
  wrap.appendChild(iframe);

  // Expand button (bottom-left) → opens the map in a centered pop-up modal.
  const btn = document.createElement('button');
  btn.className = 'dp-map-expand';
  btn.type = 'button';
  btn.title = 'Развернуть карту';
  btn.textContent = '⛶';
  btn.addEventListener('click', () => openMapModal(stops));
  wrap.appendChild(btn);
}

// Centered pop-up modal with a full copy of the route map.
function openMapModal(stops) {
  const overlay = document.createElement('div');
  overlay.className = 'dp-map-modal';
  overlay.innerHTML = '<div class="dp-map-modal-box"><button class="dp-map-modal-close" type="button" aria-label="Закрыть">✕</button></div>';

  const box = overlay.querySelector('.dp-map-modal-box');
  const iframe = document.createElement('iframe');
  iframe.className = 'dp-map-frame';
  iframe.setAttribute('sandbox', 'allow-scripts allow-popups');
  iframe.srcdoc = mapSrcdoc(stops);
  box.appendChild(iframe);

  const close = () => { overlay.remove(); document.removeEventListener('keydown', onEsc); };
  function onEsc(e) { if (e.key === 'Escape') close(); }
  overlay.querySelector('.dp-map-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onEsc);
  document.body.appendChild(overlay);
}

// Self-contained HTML for the sandboxed map iframe.
function mapSrcdoc(stops) {
  const data = JSON.stringify(stops);
  return `<!DOCTYPE html><html><head>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{height:100%;margin:0;background:#e8eef5}
  #info{position:absolute;bottom:8px;right:8px;z-index:1000;background:rgba(15,23,42,.85);color:#fff;
        font:600 12px/1.2 -apple-system,Segoe UI,sans-serif;padding:5px 9px;border-radius:8px;display:none}
  #stops{position:absolute;top:8px;left:8px;z-index:1000;display:flex;flex-direction:column;gap:4px}
  #stops button{display:flex;align-items:center;gap:6px;border:none;border-radius:7px;
        background:rgba(255,255,255,.95);color:#1e293b;font:600 11px/1 -apple-system,Segoe UI,sans-serif;
        padding:6px 9px;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.25);white-space:nowrap}
  #stops button:hover{background:#fff}
  #stops .dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto}
  .leaflet-control-attribution{display:none}
</style></head><body>
<div id="map"></div><div id="info"></div><div id="stops"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const STOPS = ${data};
let MAP;
(async () => {
  MAP = L.map('map', { zoomControl:false, attributionControl:false }).setView([39.5,-98.35], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:18, attribution:'' }).addTo(MAP);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const geocode = async q => {
    try {
      const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=' + encodeURIComponent(q));
      const j = await r.json();
      return j[0] ? [parseFloat(j[0].lat), parseFloat(j[0].lon)] : null;
    } catch (_) { return null; }
  };
  // Sequential with ~1s spacing — Nominatim rate-limits rapid calls (so the 3rd
  // stop silently came back empty). One retry per stop covers transient throttling.
  const pts = [];
  for (let i = 0; i < STOPS.length; i++) {
    if (i) await sleep(1100);
    const s = STOPS[i];
    let ll = await geocode(s.q);
    if (!ll) { await sleep(1100); ll = await geocode(s.q); }
    if (!ll) continue;
    pts.push({ ...s, ll });
    L.circleMarker(ll, { radius:7, color:'#fff', weight:2, fillColor:s.color, fillOpacity:1 })
      .addTo(MAP).bindTooltip(s.label + ': ' + s.q, { direction:'top' });
  }
  if (!pts.length) return;

  // One button per stop — click zooms the map to that point.
  const bar = document.getElementById('stops');
  pts.forEach(p => {
    const b = document.createElement('button');
    b.innerHTML = '<span class="dot" style="background:' + p.color + '"></span>' + p.label + ' location';
    b.title = p.q;
    b.addEventListener('click', () => MAP.setView(p.ll, 11, { animate:true }));
    bar.appendChild(b);
  });

  if (pts.length === 1) { MAP.setView(pts[0].ll, 8); return; }
  const coords = pts.map(p => p.ll[1] + ',' + p.ll[0]).join(';');
  try {
    const r = await fetch('https://router.project-osrm.org/route/v1/driving/' + coords + '?overview=full&geometries=geojson');
    const j = await r.json();
    const route = j.routes && j.routes[0];
    if (route) {
      const line = L.geoJSON(route.geometry, { style:{ color:'#1d4ed8', weight:4, opacity:.85 } }).addTo(MAP);
      MAP.fitBounds(line.getBounds(), { padding:[24,24] });
      const mi = Math.round(route.distance / 1609.34);
      const h = Math.floor(route.duration / 3600), m = Math.round((route.duration % 3600) / 60);
      const info = document.getElementById('info');
      info.textContent = mi.toLocaleString() + ' mi · ' + h + 'ч ' + m + 'м';
      info.style.display = 'block';
      return;
    }
  } catch (_) {}
  MAP.fitBounds(L.latLngBounds(pts.map(p => p.ll)), { padding:[30,30] });
})();
</script></body></html>`;
}

// Short lane verdict for the collapsed bar (empty when no market data).
function laneVerdictShort(data) {
  const rate = data.rate || 0, spot = data.spotRate || 0;
  if (!rate || !spot) return '';
  if (rate >= spot) return '🟢 Хорошая ставка';
  if (rate >= spot * 0.93) return '🟡 Торгуйся';
  return '🔴 Ниже рынка';
}

// Derived decision support only — never repeats numbers DAT already shows.
// Shows a 🟢/🟡/🔴 verdict, the price to ask the broker, and true RPM (incl. DH-O).
function buildVerdict(data) {
  const rate = data.rate || 0;
  const spot = data.spotRate || 0;

  if (!spot || !rate) {
    return `<div class="dp-sec-empty">Нет данных DAT iQ по лейну</div>`;
  }

  const low  = data.spotLow  || Math.round(spot * 0.92);
  const high = data.spotHigh || Math.round(spot * 1.08);

  let verdict, cls, tip;
  if (rate >= spot) {
    verdict = '🟢 Хорошая ставка'; cls = 'green';
    tip = `держи цену, потолок $${high.toLocaleString()}`;
  } else if (rate >= spot * 0.93) {
    verdict = '🟡 Торгуйся'; cls = 'yellow';
    tip = `цель $${spot.toLocaleString()} (до $${high.toLocaleString()})`;
  } else {
    verdict = '🔴 Ниже рынка'; cls = 'red';
    tip = `проси от $${low.toLocaleString()}, цель $${spot.toLocaleString()}`;
  }

  return `
    <div class="dp-vd-badge dp-vd-${cls}">${verdict}</div>
    <div class="dp-vd-tip">💡 ${tip}</div>
  `;
}

// ponytail: standalone voice wiring for the load panel's dictation section.
// Duplicates the Whisper call from attachVoice on purpose, so the separate
// voice-panel tool stays untouched. Merge into one helper if a 3rd caller appears.
function wireSectionVoice(panel) {
  const micBtn  = panel.querySelector('.dp-v2-mic');
  const trBtn   = panel.querySelector('.dp-v2-tr');
  const status  = panel.querySelector('.dp-v2-status');
  const area    = panel.querySelector('.dp-v2-area');

  // One-button translate — auto-detects RU/EN and flips to the other language.
  trBtn.addEventListener('click', async () => {
    const txt = area.value.trim();
    if (!txt) return;
    status.textContent = '🌐 Перевод...';
    try {
      const res = await fetch(GROQ_PROXY + 'chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          messages: [
            { role: 'system', content: `Detect the language of the user's text. If it is Russian, translate it to English; otherwise translate it to Russian. Output only the translation, no notes.` },
            { role: 'user', content: txt }
          ]
        })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error?.message || res.status);
      area.value = j.choices[0].message.content.trim();
      status.textContent = '✅ Переведено';
    } catch (err) {
      status.textContent = '❌ ' + err.message;
      console.error('[D4Y translate]', err);
    }
  });

  // Web Speech for real-time interim text while recording
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let interim = null;
  if (SR) {
    interim = new SR();
    interim.continuous = true;
    interim.interimResults = true;
    interim.onresult = (e) => {
      let txt = '';
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      area.value = txt;
    };
    interim.onerror = () => {};
  }

  let mediaRecorder, chunks = [], recording = false;
  micBtn.addEventListener('click', async () => {
    if (recording) { recording = false; mediaRecorder?.stop(); return; }

    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { status.textContent = '❌ Нет доступа к микрофону'; return; }

    recording = true;
    area.value = '';
    chunks = [];
    micBtn.textContent = '⏹ Стоп';
    micBtn.classList.add('dp-rec');
    status.textContent = '🔴 Говори...';
    // Live preview needs a single lang; Whisper does the real auto-detect on stop.
    if (interim) { interim.lang = navigator.language || 'ru-RU'; try { interim.start(); } catch {} }

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('dataavailable', e => { if (e.data?.size > 0) chunks.push(e.data); });
    mediaRecorder.addEventListener('stop', async () => {
      stream.getTracks().forEach(t => t.stop());
      try { interim?.stop(); } catch {}
      micBtn.textContent = '🎤 Запись';
      micBtn.classList.remove('dp-rec');

      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      if (blob.size < 1000) { status.textContent = '⚠️ Слишком коротко'; return; }

      status.textContent = '⏳ Распознавание...';
      try {
        const form = new FormData();
        form.append('file', blob, 'audio.webm');
        form.append('model', 'whisper-large-v3-turbo');
        form.append('response_format', 'text');
        // no 'language' → Whisper auto-detects RU or EN from the audio
        const res = await fetch(GROQ_PROXY + 'audio/transcriptions', {
          method: 'POST', body: form
        });
        const text = await res.text();
        if (!res.ok) throw new Error(text.slice(0, 120));
        area.value = text.trim();
        status.textContent = '✅ Готово';
      } catch (err) {
        status.textContent = '❌ ' + err.message;
        console.error('[D4Y voice]', err);
      }
    });
    mediaRecorder.start(250);
  });
}

// Original profit calculator + factoring panel — shown INSIDE the expanded load,
// as a column before the company column (restored to the pre-banner behaviour).
function buildCalcPanel(data) {
  // Stored defaults (persist across loads)
  const mpg    = parseFloat(localStorage.getItem('dp-mpg')  || '6.8');
  const fuelPx = parseFloat(localStorage.getItem('dp-fuel') || '4.10');
  const dho    = data.dho || 0;
  const rate   = data.rate || 0;

  const panel = document.createElement('div');
  panel.className = 'dp-calc';
  panel.innerHTML = `
    <div class="dp-rc-head">
      <span>Include DH-O <input class="dp-dho-inp" id="dp-dho-mi" type="number" value="${dho}" min="0" step="1"> mi</span>
      <label class="dp-rc-switch">
        <input type="checkbox" id="dp-dho" ${dho > 0 ? 'checked' : ''}>
        <span class="dp-rc-slider"></span>
      </label>
    </div>

    <div class="dp-rc-grid">
      <div class="dp-rc-cell"><label>Miles</label><input id="dp-c-miles" type="number" min="0"></div>
      <div class="dp-rc-cell"><label>RPM</label><input id="dp-c-rpm" type="number" min="0" step="0.01"></div>
      <div class="dp-rc-cell"><label>Rate</label><input id="dp-c-rate" type="number" min="0" value="${rate || ''}"></div>
      <div class="dp-rc-cell"><label>MPG</label><input id="dp-c-mpg" type="number" min="0.1" step="0.1" value="${mpg}"></div>
      <div class="dp-rc-cell"><label>Fuel Cost</label><input id="dp-c-fuel" type="number" min="0"></div>
      <div class="dp-rc-cell"><label>Tolls</label><input id="dp-c-tolls" type="number" min="0" value="0"></div>
    </div>

    <div class="dp-rc-profit">
      <h4>Profit</h4>
      <span id="dp-c-profit" class="positive">$ 0</span>
    </div>

    <div class="dp-rc-analytics" id="dp-c-analytics"></div>

    <div class="dp-rc-footer">Powered by <b>Dispatch4you.com</b></div>

    <div class="dp-calc-fact-lbl">Проверить факторинг (MC#${data.mc || '—'})</div>
    <div class="dp-calc-actions">
      <button class="dp-inline-btn" data-fact="rts">RTS</button>
      <button class="dp-inline-btn" data-fact="otr">OTR</button>
      <button class="dp-inline-btn" data-fact="sjc">St John</button>
    </div>
  `;

  const $ = id => panel.querySelector(id);
  const num = id => parseFloat($(id).value) || 0;

  function recompFuel() {
    const miles = num('#dp-c-miles'), m = num('#dp-c-mpg');
    $('#dp-c-fuel').value = (miles > 0 && m > 0) ? ((miles / m) * fuelPx).toFixed(2) : '0';
  }
  function recompRpm() {
    const miles = num('#dp-c-miles'), r = num('#dp-c-rate');
    $('#dp-c-rpm').value = miles > 0 ? (r / miles).toFixed(2) : '0';
  }
  // Inverse: editing RPM drives Rate (= RPM × Miles)
  function recompRateFromRpm() {
    const miles = num('#dp-c-miles');
    $('#dp-c-rate').value = miles > 0 ? Math.round(num('#dp-c-rpm') * miles) : '';
  }
  function recompProfit() {
    const r = num('#dp-c-rate');
    const profit = r - num('#dp-c-fuel') - num('#dp-c-tolls');
    const el = $('#dp-c-profit');
    el.textContent = '$ ' + Math.round(profit).toLocaleString();
    el.className = profit >= 0 ? 'positive' : 'negative';
    localStorage.setItem('dp-mpg', num('#dp-c-mpg'));
    recompAnalytics();
  }

  // Verdict + recommended booking price, based on DAT's spot market rate
  function recompAnalytics() {
    const el = $('#dp-c-analytics');
    const r    = num('#dp-c-rate');
    const spot = data.spotRate || 0;
    if (!spot || !r) {
      el.innerHTML = data.spotRate ? '' :
        '<div class="dp-an-note">Нет рыночных данных по лейну</div>';
      return;
    }
    const diff = (r - spot) / spot * 100;
    const low  = data.spotLow || Math.round(spot * 0.92);
    const high = data.spotHigh || Math.round(spot * 1.08);

    let verdict, cls, tip;
    if (r >= spot) {
      verdict = '🟢 Хорошая ставка'; cls = 'green';
      tip = `держи цену, потолок $${high.toLocaleString()}`;
    } else if (r >= spot * 0.93) {
      verdict = '🟡 Торгуйся'; cls = 'yellow';
      tip = `цель $${high.toLocaleString()}`;
    } else {
      verdict = '🔴 Ниже рынка'; cls = 'red';
      tip = `проси от $${low.toLocaleString()}, цель $${high.toLocaleString()}`;
    }

    el.innerHTML = `
      <div class="dp-an-row"><span>Рынок</span><b>$${spot.toLocaleString()}${data.spotRpm ? ` ($${data.spotRpm}/mi)` : ''}</b></div>
      <div class="dp-an-row"><span>Эта ставка</span><b class="${diff >= 0 ? 'pos' : 'neg'}">$${r.toLocaleString()} (${diff >= 0 ? '+' : ''}${diff.toFixed(0)}%)</b></div>
      <div class="dp-an-tip">💡 ${tip}</div>
      <div class="dp-an-verdict dp-v-${cls}">${verdict}</div>
    `;
  }
  function setMiles() {
    const inclDho = $('#dp-dho').checked;
    const dhoVal  = parseInt($('#dp-dho-mi').value) || 0;
    $('#dp-c-miles').value = (data.miles || 0) + (inclDho ? dhoVal : 0);
  }
  function fullRecalc() { recompFuel(); recompRpm(); recompProfit(); }

  // Wire inputs
  $('#dp-c-miles').addEventListener('input', () => { recompFuel(); recompRpm(); recompProfit(); });
  $('#dp-c-mpg').addEventListener('input',   () => { recompFuel(); recompProfit(); });
  $('#dp-c-rate').addEventListener('input',  () => { recompRpm(); recompProfit(); });
  $('#dp-c-rpm').addEventListener('input',   () => { recompRateFromRpm(); recompProfit(); });
  ['#dp-c-fuel', '#dp-c-tolls'].forEach(id =>
    $(id).addEventListener('input', recompProfit));
  $('#dp-dho-mi').addEventListener('input', () => {
    $('#dp-dho').checked = (parseInt($('#dp-dho-mi').value) || 0) > 0;
    setMiles(); fullRecalc();
  });
  $('#dp-dho').addEventListener('change', () => { setMiles(); fullRecalc(); });

  setMiles(); fullRecalc();

  // Factoring portal buttons (copies MC# + opens portal — autofill scripts take over there)
  const FACTORS = {
    rts: 'https://rtspro.com/',
    otr: 'https://portal.otrsolutions.com/',
    sjc: 'https://www.saintjohnfactoring.com/Client_Home'
  };
  panel.addEventListener('click', e => {
    const f = e.target.dataset.fact;
    if (!f) return;
    if (data.mc) chrome.storage.local.set({ factorCheckMc: data.mc });
    window.open(FACTORS[f], '_blank');
  });

  return panel;
}

// Parse load data from a specific DOM element (works on collapsed rows too)
function parseLoadFromElement(el) {
  const text = ((el && el.innerText) || '').replace(/[•·]/g, ' ');

  // Word separator is a plain space, never a newline (else adjacent lines merge into one "city").
  const cities = [...text.matchAll(/([A-Z][A-Za-z]+(?:[ ][A-Za-z]+)*,\s*[A-Z]{2})/g)].map(m => m[1].trim());
  const origin = cities[0] || '';
  const dest   = cities[1] || '';

  // Miles: standalone 3-4 digit number (not part of $X,XXX)
  const milesMatch = text.replace(/\$[\d,]+/g, '').match(/\b(\d{3,4})\b/);
  const miles = milesMatch ? parseInt(milesMatch[1]) : 0;

  const rateMatch = text.match(/\$(\d{1,3}(?:,\d{3})+)/);
  const rate = rateMatch ? parseInt(rateMatch[1].replace(/,/g, '')) : 0;

  const rpmMatch = text.match(/\$(\d+\.\d+)\*?\/mi/);
  const rpm = rpmMatch ? parseFloat(rpmMatch[1]) : (miles > 0 && rate > 0 ? rate / miles : 0);

  const dhoMatch = text.match(DH_RE);
  const dho = dhoMatch ? parseInt(dhoMatch[1]) : 0;

  const mcMatch = text.match(/MC#?\s*(\d{5,7})/i);
  const mc = mcMatch ? mcMatch[1] : '';

  const refMatch = text.match(/Reference\s*ID\s*[:\s]*(\d+)/i);
  const refId = refMatch ? refMatch[1] : '';

  return { origin, dest, miles, rate, rpm, mc, email: '', phone: '', refId, deadhead: '', dho, spotRpm: 0 };
}

// Truck location = the search "Origin" field (the point DAT measures deadhead from)
function getTruckLocation() {
  const inputs = [...document.querySelectorAll('input')];
  let inp = inputs.find(i =>
    /origin/i.test(i.getAttribute('aria-label') || '') && /,\s*[A-Z]{2}/.test(i.value || ''));
  if (!inp) inp = inputs.find(i => /^[A-Z][A-Za-z .'-]+,\s*[A-Z]{2}$/.test((i.value || '').trim()));
  return inp ? inp.value.trim() : '';
}

// Structured "Copy Load Info" text, parsed as fully as possible from the detail row.
function buildCopyText(detail) {
  const text = (detail && detail.innerText) || '';
  // Word separator is a plain space, never a newline (else "Trip\nPalm Beach" merges).
  const cities = [...text.matchAll(/([A-Z][A-Za-z]+(?:[ ][A-Za-z]+)*,\s*[A-Z]{2})/g)].map(m => m[1].trim());
  const origin = cities[0] || '';
  const dest   = cities[1] || '';

  const milesM = text.match(/Trip\s*([\d,]+)\s*mi/i);
  const miles  = milesM ? parseInt(milesM[1].replace(/,/g, '')) : 0;
  const dho    = detail ? getDhoFromListRow(detail) : 0;
  const total  = miles + dho;

  const rateM = text.match(/Total\s*\$?\s*([\d,]+)/i);
  const rate  = rateM ? parseInt(rateM[1].replace(/,/g, '')) : 0;
  // RPM = rate ÷ miles, consistent with everything else.
  const rpm   = miles > 0 ? rate / miles : 0;

  const refM  = text.match(/Reference\s*ID\s*[:\s]*(\d[\w-]*)/i);
  const refId = refM ? refM[1] : '—';

  const truck = getTruckLocation() || origin;
  const chain = [truck && truck !== origin ? truck : null, origin, dest]
    .filter(Boolean).join(' to > ');

  // Broker block, parsed from the company column of this detail row.
  const companyCol = detail
    ? [...detail.children].find(c => /VIEW IN DIRECTORY|Factoring/i.test(c.innerText || ''))
    : null;
  const cText  = (companyCol && companyCol.innerText) || text;
  const broker = (cText.split('\n').map(s => s.trim())
    .find(s => s && !/VIEW IN DIRECTORY|Factoring|MC#|Credit|Days to Pay|Connect|@|^\(?\d/i.test(s))) || '';
  const mc    = (text.match(/MC#?\s*(\d{5,7})/i) || [])[1] || '';
  const email = (cText.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/) || text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/) || [])[0] || '';
  const phone = (text.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/) || [])[0] || '';

  return [
    chain,
    '',
    `Reference Number: ${refId}`,
    `Origin: ${origin || '—'}`,
    `Destination: ${dest || '—'}`,
    `Truck Location: ${truck || '—'}`,
    `Trip: ${miles} mi${dho ? ` + ${dho} mi DH = ${total} mi total` : ''}`,
    `Rate: ${rpm ? `$${rpm.toFixed(2)}/mi` : '—'}`,
    '',
    `Broker: ${broker || '—'}`,
    `MC: ${mc || '—'}`,
    `Email: ${email || '—'}`,
    `Phone: ${phone || '—'}`,
  ].join('\n');
}

// Keep the "✓ Скопировано" label on a copy button while its text is still in
// the clipboard. Reverts when another load is copied or the user copies
// something else (Ctrl+C — the only clipboard change we can observe).
let activeCopyBtn = null;
function markCopied(btn, original) {
  if (activeCopyBtn && activeCopyBtn !== btn) activeCopyBtn.textContent = activeCopyBtn._dpOrig;
  btn._dpOrig = original;
  btn.textContent = '✓ Скопировано';
  activeCopyBtn = btn;
}
document.addEventListener('copy', () => {
  if (activeCopyBtn) { activeCopyBtn.textContent = activeCopyBtn._dpOrig; activeCopyBtn = null; }
}, true);

// Walk up from email link to find the detail row (flex container with ≥3 cols)
function findDetailRow(link) {
  let el = link;
  for (let i = 0; i < 16; i++) {
    el = el.parentElement;
    if (!el) return null;
    const t = el.innerText || '';
    if (el.children.length >= 3 && t.includes('Total') && t.includes('Trip')) return el;
  }
  return null;
}

// DH-O shown as (78) in the collapsed list row
// Walk up DOM checking ALL siblings at each level; exclude phone numbers like (704) 555-xxxx
const DH_RE = /\((\d{1,3})\)(?!\s*\d)/;

function getDhoFromListRow(detailRow) {
  // "(113)" is in the Trip column — the child of detailRow that contains city names
  for (const col of detailRow.children) {
    const t = col.innerText || '';
    // Trip column has city names like "Ooltewah, TN"
    if (!/[A-Z][a-z].+,\s*[A-Z]{2}/.test(t)) continue;
    for (const m of t.matchAll(/\((\d{1,3})\)(?!\s*\d)/g)) {
      const v = parseInt(m[1]);
      if (v >= 5 && v < 500) return v;
    }
  }
  return 0;
}

function tryInject() {
  // Drop panels whose anchor row is no longer a LIVE expanded load detail.
  // DAT's virtual scroller recycles row nodes — a node can stay connected yet be
  // reused for a collapsed/different load, leaving our blue panel stranded in the
  // wrong place with stale data. isConnected alone misses that, so re-verify the
  // row still looks like an expanded detail (Total + Trip + company column).
  document.querySelectorAll('.dp-calc-anchor, .dp-banner-anchor').forEach(a => {
    const row = a._dpRow;
    const t = (row && row.innerText) || '';
    const live = row && row.isConnected &&
      /Total/.test(t) && /Trip/.test(t) && /VIEW IN DIRECTORY|Factoring/i.test(t);
    if (!live) {
      if (row) delete row.dataset.d4yCalc;   // allow clean re-inject when re-expanded
      a.remove();
    }
  });

  // 1. Email button + calc panel — triggered by mailto links
  document.querySelectorAll('a[href^="mailto:"]:not([data-d4y])').forEach(link => {
    link.dataset.d4y = '1';
    const emailAddr = link.href.replace('mailto:', '');

    const emailBtn = document.createElement('button');
    emailBtn.className = 'dp-inline-btn';
    emailBtn.style.cssText = 'margin-left:8px;vertical-align:middle;';
    emailBtn.textContent = '✉ Email';
    emailBtn.addEventListener('click', e => {
      e.stopPropagation();
      // parseLoad() reads the full expanded detail — has origin, dest, miles, rate
      const d = parseLoad();
      // Collapsed row has no expanded detail → cities empty. Pull data from this
      // load's own row: nearest ancestor of the email link that holds ≥2 cities.
      if (!d.origin || !d.dest) {
        let el = link;
        for (let i = 0; i < 16 && el; i++, el = el.parentElement) {
          const cities = [...(el.innerText || '').matchAll(/([A-Z][A-Za-z]+(?:[ ][A-Za-z]+)*,\s*[A-Z]{2})/g)];
          if (cities.length >= 2) { Object.assign(d, parseLoadFromElement(el)); break; }
        }
      }
      d.email = emailAddr;
      // Override DH from calc panel if user edited it
      const calcPanel = document.querySelector('.dp-calc');
      if (calcPanel) {
        const dhoInp = calcPanel.querySelector('#dp-dho-mi');
        const dhoChk = calcPanel.querySelector('#dp-dho');
        if (dhoInp && dhoChk?.checked) d.dho = parseInt(dhoInp.value) || d.dho || 0;
      }
      const lines   = fillTemplate(currentTemplate, d, currentSettings).split('\n');
      const subject = lines[0].replace(/^Subject:\s*/i, '');
      const body    = lines.slice(2).join('\n');
      window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(emailAddr)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    });
    link.insertAdjacentElement('afterend', emailBtn);

    // Calc panel + blue map banner for this load's expanded detail row.
    injectCalcPanel(findDetailRow(link));
  });

  // 1b. Same panel for expanded rows that have NO email — anchored to VIEW ROUTE.
  document.querySelectorAll('button, a, [role="button"]').forEach(el => {
    if (el.dataset.d4yCalcScan) return;
    if (!/view\s*route/i.test(el.innerText || el.textContent || '')) return;
    if (el.offsetParent === null) return;
    el.dataset.d4yCalcScan = '1';
    injectCalcPanel(findDetailRow(el));
  });

  // 2. Maps + Copy buttons — stacked under VIEW ROUTE (one per VISIBLE VIEW ROUTE)
  document.querySelectorAll('button, a, [role="button"]').forEach(el => {
    if (el.dataset.d4yMaps) return;
    if (!/view\s*route/i.test(el.innerText || el.textContent || '')) return;
    if (el.offsetParent === null) return;            // skip the hidden subheader VIEW ROUTE
    if (el.closest('.dp-route-col')) return;         // already wrapped
    el.dataset.d4yMaps = '1';
    injectMapsCopy(el);
  });

  injectFilterBar();
  applyFilters();
}

// Inject the blue calc / market banner + map for an EXPANDED load detail row.
// Independent of email: a load with no mailto link still gets the panel.
function injectCalcPanel(row) {
    if (!row || row.dataset.d4yCalc) return;

    // Gate: only a genuinely EXPANDED load detail has a company column with
    // "VIEW IN DIRECTORY"/"Factoring". mailto links in the collapsed list match
    // a huge ancestor instead — skip those so we don't inject empty banners.
    const companyCol = Array.from(row.children).find(c => {
      const t = c.innerText || '';
      return t.includes('VIEW IN DIRECTORY') || t.includes('Factoring');
    });
    if (!companyCol) return;

    row.dataset.d4yCalc = '1';

    const data = parseLoad();
    data.dho = getDhoFromListRow(row) || data.dho || 0;

    // Rate / miles / RPM / MC# / cities from THIS row. parseLoadFromElement(row) is
    // the robust fallback ($4,000 / 805 mi parse directly off the row's text).
    const rd = parseLoadFromElement(row);
    const rowText = row.innerText || '';
    const rowRate = rowText.match(/Total\s*\$?\s*([\d,]+)/i);
    const rowMiles = rowText.match(/Trip\s*([\d,]+)\s*mi/i) || rowText.match(/(\d{2,4})\s*mi\b/);
    const rowMc = rowText.match(/MC#?\s*(\d{5,7})/i);

    data.origin = rd.origin || data.origin;
    data.dest   = rd.dest   || data.dest;
    data.rate   = (rowRate ? parseInt(rowRate[1].replace(/,/g, '')) : 0) || rd.rate || data.rate || 0;
    data.miles  = (rowMiles ? parseInt(rowMiles[1].replace(/,/g, '')) : 0) || rd.miles || data.miles || 0;
    // RPM is always rate ÷ miles — derive it, never trust DAT's parsed "Rate / mile".
    data.rpm    = data.miles > 0 ? data.rate / data.miles : 0;
    data.mc     = (rowMc ? rowMc[1] : '') || rd.mc || data.mc || '';

    // Market data from DAT iQ (SPOT RATE block) — for "is it worth it" + target price
    const spotM = rowText.match(/SPOT\s*RATE[\s\S]{0,160}?\$([\d,]+)\s*\(\$?([\d.]+)\s*\/?\s*mi\)/i);
    if (spotM) { data.spotRate = parseInt(spotM[1].replace(/,/g, '')); data.spotRpm = parseFloat(spotM[2]); }
    const rangeM = rowText.match(/SPOT\s*RATE[\s\S]{0,320}?Range[\s\S]{0,40}?\$([\d,]+)\s*[-–]\s*\$([\d,]+)/i);
    if (rangeM) { data.spotLow = parseInt(rangeM[1].replace(/,/g, '')); data.spotHigh = parseInt(rangeM[2].replace(/,/g, '')); }
    if (companyCol) {
      // First non-empty line of the company column is the broker name
      data.companyName = (companyCol.innerText || '')
        .split('\n').map(s => s.trim())
        .find(s => s && !/VIEW IN DIRECTORY|Factoring|MC#/i.test(s)) || '';
    }

    // No real load parsed → don't inject an empty banner.
    if (!data.origin || !data.dest) { delete row.dataset.d4yCalc; return; }

    // (a) Original calc + factoring panel — column inside the row, before Company.
    const calcAnchor = document.createElement('div');
    calcAnchor.className = 'dp-calc-anchor';
    calcAnchor._dpRow = row;
    calcAnchor.appendChild(buildCalcPanel(data));
    companyCol.insertAdjacentElement('beforebegin', calcAnchor);

    // (b) 3-section banner ABOVE the whole expanded tab. The route header and the
    // Trip|Rate|Company columns live in the same container (header is the first
    // child, columns next). Prepending to that container puts the banner above the
    // header. Bounded to row's parent — never walks up to the page root.
    data.truck = getTruckLocation();
    const banner = document.createElement('div');
    banner.className = 'dp-banner-anchor';
    banner._dpRow = row;
    banner.appendChild(buildTopBanner(data));
    (row.parentElement || row).insertBefore(banner, (row.parentElement || row).firstChild);
}

// Maps + Copy buttons stacked under one VIEW ROUTE button.
function injectMapsCopy(el) {
    const mapsBtn = document.createElement('button');
    mapsBtn.className = 'dp-maps-btn';
    mapsBtn.title = 'Открыть маршрут в Google Maps';
    mapsBtn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M12 2C8.7 2 6 4.7 6 8c0 4.5 6 11 6 11s6-6.5 6-11c0-3.3-2.7-6-6-6z"/>
      <circle cx="12" cy="8" r="2.3" fill="#fff"/>
    </svg><span>Google Maps</span>`;
    mapsBtn.addEventListener('click', e => {
      e.stopPropagation();
      const d = parseLoad();
      if (!d.origin || !d.dest) return;
      const stops = [d.deadhead, d.origin, d.dest].filter(Boolean).map(encodeURIComponent);
      window.open(`https://www.google.com/maps/dir/${stops.join('/')}`, '_blank');
    });
    // Copy Load Info — copies this load's details from its detail row
    const copyBtn = document.createElement('button');
    copyBtn.className = 'dp-copy-btn';
    copyBtn.textContent = '📋 Copy Load Info';
    copyBtn.addEventListener('click', ev => {
      ev.stopPropagation();
      navigator.clipboard?.writeText(buildCopyText(findDetailRow(el))).catch(() => {});
      markCopied(copyBtn, '📋 Copy Load Info');
    });

    // Stack VIEW ROUTE + Maps + Copy vertically, equal width
    const col = document.createElement('div');
    col.className = 'dp-route-col';
    el.insertAdjacentElement('beforebegin', col);
    col.appendChild(el);
    col.appendChild(mapsBtn);
    col.appendChild(copyBtn);
}

// ── Filter toolbar (LoadConnect-style) — hides DAT rows that fail thresholds ──
const FILTER_KEYS = ['maxMiles', 'minMiles', 'maxDeadhead', 'minRate', 'minRPM', 'excludeStates'];
let filterState = loadFilterState();

function loadFilterState() {
  try { return JSON.parse(localStorage.getItem('dp-filters') || '{}'); }
  catch { return {}; }
}
function saveFilterState() {
  localStorage.setItem('dp-filters', JSON.stringify(filterState));
}
function stateOf(city) {
  const m = (city || '').match(/,\s*([A-Za-z]{2})\s*$/);
  return m ? m[1].toUpperCase() : '';
}

// DAT row + per-cell selectors (verified from LoadConnect's shipped code)
const DAT_ROW_SEL = '.row-container:not(#table-row-similar-matches-separator), .mat-row';
const DAT_CELL = {
  trip:   '.cell-route .trip-container, .cell-route-small .trip-container, .mat-column-trip-length',
  rate:   '.cell-rate .offer, .mat-column-rate-per-mile>div>div:nth-child(1)',
  rpm:    '.cell-rate .calculated-rate, .mat-column-rate-per-mile .calculated-rate',
  dho:    '.cell-route .dho, .cell-route .deadhead, .mat-column-dho',
  origin: '.cell-route .origin, .mat-column-origin, .orig-dest-container>div:nth-child(1)',
  dest:   '.cell-route .destination, .mat-column-destination, .orig-dest-container>div:nth-child(2)'
};
function cellNum(row, sel) {
  const el = row.querySelector(sel);
  if (!el) return 0;
  const m = (el.innerText || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}
function cellText(row, sel) {
  const el = row.querySelector(sel);
  return el ? (el.innerText || '').trim() : '';
}

function injectFilterBar() {
  if (document.getElementById('dp-filterbar')) return;
  const viewport = document.querySelector('.cdk-virtual-scroll-viewport');
  if (!viewport) return;

  const bar = document.createElement('div');
  bar.id = 'dp-filterbar';
  bar.innerHTML = `
    <span class="dp-fb-brand">Dispatch4you.com</span>
    <label>Min RPM <input type="number" min="0" step="0.01" data-f="minRPM"></label>
    <label>Min Rate <input type="number" min="0" data-f="minRate"></label>
    <label>Max Miles <input type="number" min="0" data-f="maxMiles"></label>
    <label>Min Miles <input type="number" min="0" data-f="minMiles"></label>
    <label>Max Deadhead <input type="number" min="0" data-f="maxDeadhead"></label>
    <label>Exclude States <input type="text" placeholder="GA,FL" data-f="excludeStates"></label>
    <div class="dp-fb-actions">
      <button id="dp-fb-apply" title="Обновить доску и применить фильтр ко всем грузам">🔄 Применить</button>
      <button id="dp-fb-reset">Reset</button>
    </div>
  `;
  // Restore saved values
  bar.querySelectorAll('input[data-f]').forEach(inp => {
    const k = inp.dataset.f;
    const val = filterState[k];
    if (Array.isArray(val)) { if (val.length) inp.value = val.join(','); }
    else if (typeof val === 'number' && val > 0) { inp.value = val; }
    else { filterState[k] = null; }  // drop stale junk like -0.01
    inp.addEventListener('input', () => {
      const v = inp.value.trim();
      if (k === 'excludeStates') {
        filterState[k] = v ? v.split(/[,\s]+/).map(s => s.toUpperCase()).filter(Boolean) : [];
      } else {
        const n = parseFloat(v);
        filterState[k] = isFinite(n) && n > 0 ? n : null;  // ignore empty/negative/zero
      }
      saveFilterState();
      applyFilters();
    });
  });
  bar.querySelector('#dp-fb-apply').addEventListener('click', refreshAndFilter);
  bar.querySelector('#dp-fb-reset').addEventListener('click', () => {
    filterState = {};
    saveFilterState();
    bar.querySelectorAll('input[data-f]').forEach(i => { i.value = ''; });
    applyFilters();
  });

  viewport.parentElement.insertBefore(bar, viewport);

  // CDK virtual scroll recycles row nodes — re-evaluate filter on every scroll
  // frame so reused rows never stay wrongly hidden (fixes "loads vanish on scroll").
  if (!viewport.dataset.d4yScroll) {
    viewport.dataset.d4yScroll = '1';
    let raf = null;
    viewport.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; applyFilters(); });
    }, { passive: true });
  }
}

// Trigger DAT's own table refresh (re-fetch loads), then re-apply our filter
// across the whole board. Refresh = re-click the active sort option (LoadConnect's method).
function refreshAndFilter() {
  try {
    const sortBtn = document.querySelector('dat-search-results-sort .sort-button-content');
    if (sortBtn) {
      sortBtn.click();
      setTimeout(() => {
        const opt = document.querySelector("div.sort-menu button[data-test='sort-by-option']:has(mat-icon)");
        if (opt) opt.click();
        // give DAT time to re-render rows, then filter all of them
        setTimeout(applyFilters, 800);
      }, 150);
    } else {
      applyFilters();
    }
  } catch {
    applyFilters();
  }
}

function applyFilters() {
  const f = filterState;
  const pos = v => (typeof v === 'number' && isFinite(v) && v > 0) ? v : 0;
  const exStates = Array.isArray(f.excludeStates) ? f.excludeStates : [];
  const hasAny = pos(f.maxMiles) || pos(f.minMiles) || pos(f.maxDeadhead) ||
                 pos(f.minRate) || pos(f.minRPM) || exStates.length;

  document.querySelectorAll(DAT_ROW_SEL).forEach(row => {
    if (!hasAny) { row.style.display = ''; return; }
    const miles = cellNum(row, DAT_CELL.trip);
    const rate  = cellNum(row, DAT_CELL.rate);
    const rpm   = cellNum(row, DAT_CELL.rpm);
    const dho   = cellNum(row, DAT_CELL.dho);

    let hide = false;
    if (pos(f.maxMiles)    && miles && miles > f.maxMiles)    hide = true;
    if (pos(f.minMiles)    && miles && miles < f.minMiles)    hide = true;
    if (pos(f.maxDeadhead) && dho   && dho   > f.maxDeadhead) hide = true;
    if (pos(f.minRate)     && rate  && rate  < f.minRate)     hide = true;
    if (pos(f.minRPM)      && rpm   && rpm   < f.minRPM)      hide = true;
    if (exStates.length) {
      const st = [stateOf(cellText(row, DAT_CELL.origin)), stateOf(cellText(row, DAT_CELL.dest))];
      if (st.some(s => s && exStates.includes(s))) hide = true;
    }
    row.style.display = hide ? 'none' : '';
  });
}

// ── Collapse DAT's left nav / search form (CSS-only, reversible) ──
// Selectors verified from LoadConnect's shipped "Maximize View" CSS.
const LAYOUT_RULES = {
  sidebar: 'mat-sidenav{display:none!important;} mat-sidenav-content{margin-left:0!important;}',
  search:  'dat-search-tab dat-search-form{display:none!important;}'
};

function setRegionHidden(which, hidden) {
  const id = 'd4y-hide-' + which;
  let style = document.getElementById(id);
  if (hidden) {
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      style.textContent = LAYOUT_RULES[which];
      document.head.appendChild(style);
    }
  } else if (style) {
    style.remove();
  }
  localStorage.setItem(id, hidden ? '1' : '0');
}

// Compact DAT's top area (tabs + results header) vertically — proven rules from
// LoadConnect's beautifier. Always on; CSS applies whenever the elements render.
function injectCompactStyles() {
  if (document.getElementById('d4y-compact')) return;
  const style = document.createElement('style');
  style.id = 'd4y-compact';
  style.textContent = `
    dat-search .mat-tab-label-container,
    dat-search .mat-tab-label { height: 40px !important; }
    dat-search button[data-test="new-tab-button"] {
      width: 30px !important; height: 30px !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
    }
    .table-results-tools-container a { height: 10px !important; }
    .table-results-tools-container div:has(a),
    dat-results-header div { height: fit-content !important; }
    .table-results-tools-container dat-results-header .results { margin-bottom: 0 !important; }

    /* Origin/destination SIDE BY SIDE (verified live): show DAT's own wide route
       layout, widen the route cell, truncate long city names, and let the company
       cell absorb the remaining width so the row fills the screen (no empty area). */
    .cell-route { flex: 0 0 auto !important; width: 360px !important; max-width: none !important; }
    .cell-route .route-dh-container { display: none !important; }
    .cell-route .route-dh-container-lg {
      display: flex !important; align-items: center; gap: 6px; overflow: hidden;
    }
    .cell-route .route-dh-container-lg .dhd { display: none !important; }
    .cell-route .route-dh-container-lg .origin,
    .cell-route .route-dh-container-lg .destination {
      flex: 1 1 0 !important; min-width: 0 !important; overflow: hidden !important;
    }
    .cell-route .route-dh-container-lg .extended-trip-point {
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;
    }
    .cell-route .route-dh-container-lg .dho,
    .cell-route .route-dh-container-lg .origin-dest-arrow { flex: 0 0 auto !important; }

    .row-cells { width: 100% !important; }
    .row-cells .table-cell.cell-company { flex: 1 1 auto !important; max-width: none !important; }
  `;
  document.head.appendChild(style);
}

// DAT shows a dark "Results Limit Reached" snackbar — auto-close it after 3s.
function autoDismissResultsToast() {
  const scope = document.querySelector('.cdk-overlay-container') || document.body;
  scope.querySelectorAll('button, a, [role="button"]').forEach(btn => {
    if (!/^\s*close\s*$/i.test(btn.textContent || '')) return;
    let el = btn;
    for (let i = 0; i < 5 && el; i++, el = el.parentElement) {
      if (/Results Limit Reached|Too many results/i.test(el.innerText || '')) {
        if (el.dataset.d4yToast) return;
        el.dataset.d4yToast = '1';
        setTimeout(() => { if (btn.isConnected) btn.click(); }, 3000);
        return;
      }
    }
  });
}

function injectLayoutToggles() {
  if (document.getElementById('d4y-toggles')) return;

  // Аккуратные SVG-шевроны (рисунок, не текст), наследуют цвет кнопки
  const chev = d => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const ICON = {
    up: chev('M6 15l6-6 6 6'),
    down: chev('M6 9l6 6 6-6'),
    left: chev('M15 6l-6 6 6 6'),
    right: chev('M9 6l6 6-6 6'),
  };

  const make = (which, hiddenIcon, shownIcon, title) => {
    const hidden = localStorage.getItem('d4y-hide-' + which) === '1';
    setRegionHidden(which, hidden);
    const btn = document.createElement('button');
    btn.id = 'd4y-tgl-' + which;
    btn.className = 'd4y-tgl';
    btn.title = title;
    btn.innerHTML = hidden ? hiddenIcon : shownIcon;
    btn.addEventListener('click', () => {
      const nowHidden = localStorage.getItem('d4y-hide-' + which) !== '1';
      setRegionHidden(which, nowHidden);
      btn.innerHTML = nowHidden ? hiddenIcon : shownIcon;
    });
    return btn;
  };

  // Направление развёрнуто наоборот: sidebar ▶/◀, search ▼/▲
  const sidebar = make('sidebar', ICON.right, ICON.left, 'Скрыть/показать левое меню');
  const search = make('search', ICON.down, ICON.up, 'Скрыть/показать форму поиска');
  document.body.appendChild(sidebar);
  document.body.appendChild(search);
  makeEdgeDraggable(search, 'x');   // ездит вдоль верхнего края
  makeEdgeDraggable(sidebar, 'y');  // ездит вдоль левого края
}

// Перетаскивание строго вдоль одной оси (мышь + касание); позиция запоминается.
// axis 'x' — вдоль верхнего края (top:0, двигается left); 'y' — вдоль левого (left:0, двигается top).
// Клик после перетаскивания гасится, чтобы не срабатывал скрыть/показать.
function makeEdgeDraggable(btn, axis) {
  const key = 'd4y-pos-' + btn.id;
  const horiz = axis === 'x';
  const clamp = v => Math.max(0, Math.min((horiz ? window.innerWidth - btn.offsetWidth : window.innerHeight - btn.offsetHeight), v));
  const saved = parseFloat(localStorage.getItem(key));
  if (!isNaN(saved)) {
    if (horiz) { btn.style.left = clamp(saved) + 'px'; btn.style.right = 'auto'; btn.style.top = '0px'; }
    else { btn.style.top = clamp(saved) + 'px'; btn.style.left = '0px'; }
  }
  let start, orig, moved;
  const pt = e => e.touches ? e.touches[0] : e;
  function down(e) {
    const p = pt(e), r = btn.getBoundingClientRect();
    moved = false;
    start = horiz ? p.clientX : p.clientY;
    orig = horiz ? r.left : r.top;
    if (horiz) btn.style.right = 'auto';
    document.addEventListener('mousemove', move, true);
    document.addEventListener('mouseup', up, true);
    document.addEventListener('touchmove', move, { capture: true, passive: false });
    document.addEventListener('touchend', up, true);
  }
  function move(e) {
    const p = pt(e), d = (horiz ? p.clientX : p.clientY) - start;
    if (Math.abs(d) > 3) { moved = true; btn.classList.add('d4y-dragging'); }
    if (!moved) return;
    if (e.cancelable) e.preventDefault();
    const v = clamp(orig + d);
    if (horiz) { btn.style.left = v + 'px'; btn.style.top = '0px'; }
    else { btn.style.top = v + 'px'; btn.style.left = '0px'; }
  }
  function up() {
    document.removeEventListener('mousemove', move, true);
    document.removeEventListener('mouseup', up, true);
    document.removeEventListener('touchmove', move, true);
    document.removeEventListener('touchend', up, true);
    if (!moved) return;
    btn.classList.remove('d4y-dragging');
    localStorage.setItem(key, parseInt(horiz ? btn.style.left : btn.style.top));
    const stop = ev => { ev.stopPropagation(); ev.preventDefault(); };
    btn.addEventListener('click', stop, true);
    setTimeout(() => btn.removeEventListener('click', stop, true), 50);
  }
  btn.addEventListener('mousedown', down, true);
  btn.addEventListener('touchstart', down, { capture: true, passive: false });
  window.addEventListener('resize', () => {
    if (horiz) btn.style.left = clamp(parseFloat(btn.style.left) || 0) + 'px';
    else btn.style.top = clamp(parseFloat(btn.style.top) || 0) + 'px';
  });
}

function init() {
  injectCompactStyles();
  injectLayoutToggles();
  chrome.storage.sync.get(['settings', 'template'], ({ settings = DEFAULT_SETTINGS, template = DEFAULT_TEMPLATE }) => {
    currentSettings = settings;
    currentTemplate = template;

    // Build the panel exactly ONCE
    const panel = buildPanel();
    document.body.appendChild(panel);
    attachActions(panel);

    let lastText = '', debounce = null;
    const observer = new MutationObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        autoDismissResultsToast();
        const text = document.body.innerText;
        if (text === lastText) return;
        lastText = text;
        tryInject();
        if (!hasLoadDetail(text)) return;
        const data = parseLoad();
        if (data.origin || data.dest) refreshData(data);
      }, 300);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[D4Y] Loaded on', location.href);
  });
}

init();
