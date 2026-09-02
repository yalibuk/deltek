/**
 * public/og-image.jpg üretir (1200×630) — sosyal paylaşım önizleme görseli.
 *
 * Neden betik: OG görseli raster olmalı (Facebook/X/LinkedIn/WhatsApp SVG
 * render etmez), ama depoda ikili dosyayı elle güncellemek yerine marka
 * bilgisi değiştiğinde yeniden üretilebilir olması daha iyi.
 *
 * sharp'ı doğrudan yoldan çağırıyoruz: Astro'nun görsel servisinin bağımlılığı
 * olarak zaten kurulu ama package.json'da bizim bağımlılığımız değil ve
 * kendi export haritası CJS/ESM ayrımı yüzünden düz `import sharp` ile çözülmüyor.
 *
 *   node scripts/og-gorsel-uret.mjs
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('node_modules/sharp/dist/index.cjs'));

const G = 1200, Y = 630;
const MAVI = '#185ad6', SARI = '#ffd658', METIN = '#333333', MUTE = '#777777';
const SLOGAN = 'Yatay Sondaj, Boru Sürme ve Kazısız Geçiş Teknolojileri';
const ALAN = 'www.deltek.com.tr';

// Zemin saf beyaz değil, çok açık mavi (#eef3fd): kaynak logo PNG'sinde
// pişmiş açık mavimsi hale (ölçülen ~#e9eff7) beyaz üzerinde kutu gibi
// görünüyordu; bu tonda pratikte kayboluyor.
const zemin = `<svg xmlns="http://www.w3.org/2000/svg" width="${G}" height="${Y}">
  <defs>
    <linearGradient id="ust" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${MAVI}"/>
      <stop offset="1" stop-color="#0e3578"/>
    </linearGradient>
  </defs>
  <rect width="${G}" height="${Y}" fill="#eef3fd"/>
  <rect width="${G}" height="14" fill="url(#ust)"/>
  <rect y="${Y - 14}" width="${G}" height="14" fill="url(#ust)"/>

  <!-- hafif ızgara dokusu -->
  <g stroke="#dfe9fb" stroke-width="2">
    <path d="M0 210h${G}M0 420h${G}M400 14v${Y - 28}M800 14v${Y - 28}"/>
  </g>

  <!-- logonun altına gelen mavi+sarı vurgu çizgisi -->
  <rect x="${G / 2 - 60}" y="392" width="72" height="5" rx="2.5" fill="${MAVI}"/>
  <rect x="${G / 2 + 12}" y="392" width="48" height="5" rx="2.5" fill="${SARI}"/>

  <text x="${G / 2}" y="462" text-anchor="middle"
        font-family="Segoe UI, Tahoma, DejaVu Sans, Arial, sans-serif"
        font-size="34" font-weight="600" fill="${METIN}">${SLOGAN}</text>
  <text x="${G / 2}" y="520" text-anchor="middle"
        font-family="Segoe UI, Tahoma, DejaVu Sans, Arial, sans-serif"
        font-size="26" letter-spacing="3" fill="${MUTE}">${ALAN}</text>
</svg>`;

// Logoyu keskin tutmak için ölçeği abartmadan büyüt (200×46 → 500×115)
const logo = await sharp(await readFile('public/deltek-logo.png'))
  .resize({ width: 500, kernel: 'lanczos3' })
  .toBuffer();

await sharp(Buffer.from(zemin))
  .composite([{ input: logo, top: 240, left: Math.round((G - 500) / 2) }])
  .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
  .toFile('public/og-image.jpg');

const m = await sharp('public/og-image.jpg').metadata();
console.log(`✓ public/og-image.jpg — ${m.width}×${m.height} ${m.format}`);
