/**
 * Astro entegrasyonu: build bittikten sonra `dist/` içindeki HTML'lerde
 * `width`/`height` özniteliği olmayan `<img src="/…">` etiketlerine dosyadan
 * okunan ölçüyü ekler (CLS — Core Web Vitals).
 *
 * Neden burada: Astro 7'nin varsayılan Markdown işlemcisi remark eklentisi
 * kabul etmiyor (`@astrojs/markdown-remark` kurulup işlemci değiştirilmeden).
 * Çıktı üzerinde çalışmak hem markdown gövdesindeki `![alt](/images/…)`
 * görsellerini hem de gözden kaçan her `<img>`i tek yerden yakalar.
 *
 * Yalnız `public/` altındaki dosyalara bakar (`/images/…`, `/deltek-logo.png`
 * gibi kök yollar). Ölçü okunamazsa etiket olduğu gibi kalır. Zaten
 * `width`/`height` taşıyan etiketlere dokunmaz.
 *
 * Kayıt: astro.config.mjs → integrations: [gorselOlcu()]
 */
import { readFile, writeFile, readdir, stat, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
function jpeg(b) {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const im = b[i + 1];
    if (im === 0xd8 || im === 0x01 || (im >= 0xd0 && im <= 0xd7)) { i += 2; continue; }
    if (im === 0xd9 || im === 0xda) break;
    if (SOF.has(im)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
function webp(b) {
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (t === 'VP8L') { const bits = b.readUInt32LE(21); return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 }; }
  if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  return null;
}
function svg(b) {
  const s = b.toString('utf8', 0, Math.min(b.length, 2000));
  const w = s.match(/<svg[^>]*\swidth="([\d.]+)(px)?"/i), h = s.match(/<svg[^>]*\sheight="([\d.]+)(px)?"/i);
  if (w && h) return { w: Math.round(+w[1]), h: Math.round(+h[1]) };
  const vb = s.match(/viewBox="[\d.\-]+[\s,]+[\d.\-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/i);
  return vb ? { w: Math.round(+vb[1]), h: Math.round(+vb[2]) } : null;
}
async function olcu(dosya) {
  try {
    const b = await readFile(dosya);
    if (b.length < 30) return null;
    let r = null;
    if (b[0] === 0xff && b[1] === 0xd8) r = jpeg(b);
    else if (b.toString('ascii', 1, 4) === 'PNG') r = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    else if (b.toString('ascii', 0, 3) === 'GIF') r = { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
    else if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') r = webp(b);
    else if (/<svg/i.test(b.toString('utf8', 0, 300))) r = svg(b);
    return r && r.w && r.h ? r : null;
  } catch { return null; }
}

async function htmlDosyalari(dizin) {
  const sonuc = [];
  for (const ad of await readdir(dizin)) {
    const p = path.join(dizin, ad);
    if ((await stat(p)).isDirectory()) sonuc.push(...await htmlDosyalari(p));
    else if (ad.endsWith('.html')) sonuc.push(p);
  }
  return sonuc;
}

export default function gorselOlcu() {
  return {
    name: 'deltek-gorsel-olcu',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const kok = fileURLToPath(dir);
        const bellek = new Map();
        let eklenen = 0;
        for (const dosya of await htmlDosyalari(kok)) {
          let html = await readFile(dosya, 'utf8');
          const parcalar = [];
          let son = 0, degisti = false;
          const re = /<img\b[^>]*>/gi;
          let m;
          while ((m = re.exec(html))) {
            const etiket = m[0];
            if (/\swidth\s*=/.test(etiket) && /\sheight\s*=/.test(etiket)) continue;
            const src = (etiket.match(/\ssrc="([^"]+)"/) || [])[1];
            if (!src || !src.startsWith('/') || src.startsWith('//')) continue;
            const yol = path.join(kok, decodeURIComponent(src.split('?')[0]));
            if (!bellek.has(yol)) bellek.set(yol, await olcu(yol));
            const o = bellek.get(yol);
            if (!o) continue;
            let yeni = etiket;
            if (!/\swidth\s*=/.test(yeni)) yeni = yeni.replace(/<img\b/i, `<img width="${o.w}"`);
            if (!/\sheight\s*=/.test(yeni)) yeni = yeni.replace(/<img\b/i, `<img height="${o.h}"`);
            parcalar.push(html.slice(son, m.index), yeni);
            son = m.index + etiket.length;
            degisti = true; eklenen++;
          }
          if (degisti) {
            parcalar.push(html.slice(son));
            await writeFile(dosya, parcalar.join(''));
          }
        }
        logger.info(`${eklenen} görsele width/height eklendi`);

        // EN 404: Astro `en/404.astro`yu trailingSlash yüzünden `en/404/index.html`
        // olarak yazıyor; Cloudflare Pages dizin bazlı 404 için `en/404.html` bekler.
        try {
          await rename(path.join(kok, 'en', '404', 'index.html'), path.join(kok, 'en', '404.html'));
          await rm(path.join(kok, 'en', '404'), { recursive: true, force: true });
          logger.info('en/404/index.html → en/404.html taşındı');
        } catch { /* EN 404 yoksa sorun değil */ }
      },
    },
  };
}
