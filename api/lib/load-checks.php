<?php
// Чистые помощники поверх уже разобранного груза: не мошенничество ли это,
// успевает ли водитель по часам и как разложить длинный текст по сообщениям
// Telegram. Ни одна функция тут никуда не ходит и ничего не печатает —
// на входе разбор (и, для антифрода, запись FMCSA), на выходе структурные метки.
// Текст собирается отдельно, чтобы кнопка перевода перерисовывала сообщение,
// не запрашивая FMCSA заново — так же, как это уже устроено у missingFields().
//
// Отдельный файл, а не кусок tg-actions.php: тот опирается на функции из
// telegram-bot.php и в одиночку не подключается, а этот — подключается и
// проверяется тестом (api/lib/test-load-checks.php).

// ── Длинный текст → сообщения Telegram ──────────────────────────────
//
// У Telegram жёсткий предел 4096 символов на сообщение. Карточку водителю
// раньше просто обрезали на 4000 — и на рейт-коне в 5-6 страниц с несколькими
// погрузками и выгрузками последние стопы вместе со ставкой и весом ИСЧЕЗАЛИ
// из текста, который диспетчер копирует и отправляет водителю. Ни в чате, ни в
// логе следа: сообщение выглядело законченным.
//
// На вход — ГОТОВЫЕ блоки (шапка, каждый стоп целиком, итоговые строки), а не
// текст: внутри блока стопа пустые строки тоже есть, и резать по ним значит
// разлучить адрес с его временем и реф-номерами. Блок не делится никогда —
// кроме случая, когда он один длиннее лимита.
function packBlocks(array $blocks, $limit = 3800) {
  $out = array(); $cur = '';
  foreach ($blocks as $block) {
    $block = (string)$block;
    if ($block === '') continue;
    // Блок длиннее лимита — документ ненормальный, но слишком длинное сообщение
    // Telegram не примет вообще, поэтому такой блок режем по символам.
    while (mb_strlen($block) > $limit) {
      if ($cur !== '') { $out[] = $cur; $cur = ''; }
      $out[] = mb_substr($block, 0, $limit);
      $block = mb_substr($block, $limit);
    }
    if ($cur === '') { $cur = $block; continue; }
    if (mb_strlen($cur) + 2 + mb_strlen($block) > $limit) { $out[] = $cur; $cur = $block; }
    else $cur .= "\n\n" . $block;
  }
  if ($cur !== '') $out[] = $cur;
  return $out;
}

/**
 * Разбор неполон настолько, что карточка водителю бессмысленна: нет погрузки,
 * нет доставки или у стопа нет адреса. По этому признаку решается, стоит ли
 * тратить запрос vision-модели на повторное чтение PDF картинкой — остальные
 * пропуски (ставка, вес, реф-номера) картинкой обычно не добираются, а квота
 * тратится.
 */
function rcIncomplete(array $missing) {
  foreach ($missing as $m) {
    if (in_array($m['field'], array('nopickup', 'nodelivery', 'address', 'citystate'), true)) return true;
  }
  return false;
}

// ── Число из строки ─────────────────────────────────────────────────
//
// Единственная точка разбора чисел во всём боте. Раньше в восьми местах стоял
// один и тот же приём: выкинуть из строки всё, кроме цифр и точек. На строке с
// ОДНИМ числом он работает, а биржа печатает два сразу — «$4,045 ($2.22/mi)».
// Приём склеивал их в 40452.22, и рыночная ставка выходила $22.20 за милю:
// невозможная цифра, из-за которой бот советовал торговаться там, где ставка
// на самом деле выше рынка.
//
// Берём ПЕРВОЕ число строки. Для обеих форм записи биржи это верно: из
// «$4,045 ($2.22/mi)» получаем сумму рейса, из «$2.22/mi» — цену за милю,
// а различает их вызывающий код по величине.
function numOf($v) {
  if (!preg_match('/\d[\d,]*(?:\.\d+)?/', (string)$v, $m)) return null;
  $n = str_replace(',', '', $m[0]);
  return $n === '' ? null : (float)$n;
}

// ── Числа в карточке ────────────────────────────────────────────────
//
// Модель отдаёт то, что видит: «7450.0», «$7450», «42851.0 lbs». Карточку
// читают как документ — водитель и брокер, — и «Ставка: $7450.0» выглядит как
// опечатка в цене рейса.
//
// Хвост после числа сохраняем ОБЯЗАТЕЛЬНО: «$52.00 per ton» без слов
// превращается в ставку $52 за рейс, а на этом уже обжигались.
function formatMoney($s) {
  $s = trim((string)$s);
  if ($s === '') return $s;
  if (!preg_match('/^\$?\s*([\d,]+(?:\.\d+)?)\s*(.*)$/u', $s, $m)) return $s;
  $n = (float)str_replace(',', '', $m[1]);
  if ($n <= 0) return $s;
  $tail = trim($m[2]);
  return '$' . number_format($n, 2) . ($tail !== '' ? ' ' . $tail : '');
}

function formatWeight($s) {
  $s = trim((string)$s);
  if ($s === '') return $s;
  if (!preg_match('/^([\d,]+(?:\.\d+)?)\s*(.*)$/u', $s, $m)) return $s;
  $n = (float)str_replace(',', '', $m[1]);
  if ($n <= 0) return $s;
  // Дробные фунты в рейт-конах бывают («41870.50»), но в карточке они не нужны:
  // ни один водитель не взвешивает груз до половины фунта.
  $tail = trim($m[2]);
  return number_format($n, 0) . ($tail !== '' ? ' ' . $tail : '');
}

// ── Антифрод: сходится ли брокер в документе с тем, чей MC в нём напечатан ──
//
// Схема, на которой диспетчеры теряют рейс целиком: рейт-кон приходит от имени
// известного брокера, а MC в шапке — чужой, часто вообще перевозчика. Груз
// увозят, платить некому. Данные для проверки у нас уже есть: имя брокера из
// документа и запись FMCSA по его же MC. Остаётся сравнить.

// Служебные слова выкидываем: «ABC Logistics LLC» и «ABC Logistics, Inc.» —
// одна и та же контора, а посимвольно они разные.
function normCompanyName($s) {
  $s = strtoupper((string)$s);
  $s = preg_replace('/[^A-Z0-9 ]/', ' ', $s);
  $s = preg_replace('/\b(LLC|INC|INCORPORATED|CORP|CORPORATION|CO|LTD|LP|LLP|COMPANY|THE|OF|USA|US)\b/', ' ', $s);
  $s = preg_replace('/\b(LOGISTICS|LOGISTIC|TRANSPORT|TRANSPORTATION|TRANSPORTS|FREIGHT|TRUCKING|CARRIERS|CARRIER|GROUP|SERVICES|SERVICE|BROKERAGE|SHIPPING|EXPRESS)\b/', ' ', $s);
  return trim(preg_replace('/\s+/', ' ', $s));
}

// «TOTAL QUALITY LOGISTICS» → «TQL». Половина крупных брокеров печатает в
// документе аббревиатуру, а в FMCSA записана полным именем — без этой проверки
// каждый такой рейт-кон получал бы красный флаг на ровном месте.
function companyAcronym($s) {
  $s = preg_replace('/[^A-Za-z0-9 ]/', ' ', (string)$s);
  $out = '';
  foreach (preg_split('/\s+/', trim($s)) as $w) {
    if ($w === '') continue;
    // Юридическую форму в аббревиатуру не берём: «TOTAL QUALITY LOGISTICS LLC»
    // давала TQLL, документ говорит TQL — и сверка не сходилась, то есть
    // крупнейший брокер страны получал красный флаг double-brokering ни за что.
    if (in_array(strtoupper($w), array('THE', 'OF', 'AND', 'A',
        'LLC', 'INC', 'INCORPORATED', 'CORP', 'CORPORATION', 'CO', 'LTD', 'LP', 'LLP',
        'COMPANY', 'USA', 'US'), true)) continue;
    $out .= strtoupper(substr($w, 0, 1));
  }
  return $out;
}

/** Одна ли это компания. Сверяем и по полному имени, и по аббревиатуре. */
function sameCompany($docName, $fmcsaName) {
  $a = normCompanyName($docName);
  $b = normCompanyName($fmcsaName);
  if ($a === '' || $b === '') return true;               // сравнивать нечего — не обвиняем
  if (strpos($a, $b) !== false || strpos($b, $a) !== false) return true;
  $acr = companyAcronym($fmcsaName);
  $docFlat = str_replace(' ', '', $a);
  if ($acr !== '' && strlen($acr) >= 2 && ($docFlat === $acr || strpos($docFlat, $acr) !== false)) return true;
  $acr2 = companyAcronym($docName);
  $fmcsaFlat = str_replace(' ', '', $b);
  if ($acr2 !== '' && strlen($acr2) >= 2 && ($fmcsaFlat === $acr2 || strpos($fmcsaFlat, $acr2) !== false)) return true;
  // Опечатки и разный порядок слов — по проценту совпадения, а не по равенству.
  $pct = 0.0;
  similar_text($a, $b, $pct);
  return $pct >= 60;
}

/** Совпадает ли запись FMCSA с названием компании из документа (с учётом DBA). */
function recMatchesName($rec, $docName) {
  if (!is_array($rec) || $docName === '') return true;
  $legal = isset($rec['legalName']) ? (string)$rec['legalName'] : '';
  $dba   = isset($rec['dbaName']) ? (string)$rec['dbaName'] : '';
  if ($legal === '') return true;
  return sameCompany($docName, $legal) || ($dba !== '' && sameCompany($docName, $dba));
}

/**
 * Это перевозчик, а не брокер. Нужно, чтобы отличить кривое извлечение от
 * мошенничества: в шапке рейт-кона номер перевозчика стоит рядом с номером
 * брокера (документ адресован перевозчику), и модель регулярно берёт не тот.
 */
function recIsCarrierOnly($rec) {
  if (!is_array($rec)) return false;
  $isBroker = isset($rec['brokerAuthorityStatus']) && $rec['brokerAuthorityStatus'] === 'A';
  $isCarrier = (isset($rec['commonAuthorityStatus']) && $rec['commonAuthorityStatus'] === 'A')
            || (isset($rec['contractAuthorityStatus']) && $rec['contractAuthorityStatus'] === 'A');
  return !$isBroker && $isCarrier;
}

/**
 * MC собственной компании — из подписи, заданной через /carrier. Нужен, чтобы
 * никогда не выдавать диспетчеру отчёт о нём самом: свой номер он знает.
 */
function ownMcFromSignature($sig) {
  if (!preg_match('~\bMC\s*#?\s*[:\-]?\s*(\d{4,8})\b~i', (string)$sig, $m)) return '';
  return $m[1];
}

const FREE_EMAIL_DOMAINS = array('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'gmx.com', 'proton.me', 'protonmail.com',
  'yandex.ru', 'mail.ru', 'live.com', 'msn.com');

/**
 * Структурные метки для антифрода. $rec — запись FMCSA по MC из документа
 * (null, если её не запрашивали или не нашли).
 * @return array список array{code:string, ...}
 */
function brokerFraudFlags(array $d, $rec) {
  $flags = array();
  $docName = isset($d['broker']) ? trim((string)$d['broker']) : '';

  if (is_array($rec)) {
    $legal = isset($rec['legalName']) ? (string)$rec['legalName'] : '';
    $dba   = isset($rec['dbaName']) ? (string)$rec['dbaName'] : '';
    // Совпало хоть с одним из двух имён — вопросов нет: DBA как раз для того и есть.
    if ($docName !== '' && $legal !== '' && !sameCompany($docName, $legal)
        && ($dba === '' || !sameCompany($docName, $dba))) {
      $flags[] = array('code' => 'name_mismatch', 'doc' => $docName,
                       'fmcsa' => $legal . ($dba !== '' ? ' (DBA ' . $dba . ')' : ''));
    }
    if (isset($rec['allowedToOperate']) && $rec['allowedToOperate'] !== 'Y') {
      $flags[] = array('code' => 'not_allowed');
    }
    // Бонд — единственное, из чего брокеру платят, когда он не заплатил сам.
    if (isset($rec['brokerAuthorityStatus']) && $rec['brokerAuthorityStatus'] === 'A'
        && isset($rec['bondInsuranceOnFile'])
        && preg_replace('/\D/', '', (string)$rec['bondInsuranceOnFile']) === '') {
      $flags[] = array('code' => 'no_bond');
    }
  } elseif (!empty($d['mc'])) {
    $flags[] = array('code' => 'mc_notfound', 'mc' => (string)$d['mc']);
  }

  // Почта. Проверяем, даже когда записи FMCSA нет: это признак сам по себе.
  $email = isset($d['broker_email']) ? trim((string)$d['broker_email']) : '';
  if ($email === '' && !empty($d['email'])) $email = trim((string)$d['email']);
  if ($email !== '' && strpos($email, '@') !== false) {
    $domain = strtolower(trim(substr($email, strrpos($email, '@') + 1)));
    if (in_array($domain, FREE_EMAIL_DOMAINS, true)) {
      $flags[] = array('code' => 'free_email', 'email' => $email);
    } elseif ($docName !== '') {
      // Домен не похож на имя брокера — сам по себе не приговор (бывают
      // почтовые домены TMS), но вместе с остальным складывается в картину.
      $label = preg_replace('/[^a-z0-9]/', '', explode('.', $domain)[0]);
      $flat = strtolower(str_replace(' ', '', normCompanyName($docName)));
      $acr  = strtolower(companyAcronym($docName));
      if ($label !== '' && $flat !== '' && strpos($label, $flat) === false
          && strpos($flat, $label) === false && $label !== $acr && strpos($label, $acr) === false) {
        $flags[] = array('code' => 'domain_mismatch', 'domain' => $domain);
      }
    }
  }
  return $flags;
}

/** Метки → текст. Красное — не работать без выяснения, жёлтое — проверить. */
function fraudText(array $flags, $lang = 'ru') {
  if (!$flags) return '';
  $en = $lang === 'en';
  $L = array();
  foreach ($flags as $f) {
    switch ($f['code']) {
      case 'name_mismatch':
        $L[] = $en
          ? "🔴 The document says «{$f['doc']}», but that MC belongs to «{$f['fmcsa']}». "
            . "This is what double-brokering looks like — call the broker back on the number from FMCSA, not from this document."
          : "🔴 В документе «{$f['doc']}», а этот MC принадлежит «{$f['fmcsa']}». "
            . "Так выглядит double-brokering — перезвоните брокеру по номеру из FMCSA, а не из этого документа.";
        break;
      case 'not_allowed':
        $L[] = $en ? '🔴 FMCSA: this MC is NOT allowed to operate right now.'
                   : '🔴 FMCSA: этому MC сейчас НЕ разрешено работать.';
        break;
      case 'no_bond':
        $L[] = $en ? '🔴 No BMC-84 bond on file — nothing to claim against if they do not pay.'
                   : '🔴 Бонда BMC-84 нет — если не заплатят, взыскивать не с чего.';
        break;
      case 'mc_is_carrier':
        $L[] = $en
          ? "ℹ️ The MC printed in the document ({$f['mc']}) belongs to a MOTOR CARRIER, not to the broker — "
            . "on a rate confirmation the carrier's own number sits right next to the broker's. "
            . "I could not find the broker's own number, so nothing was checked. Ask the broker for their MC."
          : "ℹ️ MC из документа ({$f['mc']}) принадлежит ПЕРЕВОЗЧИКУ, а не брокеру — в рейт-коне номер "
            . "перевозчика стоит рядом с брокерским. Брокерского номера я не нашёл, поэтому проверка не "
            . "проводилась. Спросите MC у брокера.";
        break;
      case 'mc_notfound':
        $L[] = $en ? "🔴 MC {$f['mc']} from the document is not in FMCSA at all."
                   : "🔴 MC {$f['mc']} из документа в FMCSA не найден вообще.";
        break;
      case 'free_email':
        $L[] = $en ? "⚠️ The broker writes from a free mailbox ({$f['email']}) instead of a company domain."
                   : "⚠️ Брокер пишет с бесплатной почты ({$f['email']}), а не с корпоративного домена.";
        break;
      case 'domain_mismatch':
        $L[] = $en ? "⚠️ The email domain ({$f['domain']}) does not match the broker's name — worth a look."
                   : "⚠️ Домен почты ({$f['domain']}) не совпадает с именем брокера — стоит присмотреться.";
        break;
    }
  }
  return ($en ? "🛡 BROKER CHECK\n\n" : "🛡 ПРОВЕРКА БРОКЕРА\n\n") . implode("\n\n", $L);
}

// ── Успевает ли водитель по часам ───────────────────────────────────
//
// Рейс, который физически не влезает в окна, выясняется обычно тогда, когда
// водитель уже опоздал: брокер снимает деньги, диспетчер разводит руками.
// Считается это заранее и одной арифметикой — никаких API.

/** «07/24/26 06:00 - 17:00» → [начало окна, конец окна] в unix. */
function parseWindow($s) {
  $s = trim((string)$s);
  if ($s === '') return null;
  if (!preg_match('~(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})~', $s, $dm)) return null;
  $year = (int)$dm[3];
  if ($year < 100) $year += 2000;
  $date = sprintf('%04d-%02d-%02d', $year, (int)$dm[1], (int)$dm[2]);
  preg_match_all('~(\d{1,2}):(\d{2})\s*(am|pm)?~i', $s, $tm, PREG_SET_ORDER);
  if (!$tm) {
    $t = strtotime($date . ' 00:00');
    return $t === false ? null : array('start' => $t, 'end' => $t + 86400);
  }
  $stamp = function ($m) use ($date) {
    $h = (int)$m[1]; $min = (int)$m[2];
    $ap = isset($m[3]) ? strtolower($m[3]) : '';
    if ($ap === 'pm' && $h < 12) $h += 12;
    if ($ap === 'am' && $h === 12) $h = 0;
    return strtotime(sprintf('%s %02d:%02d', $date, $h, $min));
  };
  $start = $stamp($tm[0]);
  $end   = $stamp($tm[count($tm) - 1]);
  if ($start === false || $end === false) return null;
  if ($end < $start) $end += 86400;   // окно через полночь
  return array('start' => $start, 'end' => $end);
}

/**
 * Влезает ли рейс в окна по правилам HOS для одного водителя.
 * Считаем по-доброму: выезд в самом начале окна погрузки, прибытие к самому
 * концу окна доставки, 55 миль/час — то есть если НЕ сходится даже так, то не
 * сойдётся никак.
 * @return array|null null, если считать не из чего (нет миль или дат)
 */
function hosFeasibility(array $d) {
  $miles = (float)numOf(isset($d['miles']) ? $d['miles'] : '');
  if ($miles <= 0) return null;

  $first = null; $last = null;
  foreach ((array)(isset($d['stops']) ? $d['stops'] : array()) as $s) {
    if (isset($s['type']) && $s['type'] === 'delivery') $last = $s;
    elseif ($first === null) $first = $s;
  }
  if (!$first || !$last) return null;
  $p = parseWindow(isset($first['time']) ? $first['time'] : '');
  $q = parseWindow(isset($last['time']) ? $last['time'] : '');
  if ($p === null || $q === null) return null;

  $avail = ($q['end'] - $p['start']) / 3600;
  if ($avail <= 0) return null;              // даты разобрались криво — молчим

  $drive = $miles / 55;                      // средняя по рейсу, с остановками
  $days  = (int)ceil($drive / 11);           // не больше 11 часов за руль в сутки
  // Между сменами 10 часов отдыха, плюс 2 часа на саму погрузку и выгрузку.
  $need  = $drive + max(0, $days - 1) * 10 + 2;
  return array('avail' => $avail, 'need' => $need, 'drive' => $drive,
               'days' => $days, 'miles' => $miles);
}

/** Текст показываем только когда есть о чём предупредить. */
function hosText($h, $lang = 'ru') {
  if (!is_array($h)) return '';
  $en = $lang === 'en';
  $tight = $h['need'] > $h['avail'] * 0.85;
  if (!$tight) return '';
  $hard = $h['need'] > $h['avail'];
  $nums = $en
    ? sprintf('%s mi ≈ %.0f h of driving, and the window from pickup to delivery is %.0f h.',
        number_format($h['miles']), $h['drive'], $h['avail'])
    : sprintf('%s миль ≈ %.0f ч за рулём, а окно от погрузки до доставки — %.0f ч.',
        number_format($h['miles']), $h['drive'], $h['avail']);
  if ($hard) {
    return ($en ? '🔴 HOURS: ' : '🔴 ПО ЧАСАМ: ') . $nums . ' '
      . ($en ? 'A solo driver cannot make this legally — needs a team, or move the window before you book.'
             : 'Один водитель легально не успевает — нужен team или сдвиг окна, и договариваться об этом до того, как возьмёте груз.');
  }
  return ($en ? '🟡 HOURS: ' : '🟡 ПО ЧАСАМ: ') . $nums . ' '
    . ($en ? 'It fits, but with no slack — one delay at the dock and the delivery is late.'
           : 'Успевает, но впритык — одна задержка на складе, и доставка опаздывает.');
}

// ── Адрес: только то, по чему водитель доедет ───────────────────────
//
// Брокеры печатают в адресе склада ориентиры и пояснения: «SOUTH OF BATTLE
// MOUNTAIN», «ACROSS FROM THE GRAIN ELEVATOR», «C/O RECEIVING». Модель честно
// копирует их как строки адреса — она и должна копировать всё, — но в карточке
// водителю такая строка стоит первой и выглядит как улица. Хуже того, в ссылку
// на приложение улицей уходила именно она.
//
// Оставляем строку, если в ней есть цифра (номер дома, HC 61 BOX 165, док),
// если это «CITY ST ZIP» или если в ней есть слово-указатель улицы. Всё
// остальное — пояснение, ему в адресе не место.
function isCityStateZip($line) {
  return (bool)preg_match('/\b[A-Z]{2}\b[ ,]+\d{5}/', strtoupper((string)$line));
}

function looksLikeStreet($line) {
  $u = strtoupper((string)$line);
  if (preg_match('/\d/', $u)) return true;
  return (bool)preg_match('/\b(STREET|ST|AVENUE|AVE|ROAD|RD|DRIVE|DR|LANE|LN|BOULEVARD|BLVD|HIGHWAY|HWY|PARKWAY|PKWY|COURT|CT|CIRCLE|CIR|PLACE|PL|TERRACE|TER|WAY|TRAIL|TRL|SUITE|STE|UNIT|BOX|PO BOX|RR|HC)\b/', $u);
}

/**
 * Чистим строки адреса. Осторожно: если после чистки не осталось строки с
 * городом, которая БЫЛА до неё, значит правило ошиблось на этом документе —
 * возвращаем исходное. Потерять адрес хуже, чем оставить в нём лишнюю строку.
 */
function cleanAddressLines($lines) {
  $lines = (array)$lines;
  $keep = array();
  foreach ($lines as $l) {
    $s = trim((string)$l);
    if ($s === '') continue;
    if (isCityStateZip($s) || looksLikeStreet($s)) $keep[] = $s;
  }
  if (!$keep) return $lines;
  $hadCity = false;
  foreach ($lines as $l) if (isCityStateZip($l)) { $hadCity = true; break; }
  if ($hadCity) {
    $keepsCity = false;
    foreach ($keep as $l) if (isCityStateZip($l)) { $keepsCity = true; break; }
    if (!$keepsCity) return $lines;
  }
  return $keep;
}

// ── Ставка похожа на цену за единицу, а не за рейс ──────────────────
// Сено, зерно и наливные грузы брокеры считают за тонну, изредка за милю. В
// документе печатается «$52.00», модель копирует верно — и в карточке водителя
// стоит ставка $52 за рейс через полтора штата. Не исправляем молча (умножать
// на вес наугад нельзя), но предупреждаем.
function rateSanityText(array $d, $lang = 'ru') {
  $raw = trim((string)(isset($d['rate']) ? $d['rate'] : ''));
  if ($raw === '') return '';
  $r = (float)numOf($raw);
  if ($r <= 0) return '';
  $en = $lang === 'en';
  $perTon = (bool)preg_match('/\bper\s*(ton|cwt|hundredweight)\b/i', $raw);

  // Сказано «за тонну» и есть вес — считаем, сколько это за рейс. Не подменяем
  // ставку молча: показываем обе цифры и оговорку, что окончательная сумма
  // выйдет по scale ticket, как и написано в самом рейт-коне.
  if ($perTon) {
    $lbs = (float)numOf(isset($d['weight']) ? $d['weight'] : '');
    if ($lbs > 1000) {
      $tons = $lbs / 2000;
      $total = $r * $tons;
      return $en
        ? sprintf("⚠️ The rate is PER TON: %s. At %s lbs (%.1f tons) that is about $%s for the trip — "
          . "the final amount comes from the scale tickets.", $raw, number_format($lbs), $tons, number_format($total, 2))
        : sprintf("⚠️ Ставка указана ЗА ТОННУ: %s. При %s lbs (%.1f т) это примерно $%s за рейс — "
          . "окончательная сумма выйдет по scale ticket.", $raw, number_format($lbs), $tons, number_format($total, 2));
    }
    return $en
      ? "⚠️ The rate is PER TON (" . $raw . "), not the total for the trip. Without a weight I cannot work out the trip total."
      : "⚠️ Ставка указана ЗА ТОННУ (" . $raw . "), а не за рейс. Без веса итог по рейсу не посчитать.";
  }

  // Единицы не написаны, но сумма для рейса неправдоподобно мала — предупреждаем.
  if ($r >= 300) return '';
  return $en
    ? "⚠️ Rate " . $raw . " looks like a per-unit price (per ton or per mile), not the total for the trip. "
      . "Check the rate confirmation for the total — that is the number the driver should see."
    : "⚠️ Ставка " . $raw . " похожа на цену за единицу (за тонну или за милю), а не за рейс. "
      . "Проверьте в рейт-коне итоговую сумму — водителю нужна именно она.";
}

// Вес и мили модель регулярно меняет местами: в рейт-конах подписи столбцов
// и значения печатаются на разных строках. Разводим их арифметикой — это
// надёжнее любых уговоров в промпте.
// ponytail: порог 3000 (пробег редко больше, вес редко меньше). Если пойдут
// сборные LTL-грузы легче 3000 lbs — брать вес из подписи, а не из величины.
function normalizeLoad(array $d) {
  // Через эту функцию проходит КАЖДЫЙ разбор рейт-кона — и из PDF, и с фото,
  // поэтому чистка кириллицы стоит тут: одно место вместо четырёх вызовов.
  $d = enForce($d);

  // Ориентиры и пояснения из адреса убираем: первой строкой у водителя должна
  // стоять улица, а не «SOUTH OF BATTLE MOUNTAIN». Заодно чинится ссылка в
  // приложение — туда улицей уходила та же лишняя строка.
  if (!empty($d['stops']) && is_array($d['stops'])) {
    foreach ($d['stops'] as $i => $s) {
      if (isset($s['address_lines'])) $d['stops'][$i]['address_lines'] = cleanAddressLines($s['address_lines']);
    }
  }
  $num = function ($v) { return numOf($v); };
  $w = $num(isset($d['weight']) ? $d['weight'] : '');
  $m = $num(isset($d['miles']) ? $d['miles'] : '');

  if ($w !== null && $m !== null && $m > $w) {           // явно перепутаны местами
    $t = $d['weight']; $d['weight'] = $d['miles']; $d['miles'] = $t;
    $t = $w; $w = $m; $m = $t;
  } elseif ($w === null && $m !== null && $m >= 3000) {  // вес уехал в мили
    $d['weight'] = $d['miles']; $d['miles'] = ''; $w = $m; $m = null;
  } elseif ($m === null && $w !== null && $w < 3000) {   // мили уехали в вес
    $d['miles'] = $d['weight']; $d['weight'] = ''; $m = $w; $w = null;
  }

  // «41438» → «41438 lbs»: в карточке единицы должны быть всегда
  if ($w !== null && !preg_match('/[a-zA-Zа-яА-Я]/u', (string)$d['weight'])) {
    $d['weight'] = trim($d['weight']) . ' lbs';
  }
  // «7450.0» → «$7,450.00», «42851.0 lbs» → «42,851 lbs». Модель отдаёт числа
  // как попало, а водитель и брокер читают карточку как документ: «Ставка
  // $7450.0» выглядит как опечатка в цене рейса.
  if (!empty($d['rate']))   $d['rate']   = formatMoney($d['rate']);
  if (!empty($d['weight'])) $d['weight'] = formatWeight($d['weight']);
  return $d;
}

// Список того, чего в разборе не хватает — по-человечески, с указанием стопа.
// Возвращает структурные метки (не текст), чтобы список можно было отрисовать
// на любом языке позже, без повторного разбора документа — см. missingFieldsText().
function missingFields(array $d) {
  $miss = array();
  if (empty($d['load_id']))   $miss[] = array('field' => 'load_id');
  if (empty($d['rate']))      $miss[] = array('field' => 'rate');
  if (empty($d['weight']))    $miss[] = array('field' => 'weight');
  if (empty($d['commodity'])) $miss[] = array('field' => 'commodity');
  // Про MC жалуемся, только если брокера не удалось опознать вообще: когда его
  // нашли в FMCSA по названию, номер у нас есть — просто не из документа.
  if (empty($d['mc']) && empty($d['dot'])) $miss[] = array('field' => 'mc');
  // Целиком пропавший стоп раньше не считался пропажей: в сводке просто
  // появлялось «Маршрут: ? → …», а карта в приложении не строилась вообще,
  // и понять, что бот не дочитал документ, было невозможно.
  $kinds = array();
  foreach ((array)(isset($d['stops']) ? $d['stops'] : array()) as $s) {
    $kinds[(isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup'] = true;
  }
  if (empty($kinds['pickup']))   $miss[] = array('field' => 'nopickup');
  if (empty($kinds['delivery'])) $miss[] = array('field' => 'nodelivery');

  $hasDocRefs = !empty(array_filter((array)(isset($d['refs']) ? $d['refs'] : array())));
  $i = 0;
  foreach ((array)(isset($d['stops']) ? $d['stops'] : array()) as $s) {
    $i++;
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    if (empty($s['name']) && empty($s['address_lines'])) {
      $miss[] = array('field' => 'address', 'type' => $type, 'n' => $i);
    } elseif (!preg_match('/\b[A-Z]{2}\b[ ,]+\d{5}/', implode(' ', (array)(isset($s['address_lines']) ? $s['address_lines'] : array())))) {
      // без «CITY ST ZIP» водителю адрес бесполезен — предупреждаем явно
      $miss[] = array('field' => 'citystate', 'type' => $type, 'n' => $i);
    }
    if (empty($s['time'])) $miss[] = array('field' => 'time', 'type' => $type, 'n' => $i);
    // Про пустые реф-номера стопа молчим, если номера напечатаны для груза в
    // целом: они и есть то, что спросят у водителя. Иначе бот жаловался на
    // «отсутствие» номеров, которые в карточке прямо над этим и стоят.
    if (empty($s['refs']) && !$hasDocRefs) $miss[] = array('field' => 'refs', 'type' => $type, 'n' => $i);
  }
  return $miss;
}

// Превращает структурные метки missingFields() в читаемый список на нужном языке.
function missingFieldsText(array $miss, $lang = 'ru') {
  $labels = $lang === 'en'
    ? array('load_id' => 'load number', 'rate' => 'rate', 'weight' => 'weight', 'commodity' => 'commodity',
            'address' => 'address', 'citystate' => 'city and zip', 'time' => 'time', 'refs' => 'reference numbers',
            'mc' => "broker's MC — the app cannot run the FMCSA check without it",
            'nopickup' => 'the PICKUP stop — no map without it',
            'nodelivery' => 'the DELIVERY stop — no map without it')
    : array('load_id' => 'номер загрузки', 'rate' => 'ставка', 'weight' => 'вес', 'commodity' => 'груз',
            'address' => 'адрес', 'citystate' => 'город и индекс', 'time' => 'время', 'refs' => 'реф-номера',
            'mc' => 'MC брокера — без него приложение не проверит его по FMCSA',
            'nopickup' => 'ПОГРУЗКА — без неё не построится карта',
            'nodelivery' => 'ДОСТАВКА — без неё не построится карта');
  $stopWord = $lang === 'en'
    ? array('pickup' => 'pickup', 'delivery' => 'delivery')
    : array('pickup' => 'погрузка', 'delivery' => 'доставка');
  $out = array();
  foreach ($miss as $m) {
    $label = isset($labels[$m['field']]) ? $labels[$m['field']] : $m['field'];
    $out[] = isset($m['type']) ? $label . ' (' . $stopWord[$m['type']] . ' #' . $m['n'] . ')' : $label;
  }
  return $out;
}

// ────────────────────────────────────────────────────────────────────
// $lang меняет только подписи полей (LOAD ID, Pick up Address, Time, Ref...) —
// сами данные (адреса, суммы, номера) не переводятся, это факты, а не текст.
// ⚠️ Карточка по умолчанию — для американского водителя, который читает по-английски;
// русская версия существует по прямому запросу и отправлять её водителю не стоит.
// Блоки: шапка с номером загрузки, каждый стоп ОДНИМ блоком, итоговые строки.
// Именно блоками, а не готовой строкой: из них собирается и целая карточка, и
// разложенная по сообщениям (driverCardParts ниже) — так стоп не разрывается.
function driverCardBlocks(array $d, $lang = 'en') {
  $t = $lang === 'ru'
    ? array('load' => 'НОМЕР ЗАГРУЗКИ', 'pickup' => 'Адрес погрузки', 'delivery' => 'Адрес доставки',
            'time' => 'Время', 'ref' => 'Реф', 'rate' => 'Ставка', 'commodity' => 'Груз', 'weight' => 'Вес')
    : array('load' => 'LOAD ID', 'pickup' => 'Pick up Address', 'delivery' => 'Delivery Address',
            'time' => 'Time', 'ref' => 'Ref', 'rate' => 'Rate', 'commodity' => 'Commodity', 'weight' => 'Weight');
  $hr = '__________________________';
  $blocks = array();
  // В шапке — ТОЛЬКО номер загрузки. Реф-номера в утверждённом формате
  // драйвер-инфо стоят внутри блока стопа, после времени: водителя спрашивают
  // о них на конкретном складе, там он их и ищет глазами. Номера груза в
  // целом (Shipment ID, PO#, BOL) подставляются ниже — в тот стоп, у которого
  // своих номеров нет.
  if (!empty($d['load_id'])) $blocks[] = '* ' . $t['load'] . ': #' . ltrim($d['load_id'], '#');
  $docRefs = array_values(array_filter((array)(isset($d['refs']) ? $d['refs'] : array())));

  $stops = (array)(isset($d['stops']) ? $d['stops'] : array());
  $counts = array('pickup' => 0, 'delivery' => 0);
  foreach ($stops as $s) {
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    $counts[$type]++;
  }
  $seen = array('pickup' => 0, 'delivery' => 0);
  foreach ($stops as $s) {
    $type = (isset($s['type']) && $s['type'] === 'delivery') ? 'delivery' : 'pickup';
    $seen[$type]++;
    $label = ($type === 'delivery') ? $t['delivery'] : $t['pickup'];
    if ($counts[$type] > 1) $label .= ' ' . $seen[$type];
    $L = array($label . ':', '');
    // Пустая строка после названия склада — иначе оно визуально слипается
    // с адресом на следующей строке.
    if (!empty($s['name'])) { $L[] = $s['name']; $L[] = ''; }
    foreach ((array)(isset($s['address_lines']) ? $s['address_lines'] : array()) as $a) if ($a !== '') $L[] = $a;
    $L[] = '';
    if (!empty($s['time'])) { $L[] = $hr; $L[] = $t['time'] . ': ' . $s['time']; }
    // Свои номера стопа, а если их нет — номера груза в целом: они относятся
    // ко всему рейсу, и на въезде спросят именно их.
    $refs = array_filter((array)(isset($s['refs']) ? $s['refs'] : array()));
    if (!$refs) $refs = $docRefs;
    if ($refs) {
      $L[] = $hr;
      $first = true;
      foreach ($refs as $r) { $L[] = ($first ? $t['ref'] . ': ' : '') . $r; $first = false; }
    }
    $L[] = $hr;
    $blocks[] = implode("\n", $L);
  }
  $tail = array();
  if (!empty($d['rate']))      $tail[] = $t['rate'] . ': ' . $d['rate'];
  if (!empty($d['commodity'])) $tail[] = $t['commodity'] . ': ' . $d['commodity'];
  if (!empty($d['weight']))    $tail[] = $t['weight'] . ': ' . $d['weight'];
  if ($tail) $blocks[] = implode("\n", $tail);
  return $blocks;
}

// Карточка водителю, разложенная по сообщениям под лимит Telegram (4096
// символов). Раньше она просто обрезалась на 4000 — и на рейт-коне в 5-6
// страниц последние стопы вместе со ставкой и весом ИСЧЕЗАЛИ из текста,
// который диспетчер копирует и отправляет водителю. Ни в чате, ни в логе следа
// не оставалось: сообщение выглядело законченным.
// Упаковка — packBlocks() в lib/load-checks.php: она чистая и проверяется
// тестом, а потерять здесь стоп дороже всего.
function driverCardParts(array $d, $lang = 'en', $limit = 3800) {
  return packBlocks(driverCardBlocks($d, $lang), $limit);
}
