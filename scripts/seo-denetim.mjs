/**
 * Statik SEO denetimi — `dist/` çıktısını tarar, sayfa başına ve site geneli
 * puan verir. Harici servis yok; her şey HTML'den okunur.
 *
 *   npm run build && node scripts/seo-denetim.mjs            # özet
 *   node scripts/seo-denetim.mjs --ayrinti                   # sayfa başına bulgular
 *   node scripts/seo-denetim.mjs --dil en                    # yalnız /en/ sayfaları
 *
 * Ölçülenler (her biri sayfa puanına katkı verir):
 *   title (30–65 karakter), meta description (70–160), tek <h1>, canonical,
 *   hreflang, html lang, görsellerde alt, görsellerde width/height (CLS),
 *   kelime sayısı (≥300), JSON-LD, Open Graph, iç bağlantı sayısı (≥3),
 *   site genelinde mükerrer title/description, yetim sayfa (iç bağlantısı yok),
 *   sitemap'te bulunma.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const KOK = path.resolve(process.cwd(), 'dist');
const args = process.argv.slice(2);
const AYRINTI = args.includes('--ayrinti');
const dilArg = args.includes('--dil') ? args[args.indexOf('--dil') + 1] : null;

async function htmlDosyalari(dizin) {
  const sonuc = [];
  for (const ad of await readdir(dizin)) {
    const p = path.join(dizin, ad);
    const s = await stat(p);
    if (s.isDirectory()) sonuc.push(...await htmlDosyalari(p));
    else if (ad === 'index.html' || ad === '404.html') sonuc.push(p);
  }
  return sonuc;
}

const oz = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
// Değerli öznitelik → değeri; değersiz öznitelik (`alt` — Astro alt="" çıktısı) → ''; yoksa null.
const attr = (etiket, ad) => {
  const m = etiket.match(new RegExp(`\\s${ad}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  if (m) return m[2] ?? m[3] ?? m[4] ?? '';
  return new RegExp(`\\s${ad}(?=[\\s/>])`, 'i').test(etiket) ? '' : null;
};
const metaIcerik = (html, sec) => { const m = html.match(new RegExp(`<meta[^>]+${sec}[^>]*>`, 'i')); return m ? attr(m[0], 'content') : null; };

function govdeMetni(html) {
  let g = html.replace(/<head[\s\S]*?<\/head>/i, '');
  g = g.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  g = g.replace(/<(header|footer|nav)[\s\S]*?<\/\1>/gi, ' ');   // gezinme/kalıp metni sayılmaz
  g = g.replace(/<[^>]+>/g, ' ');
  return oz(g).replace(/\s+/g, ' ');
}

function sayfayiIncele(html, url) {
  const b = { url, bulgular: [], puan: 0, azami: 0 };
  const ekle = (agirlik, ok, mesaj) => { b.azami += agirlik; if (ok) b.puan += agirlik; else b.bulgular.push(mesaj); };

  const title = oz((html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1]);
  const desc = metaIcerik(html, 'name="description"') ?? '';
  const canon = (html.match(/<link[^>]+rel="canonical"[^>]*>/i) || [null])[0];
  const lang = (html.match(/<html[^>]*\slang="([^"]*)"/i) || [, ''])[1];
  const h1ler = html.match(/<h1[\s>]/gi) || [];
  const hreflang = (html.match(/hreflang="/g) || []).length;
  const jsonld = (html.match(/application\/ld\+json/g) || []).length;
  const og = ['og:title', 'og:description', 'og:image', 'og:url'].filter(p => new RegExp(`property="${p}"`).test(html));
  const imgler = html.match(/<img\b[^>]*>/gi) || [];
  const dekoratif = (i) => /aria-hidden="true"|role="presentation"/i.test(i);
  const altsiz = imgler.filter(i => attr(i, 'alt') === null && !dekoratif(i));
  const bosAlt = imgler.filter(i => attr(i, 'alt') === '' && !dekoratif(i));
  const olcusuz = imgler.filter(i => attr(i, 'width') === null || attr(i, 'height') === null);
  const govde = govdeMetni(html);
  const kelime = govde ? govde.split(' ').length : 0;
  const icBag = new Set((html.match(/<a\b[^>]*href="(\/[^"#]*)"/gi) || []).map(a => attr(a, 'href')).filter(h => h && !h.startsWith('/admin')));
  const noindex = /name="robots"[^>]*noindex/i.test(html);

  b.title = title; b.desc = desc; b.kelime = kelime; b.icBag = icBag; b.noindex = noindex;
  b.imgToplam = imgler.length; b.altsiz = altsiz.length; b.bosAlt = bosAlt.length; b.olcusuz = olcusuz.length;

  ekle(10, title.length >= 30 && title.length <= 65, `title ${title.length} karakter (30–65 olmalı): "${title}"`);
  ekle(10, desc.length >= 70 && desc.length <= 160, `description ${desc.length} karakter (70–160 olmalı)`);
  ekle(10, h1ler.length === 1, `${h1ler.length} adet <h1> (tam 1 olmalı)`);
  ekle(5, !!canon, 'canonical yok');
  ekle(5, hreflang >= 2, 'hreflang eksik');
  ekle(3, !!lang, 'html lang yok');
  ekle(10, altsiz.length === 0 && bosAlt.length === 0, `alt eksik: ${altsiz.length} alt'sız, ${bosAlt.length} boş alt (dekoratif işaretsiz)`);
  ekle(5, olcusuz.length === 0, `${olcusuz.length} görselde width/height yok (CLS)`);
  ekle(10, kelime >= 300, `${kelime} kelime (≥300 hedef)`);
  ekle(7, jsonld >= 1, 'JSON-LD yok');
  ekle(5, og.length === 4, `Open Graph eksik: ${4 - og.length} alan`);
  ekle(5, icBag.size >= 3, `${icBag.size} iç bağlantı (≥3 hedef)`);
  return b;
}

const dosyalar = await htmlDosyalari(KOK);
const sitemapXml = await readFile(path.join(KOK, 'sitemap-0.xml'), 'utf8').catch(() => '');
const sayfalar = [];
for (const d of dosyalar) {
  const rel = '/' + path.relative(KOK, path.dirname(d)).split(path.sep).join('/');
  let url = rel === '/.' || rel === '/' ? '/' : rel + '/';
  if (path.basename(d) === '404.html') url = (rel === '/.' || rel === '/' ? '' : rel) + '/404.html';
  if (url.startsWith('/admin')) continue;
  if (dilArg === 'en' && !url.startsWith('/en/')) continue;
  if (dilArg === 'tr' && url.startsWith('/en/')) continue;
  const html = await readFile(d, 'utf8');
  sayfalar.push(sayfayiIncele(html, url));
}

// Site geneli: mükerrer title/description, yetim sayfa, sitemap
const say = (dizi) => dizi.reduce((m, v) => (m.set(v, (m.get(v) || 0) + 1), m), new Map());
const titleSay = say(sayfalar.map(s => s.title));
const descSay = say(sayfalar.map(s => s.desc));
const gelen = new Map();
for (const s of sayfalar) for (const h of s.icBag) gelen.set(h, (gelen.get(h) || 0) + (h === s.url ? 0 : 1));

let toplam = 0, azami = 0;
for (const s of sayfalar) {
  const ek = (agirlik, ok, mesaj) => { s.azami += agirlik; if (ok) s.puan += agirlik; else s.bulgular.push(mesaj); };
  if (!s.url.endsWith('/404.html')) {
    ek(5, titleSay.get(s.title) === 1, 'title başka sayfayla aynı');
    ek(5, descSay.get(s.desc) === 1, 'description başka sayfayla aynı');
    ek(5, (gelen.get(s.url) || 0) >= 1 || s.url === '/' || s.url === '/en/', 'YETİM: hiçbir sayfadan bağlantı yok');
    ek(3, sitemapXml.includes(`${s.url}</loc>`) || sitemapXml.includes(`${s.url.replace(/\/$/, '')}</loc>`), 'sitemap\'te yok');
  }
  toplam += s.puan; azami += s.azami;
}

sayfalar.sort((a, b) => (a.puan / a.azami) - (b.puan / b.azami));
const yuzde = (s) => Math.round(100 * s.puan / s.azami);

console.log(`\nSEO denetimi — ${sayfalar.length} sayfa${dilArg ? ` (${dilArg})` : ''}\n`);
for (const s of sayfalar) {
  const p = yuzde(s);
  console.log(`${String(p).padStart(3)}%  ${s.url}  [${s.kelime} kelime, ${s.imgToplam} görsel]`);
  if (AYRINTI || p < 100) for (const m of s.bulgular) console.log(`       - ${m}`);
}
const genel = Math.round(100 * toplam / azami);
console.log(`\nGENEL PUAN: ${genel}/100`);
const ort = Math.round(sayfalar.reduce((a, s) => a + yuzde(s), 0) / sayfalar.length);
console.log(`Sayfa ortalaması: ${ort}/100 · En düşük: ${yuzde(sayfalar[0])}% (${sayfalar[0].url})`);
const altToplam = sayfalar.reduce((a, s) => a + s.altsiz + s.bosAlt, 0);
const olcuToplam = sayfalar.reduce((a, s) => a + s.olcusuz, 0);
const yetim = sayfalar.filter(s => s.bulgular.some(b => b.startsWith('YETİM'))).map(s => s.url);
console.log(`Alt eksik görsel: ${altToplam} · width/height eksik: ${olcuToplam} · Yetim sayfa: ${yetim.length}${yetim.length ? ' → ' + yetim.join(', ') : ''}`);
