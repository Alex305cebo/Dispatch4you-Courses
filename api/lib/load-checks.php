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
    if (in_array(strtoupper($w), array('THE', 'OF', 'AND', 'A'), true)) continue;
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
  $miles = (float)preg_replace('/[^0-9.]/', '', (string)(isset($d['miles']) ? $d['miles'] : ''));
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
