function showTruckDetail(truck) {
  const color = getTruckColor(truck);
  const hos = Math.max(0, truck.hoursLeft);
  const hosColor = hos < 2 ? '#f87171' : hos < 4 ? '#fbbf24' : '#34d399';
  const pct = Math.round(truck.progress * 100);
  const canFind = truck.status === 'idle' || truck.status === 'at_delivery' || truck.status === 'at_pickup';
  const isMoving = truck.status === 'loaded' || truck.status === 'driving';
  const hoursWorked = Math.max(0, 11 - hos);
  const driveUsedPct = Math.min(100, (hoursWorked / 11) * 100);

  // Текущий груз
  const load = truck.currentLoad;
  const rpm = load ? (load.agreedRate / load.miles).toFixed(2) : null;
  const eta = load ? Math.round((1 - truck.progress) * load.miles / 55) : 0;
  const milesLeft = load ? Math.round((1 - truck.progress) * load.miles) : 0;

  // Метрики производительности
  const safety = truck.safetyScore || 95;
  const onTime = truck.onTimeRate || 97;
  const fuel = truck.fuelEfficiency || 6.8;
  const mood = truck.mood || 90;
  const totalMiles = truck.totalMiles || 0;
  const totalDeliveries = truck.totalDeliveries || 0;
  const hosViolations = truck.hosViolations || 0;
  const compliance = truck.complianceRate || 100;

  // Оценка водителя
  const driverScore = Math.round((safety * 0.3 + onTime * 0.3 + compliance * 0.2 + Math.min(100, mood) * 0.2));
  const driverGrade = driverScore >= 95 ? {g:'A+', c:'#4ade80'} : driverScore >= 90 ? {g:'A', c:'#34d399'} : driverScore >= 80 ? {g:'B', c:'#38bdf8'} : driverScore >= 70 ? {g:'C', c:'#fbbf24'} : {g:'D', c:'#f87171'};

  // Прогноз доходов
  const projectedRevenue = load ? load.agreedRate : 0;
  const projectedFuel = load ? Math.round(load.miles * 0.45) : 0;
  const projectedDriver = load ? Math.round(load.miles * 0.55) : 0;
  const projectedNet = projectedRevenue - projectedFuel - projectedDriver - Math.round(projectedRevenue * 0.11);

  // AI рекомендация
  function getAI() {
    if (hos < 2) return {icon:'😴', color:'#ef4444', title:'Требуется отдых!', text:`${truck.driver} почти исчерпал HOS (${hos.toFixed(1)}ч). После текущего рейса — обязательный 10-часовой отдых.`};
    if (truck.status === 'idle') {
      const w = truck.idleWarningLevel || 0;
      if (w >= 3) return {icon:'🚨', color:'#ef4444', title:'Критично — трак стоит!', text:`${truck.driver} простаивает более 5 часов в ${truck.currentCity}. Каждый час простоя = потеря ~$200. Срочно найди груз!`};
      if (w >= 1) return {icon:'⚠️', color:'#f97316', title:'Трак простаивает', text:`${truck.driver} ждёт груз в ${truck.currentCity}. Ищи загрузку — deadhead не более 150 миль.`};
      return {icon:'✅', color:'#4ade80', title:'Готов к следующему грузу', text:`${truck.driver} свободен в ${truck.currentCity}. HOS: ${hos.toFixed(0)}ч. Ищи груз $2.80+/mile.`};
    }
    if (truck.status === 'at_delivery') return {icon:'📦', color:'#fbbf24', title:'Разгружается — готовь следующий груз!', text:`Самое время найти следующий груз из ${truck.currentCity}. Не теряй время!`};
    if (truck.status === 'loaded' && pct > 70) return {icon:'🎯', color:'#06b6d4', title:'Скоро прибудет — ищи следующий груз!', text:`${truck.driver} проехал ${pct}% маршрута. ETA ~${eta}ч. Найди груз из ${load?.toCity || ''} заранее.`};
    if (truck.status === 'loaded') return {icon:'🚛', color:'#38bdf8', title:'В пути с грузом', text:`${truck.driver} везёт ${load?.commodity || 'груз'}. Прогресс: ${pct}%, осталось ~${milesLeft} миль.`};
    if (truck.status === 'breakdown') return {icon:'🔧', color:'#ef4444', title:'Поломка — требуется действие!', text:`Свяжись с техпомощью, уведоми брокера о задержке. Возможен TONU.`};
    return {icon:'🔵', color:'#38bdf8', title:'Едет к погрузке', text:`${truck.driver} едет к pickup. Убедись что Rate Con подписан.`};
  }
  const ai = getAI();

  // Статус-бар
  const STATUS_LABEL_MAP = {loaded:'Везёт груз',driving:'Едет к погрузке',at_delivery:'На разгрузке',at_pickup:'На погрузке',idle:'Свободен',breakdown:'Поломка',waiting:'Detention'};
  const STATUS_ICON_MAP = {loaded:'🚛',driving:'🚛',at_delivery:'🏁',at_pickup:'📦',idle:'✅',breakdown:'⚠️',waiting:'⏳'};

  // Мини-бар метрики
  function metricBar(val, max, color) {
    const pct = Math.min(100, Math.round(val / max * 100));
    return `<div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;margin-top:3px">
      <div style="height:100%;width:${pct}%;background:${color};border-radius:2px;transition:width 0.5s"></div>
    </div>`;
  }

  document.getElementById('modal-truck-title').innerHTML = `
    <span style="color:${color}">${truck.name}</span>
    <span style="font-size:11px;font-weight:600;color:${driverGrade.c};background:${driverGrade.c}18;border:1px solid ${driverGrade.c}44;padding:2px 8px;border-radius:6px;margin-left:8px">${driverGrade.g}</span>
  `;

  document.getElementById('modal-truck-body').innerHTML = `
    <!-- ШАПКА: водитель + статус -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div style="width:48px;height:48px;border-radius:24px;background:${color}22;border:2px solid ${color}55;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">👤</div>
      <div style="flex:1">
        <div style="font-size:16px;font-weight:900;color:#fff">${truck.driver}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${truck.name} · CDL-A · ${totalMiles.toLocaleString()} mi total</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:28px;font-weight:900;color:${driverGrade.c}">${driverGrade.g}</div>
        <div style="font-size:9px;color:var(--text-dim);font-weight:600">РЕЙТИНГ</div>
      </div>
    </div>

    <!-- СТАТУС -->
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:${color}12;border:1px solid ${color}33;margin-bottom:12px">
      <span style="font-size:20px">${STATUS_ICON_MAP[truck.status]||'🚛'}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:800;color:${color}">${STATUS_LABEL_MAP[truck.status]||truck.status}${truck.destinationCity?' → '+truck.destinationCity:''}</div>
        ${isMoving && load ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">${pct}% · ${milesLeft} mi осталось · ETA ~${eta}ч</div>` : `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">${truck.currentCity}</div>`}
      </div>
      ${hos < 3 ? `<div style="padding:4px 8px;border-radius:6px;background:#f8717122;border:1px solid #f8717144;font-size:10px;font-weight:700;color:#f87171">⚠️ ${hos.toFixed(1)}h HOS</div>` : ''}
    </div>

    <!-- AI РЕКОМЕНДАЦИЯ -->
    <div style="padding:10px 12px;border-radius:10px;background:${ai.color}10;border:1px solid ${ai.color}33;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="font-size:16px">${ai.icon}</span>
        <div>
          <div style="font-size:9px;color:var(--text-dim);font-weight:700">🤖 AI ДИСПЕТЧЕР</div>
          <div style="font-size:12px;font-weight:800;color:${ai.color}">${ai.title}</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--text-muted);line-height:1.5">${ai.text}</div>
    </div>

    <!-- HOS БЛОК -->
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">⏰ Hours of Service</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <span style="font-size:10px;color:var(--text-dim)">Drive</span>
            <span style="font-size:16px;font-weight:900;color:${hosColor}">${hos.toFixed(1)}h</span>
          </div>
          ${metricBar(hos, 11, hosColor)}
          <div style="font-size:9px;color:var(--text-dim);margin-top:2px">из 11h</div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <span style="font-size:10px;color:var(--text-dim)">Shift</span>
            <span style="font-size:16px;font-weight:900;color:#22c55e">${Math.max(0,14-hoursWorked-1).toFixed(0)}h</span>
          </div>
          ${metricBar(Math.max(0,14-hoursWorked-1), 14, '#22c55e')}
          <div style="font-size:9px;color:var(--text-dim);margin-top:2px">из 14h</div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <span style="font-size:10px;color:var(--text-dim)">Cycle</span>
            <span style="font-size:16px;font-weight:900;color:#94a3b8">52h</span>
          </div>
          ${metricBar(52, 70, '#94a3b8')}
          <div style="font-size:9px;color:var(--text-dim);margin-top:2px">из 70h</div>
        </div>
      </div>
      ${hos < 2 ? '<div style="font-size:11px;color:#f87171;font-weight:700;text-align:center;margin-top:8px;padding:6px;background:rgba(248,113,113,0.1);border-radius:6px">⚠️ Требуется 10-часовой отдых</div>' : ''}
    </div>

    <!-- МЕТРИКИ ПРОИЗВОДИТЕЛЬНОСТИ -->
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">📊 Производительность</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:8px;padding:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:10px;color:var(--text-dim)">⭐ Safety Score</span>
            <span style="font-size:14px;font-weight:900;color:${safety>=90?'#4ade80':safety>=75?'#fbbf24':'#f87171'}">${safety}</span>
          </div>
          ${metricBar(safety, 100, safety>=90?'#4ade80':safety>=75?'#fbbf24':'#f87171')}
        </div>
        <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.15);border-radius:8px;padding:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:10px;color:var(--text-dim)">🎯 On-Time Rate</span>
            <span style="font-size:14px;font-weight:900;color:${onTime>=95?'#4ade80':onTime>=85?'#fbbf24':'#f87171'}">${onTime}%</span>
          </div>
          ${metricBar(onTime, 100, onTime>=95?'#4ade80':onTime>=85?'#fbbf24':'#f87171')}
        </div>
        <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:8px;padding:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:10px;color:var(--text-dim)">⛽ Fuel Efficiency</span>
            <span style="font-size:14px;font-weight:900;color:${fuel>=7?'#4ade80':fuel>=6?'#fbbf24':'#f87171'}">${fuel} MPG</span>
          </div>
          ${metricBar(fuel, 10, fuel>=7?'#4ade80':fuel>=6?'#fbbf24':'#f87171')}
        </div>
        <div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.15);border-radius:8px;padding:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:10px;color:var(--text-dim)">😊 Driver Mood</span>
            <span style="font-size:14px;font-weight:900;color:${mood>=80?'#4ade80':mood>=60?'#fbbf24':'#f87171'}">${mood}%</span>
          </div>
          ${metricBar(mood, 100, mood>=80?'#4ade80':mood>=60?'#fbbf24':'#f87171')}
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06)">
        <div style="text-align:center">
          <div style="font-size:14px;font-weight:800;color:#38bdf8">${totalDeliveries}</div>
          <div style="font-size:9px;color:var(--text-dim)">Доставок</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:14px;font-weight:800;color:#94a3b8">${(totalMiles/1000).toFixed(0)}k</div>
          <div style="font-size:9px;color:var(--text-dim)">Миль</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:14px;font-weight:800;color:${hosViolations===0?'#4ade80':'#f87171'}">${hosViolations}</div>
          <div style="font-size:9px;color:var(--text-dim)">HOS нарушений</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:14px;font-weight:800;color:${compliance>=95?'#4ade80':'#fbbf24'}">${compliance}%</div>
          <div style="font-size:9px;color:var(--text-dim)">Compliance</div>
        </div>
      </div>
    </div>

    <!-- ТЕКУЩИЙ ГРУЗ + P&L ПРОГНОЗ -->
    ${load ? `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">📦 Текущий груз</div>
      <div style="font-size:16px;font-weight:900;color:#fff;margin-bottom:6px">${load.fromCity}, ${CITY_STATE[load.fromCity]||''} → ${load.toCity}, ${CITY_STATE[load.toCity]||''}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <span style="font-size:10px;padding:2px 8px;border-radius:5px;background:rgba(56,189,248,0.1);color:#38bdf8;font-weight:700">${load.miles} mi</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:5px;background:rgba(255,255,255,0.06);color:var(--text-muted)">${load.equipment}</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:5px;background:rgba(255,255,255,0.06);color:var(--text-muted)">${load.commodity}</span>
        <span style="font-size:10px;padding:2px 8px;border-radius:5px;background:rgba(52,211,153,0.1);color:#34d399;font-weight:700">$${rpm}/mi</span>
      </div>
      <!-- Прогресс -->
      <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#0ea5e9,${color});border-radius:3px;transition:width 0.5s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-dim);margin-bottom:10px">
        <span>${pct}% выполнено</span>
        <span>~${milesLeft} mi · ETA ${eta}ч</span>
      </div>
      <!-- P&L прогноз -->
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px">
        <div style="font-size:10px;font-weight:700;color:var(--text-dim);margin-bottom:6px">💰 P&L ПРОГНОЗ</div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
          <span style="color:var(--text-muted)">Ставка</span>
          <span style="color:#34d399;font-weight:700">+$${load.agreedRate.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">
          <span style="color:var(--text-muted)">Топливо + водитель</span>
          <span style="color:#f87171">-$${(projectedFuel+projectedDriver).toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px">
          <span style="color:var(--text-muted)">Dispatch + Factoring</span>
          <span style="color:#f87171">-$${Math.round(load.agreedRate*0.11).toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08)">
          <span style="color:var(--text)">NET PROFIT</span>
          <span style="color:${projectedNet>=0?'#34d399':'#f87171'}">${projectedNet>=0?'+':''}$${projectedNet.toLocaleString()}</span>
        </div>
      </div>
    </div>` : ''}

    <!-- ДЕЙСТВИЯ -->
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">⚡ Действия</div>
      ${canFind ? `
      <button onclick="closeModal('modal-truck-detail');findLoadForTruck('${truck.id}')" style="width:100%;display:flex;align-items:center;gap:10px;padding:12px;border-radius:10px;background:linear-gradient(135deg,rgba(52,211,153,0.15),rgba(16,185,129,0.08));border:1px solid rgba(52,211,153,0.3);cursor:pointer;margin-bottom:8px;transition:all 0.15s">
        <span style="font-size:20px">🔍</span>
        <div style="flex:1;text-align:left">
          <div style="font-size:13px;font-weight:800;color:#34d399">Найти груз</div>
          <div style="font-size:11px;color:var(--text-muted)">из ${truck.currentCity} · $2.80+/mile</div>
        </div>
        <span style="color:#34d399;font-size:16px">→</span>
      </button>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
        <button onclick="closeModal('modal-truck-detail');showDriverSMS('${truck.id}')" style="padding:8px;border-radius:8px;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:12px;font-weight:700;cursor:pointer">💬 SMS</button>
        <button onclick="closeModal('modal-truck-detail');showDriverCall('${truck.id}')" style="padding:8px;border-radius:8px;background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.25);color:#34d399;font-size:12px;font-weight:700;cursor:pointer">📞 Звонок</button>
        <button onclick="closeModal('modal-truck-detail');showHOSGraph('${truck.id}')" style="padding:8px;border-radius:8px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.25);color:#06b6d4;font-size:12px;font-weight:700;cursor:pointer">⏱ HOS Лог</button>
        <button onclick="closeModal('modal-truck-detail');zoomToTruck(G.trucks.find(t=>t.id==='${truck.id}'))" style="padding:8px;border-radius:8px;background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.25);color:#a78bfa;font-size:12px;font-weight:700;cursor:pointer">🗺️ На карте</button>
      </div>
      ${load ? `<button onclick="closeModal('modal-truck-detail');showCancelLoadModal(G.trucks.find(t=>t.id==='${truck.id}').currentLoad)" style="width:100%;padding:8px;border-radius:8px;background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:12px;font-weight:700;cursor:pointer">⚠️ Отменить груз (TONU)</button>` : ''}
    </div>
  `;
  openModal('modal-truck-detail');
}
