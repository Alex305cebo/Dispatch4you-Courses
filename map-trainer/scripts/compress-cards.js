import sharp from 'sharp';
import { readdirSync } from 'fs';
import { join } from 'path';

const INPUT_DIR = './public/level-cards';
const OUTPUT_DIR = './public/level-cards';
const MAX_WIDTH = 600;
const QUALITY = 80;

const files = readdirSync(INPUT_DIR).filter(f => f.endsWith('.png'));

for (const file of files) {
  const input = join(INPUT_DIR, file);
  const output = join(OUTPUT_DIR, file.replace('.png', '.webp'));
  
  const info = await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);
  
  console.log(`${file} → ${file.replace('.png', '.webp')} (${Math.round(info.size / 1024)} KB)`);
}

console.log('\nDone! You can now delete the .png files.');
