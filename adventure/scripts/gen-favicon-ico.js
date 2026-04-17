#!/usr/bin/env node
// Конвертирует favicon.png → favicon.ico (16x16 + 32x32 embedded)
// Использует только встроенные модули Node.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Рисуем пиксели для заданного размера ────────────────────────────────────
function renderFavicon(W, H) {
  const pixels = new Uint8Array(W * H * 4);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = (y * W + x) * 4;
    pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
  }

  // Фон #0a0f1e
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      setPixel(x, y, 10, 15, 30);

  // Скруглённые углы
  const R = Math.max(2, Math.floor(W * 0.15));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let inside = true;
      if (x < R && y < R) inside = (x-R)*(x-R)+(y-R)*(y-R) <= R*R;
      else if (x >= W-R && y < R) inside = (x-(W-R-1))*(x-(W-R-1))+(y-R)*(y-R) <= R*R;
      else if (x < R && y >= H-R) inside = (x-R)*(x-R)+(y-(H-R-1))*(y-(H-R-1)) <= R*R;
      else if (x >= W-R && y >= H-R) inside = (x-(W-R-1))*(x-(W-R-1))+(y-(H-R-1))*(y-(H-R-1)) <= R*R;
      if (!inside) { const i=(y*W+x)*4; pixels[i+3]=0; }
    }
  }

  // Синяя полоска сверху
  const barH = Math.max(2, Math.floor(H * 0.12));
  for (let y = 0; y < barH; y++)
    for (let x = R; x < W-R; x++)
      setPixel(x, y, 6, 182, 212);

  // Пиксельные буквы D4Y
  // Масштабируем под размер
  const scale = Math.max(1, Math.floor(W / 16));
  
  // 3x5 мини-шрифт (для 16px) или 5x7 (для 32px)
  const FONT3 = {
    'D': ['110','101','101','101','110'],
    '4': ['101','101','111','001','001'],
    'Y': ['101','101','010','010','010'],
  };
  const FONT5 = {
    'D': ['1110 ','1001 ','1001 ','1001 ','1001 ','1001 ','1110 '],
    '4': ['1001 ','1001 ','1001 ','11111','0001 ','0001 ','0001 '],
    'Y': ['1001 ','1001 ','0110 ','0110 ','0110 ','0110 ','0110 '],
  };

  const font = W <= 16 ? FONT3 : FONT5;
  const charW = W <= 16 ? 3 : 5;
  const charH = W <= 16 ? 5 : 7;
  const gap = W <= 16 ? 1 : 2;
  const totalW = 3 * charW + 2 * gap;
  const startX = Math.floor((W - totalW) / 2);
  const startY = Math.floor((H - charH) / 2) + (W <= 16 ? 2 : 3);

  function drawChar(char, ox, oy, r, g, b) {
    const rows = font[char];
    if (!rows) return;
    for (let row = 0; row < rows.length; row++)
      for (let col = 0; col < rows[row].length; col++)
        if (rows[row][col] === '1')
          setPixel(ox + col, oy + row, r, g, b);
  }

  drawChar('D', startX,                  startY, 255, 255, 255);
  drawChar('4', startX + charW + gap,    startY, 6, 182, 212);
  drawChar('Y', startX + 2*(charW+gap),  startY, 255, 255, 255);

  return pixels;
}

// ── PNG encoder ──────────────────────────────────────────────────────────────
function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c>>>1) : c>>>1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc>>>8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function u32BE(n) { return Buffer.from([(n>>>24)&0xFF,(n>>>16)&0xFF,(n>>>8)&0xFF,n&0xFF]); }
function chunk(type, data) {
  const t = Buffer.from(type,'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return Buffer.concat([u32BE(d.length), t, d, u32BE(crc32(Buffer.concat([t,d])))]);
}

function makePNG(W, H, pixels) {
  const ihdr = Buffer.concat([u32BE(W), u32BE(H), Buffer.from([8,6,0,0,0])]);
  const raw = [];
  for (let y = 0; y < H; y++) {
    raw.push(0);
    for (let x = 0; x < W; x++) {
      const i = (y*W+x)*4;
      raw.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(raw));
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── ICO format ───────────────────────────────────────────────────────────────
// ICO = header + directory entries + image data
// Используем PNG-в-ICO (современный формат, поддерживается всеми браузерами)

const sizes = [16, 32];
const pngs = sizes.map(s => makePNG(s, s, renderFavicon(s, s)));

// ICO header: 6 bytes
const icoHeader = Buffer.from([
  0, 0,       // reserved
  1, 0,       // type: 1 = ICO
  sizes.length, 0, // count
]);

// Directory entries: 16 bytes each
const dataOffset = 6 + sizes.length * 16;
let offset = dataOffset;
const dirEntries = pngs.map((png, i) => {
  const s = sizes[i];
  const entry = Buffer.alloc(16);
  entry[0] = s === 256 ? 0 : s;  // width
  entry[1] = s === 256 ? 0 : s;  // height
  entry[2] = 0;   // color count
  entry[3] = 0;   // reserved
  entry.writeUInt16LE(1, 4);     // planes
  entry.writeUInt16LE(32, 6);    // bit count
  entry.writeUInt32LE(png.length, 8);  // size
  entry.writeUInt32LE(offset, 12);     // offset
  offset += png.length;
  return entry;
});

const ico = Buffer.concat([icoHeader, ...dirEntries, ...pngs]);

// Записываем в dist/ и assets/
const distPath = path.join(__dirname, '../dist/favicon.ico');
const assetsPath = path.join(__dirname, '../assets/favicon.ico');

// dist может не существовать локально — пишем только если есть
if (fs.existsSync(path.join(__dirname, '../dist'))) {
  fs.writeFileSync(distPath, ico);
  console.log(`✅ dist/favicon.ico written (${ico.length} bytes)`);
}

// Также обновляем PNG для Expo
const pngPath = path.join(__dirname, '../assets/favicon.png');
fs.writeFileSync(pngPath, pngs[1]); // 32x32
console.log(`✅ assets/favicon.png updated (32x32)`);

// Сохраняем ICO рядом с PNG на случай если Expo его подхватит
fs.writeFileSync(path.join(__dirname, '../assets/favicon.ico'), ico);
console.log(`✅ assets/favicon.ico written`);
