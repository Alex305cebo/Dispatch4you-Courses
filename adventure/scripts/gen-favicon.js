#!/usr/bin/env node
// Генерирует favicon.png 32x32 с текстом D4Y
// Использует только встроенные модули Node.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 32, H = 32;

// ── Рисуем пиксели ──────────────────────────────────────────────────────────
const pixels = new Uint8Array(W * H * 4); // RGBA

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 4;
  pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
}

// Фон #0a0f1e
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    setPixel(x, y, 10, 15, 30);

// Скруглённые углы (радиус 5) — делаем прозрачными
const R = 5;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let inside = true;
    if (x < R && y < R) inside = (x-R)*(x-R)+(y-R)*(y-R) <= R*R;
    else if (x >= W-R && y < R) inside = (x-(W-R-1))*(x-(W-R-1))+(y-R)*(y-R) <= R*R;
    else if (x < R && y >= H-R) inside = (x-R)*(x-R)+(y-(H-R-1))*(y-(H-R-1)) <= R*R;
    else if (x >= W-R && y >= H-R) inside = (x-(W-R-1))*(x-(W-R-1))+(y-(H-R-1))*(y-(H-R-1)) <= R*R;
    if (!inside) {
      const i = (y * W + x) * 4;
      pixels[i+3] = 0; // прозрачный
    }
  }
}

// Синяя полоска сверху (4px) #06b6d4 = 6,182,212
for (let y = 0; y < 4; y++)
  for (let x = 3; x < W-3; x++)
    setPixel(x, y, 6, 182, 212);

// ── Шрифт D4Y — пиксельные буквы 5x7 ────────────────────────────────────────
// Каждая буква — массив строк (7 строк по 5 символов)
const FONT = {
  'D': [
    '1110 ',
    '1001 ',
    '1001 ',
    '1001 ',
    '1001 ',
    '1001 ',
    '1110 ',
  ],
  '4': [
    '1001 ',
    '1001 ',
    '1001 ',
    '11111',
    '0001 ',
    '0001 ',
    '0001 ',
  ],
  'Y': [
    '1001 ',
    '1001 ',
    '0110 ',
    '0110 ',
    '0110 ',
    '0110 ',
    '0110 ',
  ],
};

function drawChar(char, startX, startY, r, g, b) {
  const rows = FONT[char];
  if (!rows) return;
  for (let row = 0; row < rows.length; row++) {
    for (let col = 0; col < rows[row].length; col++) {
      if (rows[row][col] === '1') {
        setPixel(startX + col, startY + row, r, g, b);
      }
    }
  }
}

// Позиции: D начинается с x=2, 4 с x=9, Y с x=16 — итого 3 буквы по 5px + 2px gap
// Центрируем: 3 буквы * 5px + 2 gap * 2px = 19px → start = (32-19)/2 = 6
const startY = 11; // вертикально по центру (с учётом полоски сверху)
drawChar('D', 3,  startY, 255, 255, 255);
drawChar('4', 10, startY, 6, 182, 212);  // циановая "4"
drawChar('Y', 17, startY, 255, 255, 255);

// ── PNG encoder ──────────────────────────────────────────────────────────────
function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function uint32BE(n) {
  return Buffer.from([(n>>>24)&0xFF,(n>>>16)&0xFF,(n>>>8)&0xFF,n&0xFF]);
}

function chunk(type, data) {
  const typeB = Buffer.from(type, 'ascii');
  const dataB = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const crcBuf = Buffer.concat([typeB, dataB]);
  return Buffer.concat([uint32BE(dataB.length), typeB, dataB, uint32BE(crc32(crcBuf))]);
}

// IHDR
const ihdr = Buffer.concat([
  uint32BE(W), uint32BE(H),
  Buffer.from([8, 6, 0, 0, 0]) // 8-bit RGBA
]);

// IDAT — raw image data with filter bytes
const raw = [];
for (let y = 0; y < H; y++) {
  raw.push(0); // filter type None
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    raw.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
  }
}
const compressed = zlib.deflateSync(Buffer.from(raw));

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0)),
]);

const outPath = path.join(__dirname, '../assets/favicon.png');
fs.writeFileSync(outPath, png);
console.log(`✅ favicon.png written (${png.length} bytes)`);
