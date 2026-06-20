/* =============================================
   TERMINAL.JS — Live Dispatcher Terminal
   Имитация рабочего экрана диспетчера
============================================= */
'use strict';

(function initTerminal() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const LOADS = [
    { id:'LD-28471', from:'Chicago, IL',    to:'Atlanta, GA',    rate:3200, miles:716,  type:'Dry Van', broker:'Echo Global', status:'BOOKED' },
    { id:'LD-28472', from:'Dallas, TX',     to:'Miami, FL',      rate:2800, miles:1311, type:'Reefer',  broker:'TQL',         status:'IN TRANSIT' },
    { id:'LD-28473', from:'Los Angeles, CA',to:'Denver, CO',     rate:2100, miles:1016, type:'Flatbed', broker:'Coyote',      status:'AVAILABLE' },
    { id:'LD-28474', from:'Seattle, WA',    to:'Chicago, IL',    rate:3900, miles:2064, type:'Dry Van', broker:'XPO',         status:'AVAILABLE' },
    { id:'LD-28475', from:'New York, NY',   to:'Houston, TX',    rate:3600, miles:1629, type:'Reefer',  broker:'C.H.Robinson',status:'BOOKED' },
    { id:'LD-28476', from:'Phoenix, AZ',    to:'Kansas City, MO',rate:1900, miles:1438, type:'Dry Van', broker:'Echo Global', status:'AVAILABLE' },
    { id:'LD-28477', from:'Minneapolis, MN',to:'Dallas, TX',     rate:2400, miles:946,  type:'Flatbed', broker:'Uber Freight',status:'IN TRANSIT' },
  ];

  const EVENTS = [
    () => `> connect broker-api --exchange DAT_Loadboard`,
    () => `  Connected to DAT LoadBoard API v3.2 ✓`,
    () => `> search loads --origin "Chicago, IL" --radius 150mi`,
    () => `  Scanning 847 available loads...`,
    () => `  Found ${Math.floor(Math.random()*40+12)} loads matching criteria`,
    () => ``,
    () => `> get load ${LOADS[Math.floor(Math.random()*LOADS.length)].id}`,
    (l=LOADS[Math.floor(Math.random()*LOADS.length)]) =>
      `  [${l.id}] ${l.from} → ${l.to}`,
    (l=LOADS[Math.floor(Math.random()*LOADS.length)]) =>
      `  Rate: $${l.rate.toLocaleString()} | ${l.miles} mi | ${l.type}`,
    (l=LOADS[Math.floor(Math.random()*LOADS.length)]) =>
      `  Broker: ${l.broker} | MC#${Math.floor(Math.random()*900000+100000)}`,
    () => ``,
    () => `> check broker --mc ${Math.floor(Math.random()*900000+100000)}`,
    () => `  Credit Score: ${Math.floor(Math.random()*20+80)}/100 ✓`,
    () => `  Days to Pay: Net ${[7,14,21][Math.floor(Math.random()*3)]} days`,
    () => `  Status: VERIFIED ✓`,
    () => ``,
    () => `> book load LD-${Math.floor(Math.random()*9000+1000)}`,
    () => `  Sending Rate Confirmation...`,
    () => `  Rate Con received via email ✓`,
    () => `  Driver notified via SMS ✓`,
    () => ``,
    () => `> truck status --fleet all`,
    () => `  TRUCK-01: Chicago, IL → Atlanta, GA  [IN TRANSIT] ETA: 14h`,
    () => `  TRUCK-02: Dallas, TX   [EMPTY] Ready for dispatch`,
    () => `  TRUCK-03: Los Angeles  → Denver [LOADED] ETA: 8h`,
    () => ``,
    () => `> hos check --driver DRV-${Math.floor(Math.random()*999+100)}`,
    () => `  Available Hours: ${Math.floor(Math.random()*8+3)}h ${Math.floor(Math.random()*59)}min`,
    () => `  Next 34hr Reset: ${Math.floor(Math.random()*18+6)} hours`,
    () => ``,
    () => `> market rates --lane "CHI-ATL"`,
    () => `  Current avg: $${(Math.random()*0.5+2.8).toFixed(2)}/mi`,
    () => `  7-day trend: ↑ +4.2%`,
    () => `  Recommended rate: $${Math.floor(Math.random()*400+2800).toLocaleString()}`,
    () => ``,
  ];

  const MAX_LINES = 22;
  let lines = [];
  let eventIndex = 0;

  function getColor(text) {
    if (text.startsWith('>')) return 'term-cmd';
    if (text.includes('✓'))  return 'term-success';
    if (text.includes('↑'))  return 'term-success';
    if (text.includes('↓'))  return 'term-warn';
    if (text.includes('[IN TRANSIT]')) return 'term-cyan';
    if (text.includes('ERROR'))       return 'term-error';
    if (text.includes('VERIFIED'))    return 'term-success';
    if (text.trim() === '')           return '';
    return 'term-output';
  }

  function renderLines() {
    body.innerHTML = '';
    lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'term-line';
      if (i === lines.length - 1 && line.startsWith('>')) {
        div.innerHTML = `<span class="term-prompt">$</span><span class="${getColor(line)}">${line.slice(1)}</span>`;
      } else {
        const cls = getColor(line);
        div.innerHTML = cls
          ? `<span class="${cls}">${line}</span>`
          : `<span style="opacity:0">&nbsp;</span>`;
      }
      body.appendChild(div);
    });

    // Cursor on last line
    const cursor = document.createElement('div');
    cursor.className = 'term-line';
    cursor.innerHTML = `<span class="term-prompt">$</span><span class="term-cursor"></span>`;
    body.appendChild(cursor);
    body.scrollTop = body.scrollHeight;
  }

  function addLine(text) {
    lines.push(text);
    if (lines.length > MAX_LINES) lines.shift();
    renderLines();
  }

  function nextEvent() {
    const fn = EVENTS[eventIndex % EVENTS.length];
    const text = fn();
    eventIndex++;

    if (text === undefined) {
      nextEvent();
      return;
    }

    // Type line character by character if it starts with >
    if (text.startsWith('>')) {
      addLine('> ');
      let charIdx = 2;
      const typeChar = () => {
        if (charIdx <= text.length) {
          lines[lines.length - 1] = text.slice(0, charIdx);
          charIdx++;
          renderLines();
          setTimeout(typeChar, 40 + Math.random() * 30);
        } else {
          setTimeout(nextEvent, 600 + Math.random() * 800);
        }
      };
      setTimeout(typeChar, 100);
    } else {
      addLine(text);
      const delay = text === '' ? 200 : 150 + Math.random() * 200;
      setTimeout(nextEvent, delay);
    }
  }

  // Start after short delay
  setTimeout(nextEvent, 800);
})();

/* ---- LIVE BOARD TABLE ---- */
(function initBoard() {
  const tbody = document.getElementById('boardTbody');
  if (!tbody) return;

  const loads = [
    { id:'LD-28471', from:'Chicago, IL',     to:'Atlanta, GA',     miles:716,  rate:3200, type:'Dry Van', broker:'Echo',    status:'available', delta:'+2.1%' },
    { id:'LD-28472', from:'Dallas, TX',       to:'Miami, FL',       miles:1311, rate:2800, type:'Reefer',  broker:'TQL',     status:'transit',   delta:'-0.8%' },
    { id:'LD-28473', from:'Los Angeles, CA',  to:'Denver, CO',      miles:1016, rate:2100, type:'Flatbed', broker:'Coyote',  status:'available', delta:'+4.5%' },
    { id:'LD-28474', from:'Seattle, WA',      to:'Chicago, IL',     miles:2064, rate:3900, type:'Dry Van', broker:'XPO',     status:'available', delta:'+1.2%' },
    { id:'LD-28475', from:'New York, NY',     to:'Houston, TX',     miles:1629, rate:3600, type:'Reefer',  broker:'CHR',     status:'booked',    delta:'+3.8%' },
    { id:'LD-28476', from:'Phoenix, AZ',      to:'Kansas City, MO', miles:1438, rate:1900, type:'Dry Van', broker:'Echo',    status:'available', delta:'-1.2%' },
    { id:'LD-28477', from:'Minneapolis, MN',  to:'Dallas, TX',      miles:946,  rate:2400, type:'Flatbed', broker:'Uber',    status:'transit',   delta:'+0.5%' },
  ];

  function statusBadge(s) {
    if (s === 'available') return `<span class="board-status status-avail">● Available</span>`;
    if (s === 'booked')    return `<span class="board-status status-booked">● Booked</span>`;
    return                        `<span class="board-status status-transit">● Transit</span>`;
  }

  function render() {
    tbody.innerHTML = '';
    loads.forEach(l => {
      const up = l.delta.startsWith('+');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="board-route">${l.from} → ${l.to}</span></td>
        <td>${l.miles.toLocaleString()} mi</td>
        <td>${l.type}</td>
        <td><span class="board-rate ${up ? '' : 'down'}">$${l.rate.toLocaleString()}</span></td>
        <td><span class="${up ? 'board-arrow-up' : 'board-arrow-down'}">${up ? '↑' : '↓'} ${l.delta}</span></td>
        <td>${statusBadge(l.status)}</td>
        <td>${l.broker}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  render();

  // Simulate live updates
  setInterval(() => {
    const idx = Math.floor(Math.random() * loads.length);
    const change = (Math.random() - 0.5) * 200;
    loads[idx].rate = Math.max(800, Math.round(loads[idx].rate + change));
    loads[idx].delta = (change >= 0 ? '+' : '') + (change / loads[idx].rate * 100).toFixed(1) + '%';

    const statuses = ['available', 'booked', 'transit'];
    if (Math.random() > 0.7) {
      loads[idx].status = statuses[Math.floor(Math.random() * 3)];
    }

    render();
    // Flash the updated row
    const rows = tbody.querySelectorAll('tr');
    if (rows[idx]) {
      rows[idx].style.animation = 'none';
      requestAnimationFrame(() => {
        rows[idx].style.animation = 'rowFlash 0.6s ease';
      });
    }
  }, 2500);
})();
