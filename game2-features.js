// ═══════════════════════════════════════════════════════════════════
// MORNING BRIEFING
// ═══════════════════════════════════════════════════════════════════
const MB_STEPS = [
  { id:'wake', time:'7:30 AM', icon:'☀️', title:'Доброе утро, Диспетчер!', subtitle:'Понедельник · 14 апреля 2026', content:null, action:'Начать рабочий день', color:'#f59e0b' },
  { id:'status', time:'7:32 AM', icon:'🚛', title:'Статус парка', subtitle:'Проверь своих водителей', content:'trucks', action:'Всё проверил →', color:'#06b6d4' },
  { id:'market', time:'7:35 AM', icon:'📊', title:'Рыночные ставки сегодня', subtitle:'DAT Rate Index · Live', content:'market', action:'Понял, к работе →', color:'#22c55e' },
  { id:'weather', time:'7:38 AM', icon:'🌤️', title:'Погода на маршрутах', subtitle:'Важные предупреждения', content:'weather', action:'Учту →', color:'#8b5cf6' },
  { id:'tasks', time:'7:40 AM', icon:'✅', title:'Задачи на сегодня', subtitle:'Твой план на смену', content:'tasks', action:'🚀 Начать смену!', color:'#22c55e' },
];

const MB_MARKET_RATES = [
  { lane:'Chicago → Houston', rpm:2.94, trend:'+0.12', hot:true },
  { lane:'LA → Dallas', rpm:2.71, trend:'+0.08', hot:true },
  { lane:'Atlanta → NY', rpm:3.18, trend:'+0.21', hot:true },
  { lane:'Dallas → Chicago', rpm:2.45, trend:'-0.05', hot:false },
  { lane:'Houston → Atlanta', rpm:2.62, trend:'+0.03', hot:false },
  { lane:'NY → Miami', rpm:2.88, trend:'+0.15', hot:true },
];

const MB_WEATHER_ALERTS = [
  { region:'I-40 Tennessee', type:'⛈️ Гроза', severity:'medium', note:'Возможные задержки 1-2ч' },
  { region:'I-90 Montana', type:'❄️ Снег', severity:'high', note:'Закрыт перевал, объезд +80mi' },
  { region:'I-10 Texas', type:'🌬️ Ветер', severity:'low', note:'Порывы до 45mph, осторожно' },
  { region:'I-95 Florida', type:'☀️ Ясно', severity:'none', note:'Отличные условия' },
];

let _mbStep = 0;

function showMorningBriefing() {
  _mbStep = 0;
  renderMorningBriefingStep();
  openModal('modal-morning-briefing');
}

function renderMorningBriefingStep() {
  const step = MB_STEPS[_mbStep];
  const dots = MB_STEPS.map((_, i) =>
    `<div class="mb-dot ${i === _mbStep ? 'active' : ''} ${i < _mbStep ? 'done' : ''}"></div>`
  ).join('');

  let contentHtml = '';
  if (step.content === 'trucks') contentHtml = renderMBTrucks();
  else if (step.content === 'market') contentHtml = renderMBMarket();
  else if (step.content === 'weather') contentHtml = renderMBWeather();
  else if (step.content === 'tasks') contentHtml = renderMBTasks();

  document.getElementById('morning-briefing-content').innerHTML = `
    <div style="padding:24px;text-align:center">
      <div class="mb-dots">${dots}</div>
      <div class="mb-time">${step.time}</div>
      <div class="mb-icon-wrap" style="background:${step.color}22;border-color:${step.color}44">
        <span>${step.icon}</span>
      </div>
      <div class="mb-title">${step.title}</div>
      <div class="mb-subtitle">${step.subtitle}</div>
      <div class="mb-content">${contentHtml}</div>
      <button class="mb-action-btn" style="background:${step.color}" onclick="nextMBStep()">${step.action}</button>
      ${_mbStep < MB_STEPS.length - 1 ? '<button class="mb-skip-btn" onclick="skipMorningBriefing()">Пропустить</button>' : ''}
    </div>`;
}

function renderMBTrucks() {
  return '<div class="mb-section">' +
    '<div style="font-size:11px;color:#64748b;text-align:center;margin-bottom:8px;font-weight:600">💡 Нажми на трак чтобы узнать детали</div>' +
    G.trucks.map(t => {
      let statusText, statusColor, statusBg;
      if (t.status === 'loaded' || t.status === 'driving') {
        statusText = `🚛 В пути → ${t.destinationCity || '...'} (${Math.round(t.progress * 100)}%)`;
        statusColor = '#67e8f9'; statusBg = 'rgba(6,182,212,.15)';
      } else if (t.status === 'at_delivery') {
        statusText = '📦 На разгрузке — ждёт'; statusColor = '#fbbf24'; statusBg = 'rgba(251,191,36,.15)';
      } else {
        statusText = '✅ Свободен — готов'; statusColor = '#4ade80'; statusBg = 'rgba(34,197,94,.15)';
      }
      return `<div class="mb-truck-row" onclick="showToast('🚛 ${t.name}: ${t.driver} · ${t.currentCity}','info')">
        <div>
          <div class="mb-truck-name">${t.name} - ${t.driver}</div>
          <div class="mb-truck-meta">📍 ${t.currentCity} · HOS ${t.hoursLeft.toFixed(1)}ч · 😊 ${t.mood}%</div>
        </div>
        <div class="mb-truck-status" style="background:${statusBg};color:${statusColor}">${statusText}</div>
      </div>`;
    }).join('') + '</div>';
}

function renderMBMarket() {
  return '<div class="mb-section">' +
    '<div class="mb-market-header"><span>Маршрут</span><span>$/миля</span><span>Тренд</span></div>' +
    MB_MARKET_RATES.map(r => {
      const rpmColor = r.rpm >= 2.8 ? '#4ade80' : r.rpm >= 2.5 ? '#fbbf24' : '#f87171';
      const trendColor = r.trend.startsWith('+') ? '#4ade80' : '#f87171';
      return `<div class="mb-market-row">
        <div style="flex:1;display:flex;align-items:center;gap:4px">
          ${r.hot ? '<span style="font-size:10px">🔥</span>' : ''}
          <span style="font-size:12px;color:#e2e8f0;font-weight:600">${r.lane}</span>
        </div>
        <span style="font-size:14px;font-weight:900;color:${rpmColor};width:50px;text-align:center">$${r.rpm.toFixed(2)}</span>
        <span style="font-size:12px;font-weight:700;color:${trendColor};width:45px;text-align:right">${r.trend}</span>
      </div>`;
    }).join('') +
    '<div style="font-size:10px;color:#475569;text-align:center;margin-top:4px">📡 Источник: DAT Rate Index · Обновлено 7:30 AM</div>' +
    '</div>';
}

function renderMBWeather() {
  const sevColors = { high:'#ef4444', medium:'#f59e0b', low:'#06b6d4', none:'#22c55e' };
  return '<div class="mb-section">' +
    MB_WEATHER_ALERTS.map(w =>
      `<div class="mb-weather-row" style="border-left-color:${sevColors[w.severity]}">
        <div>
          <div style="font-size:13px;font-weight:700;color:#fff">${w.type}</div>
          <div style="font-size:10px;color:#64748b">${w.region}</div>
        </div>
        <div style="font-size:11px;color:#94a3b8;max-width:160px;text-align:right">${w.note}</div>
      </div>`
    ).join('') + '</div>';
}

function renderMBTasks() {
  const atDel = G.trucks.filter(t => t.status === 'at_delivery').length;
  const loaded = G.trucks.filter(t => t.status === 'loaded' || t.status === 'driving').length;
  const idle = G.trucks.filter(t => t.status === 'idle').length;
  const tasks = [
    { text:`Найти грузы для ${idle} свободных траков`, priority:'high' },
    { text:`Мониторить ${loaded} траков в пути`, priority:'high' },
    { text:'Проверить рыночные ставки на горячих лейнах', priority:'medium' },
    { text:'Позвонить брокерам по приоритетным маршрутам', priority:'high' },
    { text:'Проверить HOS водителей перед отправкой', priority:'medium' },
    { text:`Цель смены: заработать $${(G.trucks.length * 2500).toLocaleString()}+`, priority:'high' },
  ];
  const pColors = { high:'#ef4444', medium:'#f59e0b', low:'#64748b' };
  return '<div class="mb-section">' +
    `<div class="mb-task-goal">
      <div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px">Цель смены</div>
      <div style="font-size:28px;font-weight:900;color:#4ade80">$${(G.trucks.length * 2500).toLocaleString()}+</div>
      <div style="font-size:11px;color:#64748b">при ${idle} свободных траках</div>
    </div>` +
    tasks.map(t =>
      `<div class="mb-task-row">
        <div style="width:24px;height:24px;border-radius:8px;background:${pColors[t.priority]}22;display:flex;align-items:center;justify-content:center">
          <div class="mb-task-dot" style="background:${pColors[t.priority]}"></div>
        </div>
        <span style="flex:1;font-size:12px;color:#e2e8f0;line-height:17px">${t.text}</span>
      </div>`
    ).join('') + '</div>';
}

function nextMBStep() {
  if (_mbStep >= MB_STEPS.length - 1) {
    closeModal('modal-morning-briefing');
    return;
  }
  _mbStep++;
  renderMorningBriefingStep();
}

function skipMorningBriefing() {
  closeModal('modal-morning-briefing');
}

// ═══════════════════════════════════════════════════════════════════
// NEGOTIATION CHAT (UPGRADED — chat bubbles + tiles)
// ═══════════════════════════════════════════════════════════════════
function getBrokerReply(myOffer, load, round) {
  const market = load.marketRate;
  const min = load.minRate;
  if (myOffer >= market) {
    return { text:`Deal! ${myOffer.toLocaleString()} works for me. I'll send the Rate Con right away.`, counter:myOffer, mood:'happy', accepted:true, rejected:false };
  }
  if (myOffer >= min) {
    if (round >= 2) return { text:`Alright, you got me. ${myOffer.toLocaleString()} — deal. Sending Rate Con.`, counter:myOffer, mood:'neutral', accepted:true, rejected:false };
    const c = Math.round((myOffer + market) / 2);
    return { text:`Hmm, I can't go that low. How about ${c.toLocaleString()}? That's my best.`, counter:c, mood:'neutral', accepted:false, rejected:false };
  }
  if (round >= 3) {
    return { text:`Look, I've been patient but we're going in circles. I'll pass on this one.`, counter:0, mood:'angry', accepted:false, rejected:true };
  }
  const c = Math.round(load.postedRate + (market - load.postedRate) * 0.4);
  return { text:`I hear you, but ${myOffer.toLocaleString()} is too much. I can do ${c.toLocaleString()} — final offer.`, counter:c, mood:'annoyed', accepted:false, rejected:false };
}

function getOfferTiles(currentOffer, load) {
  const p = load.postedRate, m = load.marketRate;
  return [
    { label:`$${Math.round(p*1.05).toLocaleString()}`, value:Math.round(p*1.05), tag:'+5%' },
    { label:`$${Math.round(p*1.10).toLocaleString()}`, value:Math.round(p*1.10), tag:'+10%' },
    { label:`$${Math.round(p*1.15).toLocaleString()}`, value:Math.round(p*1.15), tag:'+15%' },
    { label:`$${Math.round(m).toLocaleString()}`, value:Math.round(m), tag:'Market' },
    { label:`$${Math.round(m*1.05).toLocaleString()}`, value:Math.round(m*1.05), tag:'+5% mkt' },
  ];
}

const MOOD_EMOJI = { happy:'😊', neutral:'😐', annoyed:'😤', angry:'😠' };

function openNegotiationV2(load) {
  G.negotiation = {
    open: true, load,
    currentOffer: load.postedRate,
    round: 0,
    brokerMood: 'neutral',
    done: null,
    agreedRate: 0,
    chatHistory: [
      { from:'broker', text:`Hey! I've got a load for you: ${load.fromCity} → ${load.toCity}, ${load.miles} miles, ${load.commodity}. I'm posting at $${load.postedRate.toLocaleString()}. Interested?` }
    ],
  };
  renderNegotiationV2();
  openModal('modal-negotiate');
}

function renderNegotiationV2() {
  const neg = G.negotiation;
  if (!neg.load) return;
  const load = neg.load;
  const broker = G.brokers.find(b => b.id === load.brokerId) || { avatar:'👨‍💼' };
  const rpmP = (load.postedRate / load.miles).toFixed(2);
  const rpmM = (load.marketRate / load.miles).toFixed(2);

  // Header info
  let html = `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:14px;border-bottom:1px solid var(--border)">
      <span style="font-size:28px">${broker.avatar || '👨‍💼'}</span>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:800;color:#fff">${load.brokerName} ${MOOD_EMOJI[neg.brokerMood]}</div>
        <div style="font-size:11px;color:#64748b">${load.brokerCompany}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;font-weight:700;color:var(--primary)">${load.fromCity} → ${load.toCity}</div>
        <div style="font-size:10px;color:var(--text-muted)">${load.miles} mi · Posted: $${load.postedRate.toLocaleString()} ($${rpmP}/mi)</div>
        <div style="font-size:10px;color:#4ade80">Market: $${load.marketRate.toLocaleString()} ($${rpmM}/mi)</div>
      </div>
    </div>`;

  // Chat bubbles
  html += '<div style="padding:14px;max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:10px" id="neg-chat-scroll">';
  neg.chatHistory.forEach(msg => {
    if (msg.from === 'me') {
      html += `<div class="neg-chat-bubble me">
        <div class="neg-bubble-body me"><div class="neg-bubble-text me">${msg.text}</div></div>
      </div>`;
    } else {
      html += `<div class="neg-chat-bubble broker">
        <span class="neg-bubble-avatar">${broker.avatar || '👨‍💼'}</span>
        <div class="neg-bubble-body broker"><div class="neg-bubble-text broker">${msg.text}</div></div>
      </div>`;
    }
  });

  // Deal/reject banners
  if (neg.done === 'accepted') {
    html += `<div class="neg-deal-banner">
      <div class="neg-deal-icon">🤝</div>
      <div class="neg-deal-text">Deal at $${neg.agreedRate.toLocaleString()}!</div>
      <div class="neg-deal-rpm">$${(neg.agreedRate / load.miles).toFixed(2)}/mile</div>
    </div>`;
  } else if (neg.done === 'rejected') {
    html += `<div class="neg-reject-banner">
      <div style="font-size:28px;margin-bottom:4px">❌</div>
      <div style="font-size:14px;font-weight:700;color:#f87171">No deal. Broker walked away.</div>
    </div>`;
  }
  html += '</div>';

  // Actions
  if (!neg.done) {
    const tiles = getOfferTiles(neg.currentOffer, load);
    html += `<div style="padding:14px;border-top:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Твоё предложение:</div>
      <div class="neg-tiles">
        ${tiles.map(t => `<div class="neg-tile" onclick="handleNegOffer(${t.value})">
          <div class="neg-tile-val">${t.label}</div>
          ${t.tag ? `<div class="neg-tile-tag">${t.tag}</div>` : ''}
        </div>`).join('')}
      </div>
      ${neg.round > 0 ? `<div class="neg-accept-counter" onclick="handleAcceptCounter()">✅ Принять $${neg.currentOffer.toLocaleString()}</div>` : ''}
    </div>`;
  } else if (neg.done === 'accepted') {
    html += `<div style="display:flex;gap:10px;padding:14px;border-top:1px solid var(--border)">
      <button style="flex:1;padding:13px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid var(--border);font-size:14px;color:var(--text-muted);font-weight:600" onclick="closeModal('modal-negotiate')">Отмена</button>
      <button style="flex:2;padding:13px;border-radius:12px;background:#22c55e;font-size:14px;font-weight:900;color:#fff" onclick="confirmNegDeal()">🚛 Назначить трак</button>
    </div>`;
  } else {
    html += `<div style="padding:14px;border-top:1px solid var(--border)">
      <button style="width:100%;padding:13px;border-radius:12px;background:var(--primary);font-size:14px;font-weight:900;color:#fff" onclick="closeModal('modal-negotiate')">Закрыть</button>
    </div>`;
  }

  document.getElementById('modal-negotiate-body').innerHTML = html;
  // Scroll chat to bottom
  setTimeout(() => {
    const sc = document.getElementById('neg-chat-scroll');
    if (sc) sc.scrollTop = sc.scrollHeight;
  }, 50);
}

function handleNegOffer(value) {
  const neg = G.negotiation;
  if (neg.done || !neg.load) return;
  neg.round++;
  const load = neg.load;
  neg.chatHistory.push({ from:'me', text:`I can do $${value.toLocaleString()} for this load. That's ${load.miles} miles at $${(value / load.miles).toFixed(2)}/mile.` });
  const reply = getBrokerReply(value, load, neg.round);
  neg.brokerMood = reply.mood;
  neg.chatHistory.push({ from:'broker', text:reply.text });
  if (reply.accepted) { neg.done = 'accepted'; neg.agreedRate = value; }
  else if (reply.rejected) { neg.done = 'rejected'; }
  else { neg.currentOffer = reply.counter; }
  renderNegotiationV2();
}

function handleAcceptCounter() {
  const neg = G.negotiation;
  if (neg.done || !neg.load) return;
  neg.chatHistory.push({ from:'me', text:`OK, I'll take $${neg.currentOffer.toLocaleString()}. Send me the Rate Con.` });
  neg.chatHistory.push({ from:'broker', text:`Perfect! Rate Con coming your way. Thanks for working with us!` });
  neg.done = 'accepted';
  neg.agreedRate = neg.currentOffer;
  renderNegotiationV2();
}

function confirmNegDeal() {
  if (G.negotiation.agreedRate > 0) {
    acceptLoad(G.negotiation.agreedRate);
  } else {
    closeModal('modal-negotiate');
  }
}

// ═══════════════════════════════════════════════════════════════════
// RATE CON MODAL
// ═══════════════════════════════════════════════════════════════════
let _rateConSigned = false;

function showRateConModal(notification) {
  _rateConSigned = false;
  if (!notification) return;

  // Find related load
  let load = null;
  for (const t of G.trucks) {
    if (t.currentLoad) { load = t.currentLoad; break; }
  }
  // Also check booked loads
  if (!load && notification.relatedLoadId) {
    load = G.bookedLoads.find(l => l.id === notification.relatedLoadId) ||
           G.activeLoads.find(l => l.id === notification.relatedLoadId);
  }

  const brokerName = load ? load.brokerName : notification.from.split(' @ ')[0] || notification.from;
  const brokerCompany = load ? load.brokerCompany : 'Freight Solutions LLC';
  const fromCity = load ? load.fromCity : 'Chicago, IL';
  const toCity = load ? load.toCity : 'Houston, TX';
  const commodity = load ? load.commodity : 'General Freight';
  const weight = load ? `${load.weight.toLocaleString()} lbs` : '—';
  const miles = load ? `${load.miles.toLocaleString()} mi` : '—';
  const equipment = load ? load.equipment : "Dry Van 53'";
  const agreedRate = load ? load.agreedRate : 0;
  const pickupTime = load ? load.pickupTime : '08:00 - 14:00';
  const deliveryTime = load ? load.deliveryTime : 'See details';
  const rpm = load && load.miles > 0 ? `$${(agreedRate / load.miles).toFixed(2)}/mi` : '—';
  const rcNumber = `RC-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-US');

  document.getElementById('ratecon-subtitle').textContent = notification.subject;

  document.getElementById('modal-ratecon-body').innerHTML = `
    <div class="rc-doc">
      <div class="rc-doc-top">
        <div>
          <div class="rc-doc-broker">${brokerCompany.toUpperCase()}</div>
          <div class="rc-doc-title">RATE CONFIRMATION</div>
          <div class="rc-doc-subtitle">Broker-Carrier Agreement</div>
        </div>
        <div style="text-align:right">
          <div id="rc-stamp-area"></div>
          <div style="font-size:9px;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:1px">LOAD #</div>
          <div style="font-size:13px;color:#fff;font-weight:800">${rcNumber}</div>
          <div style="font-size:9px;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-top:6px">DATE</div>
          <div style="font-size:13px;color:#fff;font-weight:800">${dateStr}</div>
        </div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-two-col">
        <div class="rc-col">
          <div class="rc-col-label">BROKER</div>
          <div class="rc-col-name">${brokerName}</div>
          <div style="font-size:11px;color:#374151;margin-top:1px">${brokerCompany}</div>
          <div class="rc-col-detail">MC# 295957 · DOT# 802616</div>
          <div class="rc-col-detail">Phone: (513) 831-2600</div>
        </div>
        <div class="rc-col" style="border-left:1px solid #e5e7eb">
          <div class="rc-col-label">CARRIER</div>
          <div class="rc-col-name">Your Trucking Co. LLC</div>
          <div style="font-size:11px;color:#374151;margin-top:1px">Dallas, TX 75201</div>
          <div class="rc-col-detail">MC# 1234567 · DOT# 7654321</div>
          <div class="rc-col-detail">Phone: (555) 123-4567</div>
        </div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-summary-row">
        <div class="rc-summary-item"><div class="rc-summary-label">DATE</div><div class="rc-summary-val">${dateStr}</div></div>
        <div class="rc-summary-item"><div class="rc-summary-label">EQUIPMENT</div><div class="rc-summary-val">${equipment}</div></div>
        <div class="rc-summary-item"><div class="rc-summary-label">COMMODITY</div><div class="rc-summary-val">${commodity}</div></div>
        <div class="rc-summary-item" style="border-right:none;background:#f0fdf4"><div class="rc-summary-label">TOTAL RATE</div><div style="font-size:14px;font-weight:900;color:#16a34a">$${agreedRate.toLocaleString()}.00</div></div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-stop">
        <div class="rc-stop-badge">PICKUP</div>
        <div class="rc-stop-city">${fromCity}</div>
        <div class="rc-stop-addr">Shipper Warehouse · ${fromCity}</div>
        <div class="rc-stop-details">
          <div class="rc-stop-detail"><div class="rc-stop-detail-label">TIME WINDOW</div><div class="rc-stop-detail-val">${pickupTime}</div></div>
          <div class="rc-stop-detail"><div class="rc-stop-detail-label">CONTACT</div><div class="rc-stop-detail-val">Dock Manager</div></div>
          <div class="rc-stop-detail"><div class="rc-stop-detail-label">PHONE</div><div class="rc-stop-detail-val">(312) 555-0100</div></div>
        </div>
      </div>
      <div class="rc-arrow-row"><div class="rc-arrow-line"></div><span class="rc-arrow-icon">▼</span><span class="rc-arrow-miles">${miles}</span><div class="rc-arrow-line"></div></div>
      <div class="rc-stop">
        <div class="rc-stop-badge delivery">DELIVERY</div>
        <div class="rc-stop-city">${toCity}</div>
        <div class="rc-stop-addr">Distribution Center · ${toCity}</div>
        <div class="rc-stop-details">
          <div class="rc-stop-detail"><div class="rc-stop-detail-label">TIME WINDOW</div><div class="rc-stop-detail-val">${deliveryTime}</div></div>
          <div class="rc-stop-detail"><div class="rc-stop-detail-label">CONTACT</div><div class="rc-stop-detail-val">Receiving Dept.</div></div>
          <div class="rc-stop-detail"><div class="rc-stop-detail-label">PHONE</div><div class="rc-stop-detail-val">(404) 555-0200</div></div>
        </div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-section">
        <div class="rc-section-title">COMMODITY DETAILS</div>
        <div class="rc-details-grid">
          <div class="rc-detail-item"><div class="rc-detail-label">Description</div><div class="rc-detail-val">${commodity}</div></div>
          <div class="rc-detail-item"><div class="rc-detail-label">Weight</div><div class="rc-detail-val">${weight}</div></div>
          <div class="rc-detail-item"><div class="rc-detail-label">Miles</div><div class="rc-detail-val">${miles}</div></div>
          <div class="rc-detail-item"><div class="rc-detail-label">Rate/Mile</div><div class="rc-detail-val">${rpm}</div></div>
          <div class="rc-detail-item"><div class="rc-detail-label">Equipment</div><div class="rc-detail-val">${equipment}</div></div>
          <div class="rc-detail-item"><div class="rc-detail-label">Pieces</div><div class="rc-detail-val">—</div></div>
        </div>
        <div class="rc-special"><div class="rc-special-label">Special Instructions:</div><div class="rc-special-val">No stacking · Handle with care · Driver assist if required</div></div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-section">
        <div class="rc-section-title">PAYMENT & ADDITIONAL TERMS</div>
        <div class="rc-payment-row"><span class="rc-payment-key">Payment Terms:</span><span class="rc-payment-val">Net 30 days from invoice date</span></div>
        <div class="rc-payment-row"><span class="rc-payment-key">Quick Pay:</span><span class="rc-payment-val">Available — 2% discount (within 5 days)</span></div>
        <div class="rc-payment-row"><span class="rc-payment-key">Detention:</span><span class="rc-payment-val">$75/hour after 2 hours free time</span></div>
        <div class="rc-payment-row"><span class="rc-payment-key">TONU:</span><span class="rc-payment-val">$250 if cancelled after dispatch</span></div>
        <div class="rc-payment-row"><span class="rc-payment-key">POD Deadline:</span><span class="rc-payment-val" style="color:#dc2626;font-weight:700">Within 48 hours of delivery</span></div>
        <div class="rc-payment-row"><span class="rc-payment-key">Lumper:</span><span class="rc-payment-val">Carrier responsible — keep receipt</span></div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-rate-box">
        <div><div class="rc-rate-label">AGREED RATE</div><div class="rc-rate-sub">${fromCity} → ${toCity} · ${miles}</div></div>
        <div class="rc-rate-val">$${agreedRate.toLocaleString()}.00</div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-legal">
        By accepting this load, Carrier agrees to all terms and conditions outlined in the Broker-Carrier Agreement on file.
        Carrier certifies proper authority, insurance coverage ($1,000,000 min. liability, $100,000 min. cargo), and qualified drivers.
        This Rate Confirmation constitutes a binding contract between Broker and Carrier.
        <div class="rc-sig-row">
          <div class="rc-sig-box">
            <div class="rc-sig-label">CARRIER SIGNATURE</div>
            <div id="rc-carrier-sig">
              <div class="rc-sig-line"></div>
              <div class="rc-sig-sub">Print Name: _______________</div>
              <div class="rc-sig-sub">Date: _______________</div>
            </div>
          </div>
          <div class="rc-sig-box">
            <div class="rc-sig-label">BROKER SIGNATURE</div>
            <div class="rc-sig-actual">${brokerName}</div>
            <div class="rc-sig-line"></div>
            <div class="rc-sig-sub">Print Name: ${brokerName}</div>
            <div class="rc-sig-sub">Date: ${dateStr}</div>
          </div>
        </div>
      </div>
    </div>`;

  renderRateConFooter();
  openModal('modal-ratecon');
}

function renderRateConFooter() {
  const footer = document.getElementById('ratecon-footer');
  if (!_rateConSigned) {
    footer.innerHTML = `
      <button style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid var(--border);font-size:14px;color:var(--text-muted);font-weight:600" onclick="closeModal('modal-ratecon')">Закрыть</button>
      <button class="rc-sign-btn" onclick="signRateCon()">✍️ Подписать Rate Con</button>`;
  } else {
    footer.innerHTML = `
      <button style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid var(--border);font-size:14px;color:var(--text-muted);font-weight:600" onclick="closeModal('modal-ratecon')">Закрыть</button>
      <div class="rc-signed-banner">
        <div style="font-size:14px;font-weight:900;color:#4ade80">✅ Rate Con подписан</div>
        <div style="font-size:10px;color:#86efac;margin-top:2px">${new Date().toLocaleDateString('en-US')}</div>
      </div>`;
  }
}

function signRateCon() {
  _rateConSigned = true;
  const dateStr = new Date().toLocaleDateString('en-US');
  const timeStr = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
  const stamp = document.getElementById('rc-stamp-area');
  if (stamp) stamp.innerHTML = '<div class="rc-signed-stamp">✓ SIGNED</div>';
  const sig = document.getElementById('rc-carrier-sig');
  if (sig) sig.innerHTML = `
    <div class="rc-sig-actual">Your Trucking Co.</div>
    <div class="rc-sig-line"></div>
    <div class="rc-sig-sub">Print Name: Dispatcher</div>
    <div class="rc-sig-sub">Date: ${dateStr} ${timeStr}</div>`;
  renderRateConFooter();
  showToast('✅ Rate Con подписан!', 'success');
}

// ═══════════════════════════════════════════════════════════════════
// DRIVER COMMUNICATION MODAL
// ═══════════════════════════════════════════════════════════════════
function getDriverResponses(notification) {
  const msg = ((notification.message || '') + ' ' + (notification.subject || '')).toLowerCase();
  if (msg.includes('задержк') || msg.includes('delay') || msg.includes('погрузк')) {
    return [
      { text:'Жди — фиксируй время. Если больше 2 часов — detention.', icon:'⏰', outcome:'Водитель ждёт. Detention clock запущен.', money:0, mood:0, correct:true },
      { text:'Уезжай — найдём другой груз.', icon:'🚛', outcome:'Груз отменён. TONU fee $150.', money:-150, mood:-10, correct:false },
      { text:'Позвони брокеру и сообщи о задержке.', icon:'📞', outcome:'Брокер в курсе. Репутация +2.', money:0, mood:5, correct:true },
    ];
  }
  if (msg.includes('поломк') || msg.includes('breakdown') || msg.includes('сломал')) {
    return [
      { text:'Вызови техпомощь. Сообщи брокеру о задержке.', icon:'🔧', outcome:'Техпомощь вызвана. Задержка ~3 часа. Брокер уведомлён.', money:-200, mood:0, correct:true },
      { text:'Попробуй починить сам.', icon:'🛠️', outcome:'Водитель потратил 2 часа. Не починил. Всё равно вызвал техпомощь.', money:-350, mood:-15, correct:false },
      { text:'Найди другой трак для перегрузки.', icon:'🔄', outcome:'Перегрузка организована. Доп. расходы $300.', money:-300, mood:5, correct:false },
    ];
  }
  if (msg.includes('detention') || msg.includes('ждёт') || msg.includes('ждет')) {
    return [
      { text:'Требуй detention у брокера — $50/час после 2 часов.', icon:'💰', outcome:'Detention claim отправлен брокеру.', money:100, mood:5, correct:true },
      { text:'Скажи водителю ждать без detention.', icon:'😐', outcome:'Водитель недоволен. Настроение -10.', money:0, mood:-10, correct:false },
      { text:'Уточни у водителя точное время прибытия.', icon:'🕐', outcome:'Водитель прислал BOL с временем. Detention подтверждён.', money:75, mood:0, correct:true },
    ];
  }
  if (msg.includes('pod') || msg.includes('разгрузил') || msg.includes('доставил')) {
    return [
      { text:'Отлично! Попроси POD и отправь брокеру.', icon:'📄', outcome:'POD получен. Инвойс выставлен.', money:50, mood:10, correct:true },
      { text:'Найди следующий груз для этого трака.', icon:'📋', outcome:'Водитель ждёт следующего груза. POD не отправлен — штраф.', money:-50, mood:0, correct:false },
      { text:'Скажи водителю отдохнуть — он заслужил.', icon:'😴', outcome:'Водитель доволен. Настроение +15. Трак простаивает 2 часа.', money:0, mood:15, correct:false },
    ];
  }
  return [
    { text:'Понял, продолжай по плану.', icon:'✅', outcome:'Водитель продолжает маршрут.', money:0, mood:5, correct:true },
    { text:'Уточни детали — позвони мне.', icon:'📞', outcome:'Водитель перезвонил. Ситуация прояснилась.', money:0, mood:5, correct:true },
    { text:'Игнорировать — разберётся сам.', icon:'🙈', outcome:'Водитель недоволен. Настроение -10.', money:0, mood:-10, correct:false },
  ];
}

let _dcNotification = null;
let _dcChosen = null;

function showDriverCommModal(notification) {
  _dcNotification = notification;
  _dcChosen = null;
  renderDriverComm();
  openModal('modal-driver-comm');
}

function renderDriverComm() {
  const n = _dcNotification;
  if (!n) return;
  document.getElementById('driver-comm-from').textContent = n.from;
  const responses = getDriverResponses(n);
  const truck = G.trucks.find(t => t.driver && n.from.includes(t.driver.split(' ')[0]));

  let html = '';
  if (truck) html += `<div style="font-size:12px;color:var(--text-dim);margin-bottom:12px">🚛 ${truck.name} · ${truck.currentCity}</div>`;

  html += `<div class="dc-message-card">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:22px">${n.type === 'voicemail' ? '🎙️' : '💬'}</span>
      <span style="font-size:14px;font-weight:700;color:#fff;flex:1">${n.subject}</span>
    </div>
    <div style="font-size:13px;color:var(--text-muted);line-height:20px">${n.message}</div>
  </div>`;

  if (_dcChosen === null) {
    html += '<div style="font-size:12px;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Как ответишь?</div>';
    html += '<div class="dc-choices">';
    responses.forEach((r, i) => {
      html += `<div class="dc-choice-btn" onclick="chooseDriverResponse(${i})">
        <span class="dc-choice-icon">${r.icon}</span>
        <span class="dc-choice-text">${r.text}</span>
      </div>`;
    });
    html += '</div>';
  } else {
    const r = responses[_dcChosen];
    html += `<div class="dc-result-card ${r.correct ? 'correct' : 'wrong'}">
      <div style="font-size:32px;margin-bottom:4px">${r.correct ? '✅' : '⚠️'}</div>
      <div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:6px">${r.correct ? 'Правильное решение!' : 'Не лучший выбор'}</div>
      <div style="font-size:13px;color:var(--text-muted);line-height:20px">${r.outcome}</div>
      ${r.money !== 0 ? `<div style="font-size:18px;font-weight:900;margin-top:4px;color:${r.money > 0 ? 'var(--success)' : 'var(--danger)'}">${r.money > 0 ? '+' : ''}${r.money}$</div>` : ''}
      ${r.mood !== 0 ? `<div style="font-size:13px;font-weight:700;color:${r.mood > 0 ? 'var(--success)' : 'var(--danger)'}">Настроение водителя: ${r.mood > 0 ? '+' : ''}${r.mood}</div>` : ''}
    </div>
    <button style="width:100%;margin-top:12px;padding:14px;border-radius:14px;background:var(--primary);font-size:15px;font-weight:900;color:#fff" onclick="closeModal('modal-driver-comm')">Готово</button>`;
  }

  document.getElementById('modal-driver-comm-body').innerHTML = html;
}

function chooseDriverResponse(idx) {
  _dcChosen = idx;
  const responses = getDriverResponses(_dcNotification);
  const r = responses[idx];
  if (r.money > 0) addMoney(r.money, `Решение: ${r.text.slice(0, 30)}`);
  if (r.money < 0) removeMoney(Math.abs(r.money), `Решение: ${r.text.slice(0, 30)}`);
  renderDriverComm();
}

// ═══════════════════════════════════════════════════════════════════
// DELIVERY RESULT (3 TABS)
// ═══════════════════════════════════════════════════════════════════
let _drTab = 'pnl';
let _drBrokerMsgs = [];
let _drDriverMsgs = [];

function showDeliveryResultV2(result) {
  _drTab = 'pnl';
  _drBrokerMsgs = [];
  _drDriverMsgs = [];
  G._currentDeliveryResult = result;
  renderDeliveryResultV2(result);
  // Replace the simple popup with the full modal
  const popup = document.getElementById('delivery-popup');
  if (popup) popup.classList.remove('show');
  openModal('modal-event'); // reuse event modal
}

function renderDeliveryResultV2(result) {
  const profitColor = result.netProfit >= 0 ? '#4ade80' : '#f87171';
  const rpmColor = result.ratePerMile >= 2.5 ? '#4ade80' : result.ratePerMile >= 2.0 ? '#fbbf24' : '#f87171';

  let html = '';
  // Header
  html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="padding:5px 10px;border-radius:8px;border:1px solid ${profitColor}55;background:${profitColor}22;font-size:12px;font-weight:800;color:${profitColor}">🚛 ${result.truckName}</div>
      <div>
        <div style="font-size:15px;font-weight:800;color:#fff">Доставка завершена!</div>
        <div style="font-size:11px;color:#64748b;margin-top:1px">${result.fromCity} → ${result.toCity} · ${result.miles} mi</div>
      </div>
    </div>
  </div>`;

  // Summary chips
  html += `<div class="dr-summary" style="margin:0 -20px;padding:12px 20px">
    <div class="dr-chip"><div class="dr-chip-label">GROSS</div><div class="dr-chip-val" style="color:#38bdf8">$${result.grossRevenue.toLocaleString()}</div></div>
    <div class="dr-chip"><div class="dr-chip-label">РАСХОДЫ</div><div class="dr-chip-val" style="color:#f87171">-$${result.totalExpenses.toLocaleString()}</div></div>
    <div class="dr-chip" style="border-color:${profitColor}55;background:${profitColor}11"><div class="dr-chip-label">NET</div><div class="dr-chip-val" style="color:${profitColor}">$${result.netProfit.toLocaleString()}</div></div>
    <div class="dr-chip"><div class="dr-chip-label">$/MILE</div><div class="dr-chip-val" style="color:${rpmColor}">${result.ratePerMile.toFixed(2)}</div></div>
  </div>`;

  // Tabs
  html += `<div class="dr-tabs" style="margin:0 -20px">
    <div class="dr-tab ${_drTab==='pnl'?'active':''}" onclick="_drTab='pnl';renderDeliveryResultV2(G._currentDeliveryResult)">💰 P&L</div>
    <div class="dr-tab ${_drTab==='broker'?'active':''}" onclick="_drTab='broker';renderDeliveryResultV2(G._currentDeliveryResult)">📧 Брокер</div>
    <div class="dr-tab ${_drTab==='driver'?'active':''}" onclick="_drTab='driver';renderDeliveryResultV2(G._currentDeliveryResult)">🚛 Водитель</div>
  </div>`;

  html += '<div class="dr-tab-content">';

  if (_drTab === 'pnl') {
    html += `<div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:2px">Расчёт поездки</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:14px">${result.driverName} · ${result.fromCity} → ${result.toCity}</div>
      <div style="font-size:9px;font-weight:700;color:#475569;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">📈 ДОХОДЫ</div>
      <div class="dr-pnl-row"><span style="font-size:12px;color:#94a3b8">Agreed Rate</span><span style="font-size:12px;font-weight:700;color:#4ade80">+$${result.agreedRate.toLocaleString()}</span></div>
      ${result.detentionPay > 0 ? `<div class="dr-pnl-row"><span style="font-size:12px;color:#94a3b8">Detention Pay</span><span style="font-size:12px;font-weight:700;color:#fbbf24">+$${result.detentionPay.toLocaleString()}</span></div>` : ''}
      <div class="dr-pnl-row bold"><span style="color:#fff">GROSS REVENUE</span><span style="color:#38bdf8">+$${result.grossRevenue.toLocaleString()}</span></div>
      <div style="font-size:9px;font-weight:700;color:#475569;letter-spacing:1px;text-transform:uppercase;margin:14px 0 8px">📉 РАСХОДЫ</div>
      <div class="dr-pnl-row"><span style="font-size:12px;color:#94a3b8">Топливо (${result.miles}mi × $0.45)</span><span style="font-size:12px;font-weight:700;color:#f87171">-$${result.fuelCost.toLocaleString()}</span></div>
      <div class="dr-pnl-row"><span style="font-size:12px;color:#94a3b8">Водитель (${result.miles}mi × $0.55)</span><span style="font-size:12px;font-weight:700;color:#f87171">-$${result.driverPay.toLocaleString()}</span></div>
      <div class="dr-pnl-row"><span style="font-size:12px;color:#94a3b8">Dispatch Fee (8%)</span><span style="font-size:12px;font-weight:700;color:#f87171">-$${result.dispatchFee.toLocaleString()}</span></div>
      <div class="dr-pnl-row"><span style="font-size:12px;color:#94a3b8">Factoring Fee (3%)</span><span style="font-size:12px;font-weight:700;color:#f87171">-$${result.factoringFee.toLocaleString()}</span></div>
      ${result.lumperCost > 0 ? `<div class="dr-pnl-row"><span style="font-size:12px;color:#94a3b8">Lumper</span><span style="font-size:12px;font-weight:700;color:#f87171">-$${result.lumperCost.toLocaleString()}</span></div>` : ''}
      <div class="dr-pnl-row bold"><span style="color:#fff">TOTAL EXPENSES</span><span style="color:#f87171">-$${result.totalExpenses.toLocaleString()}</span></div>
      <div class="dr-net-row" style="border-color:${profitColor}44">
        <span style="font-size:14px;font-weight:900;color:#fff">NET PROFIT</span>
        <span style="font-size:22px;font-weight:900;color:${profitColor}">${result.netProfit >= 0 ? '+' : ''}$${result.netProfit.toLocaleString()}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:11px;color:#64748b">Rate/mile: <span style="color:${rpmColor}">$${result.ratePerMile.toFixed(2)}</span></span>
        <span style="font-size:11px;color:#64748b">Profit/mile: <span style="color:${profitColor}">$${result.profitPerMile.toFixed(2)}</span></span>
      </div>
      <div class="dr-grade-box" style="border-color:${profitColor}44">
        <div style="font-size:15px;font-weight:800;color:${profitColor};margin-bottom:4px">
          ${result.profitPerMile >= 1.0 ? '⭐ Отличная поездка!' : result.profitPerMile >= 0.5 ? '👍 Нормально' : '⚠️ Слабая маржа'}
        </div>
        <div style="font-size:11px;color:#64748b">
          ${result.profitPerMile >= 1.0 ? 'Держи такой темп — это хорошая ставка.' : result.profitPerMile >= 0.5 ? 'Можно лучше — торгуйся выше $3/mile.' : 'В следующий раз торгуйся агрессивнее!'}
        </div>
      </div>`;
  } else if (_drTab === 'broker') {
    html += `<div class="dr-chat-bubble them"><div class="dr-chat-name">${result.fromCity} Broker</div><div class="dr-chat-body them">Hey! Driver confirmed delivery in ${result.toCity}. BOL signed. Great job on this load!</div></div>`;
    html += `<div class="dr-chat-bubble them"><div class="dr-chat-name">${result.fromCity} Broker</div><div class="dr-chat-body them">Rate Con was $${result.agreedRate.toLocaleString()} all-in. I'll process the invoice today.</div></div>`;
    _drBrokerMsgs.forEach(m => {
      if (m.startsWith('__broker__')) {
        html += `<div class="dr-chat-bubble them"><div class="dr-chat-name">Broker</div><div class="dr-chat-body them">${m.replace('__broker__','')}</div></div>`;
      } else {
        html += `<div class="dr-chat-bubble me"><div class="dr-chat-body me">${m}</div></div>`;
      }
    });
    const quickReplies = ['Thanks! Send the invoice.','Please confirm detention.','POD attached.','Great working with you!','Send Rate Con for next load.'];
    html += '<div class="dr-quick-replies">' + quickReplies.map(r => `<div class="dr-quick-btn" onclick="sendDRBroker('${r.replace(/'/g,"\\'")}')">${r}</div>`).join('') + '</div>';
  } else {
    html += `<div class="dr-chat-bubble them"><div class="dr-chat-name">${result.driverName}</div><div class="dr-chat-body them">Dispatcher, I'm empty in ${result.toCity}. BOL signed, all good. What's next?</div></div>`;
    _drDriverMsgs.forEach(m => {
      if (m.startsWith('__driver__')) {
        html += `<div class="dr-chat-bubble them"><div class="dr-chat-name">${result.driverName}</div><div class="dr-chat-body them">${m.replace('__driver__','')}</div></div>`;
      } else {
        html += `<div class="dr-chat-bubble me"><div class="dr-chat-body me">${m}</div></div>`;
      }
    });
    const quickReplies = ['Great job! Rest up.','Find a truck stop nearby.','I\'ll find you a load ASAP.','Check your HOS.','Head to Chicago.'];
    html += '<div class="dr-quick-replies">' + quickReplies.map(r => `<div class="dr-quick-btn" onclick="sendDRDriver('${r.replace(/'/g,"\\'")}')">${r}</div>`).join('') + '</div>';
  }

  html += '</div>';
  html += `<button style="width:100%;margin-top:12px;padding:14px;background:rgba(56,189,248,0.15);border-radius:12px;border:1px solid rgba(56,189,248,0.3);font-size:13px;font-weight:800;color:#38bdf8" onclick="closeModal('modal-event')">✓ Закрыть и найти следующий груз</button>`;

  document.getElementById('modal-event-title').textContent = '✅ Доставка завершена!';
  document.getElementById('modal-event-body').innerHTML = html;
}

function sendDRBroker(msg) {
  _drBrokerMsgs.push(msg);
  setTimeout(() => {
    let reply = 'Thanks for the update!';
    if (msg.includes('invoice')) reply = 'Invoice will be processed in 30 days.';
    else if (msg.includes('detention')) reply = 'Detention approved — added to invoice.';
    _drBrokerMsgs.push('__broker__Got it! ' + reply);
    renderDeliveryResultV2(G._currentDeliveryResult);
  }, 600);
  renderDeliveryResultV2(G._currentDeliveryResult);
}

function sendDRDriver(msg) {
  _drDriverMsgs.push(msg);
  setTimeout(() => {
    let reply = 'Roger that, dispatcher!';
    if (msg.includes('load')) reply = 'Copy that, waiting for next load.';
    else if (msg.includes('HOS')) reply = 'HOS is good, 8 hours left.';
    _drDriverMsgs.push('__driver__' + reply);
    renderDeliveryResultV2(G._currentDeliveryResult);
  }, 500);
  renderDeliveryResultV2(G._currentDeliveryResult);
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSE EMAIL (TILE-BASED)
// ═══════════════════════════════════════════════════════════════════
let _ceReplyTo = null;
let _ceSelected = [];

function getPhraseTiles(replyTo) {
  if (!replyTo) return ['Hi,','Hello,','I have a truck available.','What is the rate?','Can you send the Rate Con?','Driver is ready.','Please confirm.','Thank you!','Best regards,','Let me know.'];
  const msg = ((replyTo.message||'') + ' ' + (replyTo.subject||'')).toLowerCase();
  if (msg.includes('pod') || msg.includes('proof of delivery')) return ['Hi,','POD is attached.','Driver delivered on time.','Please find the POD below.','No issues during delivery.','Please process the invoice.','Let me know if you need anything else.','Thank you!','Best regards,'];
  if (msg.includes('detention') || msg.includes('задержк')) return ['Hi,','Driver has been waiting for','2 hours','3 hours','at the shipper.','Detention started at','Please approve detention pay.','$50/hour','BOL timestamp confirms arrival time.','Please confirm detention payment.','Thank you!'];
  if (msg.includes('rate con') || msg.includes('rate confirmation')) return ['Hi,','Rate Con received.','Confirmed.','Driver will be at pickup by','today','tomorrow','at 8:00 AM','at 10:00 AM','Please send updated Rate Con.','All good, thank you!','Best regards,'];
  if (msg.includes('груз') || msg.includes('load') || msg.includes('available')) return ['Hi,','I have a truck available.','Dry Van','Reefer','available in','Chicago','Dallas','Atlanta','What is the rate?','Can you do','$2.50/mile?','$3.00/mile?','Send me the Rate Con.','Thank you!'];
  return ['Hi,','Got it,','Confirmed.','Thank you for the update.','Driver is on the way.','Will keep you posted.','Please send details.','Rate Con received.','POD will follow.','Let me know.','Best regards,','Thanks!'];
}

function showComposeEmail(replyTo) {
  _ceReplyTo = replyTo || null;
  _ceSelected = [];
  renderComposeEmail();
  openModal('modal-compose-email');
}

function renderComposeEmail() {
  const n = _ceReplyTo;
  document.getElementById('compose-title').textContent = n ? 'Ответить' : 'Новое письмо';
  document.getElementById('compose-to').textContent = n ? `Кому: ${n.from}` : '';
  const tiles = getPhraseTiles(n);
  const bodyText = _ceSelected.join(' ');

  let html = '';
  if (n) {
    html += `<div class="ce-quote">
      <div style="font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase;margin-bottom:3px">Оригинал:</div>
      <div style="font-size:11px;color:#94a3b8;line-height:16px">${(n.message||'').substring(0,120)}...</div>
    </div>`;
  }

  html += `<div class="ce-composed">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:10px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px">Твоё письмо:</span>
      ${_ceSelected.length > 0 ? '<span style="font-size:11px;color:var(--danger);font-weight:700;cursor:pointer" onclick="_ceSelected=[];renderComposeEmail()">Очистить</span>' : ''}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${_ceSelected.length === 0 ? '<span style="font-size:12px;color:#475569;font-style:italic">Нажимай на фразы снизу →</span>' :
        _ceSelected.map((t,i) => `<span class="ce-token" onclick="removeCETile(${i})">${t} ×</span>`).join('')}
    </div>
  </div>`;

  html += `<div style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Выбери фразы:</div>
    <div style="max-height:160px;overflow-y:auto">
      <div class="ce-tiles-grid">
        ${tiles.map(t => {
          const sel = _ceSelected.includes(t);
          return `<div class="ce-tile ${sel?'selected':''}" onclick="toggleCETile('${t.replace(/'/g,"\\'")}')">${t}</div>`;
        }).join('')}
      </div>
    </div>`;

  document.getElementById('modal-compose-body').innerHTML = html;

  const footer = document.getElementById('compose-footer');
  footer.innerHTML = `
    <button style="flex:1;padding:13px;border-radius:12px;background:rgba(255,255,255,0.06);border:1px solid var(--border);font-size:14px;color:var(--text-muted);font-weight:600" onclick="closeModal('modal-compose-email')">Отмена</button>
    <button style="flex:2;padding:13px;border-radius:12px;background:var(--primary);font-size:14px;font-weight:800;color:#fff;${!bodyText.trim()?'opacity:0.35;cursor:not-allowed':''}" onclick="${bodyText.trim()?'sendComposeEmail()':''}">Отправить</button>`;
}

function toggleCETile(tile) {
  const idx = _ceSelected.indexOf(tile);
  if (idx >= 0) _ceSelected.splice(idx, 1);
  else _ceSelected.push(tile);
  renderComposeEmail();
}

function removeCETile(idx) {
  _ceSelected.splice(idx, 1);
  renderComposeEmail();
}

function sendComposeEmail() {
  const body = _ceSelected.join(' ');
  if (!body.trim()) return;
  showToast('✉️ Письмо отправлено!', 'success');
  closeModal('modal-compose-email');
  _ceSelected = [];
}

// ═══════════════════════════════════════════════════════════════════
// CANCEL LOAD MODAL
// ═══════════════════════════════════════════════════════════════════
const CANCEL_REASONS = [
  { id:'breakdown', label:'🔧 Поломка трака', desc:'Механическая неисправность', tonu:150, rep:-5 },
  { id:'hos', label:'⏰ Нарушение HOS', desc:'Водитель не успевает по часам', tonu:200, rep:-8 },
  { id:'emergency', label:'🚨 Экстренная ситуация', desc:'Личная проблема водителя', tonu:100, rep:-3 },
  { id:'weather', label:'🌨️ Погодные условия', desc:'Опасная погода на маршруте', tonu:50, rep:-2 },
  { id:'better_rate', label:'💰 Нашли лучший груз', desc:'Отказ без уважительной причины', tonu:300, rep:-15 },
];

let _clLoad = null;
let _clReason = null;
let _clConfirming = false;

function showCancelLoadModal(load) {
  _clLoad = load;
  _clReason = null;
  _clConfirming = false;
  renderCancelLoad();
  openModal('modal-cancel-load');
}

function renderCancelLoad() {
  const load = _clLoad;
  if (!load) return;

  let html = `<div class="cl-load-info">
    <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:4px">${load.fromCity} → ${load.toCity}</div>
    <div style="font-size:13px;color:#e2e8f0;margin-bottom:2px">${load.commodity} · $${load.agreedRate.toLocaleString()}</div>
    <div style="font-size:12px;color:#94a3b8">Брокер: ${load.brokerName}</div>
  </div>`;

  html += `<div class="cl-warning">
    <span style="font-size:24px">⚠️</span>
    <div style="flex:1">
      <div style="font-size:14px;font-weight:700;color:var(--danger);margin-bottom:4px">Последствия отмены</div>
      <div style="font-size:12px;color:#e2e8f0;line-height:16px">Брокер может выставить TONU fee и ваша репутация пострадает</div>
    </div>
  </div>`;

  CANCEL_REASONS.forEach(r => {
    const sel = _clReason === r.id;
    html += `<div class="cl-reason-card ${sel?'selected':''}" onclick="_clReason='${r.id}';renderCancelLoad()">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:15px;font-weight:700;color:#fff">${r.label}</span>
        ${sel ? '<span style="font-size:18px;color:var(--primary)">✓</span>' : ''}
      </div>
      <div style="font-size:12px;color:#e2e8f0;margin-bottom:10px">${r.desc}</div>
      <div class="cl-penalty">
        <div style="flex:1"><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">TONU Fee:</div><div style="font-size:14px;font-weight:700;color:#fbbf24">-$${r.tonu}</div></div>
        <div style="flex:1"><div style="font-size:10px;color:#94a3b8;margin-bottom:2px">Репутация:</div><div style="font-size:14px;font-weight:700;color:#ef4444">${r.rep}</div></div>
      </div>
    </div>`;
  });

  if (_clReason && !_clConfirming) {
    html += `<button style="width:100%;padding:16px;background:var(--danger);border-radius:12px;font-size:15px;font-weight:700;color:#fff;margin-top:8px" onclick="_clConfirming=true;renderCancelLoad()">Продолжить отмену</button>`;
  }

  if (_clConfirming) {
    const reason = CANCEL_REASONS.find(r => r.id === _clReason);
    html += `<div style="padding:16px;border-top:1px solid rgba(255,255,255,0.1);margin-top:12px">
      <div style="font-size:16px;font-weight:700;color:var(--danger);text-align:center;margin-bottom:12px">⚠️ Подтвердите отмену</div>
      <div style="padding:14px;background:rgba(239,68,68,0.1);border-radius:10px;margin-bottom:12px">
        <div style="font-size:13px;color:#e2e8f0;margin-bottom:4px">Причина: ${reason.label}</div>
        <div style="font-size:13px;color:#e2e8f0;margin-bottom:4px">TONU Fee: -$${reason.tonu}</div>
        <div style="font-size:13px;color:#e2e8f0">Репутация: ${reason.rep}</div>
      </div>
      <div style="display:flex;gap:10px">
        <button style="flex:1;padding:14px;background:rgba(255,255,255,0.1);border-radius:10px;font-size:14px;font-weight:700;color:#e2e8f0" onclick="_clConfirming=false;renderCancelLoad()">← Назад</button>
        <button style="flex:1;padding:14px;background:var(--danger);border-radius:10px;font-size:14px;font-weight:700;color:#fff" onclick="confirmCancelLoad()">Отменить груз</button>
      </div>
    </div>`;
  }

  document.getElementById('modal-cancel-body').innerHTML = html;
}

function confirmCancelLoad() {
  const reason = CANCEL_REASONS.find(r => r.id === _clReason);
  if (!reason || !_clLoad) return;
  removeMoney(reason.tonu, `TONU: ${_clLoad.fromCity} → ${_clLoad.toCity}`);
  G.reputation = Math.max(0, G.reputation + reason.rep);
  // Remove load
  G.bookedLoads = G.bookedLoads.filter(l => l.id !== _clLoad.id);
  G.activeLoads = G.activeLoads.filter(l => l.id !== _clLoad.id);
  // Free truck
  const truck = G.trucks.find(t => t.currentLoad && t.currentLoad.id === _clLoad.id);
  if (truck) { truck.status = 'idle'; truck.currentLoad = null; truck.destinationCity = null; truck.progress = 0; }
  closeModal('modal-cancel-load');
  showToast(`🚫 Груз отменён. TONU: -$${reason.tonu}`, 'warning');
  renderPanel(); renderTruckStrip(); renderTopBar(); updateBadges();
}

// ═══════════════════════════════════════════════════════════════════
// FLEET OVERVIEW
// ═══════════════════════════════════════════════════════════════════
let _foFilter = 'all';

function showFleetOverview() {
  _foFilter = 'all';
  renderFleetOverview();
  openModal('modal-fleet-overview');
}

function renderFleetOverview() {
  const trucks = G.trucks;
  const filtered = trucks.filter(t => {
    if (_foFilter === 'all') return true;
    if (_foFilter === 'active') return t.status === 'driving' || t.status === 'loaded';
    if (_foFilter === 'idle') return t.status === 'idle';
    if (_foFilter === 'warning') return t.hoursLeft < 4 || t.hosViolations > 0;
    return true;
  });

  const totalMiles = trucks.reduce((s,t) => s + t.totalMiles, 0);
  const totalDel = trucks.reduce((s,t) => s + t.totalDeliveries, 0);
  const avgSafety = Math.round(trucks.reduce((s,t) => s + t.safetyScore, 0) / trucks.length);
  const activeCnt = trucks.filter(t => t.status === 'driving' || t.status === 'loaded').length;
  const idleCnt = trucks.filter(t => t.status === 'idle').length;
  const warnCnt = trucks.filter(t => t.hoursLeft < 4 || t.hosViolations > 0).length;

  let html = `<div style="font-size:11px;color:var(--text-dim);margin-bottom:12px">${trucks.length} trucks total</div>`;

  html += `<div class="fo-stats-grid">
    <div class="fo-stat"><div class="fo-stat-val">${totalMiles.toLocaleString()}</div><div class="fo-stat-label">Total Miles</div></div>
    <div class="fo-stat"><div class="fo-stat-val">${totalDel}</div><div class="fo-stat-label">Deliveries</div></div>
    <div class="fo-stat"><div class="fo-stat-val" style="color:var(--success)">${avgSafety}</div><div class="fo-stat-label">Avg Safety</div></div>
  </div>`;

  html += `<div class="fo-filters">
    <div class="fo-filter ${_foFilter==='all'?'active':''}" onclick="_foFilter='all';renderFleetOverview()">All (${trucks.length})</div>
    <div class="fo-filter ${_foFilter==='active'?'active':''}" onclick="_foFilter='active';renderFleetOverview()">🚛 Active (${activeCnt})</div>
    <div class="fo-filter ${_foFilter==='idle'?'active':''}" onclick="_foFilter='idle';renderFleetOverview()">⚪ Idle (${idleCnt})</div>
    <div class="fo-filter ${_foFilter==='warning'?'active':''}" onclick="_foFilter='warning';renderFleetOverview()">⚠️ Warning (${warnCnt})</div>
  </div>`;

  filtered.forEach(t => {
    const color = getTruckColor(t);
    html += `<div class="fo-truck-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff">${t.name}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:2px">${t.driver}</div>
        </div>
        <div style="padding:4px 10px;border-radius:8px;border:1px solid ${color};background:${color}15;font-size:9px;font-weight:700;color:${color}">${(t.status||'idle').toUpperCase()}</div>
      </div>
      <div class="fo-perf-grid">
        <div class="fo-perf"><div class="fo-perf-val">${t.safetyScore}</div><div class="fo-perf-label">Safety</div></div>
        <div class="fo-perf"><div class="fo-perf-val">${t.fuelEfficiency||6.2}</div><div class="fo-perf-label">MPG</div></div>
        <div class="fo-perf"><div class="fo-perf-val">${t.onTimeRate||95}%</div><div class="fo-perf-label">On-Time</div></div>
        <div class="fo-perf"><div class="fo-perf-val">${t.complianceRate||98}%</div><div class="fo-perf-label">Compliance</div></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:10px;color:var(--text-muted)">
        <span>📍 ${t.currentCity}</span>
        <span>🛣️ ${t.totalMiles.toLocaleString()} mi</span>
        <span>📦 ${t.totalDeliveries} loads</span>
        <span style="${t.hoursLeft < 4 ? 'color:var(--warning)' : ''}">⏰ ${t.hoursLeft.toFixed(1)}h HOS</span>
      </div>
      ${t.hoursLeft < 4 || t.hosViolations > 0 ? `<div style="margin-top:8px;background:rgba(251,146,60,0.1);border-radius:8px;padding:8px">
        ${t.hoursLeft < 2 ? '<div style="font-size:10px;color:var(--danger);font-weight:600">🚨 Critical: Less than 2h HOS</div>' : ''}
        ${t.hoursLeft >= 2 && t.hoursLeft < 4 ? '<div style="font-size:10px;color:var(--warning);font-weight:600">⚠️ Warning: Low HOS hours</div>' : ''}
        ${t.hosViolations > 0 ? `<div style="font-size:10px;color:var(--warning);font-weight:600">⚠️ ${t.hosViolations} HOS violation(s)</div>` : ''}
      </div>` : ''}
    </div>`;
  });

  if (filtered.length === 0) html += '<div style="text-align:center;padding:40px;color:var(--text-dim)">No trucks match this filter</div>';

  document.getElementById('modal-fleet-body').innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// COMPLIANCE DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function showComplianceDashboard() {
  renderComplianceDashboard();
  openModal('modal-compliance');
}

function renderComplianceDashboard() {
  const trucks = G.trucks;
  const total = trucks.length;
  const compliant = trucks.filter(t => t.hoursLeft >= 4 && t.hosViolations === 0).length;
  const warning = trucks.filter(t => t.hoursLeft < 4 && t.hoursLeft >= 2).length;
  const critical = trucks.filter(t => t.hoursLeft < 2 || t.hosViolations > 0).length;
  const avgComp = Math.round(trucks.reduce((s,t) => s + (t.complianceRate||98), 0) / total);
  const totalViol = trucks.reduce((s,t) => s + t.hosViolations, 0);

  let html = `<div style="font-size:11px;color:var(--text-dim);margin-bottom:12px">Real-time HOS monitoring</div>`;

  html += `<div class="comp-stats">
    <div class="comp-stat" style="border-color:var(--success)"><div class="comp-stat-val" style="color:var(--success)">${compliant}/${total}</div><div class="comp-stat-label">✅ Compliant</div></div>
    <div class="comp-stat" style="border-color:var(--warning)"><div class="comp-stat-val" style="color:var(--warning)">${warning}</div><div class="comp-stat-label">⚠️ Warning</div></div>
    <div class="comp-stat" style="border-color:var(--danger)"><div class="comp-stat-val" style="color:var(--danger)">${critical}</div><div class="comp-stat-label">🚨 Critical</div></div>
    <div class="comp-stat" style="border-color:var(--primary)"><div class="comp-stat-val">${avgComp}%</div><div class="comp-stat-label">📈 Avg Rate</div></div>
  </div>`;

  if (totalViol > 0) {
    html += `<div style="background:rgba(239,68,68,0.1);border:2px solid var(--danger);border-radius:12px;padding:14px;margin-bottom:12px">
      <div style="font-size:14px;font-weight:700;color:var(--danger);margin-bottom:4px">⚠️ HOS Violations Today</div>
      <div style="font-size:20px;font-weight:800;color:var(--danger);margin-bottom:6px">${totalViol} total violations</div>
      <div style="font-size:11px;color:var(--text-muted)">Review driver logs and take corrective action</div>
    </div>`;
  }

  html += '<div style="font-size:13px;font-weight:700;color:var(--text-muted);margin-bottom:8px">Driver Status</div>';

  trucks.forEach(t => {
    const status = t.hoursLeft >= 4 ? 'ok' : t.hoursLeft >= 2 ? 'warning' : 'critical';
    const sColor = status === 'ok' ? 'var(--success)' : status === 'warning' ? 'var(--warning)' : 'var(--danger)';
    const sIcon = status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '🚨';
    html += `<div class="comp-driver-card" style="border-left-color:${sColor}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff">${t.driver}</div>
          <div style="font-size:11px;color:var(--text-dim);margin-top:2px">${t.name}</div>
        </div>
        <div style="padding:4px 10px;border-radius:8px;background:${sColor}15;border:1px solid ${sColor};font-size:10px;font-weight:700;color:${sColor}">${sIcon} ${status.toUpperCase()}</div>
      </div>
      <div class="comp-metrics">
        <div class="comp-metric"><div class="comp-metric-val" style="color:${sColor}">${t.hoursLeft.toFixed(1)}h</div><div class="comp-metric-label">HOS Left</div></div>
        <div class="comp-metric"><div class="comp-metric-val">${t.complianceRate||98}%</div><div class="comp-metric-label">Compliance</div></div>
        <div class="comp-metric"><div class="comp-metric-val" ${t.hosViolations>0?'style="color:var(--danger)"':''}>${t.hosViolations}</div><div class="comp-metric-label">Violations</div></div>
        <div class="comp-metric"><div class="comp-metric-val">${t.safetyScore}</div><div class="comp-metric-label">Safety</div></div>
      </div>
      ${t.hosViolations > 0 ? `<div style="margin-top:10px;background:rgba(239,68,68,0.1);border-radius:8px;padding:8px"><div style="font-size:10px;color:var(--danger);font-weight:600">⚠️ ${t.hosViolations} HOS violation(s) - Review required</div></div>` : ''}
    </div>`;
  });

  document.getElementById('modal-compliance-body').innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// FINANCIAL DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function showFinancialDashboard() {
  renderFinancialDashboard();
  openModal('modal-financial');
}

function renderFinancialDashboard() {
  const profit = G.totalEarned - G.totalLost;
  const incomes = G.financeLog.filter(f => f.type === 'income');
  const expenses = G.financeLog.filter(f => f.type === 'expense');

  let html = `<div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:20px">
    <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="font-size:13px;color:var(--text-muted)">Доходы</span><span style="font-size:14px;font-weight:800;color:var(--success)">+$${G.totalEarned.toLocaleString()}</span></div>
    <div style="display:flex;justify-content:space-between;padding:4px 0"><span style="font-size:13px;color:var(--text-muted)">Расходы</span><span style="font-size:14px;font-weight:800;color:var(--danger)">-$${G.totalLost.toLocaleString()}</span></div>
    <div style="display:flex;justify-content:space-between;padding:10px 0 4px;border-top:1px solid var(--border);margin-top:4px"><span style="font-size:13px;color:var(--text-muted)">Итого</span><span style="font-size:14px;font-weight:800;color:${profit>=0?'var(--success)':'var(--danger)'}">${profit>=0?'+':''}$${profit.toLocaleString()}</span></div>
  </div>`;

  html += '<div style="font-size:13px;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Доходы</div>';
  if (incomes.length === 0) html += '<div style="font-size:12px;color:var(--text-dim);font-style:italic;margin-bottom:12px">Нет доходов</div>';
  else incomes.forEach(f => {
    html += `<div style="display:flex;justify-content:space-between;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:6px">
      <span style="font-size:12px;color:var(--text-muted);flex:1">${f.description}</span>
      <span style="font-size:12px;font-weight:700;color:var(--success)">+$${f.amount.toLocaleString()}</span>
    </div>`;
  });

  html += '<div style="font-size:13px;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin:12px 0 8px">Расходы</div>';
  if (expenses.length === 0) html += '<div style="font-size:12px;color:var(--text-dim);font-style:italic;margin-bottom:12px">Нет расходов</div>';
  else expenses.forEach(f => {
    html += `<div style="display:flex;justify-content:space-between;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:6px">
      <span style="font-size:12px;color:var(--text-muted);flex:1">${f.description}</span>
      <span style="font-size:12px;font-weight:700;color:var(--danger)">-$${f.amount.toLocaleString()}</span>
    </div>`;
  });

  document.getElementById('modal-financial-body').innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════
// BROKER PROFILE MODAL
// ═══════════════════════════════════════════════════════════════════
function showBrokerProfile(brokerId) {
  const broker = G.brokers.find(b => b.id === brokerId) || BROKERS.find(b => b.id === brokerId);
  if (!broker) return;

  // Defaults for missing fields
  const personality = broker.personality || ['aggressive','flexible','greedy'][Math.abs(broker.id.charCodeAt(1)) % 3];
  const rating = broker.rating || (3.5 + (broker.relationship || 50) / 50);
  const discountPct = broker.discountPercent || Math.round(5 + Math.random() * 10);
  const initialOffer = broker.initialOffer || 2500;

  document.getElementById('broker-profile-name').textContent = broker.name;
  document.getElementById('broker-profile-company').textContent = broker.company;

  const personalityLabels = { aggressive:'🔥 Агрессивный', flexible:'🤝 Гибкий', greedy:'💰 Жадный' };
  const personalityDescs = {
    aggressive:'Торгуется жёстко, но уважает уверенность. Не давай слабину.',
    flexible:'Готов идти на компромисс. Предлагай встречные варианты.',
    greedy:'Пытается выжать максимум. Стой на своём.'
  };
  const stars = '⭐'.repeat(Math.floor(rating));

  let html = `<div style="text-align:center;padding:16px;border-bottom:1px solid rgba(255,255,255,0.05)">
    <div style="font-size:28px;margin-bottom:8px">${stars}</div>
    <div style="font-size:20px;font-weight:700;color:var(--primary)">${rating.toFixed(1)} / 5.0</div>
    <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Основано на 47 отзывах</div>
  </div>`;

  html += `<div style="display:flex;gap:12px;padding:16px">
    <div style="flex:1;background:rgba(6,182,212,0.1);padding:16px;border-radius:12px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:var(--primary)">23</div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Грузов вместе</div>
    </div>
    <div style="flex:1;background:rgba(6,182,212,0.1);padding:16px;border-radius:12px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:var(--primary)">${discountPct}%</div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Средняя скидка</div>
    </div>
    <div style="flex:1;background:rgba(6,182,212,0.1);padding:16px;border-radius:12px;text-align:center">
      <div style="font-size:22px;font-weight:700;color:var(--primary)">98%</div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Оплата вовремя</div>
    </div>
  </div>`;

  html += `<div style="padding:0 16px 16px">
    <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px">👤 Характер</div>
    <div style="display:inline-block;background:rgba(251,146,60,0.15);padding:8px 12px;border-radius:8px;font-size:14px;font-weight:700;color:#fb923c;margin-bottom:8px">${personalityLabels[personality] || personality}</div>
    <div style="font-size:13px;color:#e2e8f0;line-height:20px">${personalityDescs[personality] || ''}</div>
  </div>`;

  html += `<div style="padding:0 16px 16px">
    <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px">📞 Лучшее время звонить</div>
    <div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:6px">🌅 Утро (8:00 - 10:00 AM)</div>
    <div style="font-size:12px;color:var(--text-muted);font-style:italic">В это время он более сговорчивый</div>
  </div>`;

  html += `<div style="padding:0 16px 16px">
    <div style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px">⏱️ История Detention</div>
    <div style="display:flex;justify-content:space-between;padding:8px 0"><span style="font-size:13px;color:var(--text-muted)">Задержки на погрузке:</span><span style="font-size:13px;font-weight:600;color:#e2e8f0">2 раза</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 0"><span style="font-size:13px;color:var(--text-muted)">Оплатил detention:</span><span style="font-size:13px;font-weight:600;color:#22c55e">✓ Всегда</span></div>
  </div>`;

  html += `<div style="margin:0 16px 16px;padding:16px;background:rgba(6,182,212,0.08);border-radius:12px">
    <div style="font-size:14px;font-weight:700;color:var(--primary);margin-bottom:8px">🤖 AI совет</div>
    <div style="font-size:13px;color:#e2e8f0;line-height:20px">Торгуйся до $${Math.round(initialOffer * 1.15)} — этот брокер обычно соглашается на +10-15% от первого предложения.</div>
  </div>`;

  document.getElementById('modal-broker-body').innerHTML = html;
  openModal('modal-broker-profile');
}

// ═══════════════════════════════════════════════════════════════════
// GAME SIDE MENU (HAMBURGER)
// ═══════════════════════════════════════════════════════════════════
function openGameMenu() {
  const activeTrucks = G.trucks.filter(t => t.status === 'driving' || t.status === 'loaded').length;
  const totalLoads = G.bookedLoads.length + G.activeLoads.length;
  const warnTrucks = G.trucks.filter(t => t.hoursLeft < 4 || t.hosViolations > 0).length;
  const critEvents = G.activeEvents.filter(e => e.urgency === 'critical' || e.urgency === 'high').length;

  const items = [
    { icon:'🚛', label:'Fleet Overview', action:'showFleetOverview()', color:'var(--primary)', badge:activeTrucks },
    { icon:'📦', label:'Мои грузы', action:'closeGameMenu();switchTab("loadboard")', color:'var(--success)', badge:G.bookedLoads.filter(l=>!l.truckId).length||null },
    { icon:'📊', label:'HOS & Compliance', action:'showComplianceDashboard()', color:'var(--warning)', badge:warnTrucks||null },
    { icon:'💰', label:'Финансы', action:'showFinancialDashboard()', color:'var(--success)', badge:null },
    { icon:'⚡', label:'События', action:'closeGameMenu();switchTab("email")', color:'var(--danger)', badge:critEvents||null },
    { icon:'📈', label:'Статистика', action:'showToast("Скоро!","info")', color:'var(--success)', badge:null },
    { icon:'⚙️', label:'Настройки', action:'showToast("Скоро!","info")', color:'var(--text-muted)', badge:null },
    { icon:'🚪', label:'Выйти из игры', action:'closeGameMenu();showScreen("menu")', color:'var(--danger)', badge:null },
  ];

  let html = `<div class="sm-header">
    <div class="sm-title">Меню</div>
    <button style="width:32px;height:32px;border-radius:16px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--text-muted)" onclick="closeGameMenu()">✕</button>
  </div>`;

  html += `<div class="sm-stats">
    <div class="sm-stat-row"><span class="sm-stat-label">⏰ Время:</span><span class="sm-stat-val">${formatTime(G.gameMinute)}</span></div>
    <div class="sm-stat-row"><span class="sm-stat-label">💰 Баланс:</span><span class="sm-stat-val" style="color:var(--success)">$${G.balance.toLocaleString()}</span></div>
    <div class="sm-stat-row"><span class="sm-stat-label">⭐ Репутация:</span><span class="sm-stat-val" style="color:${G.reputation>70?'var(--success)':G.reputation>40?'var(--warning)':'var(--danger)'}">${G.reputation}%</span></div>
    <div class="sm-stat-row"><span class="sm-stat-label">🚛 Траки:</span><span class="sm-stat-val">${activeTrucks}/${G.trucks.length}</span></div>
    <div class="sm-stat-row"><span class="sm-stat-label">📦 Грузы:</span><span class="sm-stat-val">${totalLoads}</span></div>
  </div>`;

  items.forEach(item => {
    html += `<div class="sm-menu-item" onclick="closeGameMenu();${item.action}">
      <div class="sm-item-left">
        <span class="sm-item-icon">${item.icon}</span>
        <span class="sm-item-label">${item.label}</span>
        ${item.badge ? `<span class="sm-badge" style="background:${item.color}">${item.badge}</span>` : ''}
      </div>
      <span style="font-size:24px;font-weight:300;color:${item.color}">›</span>
    </div>`;
  });

  html += '<div style="padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;margin-top:12px"><span style="font-size:11px;color:var(--text-dim);font-weight:600">Dispatcher Training Game v2.6</span></div>';

  document.getElementById('side-menu-panel').innerHTML = html;
  document.getElementById('game-side-menu').classList.add('open');
}

function closeGameMenu() {
  document.getElementById('game-side-menu').classList.remove('open');
}
