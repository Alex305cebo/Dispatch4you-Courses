import { GameEvent } from '../store/gameStore';

export const EVENTS: Record<string, GameEvent> = {
  pickup_chicago: {
    id: 'pickup_chicago', city: 'Chicago, IL',
    type: 'broker_call',
    speaker: { role: 'Брокер', name: 'Tom (FastFreight)', avatar: 'broker', emoji: '💼' },
    message: 'Load #FF-2847 готов к погрузке. Dry Van, 42,000 lbs, медицинское оборудование. Delivery в Houston завтра до 14:00. Rate: <b>$3,200</b>. Подтверждаешь?',
    tags: [{ text: '📦 42,000 lbs', color: 'blue' }, { text: '💰 $3,200', color: 'green' }, { text: '⏰ 14:00 завтра', color: 'yellow' }],
    question: 'Что отвечаешь брокеру?',
    options: [
      { key: 'A', text: 'Confirmed! Sending driver details. Rate Con to dispatch@company.com please.', correct: true },
      { key: 'B', text: 'Sure, no problem. Driver will be there.', correct: false },
      { key: 'C', text: 'Can you do $3,500? Market rate is higher.', correct: false },
      { key: 'D', text: 'Let me check and call you back in an hour.', correct: false },
    ],
    feedback: {
      correct: { title: 'Профессиональный ответ!', desc: 'Подтверждение + запрос Rate Con на email — это стандарт. Без Rate Con нет юридической защиты.' },
      wrong: { title: 'Не совсем', desc: 'Правильно: подтвердить и сразу запросить Rate Con на email. Это защищает тебя юридически.' },
    },
    xp: 15,
  },

  hos_stlouis: {
    id: 'hos_stlouis', city: 'St. Louis, MO',
    type: 'driver_call',
    speaker: { role: 'Водитель', name: 'Mike (Unit #47)', avatar: 'driver', emoji: '🚛' },
    message: 'Диспетчер, я на I-55 перед St. Louis. Всё нормально, но у меня осталось <b>4 часа HOS</b>. До Houston ещё 12 часов езды. Что делаем?',
    tags: [{ text: '⏱ 4ч HOS осталось', color: 'red' }, { text: '📍 St. Louis', color: 'blue' }, { text: '🛣️ 12ч до Houston', color: 'yellow' }],
    question: 'Как решаешь проблему с HOS?',
    options: [
      { key: 'A', text: 'Скажи Mike ехать без остановки — delivery важнее.', correct: false },
      { key: 'B', text: 'Mike, найди truck stop, отдыхай 10 часов. Я звоню брокеру — предупреждаю о задержке.', correct: true },
      { key: 'C', text: 'Найди другого водителя который возьмёт груз.', correct: false },
      { key: 'D', text: 'Скажи Mike ехать медленнее — так HOS считается меньше.', correct: false },
    ],
    feedback: {
      correct: { title: 'Правильно! Безопасность + коммуникация', desc: 'HOS нарушать нельзя — штраф до $16,000. Правильно: остановка + звонок брокеру заранее.' },
      wrong: { title: 'Опасное решение', desc: 'Нарушение HOS = штраф $1,000-16,000 + CSA points. Единственный вариант: остановка на 10ч + уведомление брокера.' },
    },
    xp: 20,
  },

  breakdown_memphis: {
    id: 'breakdown_memphis', city: 'Memphis, TN',
    type: 'crisis',
    speaker: { role: 'Водитель', name: 'Mike (Unit #47)', avatar: 'driver', emoji: '🚛' },
    message: 'Диспетчер! Трак встал на I-40 перед Memphis. Alternator сдох. Mechanic говорит ремонт <b>4-6 часов</b>. Груз медицинский, delivery через 6 часов!',
    tags: [{ text: '🚨 Поломка', color: 'red' }, { text: '⏰ 6ч до delivery', color: 'red' }, { text: '🔧 4-6ч ремонт', color: 'yellow' }],
    question: 'Первый шаг диспетчера?',
    options: [
      { key: 'A', text: 'Сразу звоню брокеру — объясняю ситуацию.', correct: false },
      { key: 'B', text: 'Жду пока Mike сам разберётся с ремонтом.', correct: false },
      { key: 'C', text: 'Убеждаюсь что Mike в безопасности → roadside assistance → звоню брокеру с Plan B.', correct: true },
      { key: 'D', text: 'Ищу другой трак для перегрузки — это приоритет.', correct: false },
    ],
    feedback: {
      correct: { title: 'Правильный порядок!', desc: 'Safety → Assistance → Client. Сначала безопасность водителя, потом roadside, потом брокер с готовым планом.' },
      wrong: { title: 'Порядок важен', desc: '1) Безопасность Mike 2) Roadside assistance 3) ETA ремонта 4) Брокер с Plan B.' },
    },
    xp: 25,
  },

  cargo_theft_dallas: {
    id: 'cargo_theft_dallas', city: 'Dallas, TX',
    type: 'crisis',
    speaker: { role: 'Водитель', name: 'Mike (Unit #47)', avatar: 'driver', emoji: '🚛' },
    message: 'Диспетчер, за мной едет чёрный Suburban без номеров уже <b>50 миль</b> по I-35. Груз медицинский, $180K. Что делать?',
    tags: [{ text: '🚨 Слежка 50 миль', color: 'red' }, { text: '💎 $180,000', color: 'yellow' }, { text: '📍 I-35 Texas', color: 'blue' }],
    question: 'Что говоришь Mike?',
    options: [
      { key: 'A', text: 'Останови трак и выйди проверить — может совпадение.', correct: false },
      { key: 'B', text: 'Не останавливайся. Едь к охраняемому truck stop. Я звоню в полицию.', correct: true },
      { key: 'C', text: 'Продолжай ехать, не обращай внимания.', correct: false },
      { key: 'D', text: 'Сверни на следующем съезде и посмотри едет ли за тобой.', correct: false },
    ],
    feedback: {
      correct: { title: '200-Mile Rule!', desc: 'Никогда не останавливаться при подозрении на слежку. Охраняемый truck stop + полиция — единственно верное решение.' },
      wrong: { title: 'Опасное решение', desc: 'Останавливаться при слежке = риск hijacking. Правило: не останавливаться, охраняемое место, полиция 911.' },
    },
    xp: 25,
  },

  detention_sanantonio: {
    id: 'detention_sanantonio', city: 'San Antonio, TX',
    type: 'broker_call',
    speaker: { role: 'Брокер', name: 'Sarah (QuickLoad)', avatar: 'broker', emoji: '💼' },
    message: 'Слушай, по detention — мы не можем заплатить. В rate confirmation не было прописано detention pay. Водитель ждал 4.5 часа, но это проблема shipper.',
    tags: [{ text: '💰 $337 detention', color: 'yellow' }, { text: '📄 Нет в Rate Con', color: 'red' }, { text: '⏱ 4.5ч ожидания', color: 'blue' }],
    question: 'Как отвечаешь Sarah?',
    options: [
      { key: 'A', text: 'Ладно, понимаю. Забудем про detention.', correct: false },
      { key: 'B', text: 'Sarah, detention — industry standard. У меня фото BOL с временем. Отправляю invoice $337.50 сегодня.', correct: true },
      { key: 'C', text: 'Ты мошенница! Я подам на вас в суд!', correct: false },
      { key: 'D', text: 'Если не заплатишь — больше не работаем.', correct: false },
    ],
    feedback: {
      correct: { title: 'Профессионально!', desc: 'Detention — industry standard $50-75/час после 2ч free time. Документация + спокойный тон = деньги в 80% случаев.' },
      wrong: { title: 'Потерял деньги', desc: 'Detention — твои деньги. Правильно: ссылаться на industry standard + показать документацию.' },
    },
    xp: 20,
  },

  pod_houston: {
    id: 'pod_houston', city: 'Houston, TX',
    type: 'driver_call',
    speaker: { role: 'Водитель', name: 'Mike (Unit #47)', avatar: 'driver', emoji: '🚛' },
    message: 'Диспетчер! Груз доставлен. Consignee подписал BOL. Но POD — подпись нечитаемая, нет printed name, нет даты. Receiver говорит "всё нормально, езжай".',
    tags: [{ text: '✅ Груз доставлен', color: 'green' }, { text: '⚠️ Плохой POD', color: 'red' }, { text: '💰 Invoice $3,200', color: 'yellow' }],
    question: 'Что делает Mike с POD?',
    options: [
      { key: 'A', text: 'Уезжает — receiver сказал всё нормально.', correct: false },
      { key: 'B', text: 'Просит receiver написать имя печатными буквами, поставить дату и время. Фотографирует POD. Только потом уезжает.', correct: true },
      { key: 'C', text: 'Сам пишет имя и дату на POD.', correct: false },
      { key: 'D', text: 'Звонит диспетчеру и ждёт инструкций 30 минут.', correct: false },
    ],
    feedback: {
      correct: { title: 'Идеальный POD!', desc: 'Без читаемого POD брокер может отказать в оплате $3,200. Нужно: подпись + printed name + дата + время + фото.' },
      wrong: { title: 'Риск потерять $3,200', desc: 'Нечитаемый POD = брокер может отказать в оплате. Всегда: printed name + дата + время + фото перед отъездом.' },
    },
    xp: 15,
  },

  pickup_la: {
    id: 'pickup_la', city: 'Los Angeles, CA',
    type: 'broker_call',
    speaker: { role: 'Брокер', name: 'Sarah (QuickLoad)', avatar: 'broker', emoji: '💼' },
    message: 'Load #QL-5521 готов в LA. Electronics, 38,000 lbs, Dry Van. Delivery Dallas в пятницу. Rate: <b>$4,100</b>. Подтверждаешь?',
    tags: [{ text: '📦 Electronics', color: 'blue' }, { text: '💰 $4,100', color: 'green' }, { text: '📍 LA → Dallas', color: 'yellow' }],
    question: 'Что проверяешь ПЕРВЫМ перед подтверждением?',
    options: [
      { key: 'A', text: 'Сразу подтверждаю — ставка хорошая.', correct: false },
      { key: 'B', text: 'Проверяю MC# брокера на FMCSA, потом подтверждаю и прошу Rate Con.', correct: true },
      { key: 'C', text: 'Торгуюсь за $4,500.', correct: false },
      { key: 'D', text: 'Спрашиваю есть ли другие грузы дешевле.', correct: false },
    ],
    feedback: {
      correct: { title: 'Правильно! Проверка брокера — обязательна', desc: 'Всегда проверяй MC# на FMCSA SAFER перед подтверждением. Мошенники существуют.' },
      wrong: { title: 'Риск мошенничества', desc: 'Без проверки MC# ты рискуешь работать с мошенником. FMCSA SAFER — бесплатная проверка за 30 секунд.' },
    },
    xp: 15,
  },

  tonu_phoenix: {
    id: 'tonu_phoenix', city: 'Phoenix, AZ',
    type: 'broker_call',
    speaker: { role: 'Брокер', name: 'Tom (FastFreight)', avatar: 'broker', emoji: '💼' },
    message: 'Sorry, shipper just cancelled the load. Your truck is already 150 miles into the trip. We don\'t have TONU in the rate confirmation.',
    tags: [{ text: '🚛 150 миль проехал', color: 'red' }, { text: '⛽ ~$80 топлива', color: 'yellow' }, { text: '📄 Нет TONU в Rate Con', color: 'blue' }],
    question: 'Что отвечаешь брокеру?',
    options: [
      { key: 'A', text: 'Понял, ничего не поделаешь. Разворачиваемся.', correct: false },
      { key: 'B', text: 'TONU — industry standard даже без Rate Con. Трак проехал 150 миль. Нужна компенсация $250.', correct: true },
      { key: 'C', text: 'Я подам на вас в суд за $10,000!', correct: false },
      { key: 'D', text: 'Дай мне другой груз сегодня — компенсируй потерянное время.', correct: false },
    ],
    feedback: {
      correct: { title: 'TONU — твоё право!', desc: 'TONU $200-300 — industry standard даже без прописанного в Rate Con. 80% брокеров согласятся.' },
      wrong: { title: 'Потерял деньги', desc: 'TONU — твоё право. Скажи спокойно: "Industry standard, $250, отправляю invoice." Это работает.' },
    },
    xp: 20,
  },

  hos_elpaso: {
    id: 'hos_elpaso', city: 'El Paso, TX',
    type: 'driver_call',
    speaker: { role: 'Водитель', name: 'Carlos (Unit #12)', avatar: 'driver', emoji: '🚛' },
    message: 'Диспетчер, я в El Paso. HOS в норме. Но на трассе сильный ветер, видимость плохая. Груз электроника $250K. Продолжать?',
    tags: [{ text: '🌪️ Сильный ветер', color: 'red' }, { text: '💎 $250,000', color: 'yellow' }, { text: '📍 El Paso', color: 'blue' }],
    question: 'Что говоришь Carlos?',
    options: [
      { key: 'A', text: 'Продолжай — deadline важнее.', correct: false },
      { key: 'B', text: 'Останови на ближайшем truck stop. Жди пока погода улучшится. Я звоню брокеру.', correct: true },
      { key: 'C', text: 'Езди медленнее — всё будет нормально.', correct: false },
      { key: 'D', text: 'Твоё решение — ты за рулём.', correct: false },
    ],
    feedback: {
      correct: { title: 'Безопасность прежде всего!', desc: 'Груз $250K + плохая погода = остановка. Брокер поймёт. Авария обойдётся дороже задержки.' },
      wrong: { title: 'Риск аварии', desc: 'Плохая погода + дорогой груз = обязательная остановка. Безопасность водителя и груза важнее дедлайна.' },
    },
    xp: 20,
  },

  delivery_dallas: {
    id: 'delivery_dallas', city: 'Dallas, TX',
    type: 'driver_call',
    speaker: { role: 'Водитель', name: 'Carlos (Unit #12)', avatar: 'driver', emoji: '🚛' },
    message: 'Диспетчер! Приехал на delivery в Dallas. Receiver говорит что в заказе 40 коробок, а у нас в BOL написано 38. Отказывается принимать груз.',
    tags: [{ text: '📦 Расхождение в BOL', color: 'red' }, { text: '🏭 Receiver отказывает', color: 'red' }, { text: '📄 BOL: 38 коробок', color: 'blue' }],
    question: 'Как решаешь ситуацию?',
    options: [
      { key: 'A', text: 'Уезжаем — это проблема shipper.', correct: false },
      { key: 'B', text: 'Звоню брокеру, объясняю ситуацию. Прошу связаться с shipper для подтверждения количества. Документирую всё.', correct: true },
      { key: 'C', text: 'Говорю Carlos дописать 2 коробки в BOL.', correct: false },
      { key: 'D', text: 'Соглашаюсь с receiver — пусть принимает 38.', correct: false },
    ],
    feedback: {
      correct: { title: 'Правильный процесс!', desc: 'Расхождение в BOL = звонок брокеру + документация. Никогда не исправляй BOL самостоятельно — это мошенничество.' },
      wrong: { title: 'Неправильно', desc: 'Расхождение в BOL решается через брокера и shipper. Документируй всё. Никогда не исправляй BOL.' },
    },
    xp: 20,
  },

  pickup_atlanta: {
    id: 'pickup_atlanta', city: 'Atlanta, GA',
    type: 'broker_call',
    speaker: { role: 'Брокер', name: 'Mike (EastFreight)', avatar: 'broker', emoji: '💼' },
    message: 'Load #EF-3301 готов в Atlanta. Reefer, продукты питания, 44,000 lbs. Delivery New York в среду. Rate: <b>$2,800</b>. Температура -4°C.',
    tags: [{ text: '❄️ Reefer -4°C', color: 'blue' }, { text: '💰 $2,800', color: 'green' }, { text: '🥩 Продукты', color: 'yellow' }],
    question: 'Что проверяешь перед отправкой водителя на погрузку?',
    options: [
      { key: 'A', text: 'Ничего — просто отправляю водителя.', correct: false },
      { key: 'B', text: 'Проверяю температуру reefer, наличие temperature log, и что водитель знает требования к температуре груза.', correct: true },
      { key: 'C', text: 'Проверяю только ставку в Rate Con.', correct: false },
      { key: 'D', text: 'Спрашиваю водителя умеет ли он работать с reefer.', correct: false },
    ],
    feedback: {
      correct: { title: 'Reefer требует особого внимания!', desc: 'Для reefer обязательно: температурный режим, temperature log каждые 2-4 часа, проверка рефрижератора перед погрузкой.' },
      wrong: { title: 'Риск потери груза', desc: 'Reefer груз требует: проверка температуры + temperature log + инструктаж водителя. Нарушение = потеря груза + claim.' },
    },
    xp: 15,
  },

  broker_dispute: {
    id: 'broker_dispute', city: 'Charlotte, NC',
    type: 'broker_call',
    speaker: { role: 'Брокер', name: 'Mike (EastFreight)', avatar: 'broker', emoji: '💼' },
    message: 'Слушай, я хочу снизить ставку с $2,800 до $2,400. Shipper говорит что рынок упал. Ты же понимаешь...',
    tags: [{ text: '💰 Хочет снизить на $400', color: 'red' }, { text: '📄 Rate Con подписан', color: 'green' }, { text: '🚛 Груз уже в пути', color: 'blue' }],
    question: 'Как отвечаешь брокеру?',
    options: [
      { key: 'A', text: 'Ладно, $2,400 — лишь бы не потерять клиента.', correct: false },
      { key: 'B', text: 'Mike, Rate Con подписан на $2,800. Это юридический документ. Я требую оплату по договору.', correct: true },
      { key: 'C', text: 'Хорошо, но тогда дай мне $3,200 на следующем грузе.', correct: false },
      { key: 'D', text: 'Разворачиваем трак — не везём за $2,400.', correct: false },
    ],
    feedback: {
      correct: { title: 'Rate Con — закон!', desc: 'Подписанный Rate Con — юридически обязывающий документ. Брокер не может менять ставку после подписания.' },
      wrong: { title: 'Потерял $400', desc: 'Rate Con защищает тебя. Никогда не соглашайся на снижение ставки после подписания документа.' },
    },
    xp: 25,
  },

  document_check: {
    id: 'document_check', city: 'Washington, DC',
    type: 'document',
    speaker: { role: 'Водитель', name: 'Alex (Unit #33)', avatar: 'driver', emoji: '🚛' },
    message: 'Диспетчер, меня остановили на weigh station. Инспектор просит показать: BOL, insurance certificate, и IFTA decal. BOL есть, insurance есть, но IFTA decal не могу найти.',
    tags: [{ text: '🚔 Weigh Station', color: 'red' }, { text: '📄 IFTA decal нет', color: 'red' }, { text: '📍 Washington DC', color: 'blue' }],
    question: 'Что делаешь?',
    options: [
      { key: 'A', text: 'Говорю Alex уехать — может не заметят.', correct: false },
      { key: 'B', text: 'Звоню в офис — ищу электронную копию IFTA decal. Если нет — Alex объясняет инспектору и платит штраф.', correct: true },
      { key: 'C', text: 'Говорю Alex сказать что decal в другом траке.', correct: false },
      { key: 'D', text: 'Это проблема водителя — пусть сам разбирается.', correct: false },
    ],
    feedback: {
      correct: { title: 'Правильный подход!', desc: 'IFTA decal обязателен. Штраф за отсутствие $100-500. Всегда имей электронные копии всех документов.' },
      wrong: { title: 'Нарушение закона', desc: 'Уехать от инспектора = серьёзное нарушение. Правильно: найти документ или честно объяснить ситуацию.' },
    },
    xp: 20,
  },

  delivery_ny: {
    id: 'delivery_ny', city: 'New York, NY',
    type: 'driver_call',
    speaker: { role: 'Водитель', name: 'Alex (Unit #33)', avatar: 'driver', emoji: '🚛' },
    message: 'Диспетчер! Доставил груз в New York. Всё отлично. POD подписан, имя печатными буквами, дата есть. Сфотографировал. Что дальше?',
    tags: [{ text: '✅ Доставлено', color: 'green' }, { text: '📄 POD идеальный', color: 'green' }, { text: '💰 Invoice $2,800', color: 'yellow' }],
    question: 'Следующий шаг диспетчера?',
    options: [
      { key: 'A', text: 'Жду пока брокер сам запросит документы.', correct: false },
      { key: 'B', text: 'В течение 24 часов отправляю брокеру: POD + Invoice. Начинаю искать следующий груз для Alex.', correct: true },
      { key: 'C', text: 'Отправляю invoice через неделю — не срочно.', correct: false },
      { key: 'D', text: 'Звоню брокеру и прошу оплатить сразу наличными.', correct: false },
    ],
    feedback: {
      correct: { title: 'Идеальный процесс!', desc: 'POD + Invoice в течение 24 часов = быстрая оплата. Параллельно ищи следующий груз — время = деньги.' },
      wrong: { title: 'Задержка оплаты', desc: 'Чем быстрее отправишь POD + Invoice, тем быстрее получишь деньги. Стандарт: в течение 24 часов после delivery.' },
    },
    xp: 15,
  },
};
