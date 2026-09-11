/**
 * Google Fonts'u kendi sunucumuza indirir (tek seferlik; fontlar değişirse
 * yeniden çalıştırılır).
 *
 *   node scripts/font-indir.mjs
 *
 * Neden: fonts.googleapis.com + fonts.gstatic.com iki ayrı üçüncü taraf
 * bağlantı demek (DNS + TLS el sıkışması), ve Google'ın CSS'i her istekte
 * yeniden çözülüyor. Aynı dosyaları /fonts/ altından vermek LCP/FCP'yi
 * kısaltır, üçüncü taraf bağımlılığını kaldırır, `preload` ile ilk boyamada
 * yazı tipi hazır olur.
 *
 * Yalnız `latin` ve `latin-ext` alt kümeleri alınır (Türkçe latin-ext'te).
 * Dosya adları belirleyicidir; Layout.astro'daki preload bu ada bağlanır.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const URL = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@800&family=Open+Sans:ital,wdth,wght@0,75..100,400..800;1,75..100,700&display=swap';
const ALT_KUMELER = new Set(['latin', 'latin-ext']);
const HEDEF = path.resolve('public/fonts');

const css = await (await fetch(URL, { headers: { 'user-agent': UA } })).text();
const bloklar = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];
if (!bloklar.length) throw new Error('Google Fonts CSS çözümlenemedi');

await mkdir(HEDEF, { recursive: true });
const cikti = [];
let indirilen = 0;
for (const [, altKume, govde] of bloklar) {
  if (!ALT_KUMELER.has(altKume)) continue;
  const al = (ad) => (govde.match(new RegExp(`${ad}:\\s*([^;]+);`)) || [])[1]?.trim();
  const aile = al('font-family').replace(/['"]/g, '');
  const stil = al('font-style'), agirlik = al('font-weight'), genislik = al('font-stretch');
  const url = (govde.match(/url\(([^)]+)\)/) || [])[1];
  const aralik = al('unicode-range');
  const ad = [aile.toLowerCase().replace(/\s+/g, '-'), stil, agirlik.replace(/\s+/g, '-'), altKume].join('-') + '.woff2';
  const b = Buffer.from(await (await fetch(url)).arrayBuffer());
  await writeFile(path.join(HEDEF, ad), b);
  indirilen++;
  cikti.push(`/* ${altKume} */
@font-face {
  font-family: '${aile}';
  font-style: ${stil};
  font-weight: ${agirlik};${genislik ? `\n  font-stretch: ${genislik};` : ''}
  font-display: swap;
  src: url('/fonts/${ad}') format('woff2');
  unicode-range: ${aralik};
}`);
  console.log(`${ad}  ${(b.length / 1024).toFixed(1)} KB`);
}
const bas = `/* Google Fonts'tan indirilmiş, kendi sunucumuzdan verilen yazı tipleri.
   Üretim: node scripts/font-indir.mjs (dosyalar public/fonts/). Elle düzenlemeyin;
   yazı tipi değişecekse betikteki URL'yi değiştirip yeniden çalıştırın. */
`;
await writeFile(path.resolve('src/styles/fonts.css'), bas + cikti.join('\n\n') + '\n');
console.log(`${indirilen} dosya indirildi, src/styles/fonts.css yazıldı`);
