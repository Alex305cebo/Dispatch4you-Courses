<?php
// Расшифровка PDF со стандартной защитой (Standard security handler) и ПУСТЫМ
// паролем на открытие. Именно так подписывают рейт-коны Sertifi/DocuSign и
// большинство TMS: файл открывается в любой читалке, но помечен как «защищённый»,
// и smalot/pdfparser отказывается его разбирать («Secured pdf file...»).
//
// Приём: RC4 — потоковый шифр, длина шифротекста равна длине открытого текста,
// поэтому потоки расшифровываются ПРЯМО НА МЕСТЕ, смещения xref не едут. Дальше
// имя ключа /Encrypt в трейлере переименовывается в /Xncrypt (та же длина!) —
// парсер больше не видит защиты и читает обычный PDF.
//
// ponytail: расшифровываем только потоки (в них весь текст), строки не трогаем —
// иначе пришлось бы возиться с экранированием, а на извлечение текста это не влияет.
// Апгрейд, если понадобятся метаданные: расшифровка строк с перекодировкой.
// AES (V4/V5, DocuSign) пока не поддержан — вызывающий код покажет это отдельным
// сообщением; апгрейд: openssl_decrypt('aes-128-cbc') + правка /Length потоков.

const PDF_PAD = "\x28\xBF\x4E\x5E\x4E\x75\x8A\x41\x64\x00\x4E\x56\xFF\xFA\x01\x08"
              . "\x2E\x2E\x00\xB6\xD0\x68\x3E\x80\x2F\x0C\xA9\xFE\x64\x53\x69\x7A";

/**
 * @return array{0:string,1:string} [байты PDF, код проблемы|''] — при неудаче
 *         возвращаются исходные байты и код: 'aes' | 'password' | 'unsupported'.
 */
function pdf_decrypt($bytes) {
  if (strpos($bytes, '/Encrypt') === false) return array($bytes, '');

  // Ссылка на словарь шифрования: /Encrypt 117 0 R
  if (!preg_match('/\/Encrypt\s+(\d+)\s+(\d+)\s+R/', $bytes, $m)) return array($bytes, 'unsupported');
  $encNum = (int)$m[1];

  // Сам словарь
  if (!preg_match('/(?<![0-9])' . $encNum . '\s+\d+\s+obj(.{0,2000}?)endobj/s', $bytes, $om)) {
    return array($bytes, 'unsupported');
  }
  $dict = $om[1];

  if (!preg_match('/\/Filter\s*\/Standard/', $dict)) return array($bytes, 'unsupported');
  $V = pdf_dict_int($dict, 'V', 0);
  $R = pdf_dict_int($dict, 'R', 0);
  $P = pdf_dict_int($dict, 'P', -1);
  $len = pdf_dict_int($dict, 'Length', 40);
  if ($V >= 4) return array($bytes, 'aes'); // AESV2/V3 — отдельная история
  if ($V < 1 || $R < 2 || $R > 4) return array($bytes, 'unsupported');

  $O = pdf_dict_string($dict, 'O');
  $U = pdf_dict_string($dict, 'U');
  if ($O === null || $U === null) return array($bytes, 'unsupported');

  // /ID первого поколения из трейлера
  $id = '';
  if (preg_match('/\/ID\s*\[\s*<([0-9A-Fa-f\s]+)>/', $bytes, $im)) {
    $id = hex2bin(preg_replace('/\s+/', '', $im[1]));
  } elseif (preg_match('/\/ID\s*\[\s*\((.*?)\)/s', $bytes, $im)) {
    $id = pdf_unescape($im[1]);
  }

  $n = max(5, min(16, (int)($len / 8)));
  $key = pdf_file_key($O, $P, $id, $R, $n, $dict);

  // Пустой пароль подошёл? Проверяем по /U (алгоритмы 4 и 5 из спецификации).
  if (!pdf_check_user_password($key, $U, $id, $R, $n)) return array($bytes, 'password');

  // Расшифровываем потоки на месте
  $out = $bytes;
  $offset = 0;
  while (preg_match('/(\d+)\s+(\d+)\s+obj/', $out, $mm, PREG_OFFSET_CAPTURE, $offset)) {
    $objStart = $mm[0][1];
    $num = (int)$mm[1][0];
    $gen = (int)$mm[2][0];
    $offset = $objStart + strlen($mm[0][0]);

    $endObj = strpos($out, 'endobj', $offset);
    $body = $endObj === false ? substr($out, $offset) : substr($out, $offset, $endObj - $offset);

    // Словарь шифрования и xref-потоки не шифруются никогда
    if ($num === $encNum || preg_match('/\/Type\s*\/XRef/', $body)) {
      if ($endObj !== false) $offset = $endObj;
      continue;
    }
    if (!preg_match('/stream(\r\n|\n|\r)/', $body, $sm, PREG_OFFSET_CAPTURE)) {
      if ($endObj !== false) $offset = $endObj;
      continue;
    }
    $dataStart = $offset + $sm[0][1] + strlen($sm[0][0]);
    $dataEnd = strpos($out, 'endstream', $dataStart);
    if ($dataEnd === false) break;
    $raw = substr($out, $dataStart, $dataEnd - $dataStart);
    // хвостовой перевод строки перед endstream в шифрование не входит
    $tail = '';
    if (substr($raw, -2) === "\r\n")      { $tail = "\r\n"; $raw = substr($raw, 0, -2); }
    elseif (substr($raw, -1) === "\n" || substr($raw, -1) === "\r") { $tail = substr($raw, -1); $raw = substr($raw, 0, -1); }

    $plain = pdf_rc4(pdf_object_key($key, $num, $gen, $n), $raw);
    $out = substr($out, 0, $dataStart) . $plain . $tail . substr($out, $dataEnd);
    $offset = $dataEnd;
  }

  // Прячем /Encrypt от парсера, не меняя длину файла
  $out = preg_replace('/\/Encrypt(\s+\d+\s+\d+\s+R)/', '/Xncrypt$1', $out);
  return array($out, '');
}

function pdf_file_key($O, $P, $id, $R, $n, $dict) {
  $data = PDF_PAD . substr($O, 0, 32) . pack('V', $P & 0xFFFFFFFF) . $id;
  if ($R >= 4 && preg_match('/\/EncryptMetadata\s+false/', $dict)) $data .= "\xFF\xFF\xFF\xFF";
  $key = md5($data, true);
  if ($R >= 3) for ($i = 0; $i < 50; $i++) $key = md5(substr($key, 0, $n), true);
  return substr($key, 0, $n);
}

function pdf_object_key($key, $num, $gen, $n) {
  $ext = $key . substr(pack('V', $num), 0, 3) . substr(pack('V', $gen), 0, 2);
  return substr(md5($ext, true), 0, min($n + 5, 16));
}

function pdf_check_user_password($key, $U, $id, $R, $n) {
  if ($R === 2) return pdf_rc4($key, PDF_PAD) === substr($U, 0, 32);
  // R3/R4: MD5(PAD + ID), RC4 ключом, затем 19 раз ключом с XOR по счётчику
  $x = md5(PDF_PAD . $id, true);
  $x = pdf_rc4($key, $x);
  for ($i = 1; $i <= 19; $i++) {
    $k = '';
    for ($j = 0; $j < $n; $j++) $k .= chr(ord($key[$j]) ^ $i);
    $x = pdf_rc4($k, $x);
  }
  return $x === substr($U, 0, 16); // сравниваются только первые 16 байт
}

function pdf_rc4($key, $data) {
  $s = range(0, 255);
  $kl = strlen($key);
  for ($i = 0, $j = 0; $i < 256; $i++) {
    $j = ($j + $s[$i] + ord($key[$i % $kl])) & 0xFF;
    $t = $s[$i]; $s[$i] = $s[$j]; $s[$j] = $t;
  }
  $out = '';
  $len = strlen($data);
  for ($k = 0, $i = 0, $j = 0; $k < $len; $k++) {
    $i = ($i + 1) & 0xFF;
    $j = ($j + $s[$i]) & 0xFF;
    $t = $s[$i]; $s[$i] = $s[$j]; $s[$j] = $t;
    $out .= chr(ord($data[$k]) ^ $s[($s[$i] + $s[$j]) & 0xFF]);
  }
  return $out;
}

function pdf_dict_int($dict, $name, $default) {
  return preg_match('/\/' . $name . '\s+(-?\d+)/', $dict, $m) ? (int)$m[1] : $default;
}

// /O и /U — строки: либо <hex>, либо (литерал с экранированием)
function pdf_dict_string($dict, $name) {
  if (preg_match('/\/' . $name . '\s*<([0-9A-Fa-f\s]+)>/', $dict, $m)) {
    return hex2bin(preg_replace('/\s+/', '', $m[1]));
  }
  $pos = 0;
  while (preg_match('/\/' . $name . '\s*\(/', $dict, $m, PREG_OFFSET_CAPTURE, $pos)) {
    $start = $m[0][1] + strlen($m[0][0]);
    $depth = 1; $s = '';
    for ($i = $start; $i < strlen($dict); $i++) {
      $c = $dict[$i];
      if ($c === '\\') { $s .= $c . (isset($dict[$i + 1]) ? $dict[$i + 1] : ''); $i++; continue; }
      if ($c === '(') $depth++;
      if ($c === ')') { $depth--; if ($depth === 0) return pdf_unescape($s); }
      $s .= $c;
    }
    $pos = $start;
  }
  return null;
}

function pdf_unescape($s) {
  $out = ''; $len = strlen($s);
  for ($i = 0; $i < $len; $i++) {
    if ($s[$i] !== '\\') { $out .= $s[$i]; continue; }
    $c = isset($s[$i + 1]) ? $s[++$i] : '';
    switch ($c) {
      case 'n': $out .= "\n"; break;
      case 'r': $out .= "\r"; break;
      case 't': $out .= "\t"; break;
      case 'b': $out .= "\x08"; break;
      case 'f': $out .= "\x0C"; break;
      case "\n": break;
      case "\r": if (isset($s[$i + 1]) && $s[$i + 1] === "\n") $i++; break;
      default:
        if ($c >= '0' && $c <= '7') {
          $oct = $c;
          while (strlen($oct) < 3 && isset($s[$i + 1]) && $s[$i + 1] >= '0' && $s[$i + 1] <= '7') $oct .= $s[++$i];
          $out .= chr(octdec($oct));
        } else $out .= $c;
    }
  }
  return $out;
}
